import { CircleUserRound } from "lucide-react";
import DropdownMenu from "./dropdownMenu"
import React, { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router";

type NavbarDropDownMenuProps = {
  logout: () => Promise<void>,
  imageUrl?: string;
}


export default function NavbarDropDownMenu({logout, imageUrl}: NavbarDropDownMenuProps){
  
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState<boolean>(false);


  function toggleOpen(e: React.MouseEvent){
    setOpen(!open);
  }

  useEffect(() => {
    if(!open) return;
    
    const handler = (e: MouseEvent) => {
      if(ref.current && !ref.current.contains(e.target as Node)) 
        setOpen(false);
    }

    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler);
  }, [open])

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
    <div className="relative w-max h-max" ref={ref}>
      <div 
        onClick={toggleOpen}
        className="hover:cursor-pointer flex justify-center items-center"
      >
        {imageUrl
          ? <img 
              src={imageUrl}
              className="w-10 h-10 aspect-square object-cover rounded-full"
            />
          : <CircleUserRound className="w-10 h-10"/>
        }
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

