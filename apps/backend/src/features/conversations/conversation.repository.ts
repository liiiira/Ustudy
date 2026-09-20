import pool from "../../config/postgres";
import type { DirectConversationInput, DirectConversation } from "./conversation.schema";


export async function findOrCreateDirect({directKey, requesterId, otherUserId}: DirectConversationInput): Promise<DirectConversation | null>{
  const result = await pool.query(
    `
      WITH inserted AS (
        INSERT INTO conversations(type, direct_key)
        VALUES
          ('direct', $1)
        ON CONFLICT(direct_key) DO NOTHING
        RETURNING id, direct_key, created_at
      ),
      WITH conv AS (
        SELECT id, type, created_at FROM inserted
        UNION ALL 
        SELECT id, direct_key, created_at 
        WHERE direct_key = $1 AND NOT EXITS (SELECT 1 FROM inserted)
      ),
      WITH members AS (
        INSERT INTO converations_members(member_id, conversation_id)
        VALUES 
          ($2, conv.id),
          ($3, conv.id)
      )
      SELECT 
        id,
        type, 
        created_at AS "createdAt"
      FROM inserted,`,
      [directKey, requesterId, otherUserId]
  );

  return result.rows[0] ?? null;
}
