import { useParams } from "react-router";
import Button from "../../../components/ui/button";
import useCommunity from "../hooks/useCommunity";
import type {UseCommunity } from "../types";

export default function CommunityPage(){

  const {id} = useParams();
  const {loading, error, community}: UseCommunity = useCommunity(id!);

  if(error)
    return (<p>error</p>)

  if(loading)
    return (<p>loading...</p>)
  
  const {name, description} = community!;

  return(
  <div className="px-8 py-4 gap-4 w-full h-min-screen flex flex-col">

    <div className="flex flex-row justify-between">
      
      <div className="flex flex-col">
        <div className="font-bold text-2xl">{name}</div>
        <div className="font-medium">{description}</div>
      </div>
      
      <div className="flex flex-row items-center gap-3">
          <Button>Update</Button>
          <Button variant="Danger">Delete</Button>
      </div>

    </div>
    <div>
        posts
      </div>

  </div>
  )
}
