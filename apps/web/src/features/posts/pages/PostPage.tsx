import { useParams } from "react-router";
import PostView from "../components/postView";
import usePost from "../hooks/usePost";
import type { UsePost } from "../types";


export default function PostPage(){

  const {communityId, postId} = useParams();
  const {loading, error, post}: UsePost = usePost(communityId!, postId!)

  if(loading)
    return <p>loading...</p>

  if(error)
    return <p>error</p>

  return (
    <div className="w-full h-full px-8 py-4 items-center justify-center">
      <PostView {...post!} />
    </div>
  )
}
