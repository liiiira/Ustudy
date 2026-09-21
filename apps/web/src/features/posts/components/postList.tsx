import type { Post } from "../types";
import PostCard from "./postCard";

export default function PostList({ posts }: { posts: Post[] }) {
  if (posts.length === 0) return <></>;
  return (
    <div className="min-w-0 w-2xl h-full flex flex-col gap-4 rounded-2xl">
      {posts.map((p: Post) => (
        <PostCard
          key={p.id}
          postId={p.id}
          title={p.title}
          textContent={p.textContent}
          communityId={p.communityId}
          imageUrl={p.imageUrl}
        />
      ))}
    </div>
  );
}
