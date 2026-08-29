import LogoutForm from "../../features/auth/components/LogoutForm";
import { useAuth} from "../../features/auth/hooks/useAuth";
import { Link } from "react-router";

export function Navbar(){
  
  const {isAuthenticated} = useAuth();
  return (
    <div className="flex flex-row sticky top-0 w-full bg-blue-950 text-white font-bold size-10 justify-between" >
      <p >NavBar</p>
      { isAuthenticated &&<div className="flex flex-row"><LogoutForm /> <Link to="/profile">Profile</Link></div> }
    </div>
  )
}
