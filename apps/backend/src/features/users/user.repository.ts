import pool from "../../config/postgres";
import type {User, UserAuth, CreateUserRepository, UpdateUserRepository} from './user.schema.ts'

export async function create(userData: CreateUserRepository) : Promise<User>{

  const {username, hashedPassword, email, avatarUrl}= userData;
  
  const result = await pool.query(
    `INSERT INTO users(username, hashed_password, email, avatar_url) Values($1, $2, $3, $4)
    RETURNING 
      id,
      username,
      email,
      created_at AS "createdAt",
      avatar_url AS "avatarUrl"
    `,
    [username, hashedPassword, email, avatarUrl],
  );

  return result.rows[0]; 
}  

export async function findAll() : Promise<User[]>{
  const result = await pool.query(
    `SELECT 
      id, 
      username,
      email, 
      created_at  AS "createdAt",
      avatar_url AS "avatarUrl"
    FROM users`
  )

  return result.rows;
}

export async function findByEmail(email: string ): Promise<UserAuth | null>{

  const result = await pool.query(
    `SELECT
      id, 
      email, 
      username, 
      hashed_password AS "hashedPassword",
      created_at AS "createdAt",
      avatar_url AS "avatarUrl"
    FROM users
    WHERE email = $1`,
    [email], 
  )
  
  return result.rows[0] ?? null;

}
 
export async function findByUsername(username: string): Promise<UserAuth | null> {
  
  const result = await pool.query(
    `SELECT  
      id, 
      email, 
      username, 
      hashed_password AS "hashedPassword", 
      created_at AS "createdAt",
      avatar_url AS "avatarUrl"
    FROM users
    WHERE username = $1`,
    [username]
  )
  
  return result.rows[0] ?? null;
}

export async function findById(id: string): Promise<UserAuth | null>{
   const result = await pool.query(
    `SELECT 
      id, 
      email, 
      username, 
      hashed_password AS "hashedPassword", 
      created_at AS "createdAt",
      avatar_url AS "avatarUrl"
    FROM users
    WHERE id = $1`,
    [id]
  )

  return result.rows[0] ?? null;  
}

export async function updateById(id: string, userData: UpdateUserRepository): Promise<User>{

  const {username, email, hashedPassword, avatarUrl} = userData;
  
  // contains the qeury split into strings
  let updates = []
  // contains the modfied values
  let values: string[] = []

  if (email){
    updates.push(`email = $${values.length + 1}`);
    values.push(email);
  }

  if (username){
    updates.push(`username = $${values.length + 1}`);
    values.push(username);
  }

  if (hashedPassword){
    updates.push(`hashed_password = $${values.length + 1}`);
    values.push(hashedPassword);
  }
  
  if (avatarUrl){
    updates.push(`avatar_url = $${values.length + 1}`);
    values.push(avatarUrl);
  }

  // forming the query
  const query: string = `UPDATE users
    SET ${updates.join(", ")}
    WHERE id = $${values.length + 1}
    RETURNING 
      id, 
      email, 
      username, 
      created_at AS "createdAt",
      avatar_url AS "avatarUrl"
  `
  values.push(id);

  const result = await pool.query(query, values)

  return result.rows[0]
}


export async function deleteById(id: string): Promise<{id: string} | null>{

  const result = await pool.query(
    `DELETE FROM users
    WHERE id = $1
    RETURNING id`, 
    [id]
  );
  return result.rows[0] ?? null;
}


