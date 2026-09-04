import { useParams } from "react-router";
import Button from "../../../components/ui/button";
import useCommunity from "../hooks/useCommunity";
import type {UseCommunity } from "../types";
import { useNavigate } from "react-router";
import * as communityApi from "../api/communities.api";
import { useAuth } from "../../auth/hooks/useAuth";

export default function CommunityPage(){
   
  const navigate = useNavigate();

  const {id} = useParams();
  const {loading, error, community}: UseCommunity = useCommunity(id!);
  const {user} = useAuth();

  if(error)
    return (<p>error</p>)

  if(loading)
    return (<p>loading...</p>)
  
  const {name, description, createdAt, ownerName, ownerId} = community!;
  
  async function handleDeleteCommunity(){
    await communityApi.deleteById(id!);
    navigate("/communities")
  } 

  return(
  <div className="bg-white px-8 py-4 gap-4 w-full min-h-screen flex flex-col">

    <div className="flex flex-row justify-between">
      
      <div className="flex flex-col">
        <div className="font-bold text-2xl">{name}</div>
        <div className="font-medium">{description}</div>
        <div className="flex flex-row gap-1">
          <div className="text-center">Created by: {ownerName}</div>
        </div>
      </div>
    
      {/* dispaly the buttons only if the user is the owner of the community*/}

     {user!.id === ownerId && 

      <div className="flex flex-row items-center gap-3">
          <Button onClick={() => navigate(`/communities/${id}/update`)}>Update</Button>
          <Button onClick={handleDeleteCommunity} variant="Danger">Delete</Button>
      </div>

      }

    </div>
    <div>
        posts
      </div>

  </div>
  )
}
