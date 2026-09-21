import pool from "../../config/postgres";
import type {
  User,
  UserAuth,
  CreateUserRepository,
  UpdateUserRepository,
} from "./user.schema.ts";

export async function create(userData: CreateUserRepository): Promise<User> {
  const { username, hashedPassword, email } = userData;

  const result = await pool.query(
    `
    WITH inserted AS (
      INSERT INTO users(username, hashed_password, email)
      VALUES($1, $2, $3)
      RETURNING id, username, email, created_at
    )
    SELECT
      inserted.id,
      inserted.username,
      inserted.email,
      inserted.created_at AS "createdAt"
    FROM inserted`,
    [username, hashedPassword, email],
  );

  return result.rows[0];
}

export async function findAll(): Promise<User[]> {
  const result = await pool.query(
    `SELECT
      u.id,
      u.username,
      u.email,
      u.created_at AS "createdAt",
      uploads.public_url AS "avatarUrl"
    FROM users u
    LEFT JOIN uploads
      ON u.avatar_id = uploads.id`,
  );

  return result.rows;
}

export async function findByEmail(email: string): Promise<UserAuth | null> {
  const result = await pool.query(
    `SELECT
      u.id,
      u.email,
      u.username,
      u.hashed_password AS "hashedPassword",
      u.created_at AS "createdAt",
      uploads.public_url AS "avatarUrl"
    FROM users u
    LEFT JOIN uploads
      ON u.avatar_id = uploads.id
    WHERE u.email = $1`,
    [email],
  );

  return result.rows[0] ?? null;
}

export async function findByUsername(
  username: string,
): Promise<UserAuth | null> {
  const result = await pool.query(
    `SELECT
      u.id,
      u.email,
      u.username,
      u.hashed_password AS "hashedPassword",
      u.created_at AS "createdAt",
      uploads.public_url AS "avatarUrl"
    FROM users u
    LEFT JOIN uploads
      ON u.avatar_id = uploads.id
    WHERE u.username = $1`,
    [username],
  );

  return result.rows[0] ?? null;
}

export async function findById(id: string): Promise<UserAuth | null> {
  const result = await pool.query(
    `SELECT
      u.id,
      u.email,
      u.username,
      u.hashed_password AS "hashedPassword",
      u.created_at AS "createdAt",
      uploads.public_url AS "avatarUrl"
    FROM users u
    LEFT JOIN uploads
      ON u.avatar_id = uploads.id
    WHERE u.id = $1`,
    [id],
  );

  return result.rows[0] ?? null;
}

export async function updateById(
  id: string,
  userData: UpdateUserRepository,
): Promise<User> {
  const { username, email, hashedPassword, uploadId } = userData;

  // contains the qeury split into strings
  let updates = [];
  // contains the modfied values
  let values: string[] = [];

  if (email) {
    updates.push(`email = $${values.length + 1}`);
    values.push(email);
  }

  if (username) {
    updates.push(`username = $${values.length + 1}`);
    values.push(username);
  }

  if (hashedPassword) {
    updates.push(`hashed_password = $${values.length + 1}`);
    values.push(hashedPassword);
  }

  if (uploadId) {
    updates.push(`avatar_id = $${values.length + 1}`);
    values.push(uploadId);
  }

  // forming the query
  const query: string = `WITH updated AS (
    UPDATE users
    SET ${updates.join(", ")}
    WHERE id = $${values.length + 1}
    RETURNING id, username, email, created_at, avatar_id
  )
  SELECT
    updated.id,
    updated.username,
    updated.email,
    updated.created_at AS "createdAt",
    uploads.public_url AS "avatarUrl"
  FROM updated
  LEFT JOIN uploads
    ON updated.avatar_id = uploads.id`;
  values.push(id);

  const result = await pool.query(query, values);

  return result.rows[0];
}

export async function deleteById(id: string): Promise<{ id: string } | null> {
  const result = await pool.query(
    `DELETE FROM users
    WHERE id = $1
    RETURNING id`,
    [id],
  );
  return result.rows[0] ?? null;
}

export async function findExistingIds(userIds: string[]): Promise<string[]> {
  const result = await pool.query(
    `
    SELECT id 
    FROM users 
    WHERE id = ANY($1::uuid[])`,
    [userIds],
  );

  return result.rows.map((user) => user.id);
}
