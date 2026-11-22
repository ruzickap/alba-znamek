<script lang="ts">
  import AlbumPages from "./lib/AlbumPages.svelte";
  import {
    albums,
    albumsLabel,
    loadStamps,
    pagesLabel,
    type AlbumStamps,
  } from "./lib/albums";
  import PageViewer from "./lib/PageViewer.svelte";
  import { parseRoute, routeHash, type Route } from "./lib/route";
  import Shelf from "./lib/Shelf.svelte";

  const start = parseRoute(location.hash);
  let route = $state(start);
  // Stamp descriptions of the albums opened so far
  let loaded = $state.raw<Record<string, AlbumStamps>>({});

  // A failed load only leaves the album without descriptions
  function loadAlbum(slug: string | undefined) {
    if (!slug || slug in loaded) return;
    loadStamps(slug).then(
      (pages) => (loaded = { ...loaded, [slug]: pages }),
      () => {},
    );
  }
  loadAlbum(start.album);

  // Unknown album or page number in the URL falls back to the level above
  const album = $derived(albums.find((a) => a.slug === route.album));
  const stamps = $derived(album && loaded[album.slug]);
  const pageIndex = $derived(
    album && route.page && route.page <= album.pages.length
      ? route.page - 1
      : undefined,
  );
  const pageCount = albums.reduce((sum, a) => sum + a.pages.length, 0);

  // Flipping pages replaces the history entry - "Back" closes the viewer
  function navigate(next: Route, replace = false) {
    if (replace) {
      history.replaceState(null, "", routeHash(next));
      route = next;
    } else {
      location.hash = routeHash(next);
    }
  }
</script>

<svelte:window
  onhashchange={() => {
    route = parseRoute(location.hash);
    loadAlbum(route.album);
  }}
/>

{#if album}
  <AlbumPages {album} {stamps} />
  {#if pageIndex !== undefined}
    <PageViewer
      {album}
      {stamps}
      index={pageIndex}
      go={(page) => navigate({ album: album.slug, page }, true)}
      close={() => navigate({ album: album.slug })}
    />
  {/if}
{:else}
  <Shelf
    {albums}
    summary={`${albumsLabel(albums.length)}, ${pagesLabel(pageCount)}`}
  />
{/if}
