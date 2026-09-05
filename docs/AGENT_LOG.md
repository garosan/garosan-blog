# Agent Log

Notes, tradeoffs, and gotchas from AI-assisted work on this project — the
things worth knowing before touching related code again, that don't belong
in commit messages or code comments.

## 2026-09-05 — AI-generated cover images

**What was built**: `scripts/generate-covers.mjs` generates a cover image
per post via OpenAI and uploads it to Vercel Blob. It's wired into the
build itself (`"build": "node --env-file-if-exists=.env.local
scripts/generate-covers.mjs && next build"`), so it runs automatically on
every Vercel deploy — no git hook needed.

**Opt-in only**: a post is only a candidate for generation if its
`coverImage` frontmatter field is missing or the literal string
`"generate"`. Anything else (a real URL) is left alone. Existing test
posts with picsum URLs will never be touched by this pipeline.

**Cost safety rails** (this was the main design constraint — don't remove
without re-reading the reasoning):
- `covers/manifest.json` in Vercel Blob is the cross-build memory. Once a
  slug has a manifest entry, it is never regenerated automatically, and
  reusing it costs zero API calls. This is what stops "the same post gets
  regenerated on every single deploy forever."
- `MAX_COVER_GENERATIONS_PER_BUILD` (env var, default 3) — hard ceiling on
  how many *new* images one build can generate, no matter how many posts
  look pending. This is the circuit breaker against a bug (or a bulk
  import of hundreds of posts) accidentally triggering a huge one-shot
  API bill. Excess candidates fall back to a picsum placeholder and pick
  up on the next build.
- `MAX_COVER_GENERATIONS_TOTAL` (env var, default 200) — lifetime ceiling
  tracked in the manifest. Once hit, generation stops everywhere until a
  human deliberately raises it.
- Missing `OPENAI_API_KEY`/`BLOB_READ_WRITE_TOKEN`, an OpenAI API error, or
  a manifest read failure all fail *soft*: log a warning, fall back to a
  placeholder, and let `next build` complete. This must never be allowed
  to fail the build.
- `npm run covers:reset <slug>` manually clears one post's manifest entry
  to force exactly one fresh regeneration — the only supported way to
  redo a cover.

**Model/cost**: `gpt-image-1`, quality `"medium"`, size `1536x1024`.
Roughly $0.04–0.07 per image. Started at quality `"low"` but the output
was too crude (very basic flat shapes) — bumped one tier, still cheap.

**Prompt design**: hashes the post's slug to deterministically pick one of
four dominant color themes (hot pink/magenta, electric blue, deep
violet/purple, turquoise/teal) so covers vary across posts instead of all
looking the same. Explicitly asks for "elaborate," "intricate layered
composition" (data streams, network nodes, circuitry, particle depth) and
explicitly says *not* simple flat geometric shapes — the first version's
prompt was too minimal and produced boring outlines.

**Bug found and fixed — stale image caching**: the first version wrote
every generation to a fixed path (`covers/{slug}.png`) with
`allowOverwrite: true`. Vercel Blob serves images with `cache-control:
public, max-age=2592000` (30 days). Since the URL never changed between
regenerations, browsers *and Vercel's CDN edge* would keep serving the old
image bytes for up to a month after a real regeneration — this wasn't
just a local browser-cache annoyance, it would have affected real
visitors too. Fixed by giving every generation a unique,
content-hash-prefixed filename and letting Blob's default random suffix
guarantee uniqueness, so a regeneration always gets a fresh, uncached URL.

**Known tradeoff from that fix**: old cover images from previous
generations of the same post are never deleted — they become orphaned
files in Blob storage. At current scale (images are ~1-2MB each) this is
a negligible storage cost, not worth building a cleanup job for yet. If
this ever needs addressing, look at `scripts/generate-covers.mjs`'s
`put()` call and consider deleting the manifest's previous `url` for a
slug before overwriting its entry.

**Frontmatter rewrite is build-local, not committed automatically**: the
script rewrites a post's `coverImage:` line in place (a surgical
single-line replace — not a full YAML re-stringify via `matter.stringify`,
which was tried first and reformatted the entire file's quoting style,
producing noisy unrelated diffs). This rewrite only exists in that
build's ephemeral checkout; it is never committed back to git. So the
*next* build's fresh git checkout will see `coverImage: "generate"` again
for any post whose real URL hasn't been manually committed — this is
expected, not a bug, and costs nothing extra because the manifest cache
serves the cached URL for free.

## 2026-09-04 — Custom domain (foundationfrontier.com)

- Domain is registered at Namecheap and was *not* transferred to Vercel —
  DNS stays on Namecheap's nameservers (`dns1`/`dns2.registrar-servers.com`),
  Vercel just points at it via standard records.
- Records in Namecheap Advanced DNS: `A` record on `@` → `216.198.79.1`
  (apex), `CNAME` on `www` → `2225ce519b6a9ddc.vercel-dns-017.com`, plus
  two separate `TXT` records both on host `_vercel` (one verifying the
  apex, one verifying `www` — DNS allows multiple TXT records at the same
  host name, they are not a replace-each-other pair).
- Namecheap's two nameservers can drift out of sync with each other for a
  few minutes after an edit — don't assume a record is broken just
  because `dig @dns1...` and `dig @dns2...` briefly disagree.
- The `_vercel` TXT records can be deleted once Vercel shows "Valid
  Configuration" for both `foundationfrontier.com` and
  `www.foundationfrontier.com` — the `A`/`CNAME` records must stay
  permanently.
