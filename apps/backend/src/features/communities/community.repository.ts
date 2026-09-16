import pool from "../../config/postgres";
import { type CommmunityJoinUser, type CommunityCreate, type CommunityDB, type UpdateCommunityRepository } from "./community.schema";

export async function create( {name, description, ownerId, imageUrl} : CommunityCreate): Promise<CommunityDB | null>{

  const result = await pool.query(
    `INSERT INTO communities(owner_id, name, description, image_url)
      VALUES ($1, $2, $3, $4) 
      RETURNING
        id,
        owner_id AS "ownerId",
        name,
        created_at AS "createdAt",
        image_url AS "imageUrl",
        description`,
    [ownerId, name, description, imageUrl]
  );

  return result.rows[0] ?? null;
}


export async function findByName(name: string) : Promise<CommunityDB | null>{
  
  const result = await pool.query(
    `SELECT 
        id,
        owner_id AS "ownerId",
        name,
        created_at AS "createdAt",
        description,
        image_url AS "imageUrl"
      FROM 
        communities
      WHERE name = $1`,
    [name]
  );

  return result.rows[0] ?? null;
}

export async function findById(id: string) : Promise<CommunityDB | null>{
  
  const result = await pool.query(
    `SELECT 
        communities.id,
        owner_id AS "ownerId",
        name,
        created_at AS "createdAt",
        description,
        image_url AS "imageUrl"
        
      FROM 
        communities
      WHERE id = $1`,
    [id]
  );

  return result.rows[0] ?? null;
}

export async function findAll(): Promise<CommunityDB[]>{

  const result = await pool.query(
    `SELECT 
        id,
        owner_id AS "ownerId",
        name,
        created_at AS "createdAt",
        description,
        image_url AS "imageUrl"
        FROM communities`
  );
  return result.rows;
}

export async function updateById(id: string, communityData: UpdateCommunityRepository): Promise<CommunityDB | null>{

  const {name, description, imageUrl} = communityData;
  
  // contains the qeury split into strings
  let updates = []

  // contains the modfied values
  let values: string[] = []

  if (name){
    updates.push(`name = $${values.length + 1}`);
    values.push(name);
  }

  if (description){
    updates.push(`description = $${values.length + 1}`);
    values.push(description);
  }

  if (imageUrl){
    updates.push(`image_url = $${values.length + 1}`);
    values.push(imageUrl);
  }


  // forming the query
  const query: string = `UPDATE communities
    SET ${updates.join(", ")}
    WHERE id = $${values.length + 1}
    RETURNING 
      id, 
      name,
      description,
      owner_id AS "ownerId",
      created_at AS "createdAt",
      image_url AS "imageUrl"
  `
  values.push(id);

  const result = await pool.query(query, values)

  return result.rows[0] ?? null
}

export async function deleteById(id: string): Promise<{id: string} | null> {
  
  const response = await  pool.query(
    `DELETE FROM communities
      WHERE id = $1
      RETURNING 
        id`,
    [id]
  );

  return response.rows[0] ?? null;
}

export async function findByIdJoinUser(id: string): Promise<CommmunityJoinUser | null>{

  const response = await pool.query(
    `SELECT 
        communities.id AS "id",
        owner_id AS "ownerId",
        communities.created_at AS "createdAt",
        description,
        communities.name AS "name",
        communities.image_url AS "imageUrl",
        users.username AS "ownerName"
      FROM communities
      INNER JOIN users 
      ON communities.owner_id = users.id 
      WHERE communities.id = $1`, 
    [id]);

  return response.rows[0] ?? null;
  
}
