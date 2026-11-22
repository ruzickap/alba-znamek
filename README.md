# Alba známek

Web viewer of a family collection of postage stamp albums. The shelf shows
the album covers; an album opens as a gallery of its pages, and a click on a
stamp zooms the whole page to 100 % around it.

The photos are RAW shots of the album pages, edited in LightCraft (rotation,
crop, white balance, exposure, sharpening; the edits are in the `.arw.xmp`
sidecars next to the RAW files) and exported in full size. All images are
AVIF.

## Usage

```bash
mise install          # Bun and Git LFS at pinned versions
git lfs pull          # full-size and display photos (~0.9 GB)
mise run web:dev      # dev server with hot reload
```

AI agent skills (`.agents/skills/`, not committed) are installed with
`scripts/install-agent-skills.sh` (needs the GitHub CLI `gh`).

| Command                  | What it does                                                           |
|--------------------------|------------------------------------------------------------------------|
| `mise run web:dev`       | Dev server with hot reload                                             |
| `mise run web:test`      | Tests (Vitest)                                                         |
| `mise run web:build`     | Type-check + build to `web/dist/`                                      |
| `mise run photos:derive` | Thumbnails, display images and `albums.json` from the full-size photos |

## Photos

```text
web/public/photos/full/<album>/<photo>.avif     full size, quality 80 (Git LFS)
web/public/photos/display/<album>/<photo>.avif  long edge 2400 px (Git LFS)
web/public/photos/thumb/<album>/<photo>.avif    long edge 480 px (git)
web/public/photos/highlights/<n>.avif           stamps of highlights.json (git)
web/src/lib/albums.json                        album list (generated)
```

The file name is the capture time. The first photo of an album is its
cover, the rest are its pages in capture order. Album titles are in
`web/scripts/derive-photos.ts`.

To add or replace photos, export them from LightCraft into
`web/public/photos/full/<album>/` and run `mise run photos:derive`.

## Stamp descriptions

```text
web/src/lib/stamps/<album>.json   { "<page file>": { note?, stamps: [...] } }
web/src/lib/summaries.json        { "<album>": { summary, value, cover? } }
```

Each stamp has a name, country, year, optional catalogue number (Pofis,
SG, Mi.), its position on the page (`box`, fractions 0..1), a description,
an approximate price and its sources. The viewer lists the stamps under
the page with a crop of each stamp, and shows a stamp's details when the
mouse is over it. The album page ends with a summary: the period and
countries come from the stamp descriptions, the text, value estimate and
the transcribed cover note from `summaries.json`.

Identifications and prices were researched from the photos and dealer /
catalogue pages; they are approximate.

## Git LFS and pushing

The repository's `pre-push` hook belongs to prek (pre-commit), so the Git
LFS `pre-push` hook is not installed. Upload the LFS objects before pushing:

```bash
git lfs push --all origin
git push
```
