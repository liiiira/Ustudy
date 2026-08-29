import { useProfile } from "../hooks/useProfile"
import type { User } from "../types";


export default function ProfilePage(){
  
  const {loading, user, error} = useProfile();

  if(loading){
    return (<p>...loading</p>)
  }
  if(error){
    return (<p>...error</p>)
  }
  const {username, createdAt, email, id}: User = user!;
  return (
  <div className="w-full h-full flex justify-center items-center ">

    <div className="flex flex-col w-1/2 h-1/2 gap-2 px-8 py-4  border-2 border-blue-400 rounded-xl">
      <div>
          id: {id}
        </div>
      <div>
          Username: {username}
      </div>
      <div>
          Email: {email}
        </div>
      <div>
          Created At:{String(createdAt)} 
        </div>
    
      
    </div>
  </div>
  )
}
