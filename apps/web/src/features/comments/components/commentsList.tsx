import type { CommentJoinUser } from "../types";
import CommentCard from "./commentCard"; 

type CommentListProps = {
  comments: CommentJoinUser[];
}

export default function CommentsList({comments}: CommentListProps){

  if(comments.length === 0) return <></> 

  return(
    <div className="flex flex-col gap-2 w-full h-max rounded-2xl overflow-hidden bg-white">
      {comments.map((c: CommentJoinUser) => (<CommentCard comment={c} />))}
    </div>
  )
}

