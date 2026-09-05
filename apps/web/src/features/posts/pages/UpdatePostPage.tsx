import PostForm from "../components/postForm";
import FormBg from "../../../components/layout/formBg";
import { useParams } from "react-router";
import usePost from "../hooks/usePost";


export default function UpdatePostPage(){
   
  const {communityId, postId} = useParams()
  const {loading, error, post} = usePost(communityId!, postId!)

  if(loading)
    return <p>loading...</p>
  
  if(error)
    return <p>error</p>

  const {title, textContent} = post!;

  return (
    <FormBg>
      <PostForm mode="Update" communityId={communityId!} textContent={textContent} title={title} postId={postId} />
    </FormBg>
  )
}
