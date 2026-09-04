import pool from "../../config/postgres.ts";
import type { PostInput, Post } from "./post.schema.ts";

export async function create (ownerId: string, communityId: string, {title, textContent}: PostInput): Promise<Post | null>{

  const response = await pool.query(`INSERT INTO 
      posts(title, text_content, owner_id, community_id) 
      VALUES($1, $2, $3, $4)
      RETURNING
        title,
        text_content AS "textContent",
        id,
        community_id AS "communityId",
        owner_id AS "ownerId",
        created_at AS "createdAt"`,
    [title, textContent, ownerId, communityId]
  );

  return response.rows[0] ?? null
}


 
