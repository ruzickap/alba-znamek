import { render, screen, within } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App.svelte";

// Two small albums instead of the generated photo list
vi.mock("./lib/albums.json", () => ({
  default: [
    {
      slug: "red",
      title: "Červené album",
      cover: { file: "c.avif", width: 300, height: 400 },
      pages: [
        { file: "p1.avif", width: 3000, height: 4000 },
        { file: "p2.avif", width: 3000, height: 4000 },
      ],
    },
    {
      slug: "green",
      title: "Zelené album",
      cover: { file: "g.avif", width: 300, height: 400 },
      pages: [{ file: "g1.avif", width: 4000, height: 3000 }],
    },
  ],
}));

async function renderAt(hash: string) {
  location.hash = hash;
  render(App);
}

beforeEach(() => {
  history.replaceState(null, "", "#/");
  document.body.innerHTML = "";
});

describe("App", () => {
  it("shows all album covers", async () => {
    await renderAt("#/");
    expect(
      screen.getByRole("heading", { name: "Alba známek" }),
    ).toBeInTheDocument();
    expect(screen.getByText("2 alba, 3 stránky")).toBeInTheDocument();
    const red = screen.getByRole("link", { name: /Červené album/ });
    expect(red).toHaveAttribute("href", "#/red");
    expect(within(red).getByText("2 stránky")).toBeInTheDocument();
    expect(red.querySelector("img")).toHaveAttribute(
      "src",
      "photos/thumb/red/c.avif",
    );
  });

  it("opens an album with its pages", async () => {
    await renderAt("#/");
    await userEvent.click(screen.getByRole("link", { name: /Zelené album/ }));
    expect(
      await screen.findByRole("heading", { name: "Zelené album" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Stránka 1" })).toHaveAttribute(
      "href",
      "#/green/1",
    );
    expect(screen.getByRole("link", { name: "Všechna alba" })).toHaveAttribute(
      "href",
      "#/",
    );
  });

  it("shows all albums for a damaged link", async () => {
    await renderAt("#/%");
    expect(
      screen.getByRole("heading", { name: "Alba známek" }),
    ).toBeInTheDocument();
  });

  it("falls back to the albums for an unknown album", async () => {
    await renderAt("#/missing/1");
    expect(
      screen.getByRole("heading", { name: "Alba známek" }),
    ).toBeInTheDocument();
  });

  it("shows a page in the viewer and flips pages", async () => {
    await renderAt("#/red/1");
    const dialog = screen.getByRole("dialog", {
      name: "Červené album, stránka 1",
    });
    expect(within(dialog).getByText("Stránka 1 z 2")).toBeInTheDocument();
    expect(
      within(dialog).getByRole("img", { name: "Stránka 1" }),
    ).toHaveAttribute("src", "photos/display/red/p1.avif");
    expect(
      within(dialog).getByRole("button", { name: "Předchozí" }),
    ).toBeDisabled();

    await userEvent.click(
      within(dialog).getByRole("button", { name: "Další" }),
    );
    expect(location.hash).toBe("#/red/2");
    expect(await screen.findByText("Stránka 2 z 2")).toBeInTheDocument();

    await userEvent.keyboard("{ArrowLeft}");
    expect(await screen.findByText("Stránka 1 z 2")).toBeInTheDocument();
  });

  it("zooms the page to 100 % and back", async () => {
    await renderAt("#/red/2");
    await userEvent.click(
      screen.getByRole("button", { name: "Zvětšit na 100 %" }),
    );
    const full = screen.getByRole("img", {
      name: "Stránka 2 v plném rozlišení",
    });
    expect(full).toHaveAttribute("src", "photos/full/red/p2.avif");
    expect(full).toHaveAttribute("width", "3000");

    await userEvent.keyboard("{Escape}");
    expect(
      screen.queryByRole("img", { name: /plném rozlišení/ }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("closes the viewer with Escape", async () => {
    await renderAt("#/red/1");
    await userEvent.keyboard("{Escape}");
    expect(location.hash).toBe("#/red");
  });
});
