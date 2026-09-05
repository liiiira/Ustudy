import pool from "../../config/postgres.ts";
import type { PostInput, Post , PostJoined, PostUpdate} from "./post.schema.ts";

export async function create (ownerId: string, communityId: string, {title, textContent}: PostInput): Promise<Post | null>{

  const response = await pool.query(
    `INSERT INTO 
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

  const response = await pool.query(
    `SELECT 
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

  const response = await pool.query(
    `SELECT 
        title,
        text_content AS "textContent",
        posts.id AS "postId",
        community_id AS "communityId",
        posts.owner_id AS "ownerId",
        posts.created_at AS "createdAt",
        communities.name AS "communityName",
        username AS "ownerName"
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

  const response = await pool.query(
    `SELECT 
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

export async function updateById(id: string, communityData: PostUpdate): Promise<Post | null>{

  const {title, textContent} = communityData;
  
  // contains the qeury split into strings
  let updates = []

  // contains the modfied values
  let values: string[] = []

  if (title){
    updates.push(`title = $${values.length + 1}`);
    values.push(title);
  }

  if (textContent){
    updates.push(`text_content = $${values.length + 1}`);
    values.push(textContent);
  }


  // forming the query
  const query: string = `UPDATE posts
    SET ${updates.join(", ")}
    WHERE id = $${values.length + 1}
    RETURNING 
      id, 
      title, 
      text_content AS "textContent",
      owner_id AS "ownerId",
      created_at AS "createdAt",
      community_id AS "communityId"
  `;

  values.push(id);

  const result = await pool.query(query, values)

  return result.rows[0] ?? null
}

export async function deleteById(postId: string): Promise<{id: string} | null>{
  
  const response = await pool.query(
    `DELETE FROM posts
      WHERE id = $1 
      RETURNING id`,
    [postId]
  );

  return response.rows[0] ?? null

}
