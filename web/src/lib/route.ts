// URL hash routes: "#/" all albums, "#/<album>" its pages, "#/<album>/<n>" page n (1-based)
export type Route = { album?: string; page?: number };

export function parseRoute(hash: string): Route {
  const [album, page] = hash.replace(/^#\/?/, "").split("/");
  const n = Number(page);
  let slug: string | undefined;
  try {
    slug = album ? decodeURIComponent(album) : undefined;
  } catch {
    // A damaged link ("#/%") opens all albums instead of a blank page
    return {};
  }
  return {
    album: slug,
    page: slug && Number.isInteger(n) && n > 0 ? n : undefined,
  };
}

export function routeHash({ album, page }: Route): string {
  if (!album) return "#/";
  return `#/${encodeURIComponent(album)}${page ? `/${page}` : ""}`;
}
