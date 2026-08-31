import pool from "../../config/postgres";
import { type CommunityCreate, type CommunityDB } from "./community.schema";

export async function create( {name, description, ownerId} : CommunityCreate): Promise<CommunityDB | null>{

  const result = await pool.query(
    `INSERT INTO communities(owner_id, name, description)
      VALUES ($1, $2, $3) 
      RETURNING
        id,
        owner_id AS "ownerId",
        name,
        created_at AS "createdAt",
        description`,
    [ownerId, name, description]
  );

  return result.rows[0]
}

export async function findByName(name: string) : Promise<CommunityDB | null>{
  
  const result = await pool.query(
    `SELECT 
        id,
        owner_id AS "ownerId",
        name,
        created_at AS "createdAt",
        description
      FROM 
        communities
      WHERE name = $1`,
    [name]
  );

  return result.rows[0];
}
