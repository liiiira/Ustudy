import PostForm from "../components/postForm";
import FormBg from "../../../components/layout/formBg";
import { useParams } from "react-router";


export default function CreatePostPage(){

  const {communityId} = useParams()
  return (
    <FormBg>
      <PostForm mode="Create" communityId={communityId!}/>
    </FormBg>
  )
}
