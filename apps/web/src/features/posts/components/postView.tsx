import { useNavigate } from "react-router"
import  type { PostJoined } from "../types"
import * as postApi from "../api/posts.api"
import DropdownMenu from "../../../components/ui/dropdownMenu";
import KebabMenu from "../../../components/ui/kebabMenu";



export default function PostView({communityId, postId, title, textContent, ownerId, ownerName, communityName, cratedAt}: PostJoined){
  
  const navigate = useNavigate();
  
  function handleUpdatePost(){
    navigate(`/communities/${communityId}/posts/${postId}/update`)
  }

  async function handleDeletePost(){
    await postApi.deleteById(communityId, postId);
    navigate(`/communities/${communityId}/`)
  }

  return(

    <div className="bg-white px-8 py-4 flex-1 flex flex-col  rounded-2xl h-full shadow-xl" >
      
      <div className="flex flex-row justify-between">

        <div>
          published by: {ownerName}, {communityName}
        </div>

        <KebabMenu
          options={
            {
              "Update": handleUpdatePost,
              "Delete": handleDeletePost,
            }
          }
        />
      </div>

      <div className=" px-2 py-1 flex flex-col gap-1">
        <div className="font-bold text-black text-xl">{title}</div>
        <div className="font-medium text-gray-700 text-xs">{textContent}</div>
      </div>
    </div>
  )
}
