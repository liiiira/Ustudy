import request from "supertest";
import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";

import app from "../src/app.ts";
import pool from "../src/config/postgres.ts";

const BASE_URL = "/api/v1/communities";

const TEST_USER = {
  email: "community-tests@example.com",
  username: "community-tester",
  password: "SuperSecret123!",
};

let accessToken: string;
let ownerId: string;

describe("POST /api/v1/communities", () => {
  beforeAll(async () => {
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

  afterAll(async () => {
    await pool.end();
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
