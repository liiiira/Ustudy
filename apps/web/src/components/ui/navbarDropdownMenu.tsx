import DropdownMenu from "./dropdownMenu"
import React, { useState } from "react"
import { useNavigate } from "react-router";


type NavbarDropDownMenuProps = {
  logout: () => Promise<void>
}


export default function NavbarDropDownMenu({logout}: NavbarDropDownMenuProps){
  
  const navigate = useNavigate();
  const [open, setOpen] = useState<boolean>(false);


  function toggleOpen(e: React.MouseEvent){
    setOpen(!open);
  }

  async function handleLogout(e: React.MouseEvent<HTMLDivElement>){

    setOpen(false);

    try{
       await logout();

    }catch(err){

      if (err instanceof Error)
        console.error("Failed to logout: ", err);

    }
  
    navigate("/login")
  }

  function handleNavigateProfile(e: React.MouseEvent<HTMLDivElement>){
    setOpen(false);
    navigate("/profile");
  }

  return(
    <div className="relative w-max h-max">
      <div 
        onClick={toggleOpen}
        className="hover:cursor-pointer"
      >
        pfp
      </div>
      <div 
        className={`absolute h-max w-max top-full mt-6 right-0 transition-all duration-150 ease-out
            ${open 
              ? "opacity-100 scale-100 pointer-events-auto"
              : "opacity-0 scale-95 pointer-events-none"}`}
        >
        <DropdownMenu 
          options={{
            "Profile": handleNavigateProfile,
            "Logout": handleLogout,
          }}
          size="xl"
        />
      </div>
    </div>
  )
}

