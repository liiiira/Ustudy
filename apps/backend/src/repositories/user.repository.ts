import pool from "../config/postgres";
import {CreateUserRepository} from "../schemas/user.schema.ts";

export async function create(userData: CreateUserRepository){

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

export async function findAll(){
  const result = await pool.query(
    `SELECT 
    id, username, email, created_at  AS "createdAt"
    FROM users`
  )

  return result.rows;
}

export async function findByEmail(email: string ){

  const result = await pool.query(
    `SELECT * 
    FROM users
    WHERE email = $1`,
    [email], 
  )
  
  return result.rows[0];

}
 
export async function findByUsername(username: string) {
  
  const result = await pool.query(
    `SELECT * 
    FROM users
    WHERE username = $1`,
    [username]
  )
  
  return result.rows[0];
}

export async function findById(id: string){
   const result = await pool.query(
    `SELECT * 
    FROM users
    WHERE id = $1`,
    [id]
  )
  
  return result.rows[0]; 
}
