// Uploads a local image (a post screenshot, usually) to Vercel Blob and
// prints a ready-to-paste markdown snippet.
//
// Usage:
//   npm run image:upload -- <slug> <local-file-path> ["alt text"]
//
// Example:
//   npm run image:upload -- ai-for-production-week1-instant-gratification ~/Desktop/vercel-dashboard.png "Vercel dashboard showing the deployed function"

import fs from "fs";
import path from "path";
import { put } from "@vercel/blob";

const [slug, filePath, ...altParts] = process.argv.slice(2);
const alt = altParts.join(" ") || "screenshot";

if (!slug || !filePath) {
  console.error(
    'Usage: npm run image:upload -- <slug> <local-file-path> ["alt text"]',
  );
  process.exit(1);
}

if (!fs.existsSync(filePath)) {
  console.error(`File not found: ${filePath}`);
  process.exit(1);
}

const ext = path.extname(filePath) || ".png";
const baseName = path.basename(filePath, ext).replace(/[^a-z0-9-]/gi, "-");

const buffer = fs.readFileSync(filePath);
const contentType =
  { ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".gif": "image/gif" }[
    ext.toLowerCase()
  ] ?? "application/octet-stream";

const blob = await put(`posts/${slug}/${baseName}${ext}`, buffer, {
  access: "public",
  contentType,
  addRandomSuffix: true,
});

console.log(`\nUploaded: ${blob.url}\n`);
console.log("Paste this into your post:\n");
console.log(`![${alt}](${blob.url})\n`);
