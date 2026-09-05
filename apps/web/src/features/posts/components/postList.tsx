import type { Post } from "../types";
import PostCard from "./postCard"; 


export default function PostList({posts} : {posts: Post[]}){
  return(
  <div className="w-2xl h-full flex flex-col gap-1 border-2 broder-gray-100 rounded-2xl">
      {
        posts.map((p: Post) =>
          (<PostCard key={p.id} postId={p.id} title={p.title} textContent={p.textContent} communityId={p.communityId} />)
        )
      }
  </div>
  )
}
