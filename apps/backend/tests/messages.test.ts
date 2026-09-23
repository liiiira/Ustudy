import request from "supertest";
import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import app from "../src/app.ts";
import pool from "../src/config/postgres.ts";
import {
  resetTables,
  resetConversationsTable,
  registerAndLogin,
  presignUpload,
  tokenFor,
} from "./utils.ts";

const BASE_URL = "/api/v1/conversations";
const NONEXISTENT_ID = "00000000-0000-0000-0000-000000000000";

const OWNER = {
  email: "msg-owner@example.com",
  username: "msg-owner",
  password: "SuperSecret123!",
};
const MEMBER = {
  email: "msg-member@example.com",
  username: "msg-member",
  password: "SuperSecret123!",
};
const THIRD = {
  email: "msg-third@example.com",
  username: "msg-third",
  password: "SuperSecret123!",
};

let ownerId: string;
let ownerToken: string;
let memberId: string;
let memberToken: string;
let thirdId: string;

async function createDirect(
  token: string,
  otherUserId: string,
): Promise<string> {
  const res = await request(app)
    .post(BASE_URL)
    .set("Authorization", `Bearer ${token}`)
    .send({ type: "direct", otherUserId });
  return res.body.conversation.id;
}

async function createGroup(
  token: string,
  name: string,
  memberIds: string[],
): Promise<string> {
  const res = await request(app)
    .post(BASE_URL)
    .set("Authorization", `Bearer ${token}`)
    .send({ type: "group", name, memberIds });
  return res.body.conversation.id;
}

async function countMessages(conversationId: string): Promise<number> {
  const result = await pool.query(
    "SELECT count(*)::int AS n FROM messages WHERE conversation_id = $1",
    [conversationId],
  );
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

    const row = await pool.query(
      "SELECT sender_id, text_content, upload_id FROM messages WHERE id = $1",
      [res.body.chatMessage.id],
    );
    expect(row.rows[0]).toMatchObject({
      sender_id: ownerId,
      text_content: "hello",
      upload_id: null,
    });
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
      [res.body.chatMessage.id],
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
    expect(res.body.chatMessage).toMatchObject({
      textContent: "look",
      imageUrl,
    });
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

describe("DELETE /api/v1/conversations/:conversationId/messages/:messageId", () => {
  beforeEach(async () => {
    await resetConversationsTable();
  });

  async function sendMessage(
    token: string,
    conversationId: string,
    textContent: string,
  ): Promise<string> {
    const res = await request(app)
      .post(`${BASE_URL}/${conversationId}/messages`)
      .set("Authorization", `Bearer ${token}`)
      .send({ textContent });
    return res.body.chatMessage.id;
  }

  it("lets the sender delete their own message", async () => {
    const id = await createDirect(ownerToken, memberId);
    const messageId = await sendMessage(ownerToken, id, "mine");

    const res = await request(app)
      .delete(`${BASE_URL}/${id}/messages/${messageId}`)
      .set("Authorization", `Bearer ${ownerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
    expect(res.body.chatMessage).toEqual({ id: messageId });
    expect(await countMessages(id)).toBe(0);
  });

  it("lets a group admin delete another member's message", async () => {
    const id = await createGroup(ownerToken, "Moderated", [memberId]);
    const messageId = await sendMessage(memberToken, id, "from member");

    const res = await request(app)
      .delete(`${BASE_URL}/${id}/messages/${messageId}`)
      .set("Authorization", `Bearer ${ownerToken}`);

    expect(res.status).toBe(200);
    expect(await countMessages(id)).toBe(0);
  });

  it("does not allow a non-admin member to delete someone else's message", async () => {
    const id = await createGroup(ownerToken, "Locked", [memberId]);
    const messageId = await sendMessage(ownerToken, id, "from admin");

    const res = await request(app)
      .delete(`${BASE_URL}/${id}/messages/${messageId}`)
      .set("Authorization", `Bearer ${memberToken}`);

    expect(res.status).toBe(403);
    expect(await countMessages(id)).toBe(1);
  });

  it("does not allow the other side of a DM to delete your message", async () => {
    const id = await createDirect(ownerToken, memberId);
    const messageId = await sendMessage(ownerToken, id, "mine");

    const res = await request(app)
      .delete(`${BASE_URL}/${id}/messages/${messageId}`)
      .set("Authorization", `Bearer ${memberToken}`);

    expect(res.status).toBe(403);
    expect(await countMessages(id)).toBe(1);
  });

  it("does not allow a non-member to delete", async () => {
    const id = await createDirect(ownerToken, memberId);
    const messageId = await sendMessage(ownerToken, id, "mine");

    const res = await request(app)
      .delete(`${BASE_URL}/${id}/messages/${messageId}`)
      .set("Authorization", `Bearer ${tokenFor(thirdId)}`);

    expect(res.status).toBe(403);
    expect(await countMessages(id)).toBe(1);
  });

  it("returns 404 when the message belongs to a different conversation", async () => {
    const a = await createDirect(ownerToken, memberId);
    const b = await createDirect(ownerToken, thirdId);
    const messageInA = await sendMessage(ownerToken, a, "in a");

    const res = await request(app)
      .delete(`${BASE_URL}/${b}/messages/${messageInA}`)
      .set("Authorization", `Bearer ${ownerToken}`);

    expect(res.status).toBe(404);
    expect(await countMessages(a)).toBe(1);
  });

  it("returns 404 for a message that does not exist", async () => {
    const id = await createDirect(ownerToken, memberId);

    const res = await request(app)
      .delete(`${BASE_URL}/${id}/messages/${NONEXISTENT_ID}`)
      .set("Authorization", `Bearer ${ownerToken}`);

    expect(res.status).toBe(404);
  });

  it("returns 404 when deleting the same message twice", async () => {
    const id = await createDirect(ownerToken, memberId);
    const messageId = await sendMessage(ownerToken, id, "once");

    await request(app)
      .delete(`${BASE_URL}/${id}/messages/${messageId}`)
      .set("Authorization", `Bearer ${ownerToken}`)
      .expect(200);
    const again = await request(app)
      .delete(`${BASE_URL}/${id}/messages/${messageId}`)
      .set("Authorization", `Bearer ${ownerToken}`);

    expect(again.status).toBe(404);
  });

  it("returns 404 for a conversation that does not exist", async () => {
    const res = await request(app)
      .delete(`${BASE_URL}/${NONEXISTENT_ID}/messages/${NONEXISTENT_ID}`)
      .set("Authorization", `Bearer ${ownerToken}`);

    expect(res.status).toBe(404);
  });

  it("returns 400 for an invalid message id", async () => {
    const id = await createDirect(ownerToken, memberId);

    const res = await request(app)
      .delete(`${BASE_URL}/${id}/messages/not-a-uuid`)
      .set("Authorization", `Bearer ${ownerToken}`);

    expect(res.status).toBe(400);
  });

  it("requires authentication", async () => {
    const id = await createDirect(ownerToken, memberId);
    const messageId = await sendMessage(ownerToken, id, "mine");

    const res = await request(app).delete(
      `${BASE_URL}/${id}/messages/${messageId}`,
    );

    expect(res.status).toBe(401);
  });
});

describe("GET /api/v1/conversations/:conversationId/messages", () => {
  beforeEach(async () => {
    await resetConversationsTable();
  });

  async function sendMessage(
    token: string,
    conversationId: string,
    body: { textContent?: string; imageUrl?: string },
  ): Promise<string> {
    const res = await request(app)
      .post(`${BASE_URL}/${conversationId}/messages`)
      .set("Authorization", `Bearer ${token}`)
      .send(body);
    return res.body.chatMessage.id;
  }

  async function seed(
    conversationId: string,
    count: number,
  ): Promise<string[]> {
    const ids: string[] = [];
    for (let i = 0; i < count; i++) {
      ids.push(await sendMessage(ownerToken, conversationId, { textContent: `m${i}` }));
    }
    return ids;
  }

  function list(token: string, conversationId: string, query = "") {
    return request(app)
      .get(`${BASE_URL}/${conversationId}/messages${query}`)
      .set("Authorization", `Bearer ${token}`);
  }

  it("returns the conversation's messages, newest first", async () => {
    const id = await createDirect(ownerToken, memberId);
    const ids = await seed(id, 3);

    const res = await list(memberToken, id);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
    expect(res.body.messages.map((m: { id: string }) => m.id)).toEqual(
      [...ids].reverse(),
    );
  });

  it("returns the sender and image fields on each message", async () => {
    const id = await createDirect(ownerToken, memberId);
    const imageUrl = await presignUpload(ownerToken, "message");
    await sendMessage(ownerToken, id, { imageUrl });
    await sendMessage(ownerToken, id, { textContent: "hello" });

    const res = await list(ownerToken, id);

    expect(res.body.messages[0]).toMatchObject({
      conversationId: id,
      senderId: ownerId,
      senderUsername: OWNER.username,
      textContent: "hello",
      imageUrl: null,
    });
    expect(res.body.messages[1]).toMatchObject({
      textContent: null,
      imageUrl,
    });
  });

  it("returns an empty list for a conversation with no messages", async () => {
    const id = await createDirect(ownerToken, memberId);

    const res = await list(ownerToken, id);

    expect(res.status).toBe(200);
    expect(res.body.messages).toEqual([]);
  });

  it("returns only the messages of the requested conversation", async () => {
    const a = await createDirect(ownerToken, memberId);
    const b = await createGroup(ownerToken, "Other", [memberId]);
    await seed(a, 2);
    await sendMessage(ownerToken, b, { textContent: "in b" });

    const res = await list(ownerToken, a);

    expect(res.body.messages).toHaveLength(2);
    expect(
      res.body.messages.every(
        (m: { conversationId: string }) => m.conversationId === a,
      ),
    ).toBe(true);
  });

  it("defaults to 30 messages when no limit is given", async () => {
    const id = await createDirect(ownerToken, memberId);
    await seed(id, 35);

    const res = await list(ownerToken, id);

    expect(res.status).toBe(200);
    expect(res.body.messages).toHaveLength(30);
  });

  it("respects an explicit limit", async () => {
    const id = await createDirect(ownerToken, memberId);
    await seed(id, 10);

    const res = await list(ownerToken, id, "?limit=4");

    expect(res.status).toBe(200);
    expect(res.body.messages).toHaveLength(4);
  });

  it("returns the next page without repeating the first", async () => {
    const id = await createDirect(ownerToken, memberId);
    const ids = await seed(id, 10);
    const newestFirst = [...ids].reverse();

    const first = await list(ownerToken, id, "?limit=4");
    const second = await list(ownerToken, id, "?limit=4&cursor=4");

    const firstIds = first.body.messages.map((m: { id: string }) => m.id);
    const secondIds = second.body.messages.map((m: { id: string }) => m.id);

    expect(firstIds).toEqual(newestFirst.slice(0, 4));
    expect(secondIds).toEqual(newestFirst.slice(4, 8));
    expect(firstIds.some((i: string) => secondIds.includes(i))).toBe(false);
  });

  it("treats cursor=0 as the first page", async () => {
    const id = await createDirect(ownerToken, memberId);
    const ids = await seed(id, 6);

    const bare = await list(ownerToken, id, "?limit=3");
    const zero = await list(ownerToken, id, "?limit=3&cursor=0");

    expect(zero.status).toBe(200);
    expect(zero.body.messages.map((m: { id: string }) => m.id)).toEqual(
      bare.body.messages.map((m: { id: string }) => m.id),
    );
    expect(zero.body.messages).toHaveLength(3);
    expect(ids).toHaveLength(6);
  });

  it("returns 400 for a limit above the maximum", async () => {
    const id = await createDirect(ownerToken, memberId);

    const res = await list(ownerToken, id, "?limit=101");

    expect(res.status).toBe(400);
  });

  it("returns 400 for a non-numeric limit", async () => {
    const id = await createDirect(ownerToken, memberId);

    const res = await list(ownerToken, id, "?limit=abc");

    expect(res.status).toBe(400);
  });

  it("returns 400 for an invalid conversation id", async () => {
    const res = await list(ownerToken, "not-a-uuid");

    expect(res.status).toBe(400);
  });

  it("returns 404 for a conversation that does not exist", async () => {
    const res = await list(ownerToken, NONEXISTENT_ID);

    expect(res.status).toBe(404);
  });

  it("does not allow a non-member to read the messages", async () => {
    const id = await createDirect(ownerToken, memberId);
    await seed(id, 1);

    const res = await list(tokenFor(thirdId), id);

    expect(res.status).toBe(403);
  });

  it("requires authentication", async () => {
    const id = await createDirect(ownerToken, memberId);

    const res = await request(app).get(`${BASE_URL}/${id}/messages`);

    expect(res.status).toBe(401);
  });
});
