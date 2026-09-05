import Link from "next/link";
import { PostGrid } from "@/components/post-grid";
import { getAllPosts } from "@/lib/posts";

const PAGE_SIZE = 12;

export default async function PostsArchivePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const posts = getAllPosts();
  const totalPages = Math.max(1, Math.ceil(posts.length / PAGE_SIZE));
  const page = Math.min(Math.max(1, Number(pageParam) || 1), totalPages);
  const start = (page - 1) * PAGE_SIZE;
  const pagePosts = posts.slice(start, start + PAGE_SIZE);

  return (
    <main className="max-w-7xl mx-auto px-4 py-10">
      <Link
        href="/"
        className="inline-block text-sm text-muted-foreground hover:text-foreground mb-8"
      >
        ← Back to home
      </Link>
      <h1 className="text-2xl font-bold tracking-tight text-foreground mb-8">
        All posts
      </h1>
      <PostGrid posts={pagePosts} />
      {totalPages > 1 && (
        <nav className="flex items-center justify-between mt-10 pt-6 border-t border-border text-sm">
          {page > 1 ? (
            <Link
              href={page - 1 === 1 ? "/posts" : `/posts?page=${page - 1}`}
              className="text-foreground hover:text-brand"
            >
              ← Previous
            </Link>
          ) : (
            <span />
          )}
          <span className="text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          {page < totalPages ? (
            <Link
              href={`/posts?page=${page + 1}`}
              className="text-foreground hover:text-brand"
            >
              Next →
            </Link>
          ) : (
            <span />
          )}
        </nav>
      )}
    </main>
  );
}
