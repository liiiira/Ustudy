import type React from "react";
import KebabMenu from "../../../components/ui/kebabMenu";
import type { CommentJoinUser } from "../types";
import { deleteById } from "../api/comments.api";
import { useAuth } from "../../auth/hooks/useAuth";

type CommentCardProps = {
  communityId: string;
  postId: string;
  comment: CommentJoinUser;
  onDeleteSuccess: (deletedComment: {id: string}) => void;
}

export default function CommentCard({communityId, postId, comment, onDeleteSuccess}: CommentCardProps){

  const {id, ownerUsername, ownerId, textContent, createdAt} = comment;
  const {user} = useAuth();

  async function handleDeletePost(e: React.MouseEvent<HTMLDivElement>){

    const deletedComment: {id: string} = await deleteById(communityId, postId, id)
    onDeleteSuccess(deletedComment);
  }

  const options: Record<string, (e: React.MouseEvent<HTMLDivElement>) => void> = {}

  if(user!.id === ownerId)
    options["Delete"] = handleDeletePost

  return (
    <div className="flex flex-col gap-2 w-full h-max px-8 py-4 rounded-md bg-white">

      <div className="flex flex-row justify-between  w-full h-max">

        <div className="flex flex-row gap-2">

          <div className="items-center font-light text-xs">
            {ownerUsername},
          </div>

          <div className="items-center font-light text-xs">
            At: {createdAt}
          </div>

        </div>

        <KebabMenu
          options={options}
        />

      </div>
      <div className="w-full whitespace-pre-wrap wrap-break-word">
        {textContent}
      </div>
      
    </div>
  )
} 
