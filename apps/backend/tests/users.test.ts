import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import app from "../src/app";
import pool from "../src/config/postgres";
import {
  createUser,
  registerAndLogin,
  resetUsersTable,
  presignUpload,
} from "./utils.ts";

const BASE_URL = "/api/v1/users";

const TEST_USER = {
  username: "user_tester",
  email: "user-tests@example.com",
  password: "SuperSecret123!",
};

const OTHER_USER = {
  username: "other_tester",
  email: "other-user-tests@example.com",
  password: "SomeValidPassword123!",
};

describe("POST /api/v1/users", () => {
  beforeEach(resetUsersTable);

  it("registers a user", async () => {
    const res = await request(app).post(BASE_URL).send(TEST_USER);

    expect(res.status).toBe(201);
    expect(res.headers["content-type"]).toMatch(/json/);
    expect(res.body.status).toBe("success");
    expect(res.body.message).toBe("User Created Successfuly");
    expect(res.body.user).toMatchObject({
      username: TEST_USER.username,
      email: TEST_USER.email,
    });
    expect(res.body.user.id).toBeDefined();
  });

  it("rejects an invalid email format", async () => {
    const res = await request(app)
      .post(BASE_URL)
      .send({ ...TEST_USER, email: "not-an-email" });

    expect(res.status).toBe(400);
    expect(res.body.status).toBe("error");
  });

  it("rejects a username shorter than 3 characters", async () => {
    const res = await request(app)
      .post(BASE_URL)
      .send({ ...TEST_USER, username: "ab" });

    expect(res.status).toBe(400);
  });

  it("rejects a username longer than 25 characters", async () => {
    const res = await request(app)
      .post(BASE_URL)
      .send({ ...TEST_USER, username: "a".repeat(26) });

    expect(res.status).toBe(400);
  });

  it("rejects a username that already exists", async () => {
    await createUser(TEST_USER);

    const res = await request(app)
      .post(BASE_URL)
      .send({ ...TEST_USER, email: "different@example.com" });

    expect(res.status).toBe(409);
  });

  it("rejects an email that already exists", async () => {
    await createUser(TEST_USER);

    const res = await request(app)
      .post(BASE_URL)
      .send({ ...TEST_USER, username: "different_username" });

    expect(res.status).toBe(409);
  });
});

describe("GET /api/v1/users", () => {
  beforeEach(resetUsersTable);

  it("returns every registered user to an authenticated caller", async () => {
    await createUser(TEST_USER);
    const { accessToken } = await registerAndLogin(OTHER_USER);

    const res = await request(app)
      .get(BASE_URL)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
    expect(res.body.users).toHaveLength(2);
    expect(res.body.users).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          username: TEST_USER.username,
          email: TEST_USER.email,
        }),
        expect.objectContaining({
          username: OTHER_USER.username,
          email: OTHER_USER.email,
        }),
      ]),
    );
  });

  it("requires authentication", async () => {
    const res = await request(app).get(BASE_URL);

    expect(res.status).toBe(401);
  });
});

describe("GET /api/v1/users/:id", () => {
  beforeEach(resetUsersTable);

  it("returns a user by id", async () => {
    const { id, accessToken } = await registerAndLogin(TEST_USER);

    const res = await request(app)
      .get(`${BASE_URL}/${id}`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
    expect(res.body.user).toMatchObject({
      id,
      username: TEST_USER.username,
      email: TEST_USER.email,
    });
  });

  it("allows a different authenticated user to fetch someone else's profile", async () => {
    const { id: targetId } = await registerAndLogin(TEST_USER);
    const { accessToken } = await registerAndLogin(OTHER_USER);

    const res = await request(app)
      .get(`${BASE_URL}/${targetId}`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.user.id).toBe(targetId);
  });

  it("returns 404 when the user does not exist", async () => {
    const { accessToken } = await registerAndLogin(TEST_USER);
    const nonExistentId = "00000000-0000-0000-0000-000000000000";

    const res = await request(app)
      .get(`${BASE_URL}/${nonExistentId}`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(404);
  });

  it("returns 400 when the id is invalid", async () => {
    const { accessToken } = await registerAndLogin(TEST_USER);

    const res = await request(app)
      .get(`${BASE_URL}/not-a-valid-uuid`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(400);
  });

  it("requires authentication", async () => {
    const { id } = await registerAndLogin(TEST_USER);

    const res = await request(app).get(`${BASE_URL}/${id}`);

    expect(res.status).toBe(401);
  });
});

describe("PATCH /api/v1/users/:id/", () => {
  beforeEach(resetUsersTable);

  it("updates the caller's own username", async () => {
    const { id, accessToken } = await registerAndLogin(TEST_USER);

    const res = await request(app)
      .patch(`${BASE_URL}/${id}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ username: "newname" });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
    expect(res.body.message).toBe("User Updated Successfully");
    expect(res.body.user).toMatchObject({
      id,
      username: "newname",
      email: TEST_USER.email,
    });
  });

  it("updates multiple fields at once", async () => {
    const { id, accessToken } = await registerAndLogin(TEST_USER);

    const res = await request(app)
      .patch(`${BASE_URL}/${id}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ username: "newname", email: "newemail@example.com" });

    expect(res.status).toBe(200);
    expect(res.body.user).toMatchObject({
      id,
      username: "newname",
      email: "newemail@example.com",
    });
  });

  it("returns 204 when nothing actually changes", async () => {
    const { id, accessToken } = await registerAndLogin(TEST_USER);

    const res = await request(app)
      .patch(`${BASE_URL}/${id}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ username: TEST_USER.username, email: TEST_USER.email });

    expect(res.status).toBe(204);
    expect(res.body).toEqual({});
  });

  it("does not allow another user to update the account", async () => {
    const { id } = await registerAndLogin(TEST_USER);
    const { accessToken: otherAccessToken } =
      await registerAndLogin(OTHER_USER);

    const res = await request(app)
      .patch(`${BASE_URL}/${id}`)
      .set("Authorization", `Bearer ${otherAccessToken}`)
      .send({ username: "hijacked" });

    expect(res.status).toBe(403);

    // Verify it wasn't changed
    const dbRow = await pool.query("SELECT username FROM users WHERE id = $1", [
      id,
    ]);
    expect(dbRow.rows[0].username).toBe(TEST_USER.username);
  });

  it("returns 404 when the user does not exist", async () => {
    const { accessToken } = await registerAndLogin(TEST_USER);
    const nonExistentId = "00000000-0000-0000-0000-000000000000";

    const res = await request(app)
      .patch(`${BASE_URL}/${nonExistentId}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ username: "newname" });

    expect(res.status).toBe(404);
  });

  it("returns 400 when the request body fails validation", async () => {
    const { id, accessToken } = await registerAndLogin(TEST_USER);

    const res = await request(app)
      .patch(`${BASE_URL}/${id}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ username: "ab" });

    expect(res.status).toBe(400);
  });

  it("returns 400 when the request body is empty", async () => {
    const { id, accessToken } = await registerAndLogin(TEST_USER);

    const res = await request(app)
      .patch(`${BASE_URL}/${id}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({});

    expect(res.status).toBe(400);
  });

  it("requires authentication", async () => {
    const { id } = await registerAndLogin(TEST_USER);

    const res = await request(app)
      .patch(`${BASE_URL}/${id}`)
      .send({ username: "newname" });

    expect(res.status).toBe(401);
  });
});

describe("DELETE /api/v1/users/:id", () => {
  beforeEach(resetUsersTable);

  it("deletes the caller's own account", async () => {
    const { id, accessToken } = await registerAndLogin(TEST_USER);

    const res = await request(app)
      .delete(`${BASE_URL}/${id}`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      status: "success",
      message: "User Deleted Successfully",
      user: { id },
    });

    const dbRow = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
    expect(dbRow.rows).toHaveLength(0);
  });

  it("does not allow another user to delete the account", async () => {
    const { id } = await registerAndLogin(TEST_USER);
    const { accessToken: otherAccessToken } =
      await registerAndLogin(OTHER_USER);

    const res = await request(app)
      .delete(`${BASE_URL}/${id}`)
      .set("Authorization", `Bearer ${otherAccessToken}`);

    expect(res.status).toBe(403);

    // Verify it wasn't deleted
    const dbRow = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
    expect(dbRow.rows).toHaveLength(1);
  });

  it("returns 404 when the user does not exist", async () => {
    const { accessToken } = await registerAndLogin(TEST_USER);
    const nonExistentId = "00000000-0000-0000-0000-000000000000";

    const res = await request(app)
      .delete(`${BASE_URL}/${nonExistentId}`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(404);
  });

  it("returns 400 for an invalid user id", async () => {
    const { accessToken } = await registerAndLogin(TEST_USER);

    const res = await request(app)
      .delete(`${BASE_URL}/not-a-valid-uuid`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(400);
  });

  it("requires authentication", async () => {
    const { id } = await registerAndLogin(TEST_USER);

    const res = await request(app).delete(`${BASE_URL}/${id}`);

    expect(res.status).toBe(401);
  });
});

describe("users (avatars)", () => {
  beforeEach(resetUsersTable);

  it("sets the caller's avatar from their own avatar upload", async () => {
    const { id, accessToken } = await registerAndLogin(TEST_USER);
    const avatarUrl = await presignUpload(accessToken, "avatar");

    const res = await request(app)
      .patch(`${BASE_URL}/${id}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ avatarUrl });

    expect(res.status).toBe(200);
    expect(res.body.user.avatarUrl).toBe(avatarUrl);

    const row = await pool.query(
      `SELECT up.public_url FROM users u JOIN uploads up ON u.avatar_id = up.id WHERE u.id = $1`,
      [id],
    );
    expect(row.rows[0].public_url).toBe(avatarUrl);
  });

  it("sets the avatar alongside a username change", async () => {
    const { id, accessToken } = await registerAndLogin(TEST_USER);
    const avatarUrl = await presignUpload(accessToken, "avatar");

    const res = await request(app)
      .patch(`${BASE_URL}/${id}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ username: "renamed", avatarUrl });

    expect(res.status).toBe(200);
    expect(res.body.user).toMatchObject({ username: "renamed", avatarUrl });
  });

  it("returns the avatar on /me and /:id after it is set", async () => {
    const { id, accessToken } = await registerAndLogin(TEST_USER);
    const avatarUrl = await presignUpload(accessToken, "avatar");

    await request(app)
      .patch(`${BASE_URL}/${id}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ username: TEST_USER.username, avatarUrl });

    const me = await request(app)
      .get(`${BASE_URL}/me`)
      .set("Authorization", `Bearer ${accessToken}`);
    expect(me.status).toBe(200);
    expect(me.body.user.avatarUrl).toBe(avatarUrl);

    const byId = await request(app)
      .get(`${BASE_URL}/${id}`)
      .set("Authorization", `Bearer ${accessToken}`);
    expect(byId.status).toBe(200);
    expect(byId.body.user.avatarUrl).toBe(avatarUrl);
  });

  it("returns a null avatarUrl for a user who has not set one", async () => {
    const { accessToken } = await registerAndLogin(TEST_USER);

    const me = await request(app)
      .get(`${BASE_URL}/me`)
      .set("Authorization", `Bearer ${accessToken}`);
    expect(me.status).toBe(200);
    expect(me.body.user.avatarUrl).toBeNull();
  });

  it("replaces an existing avatar", async () => {
    const { id, accessToken } = await registerAndLogin(TEST_USER);
    const first = await presignUpload(accessToken, "avatar");
    const second = await presignUpload(accessToken, "avatar");

    await request(app)
      .patch(`${BASE_URL}/${id}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ username: TEST_USER.username, avatarUrl: first });

    const res = await request(app)
      .patch(`${BASE_URL}/${id}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ username: TEST_USER.username, avatarUrl: second });

    expect(res.status).toBe(200);
    expect(res.body.user.avatarUrl).toBe(second);
  });

  it("returns 204 when the same avatar is sent again", async () => {
    const { id, accessToken } = await registerAndLogin(TEST_USER);
    const avatarUrl = await presignUpload(accessToken, "avatar");

    await request(app)
      .patch(`${BASE_URL}/${id}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ username: TEST_USER.username, avatarUrl });

    const again = await request(app)
      .patch(`${BASE_URL}/${id}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ username: TEST_USER.username, avatarUrl });

    expect(again.status).toBe(204);
  });

  it("returns 404 for an avatarUrl that was never presigned", async () => {
    const { id, accessToken } = await registerAndLogin(TEST_USER);

    const res = await request(app)
      .patch(`${BASE_URL}/${id}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        username: TEST_USER.username,
        avatarUrl: "https://example.com/avatars/nope.png",
      });

    expect(res.status).toBe(404);

    const row = await pool.query("SELECT avatar_id FROM users WHERE id = $1", [
      id,
    ]);
    expect(row.rows[0].avatar_id).toBeNull();
  });

  it("does not allow using another user's upload as an avatar", async () => {
    const { id, accessToken } = await registerAndLogin(TEST_USER);
    const { accessToken: otherToken } = await registerAndLogin(OTHER_USER);
    const someoneElsesAvatar = await presignUpload(otherToken, "avatar");

    const res = await request(app)
      .patch(`${BASE_URL}/${id}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ username: TEST_USER.username, avatarUrl: someoneElsesAvatar });

    expect(res.status).toBe(403);

    const row = await pool.query("SELECT avatar_id FROM users WHERE id = $1", [
      id,
    ]);
    expect(row.rows[0].avatar_id).toBeNull();
  });

  it("does not allow an upload of a different kind as an avatar", async () => {
    const { id, accessToken } = await registerAndLogin(TEST_USER);
    const postImage = await presignUpload(accessToken, "post");

    const res = await request(app)
      .patch(`${BASE_URL}/${id}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ username: TEST_USER.username, avatarUrl: postImage });

    expect(res.status).toBe(403);
  });

  it("returns 400 when avatarUrl is not a URL", async () => {
    const { id, accessToken } = await registerAndLogin(TEST_USER);

    const res = await request(app)
      .patch(`${BASE_URL}/${id}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ username: TEST_USER.username, avatarUrl: "not a url" });

    expect(res.status).toBe(400);
  });

  it("ignores avatarUrl at registration", async () => {
    const res = await request(app)
      .post(BASE_URL)
      .send({
        ...TEST_USER,
        avatarUrl: "https://example.com/avatars/nope.png",
      });

    expect(res.status).toBe(201);

    const row = await pool.query("SELECT avatar_id FROM users WHERE id = $1", [
      res.body.user.id,
    ]);
    expect(row.rows[0].avatar_id).toBeNull();
  });
});
