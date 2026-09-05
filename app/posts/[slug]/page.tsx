import fs from "fs";
import path from "path";
import matter from "gray-matter";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/posts";

const postsDirectory = path.join(process.cwd(), "content/posts");

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const filePath = path.join(postsDirectory, `${slug}.mdx`);
  const fileContent = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(fileContent);

  return (
    <main className="max-w-7xl mx-auto px-4 py-10">
      <Link
        href="/"
        className="inline-block text-sm text-muted-foreground hover:text-foreground mb-8"
      >
        ← Back to home
      </Link>
      <article className="prose prose-invert max-w-2xl">
        <p className="text-xs font-semibold tracking-wide uppercase text-brand mb-2">
          {data.category}
        </p>
        <h1>{data.title}</h1>
        <p className="text-sm text-muted-foreground">
          By {data.author ?? "Garo Sanchez"} — {formatDate(data.date)}
        </p>
        <div className="flex gap-2 mt-2 mb-6">
          {(data.tags ?? []).map((tag: string) => (
            <Badge key={tag} variant="outline">
              {tag}
            </Badge>
          ))}
        </div>
        <MDXRemote source={content} />
      </article>
    </main>
  );
}
