import Link from "next/link";
import Image from "next/image";
import { getAllPosts, formatDate } from "@/lib/posts";

export default function Home() {
  const posts = getAllPosts();
  const featured = posts.filter((p) => p.featured).slice(0, 5);
  const [hero, ...rest] = posts;
  const middle = rest.slice(0, 2);

  return (
    <main className="max-w-7xl mx-auto py-10 px-4">
      <div className="grid grid-cols-1 md:grid-cols-[1.6fr_1fr_0.8fr] gap-8 items-stretch">
        {/* Hero */}
        <Link href={`/posts/${hero.slug}`} className="flex flex-col group">
          <div className="relative aspect-[3/2] md:aspect-auto md:flex-1 mb-4 overflow-hidden bg-muted">
            <Image
              src={hero.coverImage}
              alt={hero.title}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 42vw"
              className="object-cover"
            />
          </div>
          <p className="text-xs font-semibold tracking-wide uppercase text-brand mb-2">
            {hero.category}
          </p>
          <h2 className="text-3xl font-bold leading-tight text-foreground group-hover:underline">
            {hero.title}
          </h2>
          <p className="text-base text-muted-foreground mt-3">
            {hero.excerpt}
          </p>
          <p className="text-sm text-muted-foreground mt-3">
            By {hero.author} — {formatDate(hero.date)}
          </p>
        </Link>

        {/* Middle column */}
        <div className="flex flex-col gap-8">
          {middle.map((post) => (
            <Link
              key={post.slug}
              href={`/posts/${post.slug}`}
              className="block group"
            >
              <div className="relative aspect-[16/8] mb-3 overflow-hidden bg-muted">
                <Image
                  src={post.coverImage}
                  alt={post.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover"
                />
              </div>
              <p className="text-xs font-semibold tracking-wide uppercase text-brand mb-2">
                {post.category}
              </p>
              <h3 className="text-lg font-bold leading-snug text-foreground group-hover:underline">
                {post.title}
              </h3>
              <p className="text-sm text-muted-foreground mt-2">
                By {post.author} — {formatDate(post.date)}
              </p>
            </Link>
          ))}
        </div>

        {/* Featured sidebar */}
        <div>
          <h4 className="text-xs font-semibold tracking-wide uppercase text-muted-foreground mb-4">
            Featured
          </h4>
          <div className="flex flex-col gap-4">
            {featured.map((post) => (
              <Link
                key={post.slug}
                href={`/posts/${post.slug}`}
                className="flex gap-3 items-start group"
              >
                <div className="relative w-16 h-16 shrink-0 overflow-hidden bg-muted">
                  <Image
                    src={post.coverImage}
                    alt={post.title}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="text-sm font-bold leading-snug text-foreground group-hover:underline">
                    {post.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1.5">
                    By {post.author} — {formatDate(post.date)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
