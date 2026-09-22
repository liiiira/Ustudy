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
const MEMBERS_TABLE = "conversation_members";

const OWNER = {
  email: "conv-owner@example.com",
  username: "conv-owner",
  password: "SuperSecret123!",
};

const MEMBER = {
  email: "conv-member@example.com",
  username: "conv-member",
  password: "SuperSecret123!",
};

const THIRD = {
  email: "conv-third@example.com",
  username: "conv-third",
  password: "SuperSecret123!",
};

const NONEXISTENT_ID = "00000000-0000-0000-0000-000000000000";

let ownerId: string;
let ownerToken: string;
let memberId: string;
let memberToken: string;
let thirdId: string;

async function countRows(
  table: string,
  where: string,
  params: unknown[],
): Promise<number> {
  const result = await pool.query(
    `SELECT count(*)::int AS n FROM ${table} WHERE ${where}`,
    params,
  );
  return result.rows[0].n;
}

beforeAll(async () => {
  await resetTables();
  ({ id: ownerId, accessToken: ownerToken } = await registerAndLogin(OWNER));
  ({ id: memberId, accessToken: memberToken } = await registerAndLogin(MEMBER));
  ({ id: thirdId } = await registerAndLogin(THIRD));
});

describe("POST /api/v1/conversations (direct)", () => {
  beforeEach(async () => {
    await resetConversationsTable();
  });

  it("creates a direct conversation between the requester and another user", async () => {
    const res = await request(app)
      .post(BASE_URL)
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ type: "direct", otherUserId: memberId });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe("success");
    expect(res.body.conversation).toMatchObject({ type: "direct" });
    expect(res.body.conversation.id).toBeDefined();
    expect(res.body.conversation.createdAt).toBeDefined();

    const conversationId = res.body.conversation.id;

    const conv = await pool.query(
      "SELECT type, direct_key FROM conversations WHERE id = $1",
      [conversationId],
    );
    expect(conv.rows).toHaveLength(1);
    expect(conv.rows[0].type).toBe("direct");
    expect(conv.rows[0].direct_key).toBe([ownerId, memberId].sort().join(":"));

    const members = await pool.query(
      `SELECT member_id FROM ${MEMBERS_TABLE} WHERE conversation_id = $1 ORDER BY member_id`,
      [conversationId],
    );
    expect(members.rows.map((r) => r.member_id).sort()).toEqual(
      [ownerId, memberId].sort(),
    );
  });

  it("returns the existing conversation when the same pair asks again", async () => {
    const first = await request(app)
      .post(BASE_URL)
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ type: "direct", otherUserId: memberId });

    const second = await request(app)
      .post(BASE_URL)
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ type: "direct", otherUserId: memberId });

    expect(first.status).toBe(201);
    expect(second.status).toBe(200);
    expect(second.body.conversation.id).toBe(first.body.conversation.id);

    expect(await countRows("conversations", "type = 'direct'", [])).toBe(1);
    expect(
      await countRows(MEMBERS_TABLE, "conversation_id = $1", [
        first.body.conversation.id,
      ]),
    ).toBe(2);
  });

  it("returns the same conversation regardless of which side initiates", async () => {
    const fromOwner = await request(app)
      .post(BASE_URL)
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ type: "direct", otherUserId: memberId });

    const fromMember = await request(app)
      .post(BASE_URL)
      .set("Authorization", `Bearer ${memberToken}`)
      .send({ type: "direct", otherUserId: ownerId });

    expect(fromOwner.status).toBe(201);
    expect(fromMember.status).toBe(200);
    expect(fromMember.body.conversation.id).toBe(
      fromOwner.body.conversation.id,
    );
    expect(await countRows("conversations", "type = 'direct'", [])).toBe(1);
  });

  it("does not collide across different pairs", async () => {
    const withMember = await request(app)
      .post(BASE_URL)
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ type: "direct", otherUserId: memberId });

    const withThird = await request(app)
      .post(BASE_URL)
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ type: "direct", otherUserId: thirdId });

    expect(withMember.status).toBe(201);
    expect(withThird.status).toBe(201);
    expect(withThird.body.conversation.id).not.toBe(
      withMember.body.conversation.id,
    );
    expect(await countRows("conversations", "type = 'direct'", [])).toBe(2);
  });

  it("rejects a direct conversation with yourself", async () => {
    const res = await request(app)
      .post(BASE_URL)
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ type: "direct", otherUserId: ownerId });

    expect(res.status).toBe(400);
    expect(await countRows("conversations", "true", [])).toBe(0);
  });

  it("returns 404 when the other user does not exist", async () => {
    const res = await request(app)
      .post(BASE_URL)
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ type: "direct", otherUserId: NONEXISTENT_ID });

    expect(res.status).toBe(404);
    expect(await countRows("conversations", "true", [])).toBe(0);
  });

  it("returns 400 when otherUserId is not a uuid", async () => {
    const res = await request(app)
      .post(BASE_URL)
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ type: "direct", otherUserId: "not-a-uuid" });

    expect(res.status).toBe(400);
  });
});

describe("POST /api/v1/conversations (group)", () => {
  beforeEach(async () => {
    await resetConversationsTable();
  });

  it("creates a group with the requester as admin and the others as members", async () => {
    const res = await request(app)
      .post(BASE_URL)
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({
        type: "group",
        name: "Study group",
        memberIds: [memberId, thirdId],
      });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe("success");
    expect(res.body.conversation).toMatchObject({
      type: "group",
      name: "Study group",
      ownerId: ownerId,
    });

    const conversationId = res.body.conversation.id;

    const conv = await pool.query(
      "SELECT type, name, owner_id, direct_key FROM conversations WHERE id = $1",
      [conversationId],
    );
    expect(conv.rows[0]).toMatchObject({
      type: "group",
      name: "Study group",
      owner_id: ownerId,
      direct_key: null,
    });

    const members = await pool.query(
      `SELECT member_id, role FROM ${MEMBERS_TABLE} WHERE conversation_id = $1`,
      [conversationId],
    );
    const byId = Object.fromEntries(
      members.rows.map((r) => [r.member_id, r.role]),
    );
    expect(byId).toEqual({
      [ownerId]: "admin",
      [memberId]: "member",
      [thirdId]: "member",
    });
  });

  it("adds the requester as a member even when memberIds omits them", async () => {
    const res = await request(app)
      .post(BASE_URL)
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ type: "group", name: "No self", memberIds: [memberId] });

    expect(res.status).toBe(201);

    const owner = await pool.query(
      `SELECT role FROM ${MEMBERS_TABLE} WHERE conversation_id = $1 AND member_id = $2`,
      [res.body.conversation.id, ownerId],
    );
    expect(owner.rows).toHaveLength(1);
    expect(owner.rows[0].role).toBe("admin");
  });

  it("creates a new group every time — groups are never deduplicated", async () => {
    const body = { type: "group", name: "Same name", memberIds: [memberId] };

    const first = await request(app)
      .post(BASE_URL)
      .set("Authorization", `Bearer ${ownerToken}`)
      .send(body);
    const second = await request(app)
      .post(BASE_URL)
      .set("Authorization", `Bearer ${ownerToken}`)
      .send(body);

    expect(first.status).toBe(201);
    expect(second.status).toBe(201);
    expect(second.body.conversation.id).not.toBe(first.body.conversation.id);
    expect(await countRows("conversations", "type = 'group'", [])).toBe(2);
  });

  it("ignores duplicate ids in memberIds", async () => {
    const res = await request(app)
      .post(BASE_URL)
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({
        type: "group",
        name: "Dupes",
        memberIds: [memberId, memberId, ownerId],
      });

    expect(res.status).toBe(201);
    expect(
      await countRows(MEMBERS_TABLE, "conversation_id = $1", [
        res.body.conversation.id,
      ]),
    ).toBe(2);
  });

  it("rejects the group when any member does not exist and creates nothing", async () => {
    const res = await request(app)
      .post(BASE_URL)
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({
        type: "group",
        name: "Ghost member",
        memberIds: [memberId, NONEXISTENT_ID],
      });

    expect(res.status).toBe(400);
    expect(res.body.details).toMatchObject({
      missingUserIds: [NONEXISTENT_ID],
    });
    expect(await countRows("conversations", "true", [])).toBe(0);
    expect(await countRows(MEMBERS_TABLE, "true", [])).toBe(0);
  });

  it("returns 400 when the name is too short", async () => {
    const res = await request(app)
      .post(BASE_URL)
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ type: "group", name: "ab", memberIds: [memberId] });

    expect(res.status).toBe(400);
  });

  it("returns 400 when memberIds contains a non-uuid", async () => {
    const res = await request(app)
      .post(BASE_URL)
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ type: "group", name: "Bad ids", memberIds: ["nope"] });

    expect(res.status).toBe(400);
  });
});

describe("POST /api/v1/conversations (group image)", () => {
  beforeEach(async () => {
    await resetConversationsTable();
  });

  it("attaches the requester's own conversation upload and returns its URL", async () => {
    const imageUrl = await presignUpload(ownerToken, "conversation");

    const res = await request(app)
      .post(BASE_URL)
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({
        type: "group",
        name: "With image",
        memberIds: [memberId],
        imageUrl,
      });

    expect(res.status).toBe(201);
    expect(res.body.conversation.imageUrl).toBe(imageUrl);

    const row = await pool.query(
      `SELECT c.upload_id, u.public_url
       FROM conversations c JOIN uploads u ON c.upload_id = u.id
       WHERE c.id = $1`,
      [res.body.conversation.id],
    );
    expect(row.rows).toHaveLength(1);
    expect(row.rows[0].public_url).toBe(imageUrl);
  });

  it("returns a null imageUrl when no image is given", async () => {
    const res = await request(app)
      .post(BASE_URL)
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ type: "group", name: "No image", memberIds: [memberId] });

    expect(res.status).toBe(201);
    expect(res.body.conversation.imageUrl).toBeNull();

    const row = await pool.query(
      "SELECT upload_id FROM conversations WHERE id = $1",
      [res.body.conversation.id],
    );
    expect(row.rows[0].upload_id).toBeNull();
  });

  it("returns 404 for an imageUrl that was never presigned and creates nothing", async () => {
    const res = await request(app)
      .post(BASE_URL)
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({
        type: "group",
        name: "Unknown image",
        memberIds: [memberId],
        imageUrl: "https://example.com/conversations/not-an-upload.png",
      });

    expect(res.status).toBe(404);
    expect(await countRows("conversations", "true", [])).toBe(0);
  });

  it("does not allow attaching another user's upload", async () => {
    const someoneElsesImage = await presignUpload(memberToken, "conversation");

    const res = await request(app)
      .post(BASE_URL)
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({
        type: "group",
        name: "Stolen image",
        memberIds: [memberId],
        imageUrl: someoneElsesImage,
      });

    expect(res.status).toBe(403);
    expect(await countRows("conversations", "true", [])).toBe(0);
  });

  it("does not allow an upload of a different kind", async () => {
    const postImage = await presignUpload(ownerToken, "post");

    const res = await request(app)
      .post(BASE_URL)
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({
        type: "group",
        name: "Wrong kind",
        memberIds: [memberId],
        imageUrl: postImage,
      });

    expect(res.status).toBe(403);
    expect(await countRows("conversations", "true", [])).toBe(0);
  });

  it("returns 400 when imageUrl is not a URL", async () => {
    const res = await request(app)
      .post(BASE_URL)
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({
        type: "group",
        name: "Bad url",
        memberIds: [memberId],
        imageUrl: "not a url",
      });

    expect(res.status).toBe(400);
  });

  it("ignores imageUrl on a direct conversation", async () => {
    const imageUrl = await presignUpload(ownerToken, "conversation");

    const res = await request(app)
      .post(BASE_URL)
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ type: "direct", otherUserId: memberId, imageUrl });

    expect(res.status).toBe(201);
    expect(res.body.conversation.imageUrl).toBeUndefined();

    const row = await pool.query(
      "SELECT upload_id FROM conversations WHERE id = $1",
      [res.body.conversation.id],
    );
    expect(row.rows[0].upload_id).toBeNull();
  });
});

describe("POST /api/v1/conversations (common)", () => {
  it("returns 400 for an unknown type", async () => {
    const res = await request(app)
      .post(BASE_URL)
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ type: "broadcast", name: "x" });

    expect(res.status).toBe(400);
  });

  it("returns 400 for an empty body", async () => {
    const res = await request(app)
      .post(BASE_URL)
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({});

    expect(res.status).toBe(400);
  });

  it("requires authentication", async () => {
    const res = await request(app)
      .post(BASE_URL)
      .send({ type: "direct", otherUserId: memberId });

    expect(res.status).toBe(401);
  });
});

describe("GET /api/v1/conversations", () => {
  beforeEach(async () => {
    await resetConversationsTable();
  });

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
    imageUrl?: string,
  ): Promise<string> {
    const res = await request(app)
      .post(BASE_URL)
      .set("Authorization", `Bearer ${token}`)
      .send({ type: "group", name, memberIds, imageUrl });
    return res.body.conversation.id;
  }

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

  // PATCH /conversations/:id/read does not exist yet, so the read marker is
  // set directly. Replace with the endpoint once it lands.
  async function markRead(
    conversationId: string,
    memberId: string,
    messageId: string,
  ) {
    await pool.query(
      `UPDATE ${MEMBERS_TABLE}
         SET last_read_message_id = $1
       WHERE conversation_id = $2 AND member_id = $3`,
      [messageId, conversationId, memberId],
    );
  }

  async function list(token: string) {
    return request(app)
      .get(BASE_URL)
      .set("Authorization", `Bearer ${token}`);
  }

  it("returns an empty list when the user has no conversations", async () => {
    const res = await list(ownerToken);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
    expect(res.body.conversations).toEqual([]);
  });

  it("returns only the conversations the requester is a member of", async () => {
    const mine = await createDirect(ownerToken, memberId);
    const theirs = await createDirect(memberToken, thirdId);

    const res = await list(ownerToken);

    expect(res.status).toBe(200);
    expect(res.body.conversations).toHaveLength(1);
    expect(res.body.conversations[0].id).toBe(mine);
    expect(res.body.conversations.map((c: { id: string }) => c.id)).not.toContain(
      theirs,
    );
  });

  it("lists a conversation for every member of it", async () => {
    const id = await createGroup(ownerToken, "Shared", [memberId]);

    for (const token of [ownerToken, memberToken]) {
      const res = await list(token);

      expect(res.status).toBe(200);
      expect(res.body.conversations).toHaveLength(1);
      expect(res.body.conversations[0].id).toBe(id);
    }
  });

  it("returns a direct conversation with null group fields", async () => {
    const id = await createDirect(ownerToken, memberId);

    const res = await list(ownerToken);

    expect(res.body.conversations[0]).toMatchObject({
      id,
      type: "direct",
      name: null,
      ownerId: null,
      imageUrl: null,
      unreadMessagesCount: 0,
      lastMessage: null,
    });
    expect(res.body.conversations[0].createdAt).toBeDefined();
  });

  it("returns a group with its name, owner and image", async () => {
    const imageUrl = await presignUpload(ownerToken, "conversation");
    const id = await createGroup(ownerToken, "Study group", [memberId], imageUrl);

    const res = await list(ownerToken);

    expect(res.body.conversations[0]).toMatchObject({
      id,
      type: "group",
      name: "Study group",
      ownerId,
      imageUrl,
    });
  });

  it("does not expose the direct key", async () => {
    await createDirect(ownerToken, memberId);

    const res = await list(ownerToken);

    expect(res.body.conversations[0].directKey).toBeUndefined();
    expect(JSON.stringify(res.body)).not.toContain(ownerId + ":");
    expect(JSON.stringify(res.body)).not.toContain(memberId + ":");
  });

  it("carries the newest message as lastMessage", async () => {
    const id = await createDirect(ownerToken, memberId);
    await sendMessage(ownerToken, id, { textContent: "first" });
    const newest = await sendMessage(memberToken, id, { textContent: "newest" });

    const res = await list(ownerToken);

    expect(res.body.conversations[0].lastMessage).toMatchObject({
      id: newest,
      textContent: "newest",
      senderUsername: MEMBER.username,
      imageUrl: null,
    });
    expect(res.body.conversations[0].lastMessage.createdAt).toBeDefined();
  });

  it("carries an image-only message as lastMessage", async () => {
    const id = await createDirect(ownerToken, memberId);
    const imageUrl = await presignUpload(ownerToken, "message");
    await sendMessage(ownerToken, id, { imageUrl });

    const res = await list(ownerToken);

    expect(res.body.conversations[0].lastMessage).toMatchObject({
      textContent: null,
      imageUrl,
    });
  });

  it("counts messages the requester has not read", async () => {
    const id = await createDirect(ownerToken, memberId);
    await sendMessage(ownerToken, id, { textContent: "1" });
    await sendMessage(ownerToken, id, { textContent: "2" });
    await sendMessage(ownerToken, id, { textContent: "3" });

    const forMember = await list(memberToken);
    expect(forMember.body.conversations[0].unreadMessagesCount).toBe(3);

    const forSender = await list(ownerToken);
    expect(forSender.body.conversations[0].unreadMessagesCount).toBe(0);
  });

  it("counts only the messages after the read marker", async () => {
    const id = await createDirect(ownerToken, memberId);
    await sendMessage(ownerToken, id, { textContent: "1" });
    const second = await sendMessage(ownerToken, id, { textContent: "2" });
    await sendMessage(ownerToken, id, { textContent: "3" });

    await markRead(id, memberId, second);

    const res = await list(memberToken);
    expect(res.body.conversations[0].unreadMessagesCount).toBe(1);
  });

  it("does not count the requester's own messages in a group", async () => {
    const id = await createGroup(ownerToken, "Mixed", [memberId]);
    await sendMessage(ownerToken, id, { textContent: "mine" });
    await sendMessage(memberToken, id, { textContent: "theirs" });

    const res = await list(ownerToken);
    expect(res.body.conversations[0].unreadMessagesCount).toBe(1);
  });

  it("orders conversations by their last message, newest first", async () => {
    const first = await createDirect(ownerToken, memberId);
    const second = await createGroup(ownerToken, "Later", [memberId]);

    await sendMessage(ownerToken, first, { textContent: "in first" });
    await sendMessage(ownerToken, second, { textContent: "in second" });

    const before = await list(ownerToken);
    expect(before.body.conversations.map((c: { id: string }) => c.id)).toEqual([
      second,
      first,
    ]);

    await sendMessage(memberToken, first, { textContent: "bumps first" });

    const after = await list(ownerToken);
    expect(after.body.conversations.map((c: { id: string }) => c.id)).toEqual([
      first,
      second,
    ]);
  });

  it("orders a conversation with no messages by its creation time", async () => {
    const withMessage = await createDirect(ownerToken, memberId);
    await sendMessage(ownerToken, withMessage, { textContent: "hello" });
    const empty = await createGroup(ownerToken, "Empty", [memberId]);

    const res = await list(ownerToken);

    expect(res.body.conversations.map((c: { id: string }) => c.id)).toEqual([
      empty,
      withMessage,
    ]);
    expect(res.body.conversations[0].lastMessage).toBeNull();
  });

  it("returns each conversation once regardless of how many members it has", async () => {
    const id = await createGroup(ownerToken, "Crowded", [memberId, thirdId]);
    await sendMessage(memberToken, id, { textContent: "hi" });

    const res = await list(ownerToken);

    expect(res.body.conversations).toHaveLength(1);
    expect(res.body.conversations[0].id).toBe(id);
  });

  it("returns an empty list for a user who was removed from every conversation", async () => {
    const id = await createGroup(ownerToken, "Leaving", [memberId]);

    const left = await request(app)
      .delete(`${BASE_URL}/${id}/members/${memberId}`)
      .set("Authorization", `Bearer ${memberToken}`);
    expect(left.status).toBe(200);

    const res = await list(memberToken);
    expect(res.body.conversations).toEqual([]);
  });

  it("requires authentication", async () => {
    const res = await request(app).get(BASE_URL);

    expect(res.status).toBe(401);
  });
});

describe("GET /api/v1/conversations/:conversationId", () => {
  beforeEach(async () => {
    await resetConversationsTable();
  });

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
    imageUrl?: string,
  ): Promise<string> {
    const res = await request(app)
      .post(BASE_URL)
      .set("Authorization", `Bearer ${token}`)
      .send({ type: "group", name, memberIds, imageUrl });
    return res.body.conversation.id;
  }

  it("returns a direct conversation to either member", async () => {
    const id = await createDirect(ownerToken, memberId);

    for (const token of [ownerToken, memberToken]) {
      const res = await request(app)
        .get(`${BASE_URL}/${id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe("success");
      expect(res.body.conversation).toMatchObject({
        id,
        type: "direct",
        name: null,
        ownerId: null,
        imageUrl: null,
      });
      expect(res.body.conversation.createdAt).toBeDefined();
    }
  });

  it("returns a group conversation with its name, owner and image", async () => {
    const imageUrl = await presignUpload(ownerToken, "conversation");
    const id = await createGroup(
      ownerToken,
      "Readable group",
      [memberId],
      imageUrl,
    );

    const res = await request(app)
      .get(`${BASE_URL}/${id}`)
      .set("Authorization", `Bearer ${memberToken}`);

    expect(res.status).toBe(200);
    expect(res.body.conversation).toMatchObject({
      id,
      type: "group",
      name: "Readable group",
      ownerId: ownerId,
      imageUrl,
    });
  });

  it("does not expose the direct key", async () => {
    const id = await createDirect(ownerToken, memberId);

    const res = await request(app)
      .get(`${BASE_URL}/${id}`)
      .set("Authorization", `Bearer ${ownerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.conversation).not.toHaveProperty("directKey");
    expect(res.body.conversation).not.toHaveProperty("direct_key");
  });

  it("returns 403 to a user who is not a member", async () => {
    const id = await createDirect(ownerToken, memberId);
    const { accessToken: thirdToken } = await registerAndLogin({
      email: "conv-outsider@example.com",
      username: "conv-outsider",
      password: "SuperSecret123!",
    });

    const res = await request(app)
      .get(`${BASE_URL}/${id}`)
      .set("Authorization", `Bearer ${thirdToken}`);

    expect(res.status).toBe(403);
    expect(res.body.conversation).toBeUndefined();
  });

  it("returns 403 to a non-member of a group", async () => {
    const id = await createGroup(ownerToken, "Closed group", [memberId]);

    const res = await request(app)
      .get(`${BASE_URL}/${id}`)
      .set("Authorization", `Bearer ${tokenFor(thirdId)}`);

    expect(res.status).toBe(403);
  });

  it("returns 404 for a conversation that does not exist", async () => {
    const res = await request(app)
      .get(`${BASE_URL}/${NONEXISTENT_ID}`)
      .set("Authorization", `Bearer ${ownerToken}`);

    expect(res.status).toBe(404);
  });

  it("returns 400 for an invalid conversation id", async () => {
    const res = await request(app)
      .get(`${BASE_URL}/not-a-uuid`)
      .set("Authorization", `Bearer ${ownerToken}`);

    expect(res.status).toBe(400);
  });

  it("requires authentication", async () => {
    const id = await createDirect(ownerToken, memberId);

    const res = await request(app).get(`${BASE_URL}/${id}`);

    expect(res.status).toBe(401);
  });
});

describe("PATCH /api/v1/conversations/:conversationId", () => {
  beforeEach(async () => {
    await resetConversationsTable();
  });

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

  it("lets the admin rename the group", async () => {
    const id = await createGroup(ownerToken, "Old name", [memberId]);

    const res = await request(app)
      .patch(`${BASE_URL}/${id}`)
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ name: "New name" });

    expect(res.status).toBe(200);
    expect(res.body.conversation).toMatchObject({
      id,
      type: "group",
      name: "New name",
      ownerId: ownerId,
    });

    const row = await pool.query(
      "SELECT name FROM conversations WHERE id = $1",
      [id],
    );
    expect(row.rows[0].name).toBe("New name");
  });

  it("lets the admin set the group image", async () => {
    const id = await createGroup(ownerToken, "Pic group", [memberId]);
    const imageUrl = await presignUpload(ownerToken, "conversation");

    const res = await request(app)
      .patch(`${BASE_URL}/${id}`)
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ imageUrl });

    expect(res.status).toBe(200);
    expect(res.body.conversation.imageUrl).toBe(imageUrl);
    expect(res.body.conversation.name).toBe("Pic group");

    const row = await pool.query(
      "SELECT u.public_url FROM conversations c JOIN uploads u ON c.upload_id = u.id WHERE c.id = $1",
      [id],
    );
    expect(row.rows[0].public_url).toBe(imageUrl);
  });

  it("updates name and image together", async () => {
    const id = await createGroup(ownerToken, "Both", [memberId]);
    const imageUrl = await presignUpload(ownerToken, "conversation");

    const res = await request(app)
      .patch(`${BASE_URL}/${id}`)
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ name: "Both updated", imageUrl });

    expect(res.status).toBe(200);
    expect(res.body.conversation).toMatchObject({
      name: "Both updated",
      imageUrl,
    });
  });

  it("does not allow a non-admin member to update the group", async () => {
    const id = await createGroup(ownerToken, "Locked", [memberId]);

    const res = await request(app)
      .patch(`${BASE_URL}/${id}`)
      .set("Authorization", `Bearer ${memberToken}`)
      .send({ name: "Hijacked" });

    expect(res.status).toBe(403);

    const row = await pool.query(
      "SELECT name FROM conversations WHERE id = $1",
      [id],
    );
    expect(row.rows[0].name).toBe("Locked");
  });

  it("does not allow a non-member to update the group", async () => {
    const id = await createGroup(ownerToken, "Private", [memberId]);

    const res = await request(app)
      .patch(`${BASE_URL}/${id}`)
      .set("Authorization", `Bearer ${tokenFor(thirdId)}`)
      .send({ name: "Hijacked" });

    expect(res.status).toBe(403);
  });

  it("does not allow attaching another user's upload", async () => {
    const id = await createGroup(ownerToken, "Guarded", [memberId]);
    const someoneElsesImage = await presignUpload(memberToken, "conversation");

    const res = await request(app)
      .patch(`${BASE_URL}/${id}`)
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ imageUrl: someoneElsesImage });

    expect(res.status).toBe(403);

    const row = await pool.query(
      "SELECT upload_id FROM conversations WHERE id = $1",
      [id],
    );
    expect(row.rows[0].upload_id).toBeNull();
  });

  it("rejects updating a direct conversation", async () => {
    const id = await createDirect(ownerToken, memberId);

    const res = await request(app)
      .patch(`${BASE_URL}/${id}`)
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ name: "Not a group" });

    expect(res.status).toBe(400);

    const row = await pool.query(
      "SELECT name FROM conversations WHERE id = $1",
      [id],
    );
    expect(row.rows[0].name).toBeNull();
  });

  it("returns 400 when there is nothing to update", async () => {
    const id = await createGroup(ownerToken, "Empty patch", [memberId]);

    const res = await request(app)
      .patch(`${BASE_URL}/${id}`)
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({});

    expect(res.status).toBe(400);
  });

  it("returns 400 when the name is too short", async () => {
    const id = await createGroup(ownerToken, "Short", [memberId]);

    const res = await request(app)
      .patch(`${BASE_URL}/${id}`)
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ name: "ab" });

    expect(res.status).toBe(400);
  });

  it("returns 404 for a conversation that does not exist", async () => {
    const res = await request(app)
      .patch(`${BASE_URL}/${NONEXISTENT_ID}`)
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ name: "Ghost" });

    expect(res.status).toBe(404);
  });

  it("returns 400 for an invalid conversation id", async () => {
    const res = await request(app)
      .patch(`${BASE_URL}/not-a-uuid`)
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ name: "Bad id" });

    expect(res.status).toBe(400);
  });

  it("requires authentication", async () => {
    const id = await createGroup(ownerToken, "Auth", [memberId]);

    const res = await request(app)
      .patch(`${BASE_URL}/${id}`)
      .send({ name: "Anon" });

    expect(res.status).toBe(401);
  });
});

describe("POST /api/v1/conversations/:conversationId/members", () => {
  beforeEach(async () => {
    await resetConversationsTable();
  });

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

  it("lets the admin add members", async () => {
    const id = await createGroup(ownerToken, "Growing", [memberId]);

    const res = await request(app)
      .post(`${BASE_URL}/${id}/members`)
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ memberIds: [thirdId] });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
    expect(res.body.members).toEqual([thirdId]);

    const row = await pool.query(
      `SELECT role FROM ${MEMBERS_TABLE} WHERE conversation_id = $1 AND member_id = $2`,
      [id, thirdId],
    );
    expect(row.rows).toHaveLength(1);
    expect(row.rows[0].role).toBe("member");
    expect(await countRows(MEMBERS_TABLE, "conversation_id = $1", [id])).toBe(
      3,
    );
  });

  it("is idempotent — already-present members are skipped and only new ones returned", async () => {
    const id = await createGroup(ownerToken, "Idempotent", [memberId]);

    const res = await request(app)
      .post(`${BASE_URL}/${id}/members`)
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ memberIds: [memberId, thirdId] });

    expect(res.status).toBe(200);
    expect(res.body.members).toEqual([thirdId]);
    expect(await countRows(MEMBERS_TABLE, "conversation_id = $1", [id])).toBe(
      3,
    );

    const again = await request(app)
      .post(`${BASE_URL}/${id}/members`)
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ memberIds: [thirdId] });

    expect(again.status).toBe(200);
    expect(again.body.members).toEqual([]);
    expect(await countRows(MEMBERS_TABLE, "conversation_id = $1", [id])).toBe(
      3,
    );
  });

  it("does not allow a non-admin member to add members", async () => {
    const id = await createGroup(ownerToken, "Locked", [memberId]);

    const res = await request(app)
      .post(`${BASE_URL}/${id}/members`)
      .set("Authorization", `Bearer ${memberToken}`)
      .send({ memberIds: [thirdId] });

    expect(res.status).toBe(403);
    expect(await countRows(MEMBERS_TABLE, "conversation_id = $1", [id])).toBe(
      2,
    );
  });

  it("does not allow a non-member to add members", async () => {
    const id = await createGroup(ownerToken, "Private", [memberId]);

    const res = await request(app)
      .post(`${BASE_URL}/${id}/members`)
      .set("Authorization", `Bearer ${tokenFor(thirdId)}`)
      .send({ memberIds: [thirdId] });

    expect([403, 404]).toContain(res.status);
    expect(await countRows(MEMBERS_TABLE, "conversation_id = $1", [id])).toBe(
      2,
    );
  });

  it("rejects adding members to a direct conversation", async () => {
    const id = await createDirect(ownerToken, memberId);

    const res = await request(app)
      .post(`${BASE_URL}/${id}/members`)
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ memberIds: [thirdId] });

    expect(res.status).toBe(400);
    expect(await countRows(MEMBERS_TABLE, "conversation_id = $1", [id])).toBe(
      2,
    );
  });

  it("returns 400 when any member does not exist and adds nothing", async () => {
    const id = await createGroup(ownerToken, "Ghost", [memberId]);

    const res = await request(app)
      .post(`${BASE_URL}/${id}/members`)
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ memberIds: [thirdId, NONEXISTENT_ID] });

    expect(res.status).toBe(400);
    expect(await countRows(MEMBERS_TABLE, "conversation_id = $1", [id])).toBe(
      2,
    );
  });

  it("returns 400 for an empty memberIds list", async () => {
    const id = await createGroup(ownerToken, "Empty", [memberId]);

    const res = await request(app)
      .post(`${BASE_URL}/${id}/members`)
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ memberIds: [] });

    expect(res.status).toBe(400);
  });

  it("returns 400 when memberIds contains a non-uuid", async () => {
    const id = await createGroup(ownerToken, "Bad ids", [memberId]);

    const res = await request(app)
      .post(`${BASE_URL}/${id}/members`)
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ memberIds: ["nope"] });

    expect(res.status).toBe(400);
  });

  it("returns 404 for a conversation that does not exist", async () => {
    const res = await request(app)
      .post(`${BASE_URL}/${NONEXISTENT_ID}/members`)
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ memberIds: [thirdId] });

    expect(res.status).toBe(404);
  });

  it("requires authentication", async () => {
    const id = await createGroup(ownerToken, "Auth", [memberId]);

    const res = await request(app)
      .post(`${BASE_URL}/${id}/members`)
      .send({ memberIds: [thirdId] });

    expect(res.status).toBe(401);
  });
});

describe("DELETE /api/v1/conversations/:conversationId/members/:memberId", () => {
  beforeEach(async () => {
    await resetConversationsTable();
  });

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

  it("lets the admin remove a member", async () => {
    const id = await createGroup(ownerToken, "Shrinking", [memberId, thirdId]);

    const res = await request(app)
      .delete(`${BASE_URL}/${id}/members/${thirdId}`)
      .set("Authorization", `Bearer ${ownerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
    expect(res.body.member).toEqual({ memberId: thirdId });

    expect(
      await countRows(
        MEMBERS_TABLE,
        "conversation_id = $1 AND member_id = $2",
        [id, thirdId],
      ),
    ).toBe(0);
    expect(await countRows(MEMBERS_TABLE, "conversation_id = $1", [id])).toBe(
      2,
    );
  });

  it("lets a member leave", async () => {
    const id = await createGroup(ownerToken, "Leaving", [memberId]);

    const res = await request(app)
      .delete(`${BASE_URL}/${id}/members/${memberId}`)
      .set("Authorization", `Bearer ${memberToken}`);

    expect(res.status).toBe(200);
    expect(res.body.member).toEqual({ memberId });
    expect(
      await countRows(
        MEMBERS_TABLE,
        "conversation_id = $1 AND member_id = $2",
        [id, memberId],
      ),
    ).toBe(0);
  });

  it("does not allow a non-admin member to remove someone else", async () => {
    const id = await createGroup(ownerToken, "Locked", [memberId, thirdId]);

    const res = await request(app)
      .delete(`${BASE_URL}/${id}/members/${thirdId}`)
      .set("Authorization", `Bearer ${memberToken}`);

    expect(res.status).toBe(403);
    expect(await countRows(MEMBERS_TABLE, "conversation_id = $1", [id])).toBe(
      3,
    );
  });

  it("does not allow removing the admin", async () => {
    const id = await createGroup(ownerToken, "Owned", [memberId]);

    const byMember = await request(app)
      .delete(`${BASE_URL}/${id}/members/${ownerId}`)
      .set("Authorization", `Bearer ${memberToken}`);
    expect(byMember.status).toBe(400);

    const bySelf = await request(app)
      .delete(`${BASE_URL}/${id}/members/${ownerId}`)
      .set("Authorization", `Bearer ${ownerToken}`);
    expect(bySelf.status).toBe(400);

    expect(
      await countRows(
        MEMBERS_TABLE,
        "conversation_id = $1 AND member_id = $2",
        [id, ownerId],
      ),
    ).toBe(1);
  });

  it("does not allow a non-member to remove anyone", async () => {
    const id = await createGroup(ownerToken, "Private", [memberId]);

    const res = await request(app)
      .delete(`${BASE_URL}/${id}/members/${memberId}`)
      .set("Authorization", `Bearer ${tokenFor(thirdId)}`);

    expect(res.status).toBe(403);
    expect(await countRows(MEMBERS_TABLE, "conversation_id = $1", [id])).toBe(
      2,
    );
  });

  it("returns 404 when the target is not a member", async () => {
    const id = await createGroup(ownerToken, "Missing target", [memberId]);

    const res = await request(app)
      .delete(`${BASE_URL}/${id}/members/${thirdId}`)
      .set("Authorization", `Bearer ${ownerToken}`);

    expect(res.status).toBe(404);
  });

  it("rejects removing a member from a direct conversation", async () => {
    const id = await createDirect(ownerToken, memberId);

    const res = await request(app)
      .delete(`${BASE_URL}/${id}/members/${memberId}`)
      .set("Authorization", `Bearer ${ownerToken}`);

    expect(res.status).toBe(400);
    expect(await countRows(MEMBERS_TABLE, "conversation_id = $1", [id])).toBe(
      2,
    );
  });

  it("returns 404 for a conversation that does not exist", async () => {
    const res = await request(app)
      .delete(`${BASE_URL}/${NONEXISTENT_ID}/members/${memberId}`)
      .set("Authorization", `Bearer ${ownerToken}`);

    expect(res.status).toBe(404);
  });

  it("returns 400 for an invalid member id", async () => {
    const id = await createGroup(ownerToken, "Bad id", [memberId]);

    const res = await request(app)
      .delete(`${BASE_URL}/${id}/members/not-a-uuid`)
      .set("Authorization", `Bearer ${ownerToken}`);

    expect(res.status).toBe(400);
  });

  it("requires authentication", async () => {
    const id = await createGroup(ownerToken, "Auth", [memberId]);

    const res = await request(app).delete(
      `${BASE_URL}/${id}/members/${memberId}`,
    );

    expect(res.status).toBe(401);
  });
});

describe("DELETE /api/v1/conversations/:conversationId", () => {
  beforeEach(async () => {
    await resetConversationsTable();
  });

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

  it("lets the admin delete the group and cascades to its members", async () => {
    const id = await createGroup(ownerToken, "Doomed", [memberId, thirdId]);

    const res = await request(app)
      .delete(`${BASE_URL}/${id}`)
      .set("Authorization", `Bearer ${ownerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
    expect(res.body.conversation).toEqual({ id });

    expect(await countRows("conversations", "id = $1", [id])).toBe(0);
    expect(await countRows(MEMBERS_TABLE, "conversation_id = $1", [id])).toBe(
      0,
    );
  });

  it("does not delete other conversations", async () => {
    const doomed = await createGroup(ownerToken, "Doomed", [memberId]);
    const kept = await createGroup(ownerToken, "Kept", [memberId]);

    await request(app)
      .delete(`${BASE_URL}/${doomed}`)
      .set("Authorization", `Bearer ${ownerToken}`);

    expect(await countRows("conversations", "id = $1", [kept])).toBe(1);
    expect(await countRows(MEMBERS_TABLE, "conversation_id = $1", [kept])).toBe(
      2,
    );
  });

  it("does not allow a non-admin member to delete the group", async () => {
    const id = await createGroup(ownerToken, "Locked", [memberId]);

    const res = await request(app)
      .delete(`${BASE_URL}/${id}`)
      .set("Authorization", `Bearer ${memberToken}`);

    expect(res.status).toBe(403);
    expect(await countRows("conversations", "id = $1", [id])).toBe(1);
  });

  it("does not allow a non-member to delete the group", async () => {
    const id = await createGroup(ownerToken, "Private", [memberId]);

    const res = await request(app)
      .delete(`${BASE_URL}/${id}`)
      .set("Authorization", `Bearer ${tokenFor(thirdId)}`);

    expect(res.status).toBe(403);
    expect(await countRows("conversations", "id = $1", [id])).toBe(1);
  });

  it("rejects deleting a direct conversation", async () => {
    const id = await createDirect(ownerToken, memberId);

    const res = await request(app)
      .delete(`${BASE_URL}/${id}`)
      .set("Authorization", `Bearer ${ownerToken}`);

    expect(res.status).toBe(400);
    expect(await countRows("conversations", "id = $1", [id])).toBe(1);
  });

  it("returns 404 for a conversation that does not exist", async () => {
    const res = await request(app)
      .delete(`${BASE_URL}/${NONEXISTENT_ID}`)
      .set("Authorization", `Bearer ${ownerToken}`);

    expect(res.status).toBe(404);
  });

  it("returns 404 when deleting the same group twice", async () => {
    const id = await createGroup(ownerToken, "Once", [memberId]);

    await request(app)
      .delete(`${BASE_URL}/${id}`)
      .set("Authorization", `Bearer ${ownerToken}`)
      .expect(200);
    const again = await request(app)
      .delete(`${BASE_URL}/${id}`)
      .set("Authorization", `Bearer ${ownerToken}`);

    expect(again.status).toBe(404);
  });

  it("returns 400 for an invalid conversation id", async () => {
    const res = await request(app)
      .delete(`${BASE_URL}/not-a-uuid`)
      .set("Authorization", `Bearer ${ownerToken}`);

    expect(res.status).toBe(400);
  });

  it("requires authentication", async () => {
    const id = await createGroup(ownerToken, "Auth", [memberId]);

    const res = await request(app).delete(`${BASE_URL}/${id}`);

    expect(res.status).toBe(401);
  });
});

describe("PATCH /api/v1/conversations/:conversationId/read", () => {
  beforeEach(async () => {
    await resetConversationsTable();
  });

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

  function markRead(token: string, conversationId: string, body: object) {
    return request(app)
      .patch(`${BASE_URL}/${conversationId}/read`)
      .set("Authorization", `Bearer ${token}`)
      .send(body);
  }

  async function markerFor(
    conversationId: string,
    userId: string,
  ): Promise<string | null> {
    const result = await pool.query(
      `SELECT last_read_message_id AS "lastReadMessageId"
         FROM ${MEMBERS_TABLE}
        WHERE conversation_id = $1 AND member_id = $2`,
      [conversationId, userId],
    );
    return result.rows[0]?.lastReadMessageId ?? null;
  }

  it("sets the requester's read marker to the given message", async () => {
    const id = await createDirect(ownerToken, memberId);
    const messageId = await sendMessage(ownerToken, id, "hello");

    const res = await markRead(memberToken, id, { messageId });

    expect(res.status).toBe(204);
    expect(res.body).toEqual({});
    expect(await markerFor(id, memberId)).toBe(messageId);
  });

  it("marks only the requester's own marker, not the other member's", async () => {
    const id = await createDirect(ownerToken, memberId);
    const messageId = await sendMessage(ownerToken, id, "hello");

    await markRead(memberToken, id, { messageId });

    expect(await markerFor(id, memberId)).toBe(messageId);
    expect(await markerFor(id, ownerId)).toBeNull();
  });

  it("clears the unread count once the latest message is marked read", async () => {
    const id = await createDirect(ownerToken, memberId);
    await sendMessage(ownerToken, id, "1");
    const last = await sendMessage(ownerToken, id, "2");

    const before = await request(app)
      .get(BASE_URL)
      .set("Authorization", `Bearer ${memberToken}`);
    expect(before.body.conversations[0].unreadMessagesCount).toBe(2);

    await markRead(memberToken, id, { messageId: last });

    const after = await request(app)
      .get(BASE_URL)
      .set("Authorization", `Bearer ${memberToken}`);
    expect(after.body.conversations[0].unreadMessagesCount).toBe(0);
  });

  it("is idempotent — marking the same message twice leaves the marker unchanged", async () => {
    const id = await createDirect(ownerToken, memberId);
    const messageId = await sendMessage(ownerToken, id, "hello");

    await markRead(memberToken, id, { messageId });
    const res = await markRead(memberToken, id, { messageId });

    expect(res.status).toBe(204);
    expect(await markerFor(id, memberId)).toBe(messageId);
  });

  it("does not move the marker backwards to an older message", async () => {
    const id = await createDirect(ownerToken, memberId);
    const first = await sendMessage(ownerToken, id, "1");
    const second = await sendMessage(ownerToken, id, "2");

    await markRead(memberToken, id, { messageId: second });
    await markRead(memberToken, id, { messageId: first });

    expect(await markerFor(id, memberId)).toBe(second);
  });

  it("does not accept a message that belongs to another conversation", async () => {
    const mine = await createDirect(ownerToken, memberId);
    const other = await createDirect(ownerToken, thirdId);
    const foreign = await sendMessage(ownerToken, other, "elsewhere");

    const res = await markRead(ownerToken, mine, { messageId: foreign });

    expect(res.status).toBe(404);
    expect(await markerFor(mine, ownerId)).toBeNull();
  });

  it("returns 400 when messageId is missing", async () => {
    const id = await createDirect(ownerToken, memberId);
    await sendMessage(ownerToken, id, "hello");

    const res = await markRead(memberToken, id, {});

    expect(res.status).toBe(400);
    expect(await markerFor(id, memberId)).toBeNull();
  });

  it("returns 400 for a malformed messageId", async () => {
    const id = await createDirect(ownerToken, memberId);

    const res = await markRead(memberToken, id, { messageId: "not-a-uuid" });

    expect(res.status).toBe(400);
  });

  it("returns 400 for an invalid conversation id", async () => {
    const res = await markRead(ownerToken, "not-a-uuid", {
      messageId: NONEXISTENT_ID,
    });

    expect(res.status).toBe(400);
  });

  it("returns 404 for a conversation that does not exist", async () => {
    const res = await markRead(ownerToken, NONEXISTENT_ID, {
      messageId: NONEXISTENT_ID,
    });

    expect(res.status).toBe(404);
  });

  it("does not allow a non-member to set a read marker", async () => {
    const id = await createDirect(ownerToken, memberId);
    const messageId = await sendMessage(ownerToken, id, "hello");

    const res = await markRead(tokenFor(thirdId), id, { messageId });

    expect(res.status).toBe(403);
    expect(await markerFor(id, memberId)).toBeNull();
  });

  it("requires authentication", async () => {
    const id = await createDirect(ownerToken, memberId);
    const messageId = await sendMessage(ownerToken, id, "hello");

    const res = await request(app)
      .patch(`${BASE_URL}/${id}/read`)
      .send({ messageId });

    expect(res.status).toBe(401);
  });
});
