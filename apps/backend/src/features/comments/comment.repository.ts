import pool from "../../config/postgres.ts"
import type { CommentCreate, CommentDB, CommentInput, CommentJoinUser } from "./comment.schema.ts";

export async function create({ownerId, postId, textContent}: CommentCreate): Promise<CommentJoinUser | null>{

  const query =  
    `WITH inserted_comment AS (
      INSERT INTO comments (post_id, owner_id, text_content)
      VALUES ($1, $2, $3)
      RETURNING id, post_id, owner_id, text_content, created_at
    )
  SELECT
    inserted_comment.id AS "id",
    inserted_comment.post_id AS "postId",
    inserted_comment.owner_id AS "ownerId",
    inserted_comment.text_content AS "textContent",
    inserted_comment.created_at AS "createdAt",
    users.username AS "ownerUsername"
  FROM inserted_comment
  JOIN users ON users.id = inserted_comment.owner_id`

  const result = await pool.query(query, [postId, ownerId, textContent]);

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

export async function findById(commentId: string): Promise<CommentDB | null>{
  const result = await pool.query(
    `SELECT 
        id,
        post_id as "postId",
        owner_id as "ownerId",
        text_content as "textContent",
        created_at as "createdAt"
      FROM comments
      WHERE id = $1`,
    [commentId]
  );

  return result.rows[0] ?? null;
}

export async function updateById(commentId: string, {textContent}: CommentInput): Promise<CommentDB | null>{
  const result = await pool.query(
    `UPDATE comments 
      SET text_content = $2
      WHERE id = $1
      RETURNING
        id,
        post_id as "postId",
        owner_id as "ownerId",
        text_content as "textContent",
        created_at as "createdAt"`,
    [commentId, textContent]
  );

  return result.rows[0] ?? null;
}

export async function deleteById(commentId: string): Promise<{id: string} | null>{

  const result = await pool.query(
    `DELETE FROM comments 
      WHERE comments.id = $1
      RETURNING 
        id`,
      [commentId]
  );

  return result.rows[0] ?? null;
}
