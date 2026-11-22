import { describe, expect, it } from "vitest";
import albumList from "./albums.json";
import type { PageStamps } from "./albums";

// The description files are written by hand / by agents - keep them consistent with the photos
const files = import.meta.glob<Record<string, PageStamps>>("./stamps/*.json", {
  eager: true,
  import: "default",
});

describe("stamp description files", () => {
  it.each(Object.entries(files))("%s", (path, pages) => {
    const slug = path.replace(/^\.\/stamps\/(.+)\.json$/, "$1");
    const album = albumList.find((a) => a.slug === slug);
    expect(album, `no album "${slug}"`).toBeDefined();
    const pageFiles = new Set(album!.pages.map((p) => p.file));
    for (const [file, page] of Object.entries(pages)) {
      expect(pageFiles.has(file), `${file} is not a page of ${slug}`).toBe(
        true,
      );
      expect(Array.isArray(page.stamps)).toBe(true);
      for (const stamp of page.stamps) {
        for (const key of [
          "name",
          "country",
          "year",
          "description",
          "price",
        ] as const) {
          expect(typeof stamp[key], `${file}: ${stamp.name} ${key}`).toBe(
            "string",
          );
        }
        // Only a catalogue number, e.g. "SG 357", "Pofis 152", "Mi. 45"
        if ("catalog" in stamp) {
          expect(stamp.catalog).toMatch(/^(SG|Pofis|Mi\.|Scott|Yv\.) /);
        }
        for (const source of stamp.sources) {
          expect(source.url, `${file}: ${stamp.name}`).toMatch(/^https?:\/\//);
          expect(source.title).toBeTruthy();
        }
        if (stamp.box) {
          const [x0, y0, x1, y1] = stamp.box;
          expect(
            0 <= x0 && x0 < x1 && x1 <= 1,
            `${file}: ${stamp.name} box`,
          ).toBe(true);
          expect(
            0 <= y0 && y0 < y1 && y1 <= 1,
            `${file}: ${stamp.name} box`,
          ).toBe(true);
        }
      }
    }
  });
});
