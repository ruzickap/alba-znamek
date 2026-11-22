import { describe, expect, it } from "vitest";
import { albumFacts, albumsLabel, pagesLabel } from "./albums";
import { parseRoute, routeHash } from "./route";
import { centerOn, stampAt } from "./zoom";

describe("parseRoute / routeHash", () => {
  it.each([
    ["", {}],
    ["#/", {}],
    ["#/fialove-album", { album: "fialove-album" }],
    ["#/fialove-album/3", { album: "fialove-album", page: 3 }],
    ["#/fialove-album/0", { album: "fialove-album" }],
    ["#/fialove-album/abc", { album: "fialove-album" }],
    ["#/fialove-album/2.5", { album: "fialove-album" }],
    ["#/%", {}],
    ["#/%E0%A4%A/3", {}],
  ])("%s", (hash, route) => {
    expect(parseRoute(hash)).toEqual({
      album: undefined,
      page: undefined,
      ...route,
    });
  });

  it("round-trips", () => {
    for (const route of [{}, { album: "a b" }, { album: "x", page: 12 }]) {
      expect(parseRoute(routeHash(route))).toEqual({
        album: undefined,
        page: undefined,
        ...route,
      });
    }
  });
});

describe("pagesLabel / albumsLabel", () => {
  it.each([
    [1, "1 stránka"],
    [2, "2 stránky"],
    [4, "4 stránky"],
    [5, "5 stránek"],
    [110, "110 stránek"],
  ])("%i", (count, label) => {
    expect(pagesLabel(count)).toBe(label);
  });

  it.each([
    [1, "1 album"],
    [3, "3 alba"],
    [10, "10 alb"],
  ])("%i albums", (count, label) => {
    expect(albumsLabel(count)).toBe(label);
  });
});

describe("centerOn", () => {
  const image = { width: 4000, height: 6000 };
  const viewport = { width: 1000, height: 800 };

  it("centres the clicked point", () => {
    expect(centerOn(0.5, 0.5, image, viewport)).toEqual({
      left: 1500,
      top: 2600,
    });
  });

  it("stays inside the image at the edges", () => {
    expect(centerOn(0, 0, image, viewport)).toEqual({ left: 0, top: 0 });
    expect(centerOn(1, 1, image, viewport)).toEqual({ left: 3000, top: 5200 });
  });

  it("does not scroll an image smaller than the viewport", () => {
    expect(centerOn(0.9, 0.9, { width: 500, height: 400 }, viewport)).toEqual({
      left: 0,
      top: 0,
    });
  });
});

describe("stampAt", () => {
  const stamps = [
    { box: [0.1, 0.1, 0.3, 0.3] as [number, number, number, number] },
    {},
    { box: [0.5, 0.5, 0.9, 0.9] as [number, number, number, number] },
  ];

  it("finds the stamp under the point", () => {
    expect(stampAt(stamps, 0.2, 0.2)).toBe(0);
    expect(stampAt(stamps, 0.6, 0.8)).toBe(2);
  });

  it("returns -1 between stamps", () => {
    expect(stampAt(stamps, 0.4, 0.4)).toBe(-1);
  });
});

describe("albumFacts", () => {
  const stamp = (country: string, year: string) => ({
    name: "x",
    country,
    year,
    description: "",
    price: "",
    sources: [],
  });

  it("adds up the stamps of all pages", () => {
    const facts = albumFacts({
      "a.avif": {
        stamps: [stamp("Rakousko", "1908"), stamp("Německo", "1912–1924")],
      },
      "b.avif": { note: "deska", stamps: [stamp("Německo", "kolem 1890")] },
    });
    expect(facts).toEqual({
      stamps: 3,
      years: [1890, 1924],
      countries: ["Německo", "Rakousko"],
    });
  });

  it("has no years for an album without descriptions", () => {
    expect(albumFacts({})).toEqual({
      stamps: 0,
      years: undefined,
      countries: [],
    });
  });
});
