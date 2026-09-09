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
    <div className="w-full flex flex-row h-screen px-20 py-8 justify-center bg-slate-200">
      <PostView {...post!} />
    </div>
  )
}
