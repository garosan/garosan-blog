import Link from "next/link";
import { notFound } from "next/navigation";
import { PostGrid } from "@/components/post-grid";
import { PaginationNav } from "@/components/pagination-nav";
import { getAllPosts, getCategoryFromSlug } from "@/lib/posts";

const PAGE_SIZE = 12;

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { slug } = await params;
  const category = getCategoryFromSlug(slug);

  if (!category) {
    notFound();
  }

  const { page: pageParam } = await searchParams;
  const posts = getAllPosts().filter((post) => post.category === category);
  const totalPages = Math.max(1, Math.ceil(posts.length / PAGE_SIZE));
  const page = Math.min(Math.max(1, Number(pageParam) || 1), totalPages);
  const start = (page - 1) * PAGE_SIZE;
  const pagePosts = posts.slice(start, start + PAGE_SIZE);
  const basePath = `/category/${slug}`;

  return (
    <main className="max-w-7xl mx-auto px-4 py-10">
      <Link
        href="/"
        className="inline-block text-sm text-muted-foreground hover:text-foreground mb-8"
      >
        ← Back to home
      </Link>
      <h1 className="text-2xl font-bold tracking-tight text-foreground mb-8">
        {category}
      </h1>
      {pagePosts.length > 0 ? (
        <>
          <PostGrid posts={pagePosts} />
          <PaginationNav basePath={basePath} page={page} totalPages={totalPages} />
        </>
      ) : (
        <p className="text-muted-foreground">
          No posts in this category yet.
        </p>
      )}
    </main>
  );
}
