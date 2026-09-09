import request from "supertest";
import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import app from "../src/app.ts";
import { resetTables, createCommunity, createPost, createUser, loginUser, resetCommentsTable} from "./utils.ts";


// full url for the endpoint we wanna test  is
// /api/v1/communities/:communityId/posts/:postId/comments/ 
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

const COMMUNITY = {
  name: "algorithm_club",
  description: "a place to discuss algorithms",
}

const POST = {
  title: "random post title",
  textContent: "ranodom text content",
}

let testUserId: string;
let otherUserId: string;
let accessToken: string;
let otherAccessToken: string;
let community;
let communityId: string;
let post;
let postId: string;

beforeAll(async () => {
    await resetTables();
    testUserId = await createUser(TEST_USER);
    otherUserId = await createUser(OTHER_USER);
    accessToken = await loginUser({email: TEST_USER.email, password: TEST_USER.password})
    otherAccessToken = await loginUser({email: OTHER_USER.email, password: OTHER_USER.password})
    community = await createCommunity(accessToken, COMMUNITY);
    communityId = community.id;   
    post = await createPost(communityId, accessToken, POST);
    postId = post.id;
});

beforeEach(async () => {
  await resetCommentsTable();
})
describe("POST /api/v1/communities/:communityId/posts/:postId/comments", () => {
  const commentUrl = () => `${BASE_URL}/${communityId}/posts/${postId}/comments`;

  it("creates a comment successfully", async () => {
    const res = await request(app)
      .post(commentUrl())
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ textContent: "This is a great post!" });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe("success");
    expect(res.body.comment).toMatchObject({
      ownerId: testUserId,
      postId,
      textContent: "This is a great post!",
    });
    expect(res.body.comment.id).toBeDefined();
    expect(res.body.comment.createdAt).toBeDefined();
  });

  it("rejects when not authenticated", async () => {
    const res = await request(app)
      .post(commentUrl())
      .send({ textContent: "No auth here" });

    expect(res.status).toBe(401);
  });

  it("rejects a request with missing textContent", async () => {
    const res = await request(app)
      .post(commentUrl())
      .set("Authorization", `Bearer ${accessToken}`)
      .send({});

    expect(res.status).toBe(400);
  });

  it("rejects an empty textContent", async () => {
    const res = await request(app)
      .post(commentUrl())
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ textContent: "" });

    expect(res.status).toBe(400);
  });

  it("rejects textContent over 1000 characters", async () => {
    const res = await request(app)
      .post(commentUrl())
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ textContent: "a".repeat(1001) });

    expect(res.status).toBe(400);
  });

  it("rejects an invalid postId format", async () => {
    const res = await request(app)
      .post(`${BASE_URL}/${communityId}/posts/not-a-uuid/comments`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ textContent: "Valid text" });

    expect(res.status).toBe(400);
  });

  it("allows a different authenticated user to comment on the same post", async () => {
    const res = await request(app)
      .post(commentUrl())
      .set("Authorization", `Bearer ${otherAccessToken}`)
      .send({ textContent: "Commenting as another user" });

    expect(res.status).toBe(201);
    expect(res.body.comment.ownerId).toBe(otherUserId);
  });
  
  it("returns 404 for a well-formed but nonexistent postId", async () => {
    const nonexistentPostId = "00000000-0000-0000-0000-000000000000";

    const res = await request(app)
      .post(`${BASE_URL}/${communityId}/posts/${nonexistentPostId}/comments`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ textContent: "Commenting on a ghost post" });

    expect(res.status).toBe(404);
  });
});



describe("GET /api/v1/communities/:communityId/posts/:postId/comments", () => {
  const commentUrl = () => `${BASE_URL}/${communityId}/posts/${postId}/comments`;

  const seedComment = async (token: string, textContent: string) => {
    const res = await request(app)
      .post(commentUrl())
      .set("Authorization", `Bearer ${token}`)
      .send({ textContent });
    return res.body.comment;
  };

  it("returns an empty array when the post has no comments", async () => {
    const res = await request(app)
      .get(commentUrl())
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
    expect(res.body.comments).toEqual([]);
  });

  it("returns all comments for the post with owner usernames joined", async () => {
    await seedComment(accessToken, "First comment");
    await seedComment(otherAccessToken, "Second comment");

    const res = await request(app)
      .get(commentUrl())
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.comments).toHaveLength(2);

    const usernames = res.body.comments.map((c: any) => c.ownerUsername);
    expect(usernames).toContain(TEST_USER.username);
    expect(usernames).toContain(OTHER_USER.username);

    expect(res.body.comments[0]).toMatchObject({
      id: expect.any(String),
      postId,
      ownerId: expect.any(String),
      textContent: expect.any(String),
      createdAt: expect.any(String),
      ownerUsername: expect.any(String),
    });
  });

  it("only returns comments belonging to the requested post", async () => {
    const otherPost = await createPost(communityId, accessToken, {
      title: "another post",
      textContent: "unrelated content",
    });

    await seedComment(accessToken, "Comment on original post");
    await request(app)
      .post(`${BASE_URL}/${communityId}/posts/${otherPost.id}/comments`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ textContent: "Comment on other post" });

    const res = await request(app)
      .get(commentUrl())
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.comments).toHaveLength(1);
    expect(res.body.comments[0].textContent).toBe("Comment on original post");
  });

  it("rejects an invalid postId format", async () => {
    const res = await request(app)
      .get(`${BASE_URL}/${communityId}/posts/not-a-uuid/comments`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(400);
  });

    it("returns 404 for a well-formed but nonexistent postId", async () => {
    const nonexistentPostId = "00000000-0000-0000-0000-000000000000";

    const res = await request(app)
      .get(`${BASE_URL}/${communityId}/posts/${nonexistentPostId}/comments`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(404);
  }); 
});
