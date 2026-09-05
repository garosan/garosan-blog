// Manually clears one post's entry from the cover manifest so the next
// build regenerates its image exactly once. Usage:
//   node scripts/reset-cover.mjs my-post-slug

import { put, head } from "@vercel/blob";

const MANIFEST_PATHNAME = "covers/manifest.json";
const slug = process.argv[2];

if (!slug) {
  console.error("Usage: node scripts/reset-cover.mjs <slug>");
  process.exit(1);
}

const info = await head(MANIFEST_PATHNAME).catch(() => null);
if (!info) {
  console.log("No manifest found yet — nothing to reset.");
  process.exit(0);
}

const res = await fetch(info.url, { cache: "no-store" });
const manifest = await res.json();

if (!manifest.posts?.[slug]) {
  console.log(`No cached cover for "${slug}" — it will generate normally on the next build.`);
  process.exit(0);
}

delete manifest.posts[slug];
await put(MANIFEST_PATHNAME, JSON.stringify(manifest, null, 2), {
  access: "public",
  contentType: "application/json",
  allowOverwrite: true,
});

console.log(`Cleared cached cover for "${slug}". Set its coverImage to "generate" and the next build will create a fresh one.`);
