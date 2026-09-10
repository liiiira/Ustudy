import type { CommentJoinUser } from "../types";
import CommentForm from "./commentForm"
import CommentsList from "./commentsList"
import useComments from "../hooks/useComments";

type CommentSectionProps = {
  communityId: string;
  postId: string;
}
export function CommentSection({communityId, postId}: CommentSectionProps){

  const {loading: commentsLoading, error: commentsError, comments, setComments} = useComments(communityId!, postId!);

  if(commentsLoading)
    return <p>loading..</p>

  if(commentsError)
    return <p>error</p>

  function handleCommentCreated(newComment: CommentJoinUser){
    setComments((prev) => [...prev, newComment])
  }

  return(
    <div className="flex flex-col gap-8 w-full h-max px-4">
      <CommentForm 
        postId={postId!}
        communityId={communityId!}
        onSuccess={handleCommentCreated}
      />
      <CommentsList comments={comments}/>
    </div>
  );
}
