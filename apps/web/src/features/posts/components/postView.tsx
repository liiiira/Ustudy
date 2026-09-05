import { useNavigate } from "react-router"
import Button from "../../../components/ui/button"
import  type { PostJoined } from "../types"
import * as postApi from "../api/posts.api"

export default function PostView({communityId, postId, title, textContent, ownerId, ownerName, communityName, cratedAt}: PostJoined){
  
  const navigate = useNavigate();
  
  async function handleDeletePost(){
    await postApi.deleteById(communityId, postId);
    navigate(`/communities/${communityId}/`)
  }
  return(

    <div className="bg-white px-8 py-4 flex flex-col  rounded-2xl w-full h-full hover:cursor-pointer hover:bg-gray-100 transform-color" >
      
      <div className="flex flex-row justify-between">
        <div>
          published by: {ownerName}, {communityName}
        </div>
        <div className="flex flex-row gap-3">
          <Button 
            onClick={() => navigate(`/communities/${communityId}/posts/${postId}/update`)}
          >
            Update
          </Button>

          <Button 
            variant="Danger" 
            onClick={handleDeletePost}
          >
            Delete
          </Button>
        </div>
      </div>

      <div className=" px-2 py-1 flex flex-col gap-1">
        <div className="font-bold text-black text-xl">{title}</div>
        <div className="font-medium text-gray-700 text-xs">{textContent}</div>
      </div>
    </div>
  )
}
