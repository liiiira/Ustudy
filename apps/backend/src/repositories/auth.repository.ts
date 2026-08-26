import pool from "../config/postgres";


// For now one user has only one refresh token (Later we will update for many devices)



// it tries first to insert a refresh token of a user  if it fails it updates the existing refresh token of the user
export async function upsertRefreshToken(RefreshToken: {userId: string, hashedToken: string, expiresAt: Date}): Promise<{userId: string, id: string, createdAt: Date, expiresAt: Date}>{

  const {userId, hashedToken, expiresAt} = RefreshToken; 
  const result = await pool.query(
    `INSERT INTO refresh_tokens(user_id, hashed_token, expires_at)
    VALUES ($1, $2, $3)
    ON CONFLICT (user_id)
    DO UPDATE SET 
      hashed_token = EXCLUDED.hashed_token,
      expires_at = EXCLUDED.expires_at,
      revoked_at = NULL
    RETURNING 
    id, user_id AS userId, created_at AS createdAt, expires_at AS expiresAt;
    `,
    [userId, hashedToken, expiresAt]
  );
  
  return result.rows[0];
}

export async function getRefreshToken(userId: string){

  const result = await pool.query(
    `SELECT 
      hashed_token AS "hashedToken", 
      user_id AS "userId",  
      expires_at AS expiresAt, 
      revoked_at as "RevokedAt"
      id,
      WHERE userId = $1;`,
    [userId]
  );

  return result.rows[0];
}


