import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700", "800"],
});

export const metadata: Metadata = {
  title: "_Foundation_Frontier: AI and Software Engineering Blog",
  description: "Notas sobre AI engineering y software engineering.",
};

const NAV_LINKS = [
  { label: "AI Engineering", href: "/categoria/ai-engineering" },
  { label: "Software Engineering", href: "/categoria/software-engineering" },
  { label: "About", href: "/about" },
];

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`dark ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <header>
          <div className="border-b border-border">
            <div className="max-w-7xl mx-auto px-4 h-16 grid grid-cols-[1fr_auto_1fr] items-center">
              <button
                type="button"
                aria-label="Search"
                className="justify-self-start text-foreground/70 hover:text-foreground"
              >
                <Search className="size-[18px]" />
              </button>
              <Link
                href="/"
                className="justify-self-center text-xl font-bold tracking-tight text-foreground"
              >
                _Foundation/_Frontier
              </Link>
              <span aria-hidden className="justify-self-end" />
            </div>
          </div>
          <nav className="border-b border-border">
            <div className="max-w-7xl mx-auto px-4 h-11 flex items-center justify-center gap-8">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-foreground/80 hover:text-foreground"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </nav>
        </header>
        <div className="flex-1">{children}</div>
        <footer className="border-t border-border">
          <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xl font-bold tracking-tight text-foreground">
              _Foundation/_Frontier
            </span>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a
                href="https://x.com/garosan1"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground"
              >
                X
              </a>
              <a
                href="https://www.linkedin.com/in/garosan/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground"
              >
                LinkedIn
              </a>
              <a
                href="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground"
              >
                YouTube
              </a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
