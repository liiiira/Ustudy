import type { Community } from "../types";
import CommunityCard from "./communityCard";
 


export default function CommunityList({communities} : {communities: Community[]}){
  if (communities.length === 0) return <></>
  return(
  <div className="flex flex-col gap-1 border-2 border-black rounded-2xl">
      {
        communities.map((c: Community) =>
          (<CommunityCard key={c.id} id={c.id} name={c.name} description={c.description} />)
        )
      }
  </div>
  )
}
