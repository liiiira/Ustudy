import { Outlet, Navigate} from "react-router"
import type { AuthContextType } from "../features/auth/context/auth.context"
import { useAuth } from "../features/auth/hooks/useAuth";


export default function ProtectedRoute(){
  
  const {loading, isAuthenticated}: AuthContextType = useAuth();

  if(loading)
    return (<p>Loading ...</p>)

  if(!isAuthenticated){
    // reaplce to replace the protected path with login
    //so no weird behavior happens when we go back 
    return <Navigate to="/login" replace />
  }

  return (
    <Outlet />
  )
}
