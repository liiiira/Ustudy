import request from "supertest";
import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import app from "../src/app.ts";
import pool from "../src/config/postgres.ts";
import { resetTables, resetConversationsTable, registerAndLogin, presignUpload, tokenFor } from "./utils.ts";

const BASE_URL = "/api/v1/conversations";
const NONEXISTENT_ID = "00000000-0000-0000-0000-000000000000";

const OWNER = { email: "msg-owner@example.com", username: "msg-owner", password: "SuperSecret123!" };
const MEMBER = { email: "msg-member@example.com", username: "msg-member", password: "SuperSecret123!" };
const THIRD = { email: "msg-third@example.com", username: "msg-third", password: "SuperSecret123!" };

let ownerId: string;
let ownerToken: string;
let memberId: string;
let memberToken: string;
let thirdId: string;

async function createDirect(token: string, otherUserId: string): Promise<string> {
  const res = await request(app)
    .post(BASE_URL)
    .set("Authorization", `Bearer ${token}`)
    .send({ type: "direct", otherUserId });
  return res.body.conversation.id;
}

async function createGroup(token: string, name: string, memberIds: string[]): Promise<string> {
  const res = await request(app)
    .post(BASE_URL)
    .set("Authorization", `Bearer ${token}`)
    .send({ type: "group", name, memberIds });
  return res.body.conversation.id;
}

async function countMessages(conversationId: string): Promise<number> {
  const result = await pool.query("SELECT count(*)::int AS n FROM messages WHERE conversation_id = $1", [conversationId]);
  return result.rows[0].n;
}

beforeAll(async () => {
  await resetTables();
  ({ id: ownerId, accessToken: ownerToken } = await registerAndLogin(OWNER));
  ({ id: memberId, accessToken: memberToken } = await registerAndLogin(MEMBER));
  ({ id: thirdId } = await registerAndLogin(THIRD));
});

describe("POST /api/v1/conversations/:conversationId/messages", () => {

  beforeEach(async () => {
    await resetConversationsTable();
  });

  it("sends a text message in a direct conversation", async () => {
    const id = await createDirect(ownerToken, memberId);

    const res = await request(app)
      .post(`${BASE_URL}/${id}/messages`)
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ textContent: "hello" });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe("success");
    expect(res.body.chatMessage).toMatchObject({
      conversationId: id,
      senderId: ownerId,
      senderUsername: OWNER.username,
      textContent: "hello",
      imageUrl: null,
    });
    expect(res.body.chatMessage.id).toBeDefined();
    expect(res.body.chatMessage.createdAt).toBeDefined();

    const row = await pool.query("SELECT sender_id, text_content, upload_id FROM messages WHERE id = $1", [res.body.chatMessage.id]);
    expect(row.rows[0]).toMatchObject({ sender_id: ownerId, text_content: "hello", upload_id: null });
  });

  it("lets any member of a group send", async () => {
    const id = await createGroup(ownerToken, "Chat", [memberId]);

    const res = await request(app)
      .post(`${BASE_URL}/${id}/messages`)
      .set("Authorization", `Bearer ${memberToken}`)
      .send({ textContent: "from a member" });

    expect(res.status).toBe(201);
    expect(res.body.chatMessage.senderId).toBe(memberId);
    expect(await countMessages(id)).toBe(1);
  });

  it("sends an image message using the requester's own upload", async () => {
    const id = await createDirect(ownerToken, memberId);
    const imageUrl = await presignUpload(ownerToken, "message");

    const res = await request(app)
      .post(`${BASE_URL}/${id}/messages`)
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ imageUrl });

    expect(res.status).toBe(201);
    expect(res.body.chatMessage.imageUrl).toBe(imageUrl);
    expect(res.body.chatMessage.textContent).toBeNull();

    const row = await pool.query(
      "SELECT u.public_url FROM messages m JOIN uploads u ON m.upload_id = u.id WHERE m.id = $1",
      [res.body.chatMessage.id]
    );
    expect(row.rows[0].public_url).toBe(imageUrl);
  });

  it("sends text and image together", async () => {
    const id = await createDirect(ownerToken, memberId);
    const imageUrl = await presignUpload(ownerToken, "message");

    const res = await request(app)
      .post(`${BASE_URL}/${id}/messages`)
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ textContent: "look", imageUrl });

    expect(res.status).toBe(201);
    expect(res.body.chatMessage).toMatchObject({ textContent: "look", imageUrl });
  });

  it("returns 400 when neither text nor image is given", async () => {
    const id = await createDirect(ownerToken, memberId);

    const res = await request(app)
      .post(`${BASE_URL}/${id}/messages`)
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({});

    expect(res.status).toBe(400);
    expect(await countMessages(id)).toBe(0);
  });

  it("returns 400 when the text is empty or too long", async () => {
    const id = await createDirect(ownerToken, memberId);

    const empty = await request(app)
      .post(`${BASE_URL}/${id}/messages`)
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ textContent: "" });
    expect(empty.status).toBe(400);

    const long = await request(app)
      .post(`${BASE_URL}/${id}/messages`)
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ textContent: "x".repeat(501) });
    expect(long.status).toBe(400);

    expect(await countMessages(id)).toBe(0);
  });

  it("does not allow a non-member to send", async () => {
    const id = await createDirect(ownerToken, memberId);

    const res = await request(app)
      .post(`${BASE_URL}/${id}/messages`)
      .set("Authorization", `Bearer ${tokenFor(thirdId)}`)
      .send({ textContent: "intruder" });

    expect(res.status).toBe(403);
    expect(await countMessages(id)).toBe(0);
  });

  it("does not allow attaching another user's upload", async () => {
    const id = await createDirect(ownerToken, memberId);
    const someoneElsesImage = await presignUpload(memberToken, "message");

    const res = await request(app)
      .post(`${BASE_URL}/${id}/messages`)
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ imageUrl: someoneElsesImage });

    expect(res.status).toBe(403);
    expect(await countMessages(id)).toBe(0);
  });

  it("does not allow an upload of a different kind", async () => {
    const id = await createDirect(ownerToken, memberId);
    const groupImage = await presignUpload(ownerToken, "conversation");

    const res = await request(app)
      .post(`${BASE_URL}/${id}/messages`)
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ imageUrl: groupImage });

    expect(res.status).toBe(403);
    expect(await countMessages(id)).toBe(0);
  });

  it("returns 404 for an imageUrl that was never presigned", async () => {
    const id = await createDirect(ownerToken, memberId);

    const res = await request(app)
      .post(`${BASE_URL}/${id}/messages`)
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ imageUrl: "https://example.com/conversations/nope.png" });

    expect(res.status).toBe(404);
    expect(await countMessages(id)).toBe(0);
  });

  it("returns 400 when imageUrl is not a URL", async () => {
    const id = await createDirect(ownerToken, memberId);

    const res = await request(app)
      .post(`${BASE_URL}/${id}/messages`)
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ imageUrl: "not a url" });

    expect(res.status).toBe(400);
  });

  it("returns 404 for a conversation that does not exist", async () => {
    const res = await request(app)
      .post(`${BASE_URL}/${NONEXISTENT_ID}/messages`)
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ textContent: "hello" });

    expect(res.status).toBe(404);
  });

  it("returns 400 for an invalid conversation id", async () => {
    const res = await request(app)
      .post(`${BASE_URL}/not-a-uuid/messages`)
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ textContent: "hello" });

    expect(res.status).toBe(400);
  });

  it("requires authentication", async () => {
    const id = await createDirect(ownerToken, memberId);

    const res = await request(app)
      .post(`${BASE_URL}/${id}/messages`)
      .send({ textContent: "hello" });

    expect(res.status).toBe(401);
  });
});
