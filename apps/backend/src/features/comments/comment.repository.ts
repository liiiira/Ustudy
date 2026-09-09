import pool from "../../config/postgres.ts"
import type { CommentCreate, CommentDB, CommentJoinUser } from "./comment.schema.ts";

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

export async function findAllPost(postId: string):Promise<CommentJoinUser[]>{
  const result = await pool.query(
    `SELECT 
        comments.id AS "id",
        comments.post_id as "postId",
        comments.owner_id as "ownerId",
        comments.text_content as "textContent",
        comments.created_at as "createdAt",
        users.username as "ownerUsername"
      FROM comments 
      JOIN posts 
      ON posts.id = comments.post_id 
      JOIN users 
      ON comments.owner_id = users.id
      WHERE comments.post_id = $1`,
    [postId]
  );

  return result.rows;
}
