import { useNavigate } from "react-router"

type CommunityCardProps = {
  id: string;
  name: string;
  description: string;
}

export default function CommunityCard({name, description, id}: CommunityCardProps){

  const navigate = useNavigate();

  function handleClick(e: React.MouseEvent<HTMLDivElement>){
    navigate(`/communities/${id}`)
  }

  return(
    <div className="px-8 py-4 grid grid-cols-[2fr_7fr] gap-7 rounded-2xl w-lg hover:cursor-pointer hover:bg-gray-100 transform-color" onClick={handleClick}>
      <div className="flex items-center justify-center">
        Pic
      </div>
      <div className=" px-2 py-1 flex flex-col gap-1">
        <div className="font-bold text-black text-xl">{name}</div>
        <div className="font-medium text-gray-700 text-xs">{description}</div>
      </div>
    </div>
  )
}
