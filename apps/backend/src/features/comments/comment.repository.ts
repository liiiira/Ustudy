import pool from "../../config/postgres.ts"
import type { CommentCreate, CommentDB } from "./community.schema.ts";

export async function create({ownerId, postId, textContent}: CommentCreate): Promise<CommentDB | null>{
  const result = await pool.query(
    `INSERT INTO 
      comments(owner_id, post_id, text_content) 
      VALUES($1, $2, $3)
      RETURNING 
        id,
        post_id as "postId",
        owner_id as "ownerId",
        text_content as "textContent",
        created_at as "createdAt"
        `,
    [ownerId, postId, textContent]
  );

  return result.rows[0] ?? null;
}
