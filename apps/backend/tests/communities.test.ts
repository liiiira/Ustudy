import request from "supertest";
import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import { createUser, loginUser, createCommunity, resetCommunitiesTable, resetTables } from "./utils.ts";
import app from "../src/app.ts";
import pool from "../src/config/postgres.ts";

const BASE_URL = "/api/v1/communities";

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
let accessToken: string;
let otherAccessToken: string;

beforeAll(async () => {
  await resetTables();
  testUserId = await createUser(TEST_USER);
  await createUser(OTHER_USER);
  accessToken = await loginUser({ email: TEST_USER.email, password: TEST_USER.password });
  otherAccessToken = await loginUser({ email: OTHER_USER.email, password: OTHER_USER.password });
});

describe("POST /api/v1/communities", () => {

  beforeEach(resetCommunitiesTable);

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
      ownerId: testUserId,
    });
    expect(res.body.community.id).toBeDefined();
    expect(res.body.community.createdAt).toBeDefined();

    const dbRow = await pool.query("SELECT * FROM communities WHERE name = $1", ["algorithms-club"]);
    expect(dbRow.rows).toHaveLength(1);
    expect(dbRow.rows[0].owner_id).toBe(testUserId);
  });

  it("rejects a duplicate community name with 409", async () => {
    await createCommunity(accessToken, { name: "duplicate-club", description: "First one" });

    const res = await request(app)
      .post(BASE_URL)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ name: "duplicate-club", description: "Second one, should fail" });

    expect(res.status).toBe(409);
    expect(res.body.message).toMatch(/already taken/i);
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

  beforeEach(resetCommunitiesTable);

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
    await createCommunity(accessToken, { name: "algorithms-club", description: "A place to discuss algorithms" });
    await createCommunity(accessToken, { name: "systems-programming", description: "Low-level programming discussion" });

    const res = await request(app)
      .get(BASE_URL)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.communities).toHaveLength(2);
    expect(res.body.communities).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "algorithms-club", description: "A place to discuss algorithms", ownerId: testUserId }),
        expect.objectContaining({ name: "systems-programming", description: "Low-level programming discussion", ownerId: testUserId }),
      ])
    );
  });

  it("returns communities with the expected fields", async () => {
    await createCommunity(accessToken, { name: "shape-check-club", description: "Checking field shape" });

    const res = await request(app)
      .get(BASE_URL)
      .set("Authorization", `Bearer ${accessToken}`);

    const community = res.body.communities[0];
    expect(community).toMatchObject({
      name: "shape-check-club",
      description: "Checking field shape",
      ownerId: testUserId,
    });
    expect(community.id).toBeDefined();
    expect(community.createdAt).toBeDefined();
  });

  it("requires authentication", async () => {
    const res = await request(app).get(BASE_URL);
    expect(res.status).toBe(401);
  });
});

describe("GET /api/v1/communities/:id", () => {
  const NON_EXISTENT_ID = "00000000-0000-4000-8000-000000000000";

  beforeEach(resetCommunitiesTable);

  it("fetches the community by id", async () => {
    const community = await createCommunity(accessToken, { name: "fetchable-club", description: "a description worth reading" });

    const res = await request(app)
      .get(`${BASE_URL}/${community.id}`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      status: "success",
      message: "Community Fetched Successfuly",
      community: {
        id: community.id,
        name: "fetchable-club",
        description: "a description worth reading",
        ownerId: testUserId,
      },
    });
  });

  it("allows a non-owner to fetch the community", async () => {
    const community = await createCommunity(accessToken, { name: "public-club", description: "readable by anyone logged in" });

    const res = await request(app)
      .get(`${BASE_URL}/${community.id}`)
      .set("Authorization", `Bearer ${otherAccessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.community.id).toBe(community.id);
  });

  it("returns 404 when the community does not exist", async () => {
    const res = await request(app)
      .get(`${BASE_URL}/${NON_EXISTENT_ID}`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toMatch("Community was not found");
  });

  it("returns 404 after the community has been deleted", async () => {
    const community = await createCommunity(accessToken, { name: "soon-gone-club", description: "temporary" });

    await pool.query("DELETE FROM communities WHERE id = $1", [community.id]);

    const res = await request(app)
      .get(`${BASE_URL}/${community.id}`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(404);
  });

  it("returns 400 when the community id is invalid", async () => {
    const res = await request(app)
      .get(`${BASE_URL}/999999`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch("Invalid Request Params");
  });

  it("requires authentication", async () => {
    const community = await createCommunity(accessToken, { name: "no-auth-club", description: "some description" });

    const res = await request(app).get(`${BASE_URL}/${community.id}`);

    expect(res.status).toBe(401);
  });
});

describe("PATCH /api/v1/communities/:id", () => {

  beforeEach(resetCommunitiesTable);

  it("updates both the name and description", async () => {
    const community = await createCommunity(accessToken, { name: "original-name", description: "original description" });

    const res = await request(app)
      .patch(`${BASE_URL}/${community.id}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ name: "renamed-club", description: "updated description" });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
    expect(res.body.community).toMatchObject({
      id: community.id,
      name: "renamed-club",
      description: "updated description",
    });

    const dbRow = await pool.query("SELECT * FROM communities WHERE id = $1", [community.id]);
    expect(dbRow.rows[0].name).toBe("renamed-club");
    expect(dbRow.rows[0].description).toBe("updated description");
  });

  it("updates only the name when description is omitted", async () => {
    const community = await createCommunity(accessToken, { name: "name-only-club", description: "keep this description" });

    const res = await request(app)
      .patch(`${BASE_URL}/${community.id}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ name: "renamed-name-only" });

    expect(res.status).toBe(200);
    expect(res.body.community).toMatchObject({
      name: "renamed-name-only",
      description: "keep this description",
    });
  });

  it("updates only the description when name is omitted", async () => {
    const community = await createCommunity(accessToken, { name: "description-only-club", description: "original description" });

    const res = await request(app)
      .patch(`${BASE_URL}/${community.id}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ description: "brand new description" });

    expect(res.status).toBe(200);
    expect(res.body.community.id).toBe(community.id);

    const dbRow = await pool.query("SELECT * FROM communities WHERE id = $1", [community.id]);
    expect(dbRow.rows[0].description).toBe("brand new description");
  });

  it("returns 204 when the submitted values match the existing ones", async () => {
    const community = await createCommunity(accessToken, { name: "unchanged-club", description: "unchanged description" });

    const res = await request(app)
      .patch(`${BASE_URL}/${community.id}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ name: "unchanged-club", description: "unchanged description" });

    expect(res.status).toBe(204);
  });

  it("rejects an empty body with no name or description", async () => {
    const community = await createCommunity(accessToken, { name: "empty-body-club", description: "some description" });

    const res = await request(app)
      .patch(`${BASE_URL}/${community.id}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({});

    expect(res.status).toBe(400);
  });

  it("returns 400 when the community id is invalid", async () => {
    const res = await request(app)
      .patch(`${BASE_URL}/invalid-id`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ name: "does-not-matter" });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch("Invalid Request Params");
  });

  it("rejects a duplicate name with 409", async () => {
    await createCommunity(accessToken, { name: "taken-name", description: "first club" });
    const community = await createCommunity(accessToken, { name: "original-name", description: "second club" });

    const res = await request(app)
      .patch(`${BASE_URL}/${community.id}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ name: "taken-name" });

    expect(res.status).toBe(409);
    expect(res.body.message).toMatch(/already used/i);
  });

  it("rejects an update from a user who is not the owner", async () => {
    const community = await createCommunity(accessToken, { name: "owner-only-club", description: "original description" });

    const res = await request(app)
      .patch(`${BASE_URL}/${community.id}`)
      .set("Authorization", `Bearer ${otherAccessToken}`)
      .send({ name: "hijacked-name", description: "hijacked description" });

    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/not allowed/i);

    // Nothing should have actually changed in the DB.
    const dbRow = await pool.query("SELECT * FROM communities WHERE id = $1", [community.id]);
    expect(dbRow.rows[0].name).toBe("owner-only-club");
    expect(dbRow.rows[0].description).toBe("original description");
  });

  it("returns 404 when a non-owner targets a community that doesn't exist", async () => {
    const NON_EXISTENT_ID = "00000000-0000-4000-8000-000000000000";

    const res = await request(app)
      .patch(`${BASE_URL}/${NON_EXISTENT_ID}`)
      .set("Authorization", `Bearer ${otherAccessToken}`)
      .send({ name: "does-not-matter" });

    // id shape is valid but no row exists — ownership check never runs.
    expect(res.status).toBe(404);
  });

  it("requires authentication", async () => {
    const community = await createCommunity(accessToken, { name: "no-auth-club", description: "some description" });

    const res = await request(app)
      .patch(`${BASE_URL}/${community.id}`)
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

  beforeEach(resetCommunitiesTable);

  it("deletes the community and returns it", async () => {
    const community = await createCommunity(accessToken, { name: "to-be-deleted", description: "will not survive this test" });

    const res = await request(app)
      .delete(`${BASE_URL}/${community.id}`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      status: "success",
      message: "Community deleted successfuly",
      community: { id: community.id },
    });

    const dbRow = await pool.query("SELECT * FROM communities WHERE id = $1", [community.id]);
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

  it("rejects a delete from a user who is not the owner", async () => {
    const community = await createCommunity(accessToken, { name: "owner-only-club", description: "should survive this test" });

    const res = await request(app)
      .delete(`${BASE_URL}/${community.id}`)
      .set("Authorization", `Bearer ${otherAccessToken}`);

    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/not allowed/i);

    // Nothing should have actually been deleted.
    const dbRow = await pool.query("SELECT * FROM communities WHERE id = $1", [community.id]);
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
    const community = await createCommunity(accessToken, { name: "delete-me-twice", description: "first delete should win" });

    await request(app)
      .delete(`${BASE_URL}/${community.id}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200);

    const secondRes = await request(app)
      .delete(`${BASE_URL}/${community.id}`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(secondRes.status).toBe(404);
  });

  it("requires authentication", async () => {
    const community = await createCommunity(accessToken, { name: "no-auth-club", description: "some description" });

    const res = await request(app).delete(`${BASE_URL}/${community.id}`);

    expect(res.status).toBe(401);
  });
});
