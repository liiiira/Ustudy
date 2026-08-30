import request from "supertest";
import { describe, it, expect, beforeAll } from "vitest";
import app from "../src/app";

describe("Authentication", () => {
  

  const user = {
    username: "test_user",
    email: "test@gmail.com",
    password: "password123",
  };

  beforeAll(async () => {
    await request(app)
      .post("/api/v1/users")
      .send(user)
      .expect(201);
  })

  describe("POST /api/v1/auth/login", () => {

    it("should login successfully", async () => {
      const response = await request(app)
        .post("/api/v1/auth/login")
        .send(user)
         .expect(200);

      expect(response.body).toEqual(
        expect.objectContaining({
          status: "success",
          message: "Logged In Successfuly",
          accessToken: expect.any(String),
        })
      );

      // Refresh token should be sent as a cookie
      expect(response.headers["set-cookie"]).toBeDefined();
      expect(response.headers["set-cookie"][0])
        .toContain("refreshToken=");
    });

    it("should reject invalid credentials", async () => {
      const response = await request(app)
        .post("/api/v1/auth/login")
        .send({
          email: user.email,
          password: "wrongpassword",
        })
        .expect(401);

      expect(response.body.status).toBe("error");
    });
  });


  describe("POST /api/v1/auth/refresh", () => {

    it("should refresh the access token", async () => {

      // First login to obtain refresh cookie
      const loginResponse = await request(app)
        .post("/api/v1/auth/login")
        .send(user)
        .expect(200);

      const refreshCookie = loginResponse.headers["set-cookie"][0];

      // Use refresh cookie
      const response = await request(app)
        .post("/api/v1/auth/refresh")
        .set("Cookie", refreshCookie)
        .expect(200);

      expect(response.body).toEqual(
        expect.objectContaining({
          status: "success",
          message: "Access Token Refreshed",
          accessToken: expect.any(String),
        })
      );
    });


    it("should reject refresh without a cookie", async () => {
      const response = await request(app)
        .post("/api/v1/auth/refresh")
        .expect(401);

      expect(response.body.status).toBe("error");
      expect(response.body.message).toBe("Invalid Refresh Token");
    });
  });


  describe("POST /api/v1/auth/logout", () => {

    it("should logout successfully", async () => {

      // Login first
      const loginResponse = await request(app)
        .post("/api/v1/auth/login")
        .send(user)
        .expect(200);

      const refreshCookie = loginResponse.headers["set-cookie"][0];

      // Logout
      const response = await request(app)
        .post("/api/v1/auth/logout")
        .set("Cookie", refreshCookie)
        .expect(204);

      // 204 should have no body
      expect(response.body).toEqual({});
    });


    it("should reject logout without a refresh token", async () => {
      const response = await request(app)
        .post("/api/v1/auth/logout")
        .expect(401);

      expect(response.body.status).toBe("error");
      expect(response.body.message).toBe("Invalid Refresh Token");
    });


    it("should invalidate the refresh token after logout", async () => {

      // Login
      const loginResponse = await request(app)
        .post("/api/v1/auth/login")
        .send(user)
        .expect(200);

      const refreshCookie = loginResponse.headers["set-cookie"][0];

      // Logout → revoke token
      await request(app)
        .post("/api/v1/auth/logout")
        .set("Cookie", refreshCookie)
        .expect(204);

      // Try using revoked token
      const response = await request(app)
        .post("/api/v1/auth/refresh")
        .set("Cookie", refreshCookie)
        .expect(401);

      expect(response.body.status).toBe("error");
    });
  });
});
