import FormBg from "../../../components/layout/formBg";
import CommunityForm from "../components/communityForm";
import { type  UseCommunity } from "../types";
import useCommunity from "../hooks/useCommunity";
import { useParams } from "react-router";


export default function UpdateCommunityPage(){

  const {communityId} = useParams();
  const {loading, error, community}: UseCommunity = useCommunity(communityId!);

  if(error)
    return (<p>error</p>)
  
  if(loading)
    return (<p>loading...</p>)

  const {name, description} = community!;

  return (
    <FormBg>
      <CommunityForm id={communityId} name={name} description={description} mode="Update"/>
    </FormBg>
  )
}
