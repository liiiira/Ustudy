import type { CommentJoinUser } from "../types";
import CommentCard from "./commentCard"; 

type CommentListProps = {
  comments: CommentJoinUser[];
}

export default function CommentsList({comments}: CommentListProps){
  
  return(
    <div className="flex flex-col gap-2 w-full h-max border-2 border-black">
      {comments.map((c: CommentJoinUser) => (<CommentCard comment={c} />))}
    </div>
  )
}

