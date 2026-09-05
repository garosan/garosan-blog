This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Writing a new post

Posts live in `content/posts/*.mdx`. To get an AI-generated cover image, set in the frontmatter:

```yaml
coverImage: "generate"
```

`npm run dev` automatically runs `scripts/generate-covers.mjs` first (via the `predev` script), which replaces `"generate"` with a real Vercel Blob URL and rewrites the `.mdx` file on disk. This also happens automatically during `npm run build` (including on Vercel), but **that rewrite only happens in that build's own checkout — it never gets pushed back to git**.

**After running `npm run dev` (or after a Vercel deploy) with a new post, remember to:**

1. Check `git status` / `git diff` for the `.mdx` file — the `coverImage` field should now be a real URL, not `"generate"`.
2. Commit and push that change, so local and the repo stay in sync and you don't see `Failed to construct 'URL': Invalid URL` next time you pull and run `npm run dev` fresh.

If you ever need to force-regenerate a cover (e.g. you didn't like the result), run:

```bash
npm run covers:reset -- <post-slug>
```

then run `npm run dev` (or `npm run build`) again to regenerate it.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
