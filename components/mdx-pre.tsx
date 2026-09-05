"use client";

import { useRef, useState } from "react";
import { Check, Copy } from "lucide-react";

export function Pre({ children, ...props }: React.ComponentProps<"pre">) {
  const preRef = useRef<HTMLPreElement>(null);
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const text = preRef.current?.textContent ?? "";
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="relative group/pre">
      <pre ref={preRef} {...props}>
        {children}
      </pre>
      <button
        type="button"
        onClick={handleCopy}
        aria-label="Copy code"
        className="absolute top-3 right-3 rounded-md p-1.5 text-muted-foreground hover:text-foreground bg-background/60 hover:bg-background border border-border opacity-0 group-hover/pre:opacity-100 focus-visible:opacity-100 transition-opacity"
      >
        {copied ? (
          <Check className="size-4" />
        ) : (
          <Copy className="size-4" />
        )}
      </button>
    </div>
  );
}
