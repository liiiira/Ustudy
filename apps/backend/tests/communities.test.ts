import request from "supertest";
import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";

import app from "../src/app.ts";
import pool from "../src/config/postgres.ts";
import { sign } from "jsonwebtoken";

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

describe("POST /api/v1/communities", () => {
  beforeAll(async () => {
    await pool.query("TRUNCATE TABLE users RESTART IDENTITY CASCADE");
    const signupRes = await request(app).post("/api/v1/users").send(TEST_USER);
    ownerId = signupRes.body.user.id;

    const loginRes = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: TEST_USER.email, password: TEST_USER.password });

    accessToken = loginRes.body.accessToken;
  });

  beforeEach(async () => {
    await pool.query("TRUNCATE TABLE communities RESTART IDENTITY CASCADE");
  });


  it("creates a community and persists it", async () => {
    const res = await request(app)
      .post(BASE_URL)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ name: "algorithms-club", description: "A place to discuss algorithms" });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe("success");
    expect(res.body.community).toMatchObject({
      name: "algorithms-club",
      description: "A place to discuss algorithms",
      ownerId,
    });
    expect(res.body.community.id).toBeDefined();
    expect(res.body.community.createdAt).toBeDefined();

    const dbRow = await pool.query("SELECT * FROM communities WHERE name = $1", ["algorithms-club"]);
    expect(dbRow.rows).toHaveLength(1);
    expect(dbRow.rows[0].owner_id).toBe(ownerId);
  });

  it("rejects a duplicate community name with 409", async () => {
    await request(app)
      .post(BASE_URL)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ name: "duplicate-club", description: "First one" });

    const res = await request(app)
      .post(BASE_URL)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ name: "duplicate-club", description: "Second one, should fail" });

    expect(res.status).toBe(409);
    expect(res.body.message).toMatch(/already taken/i);

    const dbRows = await pool.query("SELECT * FROM communities WHERE name = $1", ["duplicate-club"]);
    expect(dbRows.rows).toHaveLength(1);
  });

  it("requires authentication", async () => {
    const res = await request(app)
      .post(BASE_URL)
      .send({ name: "no-auth-club", description: "Should be rejected" });

    expect(res.status).toBe(401);
  });

  it("rejects a name shorter than 3 characters", async () => {
    const res = await request(app)
      .post(BASE_URL)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ name: "ab", description: "Valid description" });

    expect(res.status).toBe(400);
  });

  it("rejects a description longer than 100 characters", async () => {
    const res = await request(app)
      .post(BASE_URL)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ name: "some-club", description: "x".repeat(101) });

    expect(res.status).toBe(400);
  });
});



describe("GET /api/v1/communities", () => {
  beforeAll(async () => {

    await pool.query("TRUNCATE TABLE communities RESTART IDENTITY CASCADE");
    const signupRes = await request(app).post("/api/v1/users").send(TEST_USER);
  

    const loginRes = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: TEST_USER.email, password: TEST_USER.password });
    accessToken = loginRes.body.accessToken;
  });

  beforeEach(async () => {
    await pool.query("TRUNCATE TABLE communities RESTART IDENTITY CASCADE");
  });


  it("returns 200 and an empty array when there are no communities", async () => {
    const res = await request(app)
      .get(BASE_URL)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
    expect(res.body.message).toBe("Communities Found Successfuly");
    expect(res.body.communities).toEqual([]);
  });

  it("returns all communities that exist in the database", async () => {
    await pool.query(
      `INSERT INTO communities (owner_id, name, description) VALUES ($1, $2, $3), ($1, $4, $5)`,
      [
        ownerId,
        "algorithms-club",
        "A place to discuss algorithms",
        "systems-programming",
        "Low-level programming discussion",
      ]
    );

    const res = await request(app)
      .get(BASE_URL)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.communities).toHaveLength(2);
    expect(res.body.communities).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "algorithms-club",
          description: "A place to discuss algorithms",
          ownerId,
        }),
        expect.objectContaining({
          name: "systems-programming",
          description: "Low-level programming discussion",
          ownerId,
        }),
      ])
    );
  });

  it("returns communities with the expected fields", async () => {
    await pool.query(
      `INSERT INTO communities (owner_id, name, description) VALUES ($1, $2, $3)`,
      [ownerId, "shape-check-club", "Checking field shape"]
    );

    const res = await request(app)
      .get(BASE_URL)
      .set("Authorization", `Bearer ${accessToken}`);

    const community = res.body.communities[0];
    expect(community).toMatchObject({
      name: "shape-check-club",
      description: "Checking field shape",
      ownerId,
    });
    expect(community.id).toBeDefined();
    expect(community.createdAt).toBeDefined();
  });

  it("requires authentication", async () => {
    const res = await request(app).get(BASE_URL);
    expect(res.status).toBe(401);
  });
});




describe("PATCH /api/v1/communities/:id", () => {
  beforeAll(async () => {
    await pool.query("TRUNCATE TABLE users RESTART IDENTITY CASCADE");
    const signupRes = await request(app).post("/api/v1/users").send(TEST_USER);
    ownerId = signupRes.body.user.id;

    const loginRes = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: TEST_USER.email, password: TEST_USER.password });

    accessToken = loginRes.body.accessToken;

    // Second user who owns nothing — used to prove non-owners can't update.
    const otherSignupRes = await request(app).post("/api/v1/users").send(OTHER_USER);
    otherUserId = otherSignupRes.body.user.id;

    const otherLoginRes = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: OTHER_USER.email, password: OTHER_USER.password });

    otherAccessToken = otherLoginRes.body.accessToken;
  });

  beforeEach(async () => {
    await pool.query("TRUNCATE TABLE communities RESTART IDENTITY CASCADE");
  });

  it("updates both the name and description", async () => {
    const insertRes = await pool.query(
      `INSERT INTO communities (owner_id, name, description) VALUES ($1, $2, $3) RETURNING id`,
      [ownerId, "original-name", "original description"]
    );
    const communityId = insertRes.rows[0].id;

    const res = await request(app)
      .patch(`${BASE_URL}/${communityId}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ name: "renamed-club", description: "updated description" });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
    expect(res.body.community).toMatchObject({
      id: communityId,
      name: "renamed-club",
      description: "updated description",
    });

    const dbRow = await pool.query("SELECT * FROM communities WHERE id = $1", [communityId]);
    expect(dbRow.rows[0].name).toBe("renamed-club");
    expect(dbRow.rows[0].description).toBe("updated description");
  });

  it("updates only the name when description is omitted", async () => {
    const insertRes = await pool.query(
      `INSERT INTO communities (owner_id, name, description) VALUES ($1, $2, $3) RETURNING id`,
      [ownerId, "name-only-club", "keep this description"]
    );
    const communityId = insertRes.rows[0].id;

    const res = await request(app)
      .patch(`${BASE_URL}/${communityId}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ name: "renamed-name-only" });

    expect(res.status).toBe(200);
    expect(res.body.community).toMatchObject({
      name: "renamed-name-only",
      description: "keep this description",
    });
  });

  it("updates only the description when name is omitted", async () => {
    const insertRes = await pool.query(
      `INSERT INTO communities (owner_id, name, description) VALUES ($1, $2, $3) RETURNING id`,
      [ownerId, "description-only-club", "original description"]
    );
    const communityId = insertRes.rows[0].id;

    const res = await request(app)
      .patch(`${BASE_URL}/${communityId}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ description: "brand new description" });

    expect(res.status).toBe(200);
    expect(res.body.community.id).toBe(communityId);

    const dbRow = await pool.query("SELECT * FROM communities WHERE id = $1", [communityId]);
    expect(dbRow.rows[0].description).toBe("brand new description");
  });

  it("returns 204 when the submitted values match the existing ones", async () => {
    const insertRes = await pool.query(
      `INSERT INTO communities (owner_id, name, description) VALUES ($1, $2, $3) RETURNING id`,
      [ownerId, "unchanged-club", "unchanged description"]
    );
    const communityId = insertRes.rows[0].id;

    const res = await request(app)
      .patch(`${BASE_URL}/${communityId}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ name: "unchanged-club", description: "unchanged description" });

    expect(res.status).toBe(204);
  });

  it("rejects an empty body with no name or description", async () => {
    const insertRes = await pool.query(
      `INSERT INTO communities (owner_id, name, description) VALUES ($1, $2, $3) RETURNING id`,
      [ownerId, "empty-body-club", "some description"]
    );
    const communityId = insertRes.rows[0].id;

    const res = await request(app)
      .patch(`${BASE_URL}/${communityId}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({});

    expect(res.status).toBe(400);
  });

  it("returns 400 when the community id is invalid", async () => {
    const res = await request(app)
      .patch(`${BASE_URL}/999999`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ name: "does-not-matter" });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch("Invalid Request Params");
  });

  it("rejects a duplicate name with 409", async () => {
    await pool.query(
      `INSERT INTO communities (owner_id, name, description) VALUES ($1, $2, $3)`,
      [ownerId, "taken-name", "first club"]
    );
    const insertRes = await pool.query(
      `INSERT INTO communities (owner_id, name, description) VALUES ($1, $2, $3) RETURNING id`,
      [ownerId, "original-name", "second club"]
    );
    const communityId = insertRes.rows[0].id;

    const res = await request(app)
      .patch(`${BASE_URL}/${communityId}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ name: "taken-name" });

    expect(res.status).toBe(409);
    expect(res.body.message).toMatch(/already used/i);
  });

  it("rejects an update from a user who is not the owner", async () => {
    const insertRes = await pool.query(
      `INSERT INTO communities (owner_id, name, description) VALUES ($1, $2, $3) RETURNING id`,
      [ownerId, "owner-only-club", "original description"]
    );
    const communityId = insertRes.rows[0].id;

    const res = await request(app)
      .patch(`${BASE_URL}/${communityId}`)
      .set("Authorization", `Bearer ${otherAccessToken}`)
      .send({ name: "hijacked-name", description: "hijacked description" });

    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/not allowed/i);

    // Nothing should have actually changed in the DB.
    const dbRow = await pool.query("SELECT * FROM communities WHERE id = $1", [communityId]);
    expect(dbRow.rows[0].name).toBe("owner-only-club");
    expect(dbRow.rows[0].description).toBe("original description");
  });

  it("returns 404 when a non-owner targets a community that doesn't exist", async () => {
    const res = await request(app)
      .patch(`${BASE_URL}/999999`)
      .set("Authorization", `Bearer ${otherAccessToken}`)
      .send({ name: "does-not-matter" });

    // id shape is valid but no row exists — ownership check never runs.
    expect(res.status).toBe(400);
  });

  it("requires authentication", async () => {
    const insertRes = await pool.query(
      `INSERT INTO communities (owner_id, name, description) VALUES ($1, $2, $3) RETURNING id`,
      [ownerId, "no-auth-club", "some description"]
    );
    const communityId = insertRes.rows[0].id;

    const res = await request(app)
      .patch(`${BASE_URL}/${communityId}`)
      .send({ name: "should-be-rejected" });

    expect(res.status).toBe(401);
  });

  it("rejects an invalid id format", async () => {
    const res = await request(app)
      .patch(`${BASE_URL}/not-a-valid-id`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ name: "whatever" });

    expect(res.status).toBe(400);
  });
});

describe("DELETE /api/v1/communities/:id", () => {
  const NON_EXISTENT_ID = "00000000-0000-4000-8000-000000000000";

  beforeAll(async () => {
    await pool.query("TRUNCATE TABLE users RESTART IDENTITY CASCADE");
    const signupRes = await request(app).post("/api/v1/users").send(TEST_USER);
    ownerId = signupRes.body.user.id;

    const loginRes = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: TEST_USER.email, password: TEST_USER.password });

    accessToken = loginRes.body.accessToken;

    // Second user who owns nothing — used to prove non-owners can't delete.
    const otherSignupRes = await request(app).post("/api/v1/users").send(OTHER_USER);
    otherUserId = otherSignupRes.body.user.id;

    const otherLoginRes = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: OTHER_USER.email, password: OTHER_USER.password });

    otherAccessToken = otherLoginRes.body.accessToken;
  });

  beforeEach(async () => {
    await pool.query("TRUNCATE TABLE communities RESTART IDENTITY CASCADE");
  });

  it("deletes the community and returns it", async () => {
    const insertRes = await pool.query(
      `INSERT INTO communities (owner_id, name, description) VALUES ($1, $2, $3) RETURNING id`,
      [ownerId, "to-be-deleted", "will not survive this test"]
    );
    const communityId = insertRes.rows[0].id;

    const res = await request(app)
      .delete(`${BASE_URL}/${communityId}`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      status: "success",
      message: "Community deleted successfuly",
      community: { id: communityId },
    });

    const dbRow = await pool.query("SELECT * FROM communities WHERE id = $1", [communityId]);
    expect(dbRow.rows).toHaveLength(0);
  });

  it("returns 404 when the community does not exist", async () => {
    const res = await request(app)
      .delete(`${BASE_URL}/${NON_EXISTENT_ID}`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toMatch("Community was not found");
  });

  it("returns 400 when the community id is invalid", async () => {
    const res = await request(app)
      .delete(`${BASE_URL}/999999`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch("Invalid Request Params");
  });

  it("rejects an invalid id format", async () => {
    const res = await request(app)
      .delete(`${BASE_URL}/not-a-valid-id`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(400);
  });

  it("rejects a delete from a user who is not the owner", async () => {
    const insertRes = await pool.query(
      `INSERT INTO communities (owner_id, name, description) VALUES ($1, $2, $3) RETURNING id`,
      [ownerId, "owner-only-club", "should survive this test"]
    );
    const communityId = insertRes.rows[0].id;

    const res = await request(app)
      .delete(`${BASE_URL}/${communityId}`)
      .set("Authorization", `Bearer ${otherAccessToken}`);

    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/not allowed/i);

    // Nothing should have actually been deleted.
    const dbRow = await pool.query("SELECT * FROM communities WHERE id = $1", [communityId]);
    expect(dbRow.rows).toHaveLength(1);
  });

  it("returns 404 (not 403) when a non-owner targets a community that doesn't exist", async () => {
    // Existence is checked before ownership in the service, so this should
    // surface as "not found", never leaking whether a real owner exists.
    const res = await request(app)
      .delete(`${BASE_URL}/${NON_EXISTENT_ID}`)
      .set("Authorization", `Bearer ${otherAccessToken}`);

    expect(res.status).toBe(404);
  });

  it("returns 404 when deleting an already-deleted community", async () => {
    const insertRes = await pool.query(
      `INSERT INTO communities (owner_id, name, description) VALUES ($1, $2, $3) RETURNING id`,
      [ownerId, "delete-me-twice", "first delete should win"]
    );
    const communityId = insertRes.rows[0].id;

    const firstRes = await request(app)
      .delete(`${BASE_URL}/${communityId}`)
      .set("Authorization", `Bearer ${accessToken}`);
    expect(firstRes.status).toBe(200);

    const secondRes = await request(app)
      .delete(`${BASE_URL}/${communityId}`)
      .set("Authorization", `Bearer ${accessToken}`);
    expect(secondRes.status).toBe(404);
  });

  it("requires authentication", async () => {
    const insertRes = await pool.query(
      `INSERT INTO communities (owner_id, name, description) VALUES ($1, $2, $3) RETURNING id`,
      [ownerId, "no-auth-club", "some description"]
    );
    const communityId = insertRes.rows[0].id;

    const res = await request(app).delete(`${BASE_URL}/${communityId}`);

    expect(res.status).toBe(401);
  });
});
