import pool from "../../config/postgres";
import {
  type CommmunityJoinUser,
  type CommunityDB,
  type CommunityCreateRepository,
  type CommunityUpdateRepository,
} from "./community.schema";

export async function create({
  name,
  description,
  ownerId,
  uploadId,
}: CommunityCreateRepository): Promise<CommunityDB | null> {
  const result = await pool.query(
    `WITH inserted AS (
      INSERT INTO communities(owner_id, name, description, image_id)
      VALUES ($1, $2, $3, $4)
      RETURNING id, owner_id, name, description, created_at, image_id
    )
    SELECT
      inserted.id,
      inserted.owner_id AS "ownerId",
      inserted.name,
      inserted.description,
      inserted.created_at AS "createdAt",
      uploads.public_url AS "imageUrl"
    FROM inserted
    LEFT JOIN uploads
      ON inserted.image_id = uploads.id`,
    [ownerId, name, description, uploadId ?? null],
  );

  return result.rows[0] ?? null;
}

export async function findByName(name: string): Promise<CommunityDB | null> {
  const result = await pool.query(
    `SELECT
        c.id,
        c.owner_id AS "ownerId",
        c.name,
        c.created_at AS "createdAt",
        c.description,
        uploads.public_url AS "imageUrl"
      FROM
        communities c
      LEFT JOIN uploads
        ON c.image_id = uploads.id
      WHERE c.name = $1`,
    [name],
  );

  return result.rows[0] ?? null;
}

export async function findById(id: string): Promise<CommunityDB | null> {
  const result = await pool.query(
    `SELECT
        c.id,
        c.owner_id AS "ownerId",
        c.name,
        c.created_at AS "createdAt",
        c.description,
        uploads.public_url AS "imageUrl"
      FROM
        communities c
      LEFT JOIN uploads
        ON c.image_id = uploads.id
      WHERE c.id = $1`,
    [id],
  );

  return result.rows[0] ?? null;
}

export async function findAll(): Promise<CommunityDB[]> {
  const result = await pool.query(
    `SELECT
        c.id,
        c.owner_id AS "ownerId",
        c.name,
        c.created_at AS "createdAt",
        c.description,
        uploads.public_url AS "imageUrl"
      FROM communities c
      LEFT JOIN uploads
        ON c.image_id = uploads.id`,
  );
  return result.rows;
}

export async function updateById(
  id: string,
  communityData: CommunityUpdateRepository,
): Promise<CommunityDB | null> {
  const { name, description, uploadId } = communityData;

  // contains the qeury split into strings
  let updates = [];

  // contains the modfied values
  let values: string[] = [];

  if (name) {
    updates.push(`name = $${values.length + 1}`);
    values.push(name);
  }

  if (description) {
    updates.push(`description = $${values.length + 1}`);
    values.push(description);
  }

  if (uploadId) {
    updates.push(`image_id = $${values.length + 1}`);
    values.push(uploadId);
  }

  // forming the query
  const query: string = `WITH updated AS (
    UPDATE communities
    SET ${updates.join(", ")}
    WHERE id = $${values.length + 1}
    RETURNING id, owner_id, name, description, created_at, image_id
  )
  SELECT
    updated.id,
    updated.name,
    updated.description,
    updated.owner_id AS "ownerId",
    updated.created_at AS "createdAt",
    uploads.public_url AS "imageUrl"
  FROM updated
  LEFT JOIN uploads
    ON updated.image_id = uploads.id`;
  values.push(id);

  const result = await pool.query(query, values);

  return result.rows[0] ?? null;
}

export async function deleteById(id: string): Promise<{ id: string } | null> {
  const response = await pool.query(
    `DELETE FROM communities
      WHERE id = $1
      RETURNING
        id`,
    [id],
  );

  return response.rows[0] ?? null;
}

export async function findByIdJoinUser(
  id: string,
): Promise<CommmunityJoinUser | null> {
  const response = await pool.query(
    `SELECT
        c.id AS "id",
        c.owner_id AS "ownerId",
        c.created_at AS "createdAt",
        c.description,
        c.name AS "name",
        uploads.public_url AS "imageUrl",
        users.username AS "ownerName"
      FROM communities c
      INNER JOIN users
        ON c.owner_id = users.id
      LEFT JOIN uploads
        ON c.image_id = uploads.id
      WHERE c.id = $1`,
    [id],
  );

  return response.rows[0] ?? null;
}
