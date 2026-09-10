import { useNavigate } from "react-router"
import  type { PostJoined } from "../types"
import * as postApi from "../api/posts.api"
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

    <div className="bg-white px-8 pt-4 pb-10 flex flex-col gap-2 rounded-2xl w-full h-max shadow-xl" >
      
      <div className="flex w-full flex-row justify-between">

        <div className="flex flex-row gap-2 justify-center items-center font-light text-xs">
          <div>
            published by: {ownerName}
          </div>
          <div>
           {communityName}
          </div>
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

      <div className=" px-2 py-1 flex flex-col h-max gap-4">
        <div className="font-bold text-black text-xl whitespace-pre-wrap wrap-break-word">{title}</div>
        <div className="font-light text-black whitespace-pre-wrap wrap-break-word">{textContent}</div>
      </div>
    </div>
  )
}
