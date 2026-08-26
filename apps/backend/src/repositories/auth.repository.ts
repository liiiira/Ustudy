import pool from "../config/postgres";

export async function createRefreshToken(RefreshToken: {userId: string, hashedToken: string, expiresAt: Date}): Promise<{userId: string, id: string, createdAt: Date, expiresAt: Date}>{
  
  const {userId, hashedToken, expiresAt} = RefreshToken; 
  const result = await pool.query(
    `INSERT INTO refresh_tokens(user_id, hashed_token, expires_at)
    VALUES ($1, $2, $3)
    RETURNING 
    id, user_id AS userId, created_at AS createdAt, expires_at AS expiresAt;
    `,
    [userId, hashedToken, expiresAt]
  );
  
  return result.rows[0]
}
