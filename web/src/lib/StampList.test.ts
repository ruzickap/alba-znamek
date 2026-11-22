import { render, screen, within } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import StampList from "./StampList.svelte";

const stamp = {
  name: "Jiří V., 1 penny",
  country: "Velká Británie",
  year: "1912",
  catalog: "SG 357",
  box: [0.1, 0.2, 0.3, 0.5] as [number, number, number, number],
  description: "Royal Cypher",
  price: "kolem £0,15",
  sources: [
    { title: "Obchod", url: "https://example.com/sg357" },
    { title: "Zlý odkaz", url: "javascript:alert(1)" },
  ],
};

describe("StampList", () => {
  it("lists the stamps with their details and safe source links", () => {
    render(StampList, {
      page: { note: "Černá jsou předtisky.", stamps: [stamp] },
      photo: { file: "p.avif", width: 1000, height: 2000 },
      src: "photos/display/a/p.avif",
    });
    expect(
      screen.getByRole("heading", { name: "Známky na stránce" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Černá jsou předtisky.")).toBeInTheDocument();
    const item = screen.getByRole("listitem");
    expect(
      within(item).getByRole("heading", { name: "Jiří V., 1 penny" }),
    ).toBeInTheDocument();
    expect(
      within(item).getByText("Velká Británie, 1912, katalog SG 357"),
    ).toBeInTheDocument();
    expect(within(item).getByText("Cena: kolem £0,15")).toBeInTheDocument();
    const links = within(item).getAllByRole("link");
    expect(links).toHaveLength(1);
    expect(links[0]).toHaveAttribute("href", "https://example.com/sg357");
    expect(links[0]).toHaveAttribute("rel", "noopener noreferrer");
    // The stamp is cut out of the page image: 20 % x 30 % of a 1000 x 2000 page
    const crop = item.querySelector<HTMLElement>(".crop")!;
    expect(crop.style.backgroundImage).toContain("photos/display/a/p.avif");
    expect(crop.style.aspectRatio).toBe("200 / 600");
  });
});
