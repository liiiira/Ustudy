import pool from "../../config/postgres";
import type { DirectConversationInput, DirectConversation, GroupConversation} from "./conversation.schema";

type GroupConversationInputRepository= {

  ownerId: string;
  memberIds: string[];
  name: string;
  uploadId?: string;
}

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
        INSERT INTO converation_members(member_id, conversation_id)
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

export async function createGroup({memberIds, uploadId, name, ownerId}: GroupConversationInputRepository): Promise<GroupConversation | null>{
  
  const result = await pool.query(
    `
      WITH inserted AS (
        INSERT INTO conversations(owner_id, name, upload_id, type)
        VALUES ($1, $2, $3, 'group')
        RETURNING *
      ),
      members AS (
        INSERT INTO conversation_members(conversation_id, member_id, role)  
        SELECT 
          inserted.id AS "conversation_id", 
          m.member_id AS "member_id", 
          CASE WHEN member_id = inserted.owner_id THEN 'admin' ELSE 'member' END AS "role"
        FROM 
          inserted, unnest($4::uuid[]) as m(member_id)
      )
      SELECT 
        inserted.id AS "id",
        inserted.name AS "name",
        inserted.upload_id AS "uploadId",
        inserted.type AS "type",
        inserted.created_at AS "createdAt",
        inserted.owner_id AS "ownerId" 
      FROM inserted`,
    [ownerId, name, uploadId, memberIds]
  );

  return result.rows[0] ?? null;
}

