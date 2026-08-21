import pool from "../config/postgres";
import {CreateUserRepository} from "../schemas/user.schema.ts";

export async function createUserRepository(userData: CreateUserRepository){

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
