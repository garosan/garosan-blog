// Generates AI cover images for blog posts at build time.
//
// Cost safety rails (do not remove without updating the user on the tradeoff):
// - Opt-in only: a post is only a candidate when its frontmatter `coverImage`
//   is missing/empty or the literal string "generate". Anything else (a real
//   URL) is left completely alone.
// - Generate-once, forever: once a slug has an entry in the manifest, it is
//   never regenerated automatically, even if the post's title/excerpt change.
//   To force a redo, run `node scripts/reset-cover.mjs <slug>`.
// - MAX_COVER_GENERATIONS_PER_BUILD caps how many *new* images a single
//   build can generate, regardless of how many posts qualify. This is the
//   circuit breaker against "1000 posts show up unrecognized and we
//   generate $100 of images in one shot" — a single run can only ever spend
//   on this many images, the rest queue for the next build.
// - MAX_COVER_GENERATIONS_TOTAL is a lifetime ceiling tracked in the
//   manifest. Once hit, generation stops entirely until a human raises it.
// - Missing credentials, API errors, or a manifest read failure never fail
//   the build — they log a warning and fall back to a placeholder image.

import fs from "fs";
import path from "path";
import crypto from "crypto";
import matter from "gray-matter";
import { put, head } from "@vercel/blob";
import OpenAI from "openai";

const POSTS_DIR = path.join(process.cwd(), "content/posts");
const MANIFEST_PATHNAME = "covers/manifest.json";

const MAX_PER_BUILD = Number(process.env.MAX_COVER_GENERATIONS_PER_BUILD ?? 3);
const MAX_TOTAL = Number(process.env.MAX_COVER_GENERATIONS_TOTAL ?? 200);

const FALLBACK_IMAGE = (slug) => `https://picsum.photos/seed/${slug}/1200/800`;

function log(msg) {
  console.log(`[covers] ${msg}`);
}

function warn(msg) {
  console.warn(`[covers] WARNING: ${msg}`);
}

async function readManifest() {
  try {
    const info = await head(MANIFEST_PATHNAME).catch(() => null);
    if (!info) return { total: 0, posts: {} };
    const res = await fetch(info.url, { cache: "no-store" });
    if (!res.ok) return { total: 0, posts: {} };
    const data = await res.json();
    return { total: data.total ?? 0, posts: data.posts ?? {} };
  } catch (err) {
    warn(`could not read manifest, starting fresh: ${err.message}`);
    return { total: 0, posts: {} };
  }
}

async function writeManifest(manifest) {
  await put(MANIFEST_PATHNAME, JSON.stringify(manifest, null, 2), {
    access: "public",
    contentType: "application/json",
    allowOverwrite: true,
  });
}

// Rewrites only the `coverImage:` line of a post's frontmatter, leaving
// every other line (formatting, quoting, key order) untouched — a full
// matter.stringify() round-trip would reformat the whole file via js-yaml
// and produce noisy, unrelated diffs on every generation run.
function setCoverImageLine(raw, coverUrl) {
  const value = `coverImage: "${coverUrl}"`;
  const frontmatterMatch = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!frontmatterMatch) return raw;

  const block = frontmatterMatch[1];
  const hasField = /^coverImage:.*$/m.test(block);
  const newBlock = hasField
    ? block.replace(/^coverImage:.*$/m, value)
    : `${block}\n${value}`;

  return (
    raw.slice(0, frontmatterMatch.index) +
    `---\n${newBlock}\n---` +
    raw.slice(frontmatterMatch.index + frontmatterMatch[0].length)
  );
}

function needsGeneration(coverImage) {
  if (!coverImage) return true;
  return coverImage.trim().toLowerCase() === "generate";
}

const COLOR_THEMES = [
  "hot pink and magenta as the dominant color, with subtle dark accents",
  "electric blue as the dominant color, with subtle dark accents",
  "turquoise and teal as the dominant color, with subtle dark accents",
];

function pickColorTheme(slug) {
  const hash = crypto.createHash("sha256").update(slug).digest();
  return COLOR_THEMES[hash[0] % COLOR_THEMES.length];
}

function buildPrompt({ slug, title, excerpt, category }) {
  const colorTheme = pickColorTheme(slug);
  return [
    `Elaborate abstract digital artwork representing the concept of "${title}".`,
    excerpt ? `Context: ${excerpt}` : "",
    `Category: ${category}.`,
    `Near-black background, glowing neon lighting with ${colorTheme}.`,
    "Intricate layered composition: flowing data streams, generative network nodes, fractal-like circuitry, particles, and depth-of-field glow — richly detailed generative-art style, not simple flat geometric shapes.",
    "No text, no words, no letters, no numbers, no logos, no UI elements. Wide cinematic composition.",
  ]
    .filter(Boolean)
    .join(" ");
}

async function generateImage(openai, prompt) {
  const result = await openai.images.generate({
    model: "gpt-image-1",
    prompt,
    size: "1536x1024",
    quality: "medium",
  });
  const b64 = result.data[0].b64_json;
  return Buffer.from(b64, "base64");
}

async function main() {
  const files = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith(".mdx"));

  const posts = files.map((file) => {
    const slug = file.replace(/\.mdx$/, "");
    const filePath = path.join(POSTS_DIR, file);
    const raw = fs.readFileSync(filePath, "utf8");
    const parsed = matter(raw);
    return { slug, filePath, raw, data: parsed.data };
  });

  const candidates = posts.filter((p) => needsGeneration(p.data.coverImage));

  if (candidates.length === 0) {
    log("no posts need a generated cover, skipping.");
    return;
  }

  const manifest = await readManifest();

  const hasCreds = Boolean(
    process.env.OPENAI_API_KEY && process.env.BLOB_READ_WRITE_TOKEN,
  );
  if (!hasCreds) {
    warn(
      "OPENAI_API_KEY or BLOB_READ_WRITE_TOKEN missing — using placeholder images for all pending posts.",
    );
  }

  const openai = hasCreds ? new OpenAI() : null;
  let generatedThisBuild = 0;

  for (const post of candidates) {
    const cached = manifest.posts[post.slug];
    let coverUrl;

    if (cached?.url) {
      coverUrl = cached.url;
      log(`${post.slug}: reusing cached cover (no API call).`);
    } else if (!hasCreds) {
      coverUrl = FALLBACK_IMAGE(post.slug);
    } else if (manifest.total >= MAX_TOTAL) {
      warn(
        `${post.slug}: lifetime cap of ${MAX_TOTAL} generated covers reached — using placeholder. Raise MAX_COVER_GENERATIONS_TOTAL to allow more.`,
      );
      coverUrl = FALLBACK_IMAGE(post.slug);
    } else if (generatedThisBuild >= MAX_PER_BUILD) {
      log(
        `${post.slug}: per-build cap of ${MAX_PER_BUILD} reached — will generate on a future build. Using placeholder for now.`,
      );
      coverUrl = FALLBACK_IMAGE(post.slug);
    } else {
      try {
        log(`${post.slug}: generating cover image via OpenAI...`);
        const prompt = buildPrompt({
          slug: post.slug,
          title: post.data.title,
          excerpt: post.data.excerpt,
          category: post.data.category,
        });
        // Each generation gets a unique filename (content-hashed) rather
        // than overwriting a fixed path. Vercel Blob serves images with a
        // 30-day cache-control, so reusing the same URL after a
        // regeneration would leave visitors' browsers and the CDN edge
        // showing the stale image for up to a month.
        const promptHash = crypto
          .createHash("sha256")
          .update(post.data.title + post.data.excerpt)
          .digest("hex")
          .slice(0, 12);
        const imageBuffer = await generateImage(openai, prompt);
        // addRandomSuffix (default true) guarantees a brand-new URL on
        // every call, even if regenerating a post with identical content —
        // this is what actually avoids stale-cache collisions, not the
        // promptHash alone.
        const blob = await put(
          `covers/${post.slug}-${promptHash}.png`,
          imageBuffer,
          {
            access: "public",
            contentType: "image/png",
          },
        );
        coverUrl = blob.url;
        generatedThisBuild += 1;
        manifest.total += 1;
        manifest.posts[post.slug] = {
          url: coverUrl,
          promptHash,
          generatedAt: new Date().toISOString(),
        };
        log(`${post.slug}: generated and uploaded (${blob.url}).`);
      } catch (err) {
        warn(
          `${post.slug}: generation failed (${err.message}), using placeholder.`,
        );
        coverUrl = FALLBACK_IMAGE(post.slug);
      }
    }

    if (post.data.coverImage !== coverUrl) {
      fs.writeFileSync(
        post.filePath,
        setCoverImageLine(post.raw, coverUrl),
        "utf8",
      );
    }
  }

  if (generatedThisBuild > 0) {
    await writeManifest(manifest);
    log(
      `done: generated ${generatedThisBuild} new cover(s), lifetime total is now ${manifest.total}/${MAX_TOTAL}.`,
    );
  } else {
    log("done: no new images generated this build.");
  }
}

main().catch((err) => {
  warn(
    `unexpected failure, continuing build with existing covers: ${err.message}`,
  );
});
