import CommunityList from "../components/communitiesList";
import useCommunitiesList from "../hooks/useCommunitiesList";
import {type UseCommunitiesList } from "../types";
import Button from "../../../components/ui/button";
import { useNavigate } from "react-router";

export default function CommunitiesPage(){

  const navigate = useNavigate();
  const {communities, loading, error}: UseCommunitiesList = useCommunitiesList();

  if(error)
    return (<div>error</div>)

  if(loading)
    return (<div>loading ...</div>)

  return (
    <div className="bg-gray-200 w-full min-h-screen flex-col">
      <div className="flex flex-row-reverse w-full "><Button onClick={() => {navigate("/communities/create")}}>Create Community</Button></div>
      <div className="flex items-center justify-center">
         <CommunityList communities={communities} />
      </div>
    </div>
      )

}
