import { useNavigate } from "react-router"

type CommunityCardProps = {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
}

export default function CommunityCard({name, description, id, imageUrl}: CommunityCardProps){

  const navigate = useNavigate();

  function handleClick(e: React.MouseEvent<HTMLDivElement>){

    navigate(`/communities/${id}`)
  }

  return(
    <div className="bg-white px-8 py-4 grid grid-cols-[4rem_1fr] gap-2 rounded-2xl w-lg hover:cursor-pointer hover:bg-gray-100 transform-color" onClick={handleClick}>
      <div className="w-full aspect-square">
        {imageUrl &&
           <img 
              src={imageUrl}
              className="w-full aspect-square object-cover rounded"
            />
        }
      </div>
      <div className="min-w-0 px-2 py-1 flex flex-col gap-1">
        <div className="font-bold text-black text-xl line-clamp-1">{name}</div>
        <div className="font-medium text-gray-700 text-xs line-clamp-1">{description}</div>
      </div>
    </div>
  )
}
