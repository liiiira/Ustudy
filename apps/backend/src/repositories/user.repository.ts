import pool from "../config/postgres";
import {User} from '../schemas/user.schema.ts'
import {CreateUserRepository, UpdateUserRepository} from "../schemas/user.schema.ts";

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

export async function updateById(id: string, userData: UpdateUserRepository): Promise<User>{

  const {username, email, hashedPassword} = userData;
  
  // contains the qeury split into strings
  let updates = [`UPDATE users SET `]
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

  updates.push(`WHERE id = $${values.length + 1}`);
  values.push(id);

  updates.push(`RETURNING id, email, username, hashed_password AS hashedPassword, created_at AS createdAt`)

  // forming the query
  const query: string = updates.join(" ");

  const result = await pool.query(query, values)

  return result.rows[0]
}

