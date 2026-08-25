import pool from "../config/postgres";
import {User} from '../schemas/user.schema.ts'
import {CreateUserRepository} from "../schemas/user.schema.ts";

export async function create(userData: CreateUserRepository) : Promise<User>{

  const {username, hashedPassword, email} = userData;
  
  const result = await pool.query(
    `INSERT INTO users(username, hashed_password, email) Values($1, $2, $3)
    RETURNING 
      id,
      username,
      email,
      created_at AS "createdAt"`,
    [username, hashedPassword, email],
  )

  return result.rows[0]; 
}  

export async function findAll() : Promise<User[]>{
  const result = await pool.query(
    `SELECT 
    id, username, email, created_at  AS "createdAt"
    FROM users`
  )

  return result.rows;
}

export async function findByEmail(email: string ): Promise<User>{

  const result = await pool.query(
    `SELECT * 
    FROM users
    WHERE email = $1`,
    [email], 
  )
  
  return result.rows[0];

}
 
export async function findByUsername(username: string): Promise<User> {
  
  const result = await pool.query(
    `SELECT * 
    FROM users
    WHERE username = $1`,
    [username]
  )
  
  return result.rows[0];
}

export async function findById(id: string): Promise<User>{
   const result = await pool.query(
    `SELECT * 
    FROM users
    WHERE id = $1`,
    [id]
  )
  
  return result.rows[0]; 
}

export async function updateById(id: string, userData: CreateUserRepository): Promise<User>{
  const {username, email, hashedPassword} = userData;

  const result = await pool.query(
    `UPDATE users
    SET email = $1, username = $2, password = $3
    WHERE id = $4 
    RETURNING *`,
    [email, username, hashedPassword, id]
  )

  return result.rows[0]
}



