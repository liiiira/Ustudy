import DropdownMenu from "./dropdownMenu"
import { EllipsisVertical } from "lucide-react"
import { useState } from "react"



type KebabMenuProps = { 
  options: Record<string, ((e: React.MouseEvent<HTMLDivElement>) => void)> 
}

export default function KebabMenu({options}: KebabMenuProps){
  
  const [open, setOpen] = useState<boolean>(false);

  function toggleOpen(e: React.MouseEvent){
    setOpen(!open);
  }

  return(
    <div className="relative w-max h-max">
      <EllipsisVertical 
        className="w-5 h-5 hover:cursor-pointer" 
        onClick={toggleOpen}
      />

        <div 
          className={`absolute h-max w-max top-full mt-2 right-0 transition-all duration-150 ease-out
              ${open 
                ? "opacity-100 scale-100 pointer-events-auto"
                : "opacity-0 scale-95 pointer-events-none"}`}
        >
            <DropdownMenu 
              options={options}
              size="xs"
            />
        </div>

    </div>
  )
}

