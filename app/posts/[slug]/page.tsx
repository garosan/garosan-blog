import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { MDXRemote } from "next-mdx-remote/rsc";

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
    <article className="prose mx-auto py-10">
      <h1>{data.title}</h1>
      <p className="text-sm text-gray-500">{data.date}</p>
      <MDXRemote source={content} />
    </article>
  );
}
