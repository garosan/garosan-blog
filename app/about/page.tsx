import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About — Garosan's Tech Blog",
  description: "Sobre FoundationFrontier y el autor.",
};

export default function AboutPage() {
  return (
    <main className="max-w-7xl mx-auto px-4 py-16">
      <Link
        href="/"
        className="inline-block text-sm text-muted-foreground hover:text-foreground mb-8"
      >
        ← Back to home
      </Link>
      <article className="prose prose-invert max-w-2xl">
        <h1>About</h1>
        <p>
          FoundationFrontier is a documentation of my journey in AI
          Engineering, Software and Tech.
        </p>
        <p>
          I started my career at Accenture in 2018 although I coded my 1st
          website when I was 12. I mostly love the startup life and doing
          things that will compound for impact.
        </p>
        <p>
          I also enjoy traveling, history, books, meeting people, hitting the
          gym, and learning useless stuff at 2am.
        </p>
      </article>
    </main>
  );
}
