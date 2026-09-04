import pool from "../../config/postgres.ts";
import type { PostInput, Post , PostJoined} from "./post.schema.ts";

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

export async function findById(postId: string): Promise<Post | null>{
  const response = await pool.query(`SELECT 
        title,
        text_content AS "textContent",
        id,
        community_id AS "communityId",
        owner_id AS "ownerId",
        created_at AS "createdAt"
      FROM posts
      WHERE id = $1`,
    [postId]
  );

  return response.rows[0] ?? null;
}

export async function findByIdJoin(postId: string): Promise<PostJoined | null>{

  const response = await pool.query(`SELECT 
        title,
        text_content AS "textContent",
        posts.id,
        community_id AS "communityId",
        posts.owner_id AS "ownerId",
        posts.created_at AS "createdAt",
        name,
        username
      FROM posts
      INNER JOIN users 
        ON posts.owner_id = users.id 
      INNER JOIN communities 
        ON posts.community_id = communities.id
      WHERE posts.id = $1`,
    [postId]
  );

  return response.rows[0] ?? null;
}
 

export async function findAllCommunity(communityId: string): Promise<Post[]>{

  const response = await pool.query(`SELECT 
        title,
        text_content AS "textContent",
        posts.id,
        community_id AS "communityId",
        posts.owner_id AS "ownerId",
        posts.created_at AS "createdAt",
        name
    FROM posts
    INNER JOIN communities 
      ON posts.community_id = communities.id
    WHERE communities.id = $1`,
    [communityId]
  );

  return response.rows;
}
