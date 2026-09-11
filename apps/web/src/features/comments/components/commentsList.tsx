import type { CommentJoinUser } from "../types";
import CommentCard from "./commentCard"; 

type CommentListProps = {
  communityId: string;
  postId: string;
  onDeleteSuccess: ((deletedComment: {id: string}) => void);
  comments: CommentJoinUser[];
}

export default function CommentsList({communityId, comments, onDeleteSuccess, postId}: CommentListProps){

  if(comments.length === 0) return <></> 

  return(
    <div className="flex flex-col gap-2 w-full h-max rounded-2xl overflow-hidden bg-white">
      {comments.map((c: CommentJoinUser) => (<CommentCard key={c.id} onDeleteSuccess={onDeleteSuccess} communityId={communityId} postId={postId}  comment={c} />))}
    </div>
  )
}

