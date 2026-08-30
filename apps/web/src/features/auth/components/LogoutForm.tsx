import {type AuthContextType } from "../context/auth.context";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router";
import Button from "../../../components/ui/button"; 

export default function LogoutForm( {className} : {className?: string}){
  const navigate = useNavigate();
  const {logout}: AuthContextType= useAuth();

  async function handleLogout(e: React.SubmitEvent){
    e.preventDefault();
    try{

       await logout();

    }catch(err){
      if (err instanceof Error)
        console.error("Failed to logout: ", err);
    }
    navigate("/login")
  }
  return (
    <form className={`flex items-center justify-center w-max h-max ${className}`} onSubmit={handleLogout}>

      <Button variant="Primary" type="submit">Log Out</Button>
    </form>
  )
}
