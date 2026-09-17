import pool from "../../config/postgres";
import type { Upload, UploadInput } from "./upload.schema";

export async function create(ownerId: string, {objectKey, publicUrl, contentType, kind} : UploadInput): Promise<Upload | null>{
  const result = await pool.query(
    `INSERT INTO uploads(owner_id, kind, object_key, public_url, content_type)
      VALUES($1, $2, $3, $4, $5)
      RETURNING 
        id,
        owner_id AS "ownerId",
        kind,
        public_url AS "publicUrl",
        content_type AS "contentType",
        object_key AS "objectKey",
        created_at AS "createdAt"`,
    [ownerId, kind, objectKey, publicUrl, contentType]
  );

  return result.rows[0] ?? null;
}

export async function findByPublicUrl(publicUrl: string): Promise<Upload | null>{
  const result = await pool.query(
    `
      SELECT 
        id,
        owner_id AS "ownerId",
        kind,
        public_url AS "publicUrl",
        content_type AS "contentType",
        object_key AS "objectKey",
        created_at AS "createdAt"
      FROM uploads
      WHERE publi_url = $1`,
    [publicUrl]
  );

  return result.rows[0] ?? null;
}
