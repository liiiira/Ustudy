import { useParams } from "react-router";
import PostView from "../components/postView";
import usePost from "../hooks/usePost";
import type { UsePost } from "../types";
import { CommentSection } from "../../comments/components/commentSection";

export default function PostPage(){

  const {communityId, postId} = useParams();
  const {loading: postLoading, error: postError, post}: UsePost = usePost(communityId!, postId!);

  if(postLoading)
    return <p>loading...</p>

  if(postError)
    return <p>error</p>

  return (
    <div className="w-full flex flex-col gap-12 min-h-screen py-16 px-20 bg-slate-200">
      <PostView {...post!} />
      <CommentSection
        postId={postId!}
        communityId={communityId!}
      />
    </div>
  )
}
