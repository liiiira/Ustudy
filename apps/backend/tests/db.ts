import pool from "../src/config/postgres.ts";
import express from "express"
import {createAccessToken} from "../src/utils/token.ts"

// TODO: adjust columns to match your actual users/communities tables —
// these are guesses (username/email for users, name/owner_id for communities).
//
export async function createTestUser(overrides: Partial<{ username: string; email: string }> = {}) {

  const username = overrides.username ?? `user_${Date.now()}`;
  const email = overrides.email ?? `${username}@example.com`;
  const { rows } = await pool.query(
    `INSERT INTO users (username, email, hashed_password) VALUES ($1, $2, $3) RETURNING id`,
    [username, email, "irrelevant-for-tests"]
  );

  return rows[0].id as string;
}

export async function createTestCommunity(ownerId: string, overrides: Partial<{ name: string }> = {}) {

  const name = overrides.name ?? `community_${Date.now()}`;

  const { rows } = await pool.query(
    `INSERT INTO communities (name, owner_id, description) VALUES ($1, $2) RETURNING id`,
    [name, ownerId, "not important"]
  );
  return rows[0].id as string;
}

export async function resetTables() {
  await pool.query(`TRUNCATE posts, communities, users RESTART IDENTITY CASCADE`);
}

export function tokenFor(userId: string) {
  return createAccessToken(userId);
}
