# AGENTS.md

Guidance for AI agents working on **alba-znamek**.

## What this repo is

A static web viewer (`web/`, Vite + Svelte 5 + TypeScript, run with Bun)
of photographed stamp album pages. No backend: the album list is
`web/src/lib/albums.json`, the photos are files in `web/public/photos/`.

## Critical gotchas

- **Photos are big.** `web/public/photos/full/` (AVIF, full size)
  and `web/public/photos/display/` are in **Git LFS**
  (`.gitattributes`); only `thumb/` is plain git. Never commit photos
  outside these folders.
- **`albums.json` is generated** by `mise run photos:derive`
  (`web/scripts/derive-photos.ts`) - do not edit it by hand. The first
  photo (by file name = capture time) of each album folder is the cover.
- **The Git LFS `pre-push` hook is not installed** - the hook belongs to
  prek. Run `git lfs push --all origin` before `git push`.
- **`.pre-commit-config.yaml` is gitignored** and symlinked locally.
- **The UI is Czech.** Use Czech plurals via `pagesLabel` /
  `albumsLabel` / `stampsLabel` in `web/src/lib/albums.ts`.
- **All images are AVIF**, made with sharp under Bun (`mise run
  photos:derive`). The shelf's "Nejcennější známky" come from
  `web/src/lib/highlights.json`; their crops are cut by the same script.
- **Stamp descriptions** are in `web/src/lib/stamps/<album>.json`, keyed
  by page file name; `stamps.test.ts` checks them against `albums.json`
  (page files, `box` within 0..1, `catalog` only "Pofis / SG / Mi. …",
  http(s) source URLs). Album summaries are in
  `web/src/lib/summaries.json`. Sources must be real pages - never
  invent URLs.

## Tooling and commands

`mise` is the task runner and tool manager (`mise.toml`); `mise install`
gets Bun and Git LFS.

| Command                  | What it does                                  |
|--------------------------|-----------------------------------------------|
| `mise run web:dev`       | Dev server with hot reload                    |
| `mise run web:test`      | Tests (Vitest + Testing Library, jsdom)       |
| `mise run web:check`     | svelte-check + tsc                            |
| `mise run web:build`     | Type-check + build to `web/dist/`             |
| `mise run photos:derive` | Web sizes + `albums.json` from `full/`        |

### Verifying changes

- CI (`.github/workflows/`, adopted from `ruzickap/container-image-scans`):
  `web-tests` on every non-main push, `deploy-web` builds `web/dist/`
  with the LFS photos for GitHub Pages (Pages sites are limited to 1 GB),
  `mega-linter` lints everything except the photos and generated data.
  Validate workflow changes with `actionlint`.
- `mise run web:test` and `mise run web:check`.
- Agent skills in `.agents/skills/` are not committed - install them with
  `scripts/install-agent-skills.sh`.
- Svelte components: `npx @sveltejs/mcp svelte-autofixer <file>`
  (`.agents/skills/svelte-code-writer`).
- UI: run `mise run web:dev` and check it in a browser with
  `playwright-cli` (`.agents/skills/playwright-cli`).

## Code layout

- `web/src/App.svelte` - hash routing: `#/` shelf, `#/<album>` pages,
  `#/<album>/<n>` page viewer (`web/src/lib/route.ts`).
- `web/src/lib/Shelf.svelte`, `AlbumPages.svelte`, `PageViewer.svelte` -
  the three views. The viewer shows the display image; a click zooms to
  the full-size image at 100 % centred on the click (`zoom.ts`).
- `StampList.svelte` (descriptions under the page, `StampCrop.svelte` cuts
  the stamp out of the page image with CSS), `StampTip.svelte` (details on
  mouse-over, `stampAt` in `zoom.ts`), `AlbumSummary.svelte` (end of the
  album page, `albumFacts` in `albums.ts`).
