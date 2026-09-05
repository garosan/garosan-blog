import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { formatDate, type PostMeta } from "@/lib/posts";

export function PostGrid({ posts }: { posts: PostMeta[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
      {posts.map((post, idx) => {
        const isFirstCol = idx % 4 === 0;
        const isFirstRow = idx < 4;
        return (
          <Link
            key={post.slug}
            href={`/posts/${post.slug}`}
            className={cn(
              "block group px-0 py-8 md:px-6",
              !isFirstCol && "md:border-l md:border-border",
              !isFirstRow && "md:border-t md:border-border"
            )}
          >
            <div className="relative aspect-[4/3] mb-4 overflow-hidden bg-muted">
              <Image
                src={post.coverImage}
                alt={post.title}
                fill
                sizes="(max-width: 768px) 100vw, 25vw"
                className="object-cover"
              />
            </div>
            <p className="text-xs font-semibold tracking-wide uppercase text-brand mb-2">
              {post.category}
            </p>
            <h3 className="text-base font-bold leading-snug text-foreground group-hover:underline mb-2">
              {post.title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
              {post.excerpt}
            </p>
            <p className="text-xs text-muted-foreground">
              By {post.author} — {formatDate(post.date)}
            </p>
          </Link>
        );
      })}
    </div>
  );
}
