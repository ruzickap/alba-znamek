import data from "./albums.json";

export type Photo = { file: string; width: number; height: number };
export type Album = {
  slug: string;
  title: string;
  cover: Photo;
  pages: Photo[];
};
export type Size = "thumb" | "display" | "full";
export type Box = [x0: number, y0: number, x1: number, y1: number];
export type Stamp = {
  name: string;
  country: string;
  year: string;
  catalog?: string;
  // Position on the page as fractions 0..1 of the image, origin top-left
  box?: Box;
  description: string;
  price: string;
  sources: { title: string; url: string }[];
};
export type PageStamps = { note?: string; stamps: Stamp[] };
// Stamp descriptions of one album, keyed by page file name
export type AlbumStamps = Record<string, PageStamps>;
// summaries.json: { "<album>": AlbumSummaryText }
export type AlbumSummaryText = {
  summary?: string;
  value?: string;
  cover?: string;
  coverCheck?: string;
};

export const albums: Album[] = data;

// Stamp descriptions: stamps/<album>.json, loaded only when the album is opened (they are MBs)
const stampFiles = import.meta.glob<AlbumStamps>("./stamps/*.json", {
  import: "default",
});

export function loadStamps(slug: string): Promise<AlbumStamps> {
  const load = stampFiles[`./stamps/${slug}.json`];
  return load ? load() : Promise.resolve({});
}

export function photoUrl(size: Size, album: Album, photo: Photo): string {
  return `photos/${size}/${album.slug}/${photo.file}`;
}

// Czech plural: 1 stránka, 2-4 stránky, 5+ stránek
function plural(count: number, one: string, few: string, many: string): string {
  if (count === 1) return `1 ${one}`;
  return `${count} ${count >= 2 && count <= 4 ? few : many}`;
}

export const pagesLabel = (count: number) =>
  plural(count, "stránka", "stránky", "stránek");
export const albumsLabel = (count: number) =>
  plural(count, "album", "alba", "alb");

export type AlbumFacts = {
  stamps: number;
  years?: [number, number];
  // Countries by number of different stamps, most first
  countries: string[];
};

// What the stamp descriptions of an album add up to
export function albumFacts(pages: AlbumStamps): AlbumFacts {
  const stamps = Object.values(pages).flatMap((page) => page.stamps);
  const years = stamps.flatMap((stamp) =>
    (stamp.year.match(/1[89]\d\d|20\d\d/g) ?? []).map(Number),
  );
  const counts = new Map<string, number>();
  for (const { country } of stamps) {
    counts.set(country, (counts.get(country) ?? 0) + 1);
  }
  return {
    stamps: stamps.length,
    years: years.length ? [Math.min(...years), Math.max(...years)] : undefined,
    countries: [...counts]
      .sort((a, b) => b[1] - a[1])
      .map(([country]) => country),
  };
}

export const stampsLabel = (count: number) =>
  plural(count, "známka", "známky", "známek");
