import request from "supertest";
import { describe, it, expect, beforeAll } from "vitest";
import app from "../src/app.ts";
import { createUser, loginUserFull, resetTables } from "./utils.ts";

const BASE_URL = "/api/v1/auth";

const TEST_USER = {
  username: "auth_tester",
  email: "auth-tests@example.com",
  password: "SuperSecret123!",
};

beforeAll(async () => {
  await resetTables();
  await createUser(TEST_USER);
});

describe("POST /api/v1/auth/login", () => {

  it("logs in with valid credentials and sets the refresh cookie", async () => {
    const res = await request(app)
      .post(`${BASE_URL}/login`)
      .send({ email: TEST_USER.email, password: TEST_USER.password })
      .expect(200);

    expect(res.body).toEqual(
      expect.objectContaining({
        status: "success",
        message: "Logged In Successfuly",
        accessToken: expect.any(String),
      })
    );

    expect(res.headers["set-cookie"]).toBeDefined();
    expect(res.headers["set-cookie"][0]).toContain("refreshToken=");
  });

  it("rejects invalid credentials", async () => {
    const res = await request(app)
      .post(`${BASE_URL}/login`)
      .send({ email: TEST_USER.email, password: "wrongpassword" })
      .expect(401);

    expect(res.body.status).toBe("error");
  });
});

describe("POST /api/v1/auth/refresh", () => {

  it("issues a new access token for a valid refresh cookie", async () => {
    const { refreshCookie } = await loginUserFull(TEST_USER);

    const res = await request(app)
      .post(`${BASE_URL}/refresh`)
      .set("Cookie", refreshCookie)
      .expect(200);

    expect(res.body).toEqual(
      expect.objectContaining({
        status: "success",
        message: "Access Token Refreshed",
        accessToken: expect.any(String),
      })
    );
  });

  it("rejects a request with no refresh cookie", async () => {
    const res = await request(app).post(`${BASE_URL}/refresh`).expect(401);

    expect(res.body).toMatchObject({
      status: "error",
      message: "Invalid Refresh Token",
    });
  });
});

describe("POST /api/v1/auth/logout", () => {

  it("revokes the refresh token", async () => {
    const { refreshCookie } = await loginUserFull(TEST_USER);

    const res = await request(app)
      .post(`${BASE_URL}/logout`)
      .set("Cookie", refreshCookie)
      .expect(204);

    // 204 must not contain a response body
    expect(res.body).toEqual({});
  });

  it("rejects a request with no refresh cookie", async () => {
    const res = await request(app).post(`${BASE_URL}/logout`).expect(401);

    expect(res.body).toMatchObject({
      status: "error",
      message: "Invalid Refresh Token",
    });
  });

  it("invalidates the refresh token so it can no longer be used to refresh", async () => {
    const { refreshCookie } = await loginUserFull(TEST_USER);

    await request(app)
      .post(`${BASE_URL}/logout`)
      .set("Cookie", refreshCookie)
      .expect(204);

    const res = await request(app)
      .post(`${BASE_URL}/refresh`)
      .set("Cookie", refreshCookie)
      .expect(401);

    expect(res.body.status).toBe("error");
  });
});
