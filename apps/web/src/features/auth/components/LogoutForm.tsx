import {type AuthContextType } from "../context/auth.context";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router";


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
    <form className={`w-max h-max ${className}`} onSubmit={handleLogout}>

      <button className="px-4 py-2 bg-blue-500 text-white font-extrabold border-blue-950 rounded-xl" 
      type="submit">Log out</button>

    </form>
  )
}
