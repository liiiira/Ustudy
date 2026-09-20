import pool from "../../config/postgres";
import type { DirectConversationInput, DirectConversation, GroupConversation} from "./conversation.schema";

type GroupConversationInputRepository= {

  ownerId: string;
  memberIds: string[];
  name: string;
  uploadId?: string;
}

export async function findOrCreateDirect({directKey, requesterId, otherUserId}: DirectConversationInput): Promise<{created: boolean, conversation: DirectConversation} | null>{
  const result = await pool.query(
    `
      WITH inserted AS (
        INSERT INTO conversations(type, direct_key)
        VALUES ('direct', $1)
        ON CONFLICT (direct_key) DO NOTHING
        RETURNING id, type, created_at
      ),
      conv AS (
        SELECT id, type, created_at, true AS created FROM inserted
        UNION ALL
        SELECT id, type, created_at, false AS created
        FROM conversations
        WHERE direct_key = $1 AND NOT EXISTS (SELECT 1 FROM inserted)
      ),
      members AS (
        INSERT INTO conversation_members(conversation_id, member_id)
        SELECT conv.id, m.member_id
        FROM conv, unnest($2::uuid[]) AS m(member_id)
        ON CONFLICT DO NOTHING
      )
      SELECT
        conv.id AS "id",
        conv.type AS "type",
        conv.created_at AS "createdAt",
        conv.created AS "created"
      FROM conv`,
      [directKey, [requesterId, otherUserId]]
  );

  if(result.rows[0]){
    const {created, ...conversation} = result.rows[0];
    return {created, conversation}
  }
  return null;
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

