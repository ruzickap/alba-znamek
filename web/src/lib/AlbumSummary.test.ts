import { render, screen } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import AlbumSummary from "./AlbumSummary.svelte";
import albumList from "./albums.json";
import summaries from "./summaries.json";

describe("AlbumSummary", () => {
  it("shows the facts, the estimate and the cover note", () => {
    render(AlbumSummary, {
      facts: {
        stamps: 12,
        years: [1945, 1953],
        countries: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"],
      },
      summary: {
        summary: "Poválečné známky.",
        value: "kolem 1 500 Kč",
        cover: "Kompletní sbírka",
        coverCheck: "Chybí aršíky.",
      },
    });
    expect(screen.getByRole("heading", { name: "O albu" })).toBeInTheDocument();
    expect(screen.getByText("Poválečné známky.")).toBeInTheDocument();
    expect(
      screen.getByText("12 známek (bez opakujících se kusů)"),
    ).toBeInTheDocument();
    expect(screen.getByText("1945–1953")).toBeInTheDocument();
    expect(
      screen.getByText("A, B, C, D, E, F, G, H a 2 další"),
    ).toBeInTheDocument();
    expect(screen.getByText("kolem 1 500 Kč")).toBeInTheDocument();
    expect(screen.getByText("Kompletní sbírka")).toBeInTheDocument();
    expect(screen.getByText("Chybí aršíky.")).toBeInTheDocument();
  });

  it("says 'dalších' for five and more countries left out", () => {
    render(AlbumSummary, {
      facts: { stamps: 13, countries: "ABCDEFGHIJKLM".split("") },
    });
    expect(
      screen.getByText("A, B, C, D, E, F, G, H a 5 dalších"),
    ).toBeInTheDocument();
  });

  it("shows nothing for an album without descriptions", () => {
    render(AlbumSummary, { facts: { stamps: 0, countries: [] } });
    expect(
      screen.queryByRole("heading", { name: "O albu" }),
    ).not.toBeInTheDocument();
  });

  it("has summaries only for existing albums", () => {
    const slugs = albumList.map((a) => a.slug);
    for (const slug of Object.keys(summaries)) expect(slugs).toContain(slug);
  });
});
