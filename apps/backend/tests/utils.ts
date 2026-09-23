import pool from "../src/config/postgres.ts";
import { createAccessToken } from "../src/utils/token.ts";
import app from "../src/app.ts";
import request from "supertest";

export async function createUser(userData: {
  email: string;
  username: string;
  password: string;
}): Promise<string> {
  const BASE_URL = "/api/v1/users";
  const { email, username, password } = userData;

  const res = await request(app)
    .post(BASE_URL)
    .send({ email, username, password });

  return res.body.user.id;
}

export async function loginUser(userData: {
  email: string;
  password: string;
}): Promise<string> {
  const BASE_URL = "/api/v1/auth/login";
  const { email, password } = userData;

  const res = await request(app).post(BASE_URL).send({ email, password });

  return res.body.accessToken;
}

// same as loginUser, but also returns the raw refresh-token cookie header,
// needed by tests that call /auth/refresh or /auth/logout directly
export async function loginUserFull(userData: {
  email: string;
  password: string;
}): Promise<{ accessToken: string; refreshCookie: string }> {
  const BASE_URL = "/api/v1/auth/login";
  const { email, password } = userData;

  const res = await request(app).post(BASE_URL).send({ email, password });

  return {
    accessToken: res.body.accessToken,
    refreshCookie: res.headers["set-cookie"][0],
  };
}

export async function registerAndLogin(userData: {
  email: string;
  username: string;
  password: string;
}): Promise<{ id: string; accessToken: string }> {
  const id = await createUser(userData);
  const accessToken = await loginUser({
    email: userData.email,
    password: userData.password,
  });

  return { id, accessToken };
}

export async function createCommunity(
  accessToken: string,
  communityData: { name: string; description: string },
) {
  const BASE_URL = "/api/v1/communities";
  const { name, description } = communityData;

  const res = await request(app)
    .post(BASE_URL)
    .set("Authorization", `Bearer ${accessToken}`)
    .send({
      name: name,
      description: description,
    });

  return res.body.community;
}

export async function createPost(
  communityId: string,
  accessToken: string,
  data: { title: string; textContent: string },
) {
  const BASE_URL = "/api/v1/communities";
  const res = await request(app)
    .post(`${BASE_URL}/${communityId}/posts`)
    .set("Authorization", `Bearer ${accessToken}`)
    .send(data);

  return res.body.post;
}

export async function resetTables() {
  await pool.query(`TRUNCATE posts, communities, users CASCADE`);
}

export async function resetPostsTable() {
  await pool.query("TRUNCATE posts CASCADE");
}

export async function resetCommunitiesTable() {
  await pool.query("TRUNCATE communities CASCADE");
}

export async function resetCommentsTable() {
  await pool.query("TRUNCATE comments CASCADE");
}

export async function resetUsersTable() {
  await pool.query("TRUNCATE users CASCADE");
}

// Creates a real uploads row owned by the caller (the S3 presigner signs
// locally, so this never touches R2) and returns its public URL, the value
// a client would then submit as imageUrl/avatarUrl.
export async function presignUpload(
  accessToken: string,
  kind: "avatar" | "post" | "community" | "conversation" | "message",
): Promise<string> {
  const res = await request(app)
    .post("/api/v1/uploads/presign")
    .set("Authorization", `Bearer ${accessToken}`)
    .send({ kind, contentType: "image/png", size: 1024 });

  return res.body.urls.publicUrl;
}

// cascades to members and messages
export async function resetConversationsTable() {
  await pool.query("TRUNCATE conversations CASCADE");
}
export function tokenFor(userId: string) {
  return createAccessToken(userId);
}
