import request from "supertest";
import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import app from "../src/app.ts";
import pool from "../src/config/postgres.ts";
import { resetTables, createCommunity, createPost, createUser, resetPostsTable, loginUser} from "./utils.ts";



const BASE_URL = "/api/v1/communities"

const TEST_USER = {
  email: "community-tests@example.com",
  username: "community-tester",
  password: "SuperSecret123!",
};

const OTHER_USER = {
  email: "other-user@example.com",
  username: "other-tester",
  password: "SomeValidPassword123!",
};

let testUserId: string;
let otherUserId: string;
let accessToken: string;
let otherAccessToken: string;
let community;
let communityId: string;
let otherCommunity;
let otherCommunityId: string;

beforeAll(async () => {
    await resetTables();
    testUserId = await createUser(TEST_USER);
    otherUserId = await createUser(OTHER_USER);
    accessToken = await loginUser({email: TEST_USER.email, password: TEST_USER.password})
    otherAccessToken = await loginUser({email: OTHER_USER.email, password: OTHER_USER.password})
    community = await createCommunity(accessToken, {name: "algorithms_club", description: "A place to discuss algorithms"});
    communityId = community.id;   
    otherCommunity = await createCommunity(accessToken, {name: "other-community", description: "Another community"});
    otherCommunityId = otherCommunity.id;
})


describe("POST /api/v1/communities/:communityId/posts", () => {


  beforeEach(async () => {
    await resetPostsTable();
  })

  it("creates a post in a community", async () => {

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
      communityId,
      ownerId: testUserId,
    });

    expect(res.body.post.id).toBeDefined();
    expect(res.body.post.createdAt).toBeDefined();

    // Verify it actually exists in the database
    const dbRow = await pool.query(
      "SELECT * FROM posts WHERE id = $1",
      [res.body.post.id]
    );

    expect(dbRow.rows).toHaveLength(1);
    expect(dbRow.rows[0].owner_id).toBe(testUserId);
    expect(dbRow.rows[0].community_id).toBe(communityId);
    expect(dbRow.rows[0].title).toBe("My first post");
    expect(dbRow.rows[0].text_content).toBe("This is my first post.");
  });


  it("requires authentication", async () => {

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
  
  let post;
  let postId: string;

  beforeEach(async () => {
    await resetPostsTable();
    post = await createPost(communityId, accessToken, {textContent: "This is my first post.", title: "My first post"})
    postId = post.id;    
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
        ownerId: testUserId,
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
    const community = await createCommunity(accessToken, {name: "idcccc", description: "it is useless idk"})
    const communityId = community.id;

    const res = await request(app)
      .get(`${BASE_URL}/${communityId}/posts`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.posts).toEqual([]);
  });

  it("does not return posts from another community", async () => {
     
    const post = await createPost(otherCommunityId, accessToken, {title: "Other post", textContent: "Other Content"})
    const postId = post.id;

    const res = await request(app)
      .get(`${BASE_URL}/${otherCommunityId}/posts`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.posts).toHaveLength(1);
    expect(res.body.posts[0].id).toBe(postId);
  });
});

describe("PATCH /api/v1/communities/:communityId/posts/:postId", () => {

  let post;
  let postId: string;

  beforeEach(async () => {
    await resetPostsTable();
    post = await createPost(communityId, accessToken, {textContent: "Original content", title: "Original title"})
    postId = post.id;    

  }); 
  
  it("updates a post", async () => {
    const res = await request(app)
      .patch(`${BASE_URL}/${communityId}/posts/${postId}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        title: "Updated title",
        textContent: "Updated content",
      });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");

    expect(res.body.post).toMatchObject({
      id: postId,
      title: "Updated title",
      textContent: "Updated content",
      ownerId: testUserId,
      communityId,
    });

    // Verify the database
    const dbRow = await pool.query(
      `SELECT title, text_content, owner_id, community_id
       FROM posts
       WHERE id = $1`,
      [postId]
    );

    expect(dbRow.rows).toHaveLength(1);
    expect(dbRow.rows[0].title).toBe("Updated title");
    expect(dbRow.rows[0].text_content).toBe("Updated content");
    expect(dbRow.rows[0].owner_id).toBe(testUserId);
    expect(dbRow.rows[0].community_id).toBe(communityId);
  });

  it("updates only the title", async () => {
    const res = await request(app)
      .patch(`${BASE_URL}/${communityId}/posts/${postId}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        title: "Updated title",
      });

    expect(res.status).toBe(200);

    expect(res.body.post.title).toBe("Updated title");
    expect(res.body.post.textContent).toBe("Original content");
  });

  it("updates only the text content", async () => {
    const res = await request(app)
      .patch(`${BASE_URL}/${communityId}/posts/${postId}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        textContent: "Updated content",
      });

    expect(res.status).toBe(200);

    expect(res.body.post.title).toBe("Original title");
    expect(res.body.post.textContent).toBe("Updated content");
  });

  it("requires authentication", async () => {
    const res = await request(app)
      .patch(`${BASE_URL}/${communityId}/posts/${postId}`)
      .send({
        title: "Updated title",
      });

    expect(res.status).toBe(401);
  });

  it("rejects an invalid post ID", async () => {
    const res = await request(app)
      .patch(`${BASE_URL}/${communityId}/posts/not-a-uuid`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        title: "Updated title",
      });

    expect(res.status).toBe(400);
  });

  it("returns 404 when the post does not exist", async () => {
    const nonExistentPostId =
      "00000000-0000-0000-0000-000000000000";

    const res = await request(app)
      .patch(`${BASE_URL}/${communityId}/posts/${nonExistentPostId}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        title: "Updated title",
      });

    expect(res.status).toBe(404);
  });

  it("rejects an empty update", async () => {
    const res = await request(app)
      .patch(`${BASE_URL}/${communityId}/posts/${postId}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({});

    expect(res.status).toBe(400);
  });

  it("returns 204 when nothing actually changes", async () => {
    const res = await request(app)
      .patch(`${BASE_URL}/${communityId}/posts/${postId}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        title: "Original title",
        textContent: "Original content",
      });

    expect(res.status).toBe(204);
  });

  it("does not allow another user to update the post", async () => {
    const res = await request(app)
      .patch(`${BASE_URL}/${communityId}/posts/${postId}`)
      .set("Authorization", `Bearer ${otherAccessToken}`)
      .send({
        title: "Hacked title",
      });

    expect(res.status).toBe(403);

    // Verify it wasn't changed
    const dbRow = await pool.query(
      "SELECT title FROM posts WHERE id = $1",
      [postId]
    );

    expect(dbRow.rows[0].title).toBe("Original title");
  });
});

describe("DELETE /api/v1/communities/:communityId/posts/:postId", () => {
  let post;
  let postId: string;

  beforeEach(async () => {

    await resetPostsTable();
    post = await createPost(communityId, accessToken, {textContent: "This Post will be delted", title: "Post to be delete"})
    postId = post.id;    
  });

  it("deletes a post", async () => {
    const res = await request(app)
      .delete(`${BASE_URL}/${communityId}/posts/${postId}`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");

    expect(res.body.post).toMatchObject({
      id: postId,
    });

    // Verify it was actually deleted
    const dbRow = await pool.query(
      "SELECT * FROM posts WHERE id = $1",
      [postId]
    );

    expect(dbRow.rows).toHaveLength(0);
  });

  it("requires authentication", async () => {
    const res = await request(app)
      .delete(`${BASE_URL}/${communityId}/posts/${postId}`);

    expect(res.status).toBe(401);
  });

  it("rejects an invalid post ID", async () => {
    const res = await request(app)
      .delete(`${BASE_URL}/${communityId}/posts/not-a-uuid`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(400);
  });

  it("returns 404 when the post does not exist", async () => {
    const nonExistentPostId =
      "00000000-0000-0000-0000-000000000000";

    const res = await request(app)
      .delete(`${BASE_URL}/${communityId}/posts/${nonExistentPostId}`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(404);
  });

  it("does not allow another user to delete the post", async () => {
    const res = await request(app)
      .delete(`${BASE_URL}/${communityId}/posts/${postId}`)
      .set("Authorization", `Bearer ${otherAccessToken}`);

    expect(res.status).toBe(403);

    // Verify it wasn't deleted
    const dbRow = await pool.query(
      "SELECT * FROM posts WHERE id = $1",
      [postId]
    );

    expect(dbRow.rows).toHaveLength(1);
  });
});
