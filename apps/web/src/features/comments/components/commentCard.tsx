import type { CommentJoinUser } from "../types";

type CommentCardProps = {
  comment: CommentJoinUser;
}

export default function CommentCard({comment}: CommentCardProps){

  const {ownerUsername, ownerId, textContent, createdAt} = comment;

  return (
    <div className="flex flex-col w-full px-4 py-2">
      <div className="flex flex-row">
        <div>{ownerUsername}, id: {ownerId}</div>
        <div>{createdAt}</div>
      </div>
      <div>
        {textContent}
      </div>
    </div>
  )
} 
