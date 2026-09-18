import { useNavigate } from "react-router"

export type PostCardProps = {
  postId: string;
  title: string;
  textContent: string;
  communityId: string;
  imageUrl?: string;
}

export default function PostCard({communityId, postId, title, textContent, imageUrl}: PostCardProps){

  const navigate = useNavigate();

  function handleClick(e: React.MouseEvent<HTMLDivElement>){

    navigate(`/communities/${communityId}/posts/${postId}`)
  }

  return(
    <div className="bg-white px-8 py-4 flex flex-col gap-2 rounded-2xl w-full hover:cursor-pointer hover:bg-gray-100 transform-color" onClick={handleClick}>

      <div className=" py-1 flex flex-col gap-1">
        <div className="font-bold text-black text-xl line-clamp-1">{title}</div>
        <div className="font-medium text-gray-700 text-xs line-clamp-3 wrap-break-word whitespace-break-spaces">{textContent}</div>
      </div>

      {imageUrl && 
          <img 
            src={imageUrl}
            className="width-full h-auto"
          />
        }
    </div>
  )
}
