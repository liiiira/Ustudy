import { useProfile } from "../hooks/useProfile";
import AccountForm from "./accountForm";

export default function Account(){
  
  const {loading, user: fetchedUser, error} = useProfile();


  if(loading){
    return (<p>...loading</p>)
  }
  if(error){
    return (<p>...error</p>)
  }
  const {id, username, avatarUrl} = fetchedUser!;

  return (
    <AccountForm 
      userId={id}
      username={username}
      avatarUrl={avatarUrl}
    />
  )
}
