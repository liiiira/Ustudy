import request from "supertest";
import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import app from "../src/app.ts";
import pool from "../src/config/postgres.ts";
import { resetTables } from "./db.ts";

const BASE_URL = "/api/v1/communities";

const TEST_USER = {
  email: "community-tests@example.com",
  username: "community-tester",
  password: "SuperSecret123!",
};

let otherUserId: string;
let otherAccessToken: string;

const OTHER_USER = {
  email: "other-user@example.com",
  username: "other-tester",
  password: "SomeValidPassword123!",
  // ...whatever other fields TEST_USER requires
};

let accessToken: string;
let ownerId: string;


describe("POST /api/v1/communities/:communityId/posts", () => {

  beforeAll(async () => {
    await pool.query("TRUNCATE TABLE users RESTART IDENTITY CASCADE");

    const signupRes = await request(app)
      .post("/api/v1/users")
      .send(TEST_USER);

    ownerId = signupRes.body.user.id;

    const loginRes = await request(app)
      .post("/api/v1/auth/login")
      .send({
        email: TEST_USER.email,
        password: TEST_USER.password,
      });

    accessToken = loginRes.body.accessToken;

    // Create the second user
    const otherSignupRes = await request(app)
      .post("/api/v1/users")
      .send(OTHER_USER);

    otherUserId = otherSignupRes.body.user.id;

    const otherLoginRes = await request(app)
      .post("/api/v1/auth/login")
      .send({
        email: OTHER_USER.email,
        password: OTHER_USER.password,
      });

    otherAccessToken = otherLoginRes.body.accessToken;
  });

  beforeEach(async () => {
    await pool.query("TRUNCATE TABLE communities RESTART IDENTITY CASCADE");
  });

  it("creates a post in a community", async () => {
    // Create a community first
    const communityRes = await request(app)
      .post(BASE_URL)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        name: "algorithms_club",
        description: "A place to discuss algorithms",
      });

    const communityId: string = communityRes.body.community.id;
    console.log("HEEEEEEEEY: ", communityRes.body.community);
    

    const res = await request(app)
      .post(`${BASE_URL}/${communityId}/posts`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        title: "My first post",
        textContent: "This is my first post.",
      });
    
    expect(res.status).toBe(201);
    expect(res.body.status).toBe("success");

    expect(res.body.post).toMatchObject({
      title: "My first post",
      textContent: "This is my first post.",
      ownerId,
      communityId,
    });

    expect(res.body.post.id).toBeDefined();
    expect(res.body.post.createdAt).toBeDefined();

    // Verify it actually exists in the database
    const dbRow = await pool.query(
      "SELECT * FROM posts WHERE id = $1",
      [res.body.post.id]
    );

    expect(dbRow.rows).toHaveLength(1);
    expect(dbRow.rows[0].owner_id).toBe(ownerId);
    expect(dbRow.rows[0].community_id).toBe(communityId);
    expect(dbRow.rows[0].title).toBe("My first post");
    expect(dbRow.rows[0].text_content).toBe("This is my first post.");
  });


  it("requirees authentication", async () => {
    const communityRes = await request(app)
      .post(BASE_URL)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        name: "algorithms-club",
        description: "A place to discuss algorithms",
      });

    const communityId = communityRes.body.community.id;

    const res = await request(app)
      .post(`${BASE_URL}/${communityId}/posts`)
      .send({
        title: "My post",
        textContent: "Some content",
      });

    expect(res.status).toBe(401);
  });

  it("rejects an invalid community ID", async () => {
    const res = await request(app)
      .post(`${BASE_URL}/not-a-uuid/posts`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        title: "My post",
        textContent: "Some content",
      });

    expect(res.status).toBe(400);
  });

  it("rejects invalid post data", async () => {
    const communityRes = await request(app)
      .post(BASE_URL)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        name: "algorithms-club",
        description: "A place to discuss algorithms",
      });

    const communityId = communityRes.body.community.id;

    const res = await request(app)
      .post(`${BASE_URL}/${communityId}/posts`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        title: "",
        textContent: "",
      });

    expect(res.status).toBe(400);
  });

  it("returns 400 when the community does not exist", async () => {
    const nonExistentCommunityId =
      "00000000-0000-0000-0000-000000000000";

    const res = await request(app)
      .post(`${BASE_URL}/${nonExistentCommunityId}/posts`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        title: "My post",
        textContent: "Some content",
      });

    expect(res.status).toBe(404);
  });
});

describe("GET /api/v1/communities/:communityId/posts", () => {
  let communityId: string;
  let postId: string;

  beforeEach(async () => {
    await pool.query("TRUNCATE TABLE communities RESTART IDENTITY CASCADE");
    const communityRes = await request(app)
      .post(BASE_URL)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        name: "algorithms-club",
        description: "A place to discuss algorithms",
      });

    communityId = communityRes.body.community.id;

    const postRes = await request(app)
      .post(`${BASE_URL}/${communityId}/posts`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        title: "My first post",
        textContent: "This is my first post.",
      });

    postId = postRes.body.post.id;
  });

  it("returns all posts belonging to a community", async () => {
    const res = await request(app)
      .get(`${BASE_URL}/${communityId}/posts`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
    expect(res.body.posts).toHaveLength(1);

    expect(res.body.posts[0]).toMatchObject({
      id: postId,
      title: "My first post",
      textContent: "This is my first post.",
      ownerId,
      communityId,
    });
  });

  it("requires authentication", async () => {
    const res = await request(app)
      .get(`${BASE_URL}/${communityId}/posts`);

    expect(res.status).toBe(401);
  });

  it("rejects an invalid community ID", async () => {
    const res = await request(app)
      .get(`${BASE_URL}/not-a-uuid/posts`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(400);
  });

  it("returns an empty array when the community has no posts", async () => {
    await pool.query("DELETE FROM posts WHERE id = $1", [postId]);

    const res = await request(app)
      .get(`${BASE_URL}/${communityId}/posts`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.posts).toEqual([]);
  });

  it("does not return posts from another community", async () => {
    const otherCommunityRes = await request(app)
      .post(BASE_URL)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        name: "other-community",
        description: "Another community",
      });

    const otherCommunityId = otherCommunityRes.body.community.id;

    await request(app)
      .post(`${BASE_URL}/${otherCommunityId}/posts`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        title: "Other post",
        textContent: "Other content",
      });

    const res = await request(app)
      .get(`${BASE_URL}/${communityId}/posts`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.posts).toHaveLength(1);
    expect(res.body.posts[0].id).toBe(postId);
  });
});
