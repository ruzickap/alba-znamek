import { render, screen, within } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import albumList from "./albums.json";
import Highlights from "./Highlights.svelte";
import highlights from "./highlights.json";

describe("Highlights", () => {
  it("points every stamp at an existing page of its album", () => {
    for (const stamp of highlights) {
      const album = albumList.find((a) => a.slug === stamp.album);
      expect(album?.pages[stamp.page - 1]?.file, `${stamp.name}`).toBe(
        stamp.file,
      );
      const [x0, y0, x1, y1] = stamp.box;
      expect(
        0 <= x0 && x0 < x1 && x1 <= 1 && 0 <= y0 && y0 < y1 && y1 <= 1,
      ).toBe(true);
    }
  });

  it("lists the stamps with a crop and a link to their page", () => {
    render(Highlights, { albums: albumList });
    expect(
      screen.getByRole("heading", { name: "Nejcennější známky" }),
    ).toBeInTheDocument();
    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(highlights.length);
    const [first] = highlights;
    expect(within(items[0]).getByRole("img")).toHaveAttribute(
      "src",
      "photos/highlights/1.avif",
    );
    expect(within(items[0]).getByText(first.value)).toBeInTheDocument();
    expect(
      within(items[0]).getByRole("link", {
        name: new RegExp(`stránka ${first.page}$`),
      }),
    ).toHaveAttribute("href", `#/${first.album}/${first.page}`);
  });
});
