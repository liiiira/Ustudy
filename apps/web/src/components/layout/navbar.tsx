import LogoutForm from "../../features/auth/components/LogoutForm";
import { useAuth} from "../../features/auth/hooks/useAuth";
import { Link } from "react-router";

export function Navbar(){
  
  const {isAuthenticated} = useAuth();
  return (
    <div id="navbar" className="flex flex-row items-center justify-between px-6 py-2 sticky top-0 w-full bg-white border-2 border-gray-500 font-bold " >
      
      <div id="navbar-logo" className="flex items-center justify-center px-4 py-2">
        Ustudy
      </div>

      {isAuthenticated &&

        <div id="navbar-links" className="flex flex-row justify-between gap-5">

          <LogoutForm /> 

          <div className="flex justify-center items-center">
            <Link to="/profile">Profile</Link>
          </div>

        </div>
      }
    </div>
  
  )
}
