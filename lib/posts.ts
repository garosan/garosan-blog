import fs from "fs";
import path from "path";
import matter from "gray-matter";

const postsDirectory = path.join(process.cwd(), "content/posts");

export type PostMeta = {
  slug: string;
  title: string;
  date: string;
  author: string;
  excerpt: string;
  category: "AI Engineering" | "Software Engineering";
  tags: string[];
  featured: boolean;
  coverImage: string;
};

export function formatDate(date: string): string {
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function getAllPosts(): PostMeta[] {
  const files = fs.readdirSync(postsDirectory);

  const posts = files
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => {
      const slug = file.replace(/\.mdx$/, "");
      const fileContent = fs.readFileSync(
        path.join(postsDirectory, file),
        "utf8",
      );
      const { data } = matter(fileContent);

      return {
        slug,
        title: data.title,
        date: data.date,
        author: data.author ?? "Garo Sanchez",
        excerpt: data.excerpt,
        category: data.category,
        tags: data.tags ?? [],
        featured: data.featured ?? false,
        coverImage: data.coverImage ?? "/images/placeholder.jpg",
      };
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  return posts;
}
