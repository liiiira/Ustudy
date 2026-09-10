import LogoutForm from "../../features/auth/components/LogoutForm";
import { useAuth} from "../../features/auth/hooks/useAuth";
import { Link } from "react-router";
import DropdownMenu from "../ui/dropdownMenu";
import NavbarDropDownMenu from "../ui/navbarDropdownMenu";

export function Navbar(){
  
  const {isAuthenticated, logout} = useAuth();
  return (
    <div id="navbar" className="flex flex-row items-center justify-between px-6 py-2 sticky top-0 w-full bg-white font-bold " >
      
      <div id="navbar-logo" className="flex items-center justify-center px-4 py-2">
        <Link to="/">Ustudy</Link>
      </div>

      {isAuthenticated &&

        <div id="navbar-links" className="flex flex-row justify-between gap-5">

          <div className="flex flex-row-reverse justify-between items-center gap-4">
            
            <NavbarDropDownMenu 
              logout={logout} 
            />
            <Link 
              to="/communities" 
              className="font-light transition-colors hover:text-blue-700"
            >
              Communities
            </Link>

          </div>
        </div>
      }
    

    </div>
  
  )
}
