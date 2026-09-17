import pool from "../../config/postgres.ts";
import type { Post , PostJoined, PostInputRepository, PostUpdateRepository} from "./post.schema.ts";

export async function create (ownerId: string, communityId: string, {title, textContent, uploadId}: PostInputRepository): Promise<Post | null>{

  const response = await pool.query(
    `WITH inserted AS (
        INSERT INTO
        posts(title, text_content, owner_id, community_id, image_id)
        VALUES($1, $2, $3, $4, $5)
        RETURNING id, title, text_content, owner_id, community_id, created_at, image_id
      )
      SELECT
        i.title AS "title",
        i.text_content AS "textContent",
        i.id AS "id",
        i.community_id AS "communityId",
        i.owner_id AS "ownerId",
        i.created_at AS "createdAt",
        u.public_url AS "imageUrl"
      FROM inserted i
      LEFT JOIN uploads u
        ON i.image_id = u.id`,

    [title, textContent, ownerId, communityId, uploadId ?? null]
  );

  return response.rows[0] ?? null
}

export async function findById(postId: string): Promise<Post | null>{

  const response = await pool.query(
    `
      SELECT
        p.title AS "title",
        p.text_content AS "textContent",
        p.id AS "id",
        p.community_id AS "communityId",
        p.owner_id AS "ownerId",
        p.created_at AS "createdAt",
        u.public_url AS "imageUrl"
      FROM posts p
      LEFT JOIN uploads u
        ON p.image_id = u.id
      WHERE p.id = $1`,
    [postId]
  );

  return response.rows[0] ?? null;
}

export async function findByIdJoin(postId: string): Promise<PostJoined | null>{

  const response = await pool.query(
    `SELECT
        p.title AS "title",
        p.text_content AS "textContent",
        p.id AS "postId",
        p.community_id AS "communityId",
        p.owner_id AS "ownerId",
        p.created_at AS "createdAt",
        c.name AS "communityName",
        users.username AS "ownerName",
        uploads.public_url AS "imageUrl"
      FROM posts p
      INNER JOIN users
        ON p.owner_id = users.id
      INNER JOIN communities c
        ON p.community_id = c.id
      LEFT JOIN uploads
        ON p.image_id = uploads.id
      WHERE p.id = $1`,
    [postId]
  );

  return response.rows[0] ?? null;
}


export async function findAllCommunity(communityId: string): Promise<Post[]>{

  const response = await pool.query(
    `SELECT
        p.title AS "title",
        p.text_content AS "textContent",
        p.id AS "id",
        p.community_id AS "communityId",
        p.owner_id AS "ownerId",
        p.created_at AS "createdAt",
        uploads.public_url AS "imageUrl"
    FROM posts p
    INNER JOIN communities c
      ON p.community_id = c.id
    LEFT JOIN uploads
      ON p.image_id = uploads.id
    WHERE c.id = $1`,
    [communityId]
  );

  return response.rows;
}

export async function updateById(id: string, postData: PostUpdateRepository): Promise<Post | null>{

  const {title, textContent, uploadId} = postData;

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

  if (uploadId){
    updates.push(`image_id = $${values.length + 1}`);
    values.push(uploadId);
  }


  // forming the query
  const query: string = `WITH updated AS (
    UPDATE posts
    SET ${updates.join(", ")}
    WHERE id = $${values.length + 1}
    RETURNING id, title, text_content, owner_id, community_id, created_at, image_id
  )
  SELECT
    updated.id,
    updated.title,
    updated.text_content AS "textContent",
    updated.owner_id AS "ownerId",
    updated.created_at AS "createdAt",
    updated.community_id AS "communityId",
    uploads.public_url AS "imageUrl"
  FROM updated
  LEFT JOIN uploads
    ON updated.image_id = uploads.id`;

  values.push(id);

  const result = await pool.query(query, values)

  return result.rows[0] ?? null
}

export async function deleteById(postId: string): Promise<{id: string} | null>{

  const response = await pool.query(
    `DELETE FROM posts
      WHERE id = $1
      RETURNING
        id`,
    [postId]
  );

  return response.rows[0] ?? null

}
