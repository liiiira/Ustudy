import type { CommentJoinUser } from "../types";

type CommentCardProps = {
  comment: CommentJoinUser;
}

export default function CommentCard({comment}: CommentCardProps){

  const {ownerUsername, ownerId, textContent, createdAt} = comment;

  return (
    <div className="flex flex-col gap-2 w-full h-max px-8 py-4 rounded-md bg-white">
      <div className="flex flex-row justify-start  w-full h-max">
        <div className="flex flex-row gap-2">
          <div className="items-center font-light text-xs">
            {ownerUsername},
          </div>
          <div className="items-center font-light text-xs">
            At: {createdAt}
          </div>
        </div>
      </div>
      <div className="w-full whitespace-pre-wrap wrap-break-word">
        {textContent}
      </div>
    </div>
  )
} 
