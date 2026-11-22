<script lang="ts">
  import {
    albumFacts,
    pagesLabel,
    photoUrl,
    type Album,
    type AlbumStamps,
    type AlbumSummaryText,
  } from "./albums";
  import AlbumSummary from "./AlbumSummary.svelte";
  import { routeHash } from "./route";
  import summaries from "./summaries.json";

  // `stamps` arrive after the page grid - the descriptions are loaded on demand
  let { album, stamps }: { album: Album; stamps?: AlbumStamps } = $props();

  const facts = $derived(albumFacts(stamps ?? {}));
  const summary = $derived(
    (summaries as Record<string, AlbumSummaryText>)[album.slug],
  );
</script>

<main>
  <header>
    <a class="back" href={routeHash({})}>Všechna alba</a>
    <h1>{album.title}</h1>
    <p>{pagesLabel(album.pages.length)}</p>
  </header>

  <ol class="pages">
    {#each album.pages as page, i (page.file)}
      <li>
        <a
          href={routeHash({ album: album.slug, page: i + 1 })}
          aria-label={`Stránka ${i + 1}`}
        >
          <img
            src={photoUrl("thumb", album, page)}
            width={page.width}
            height={page.height}
            loading="lazy"
            alt=""
          />
          <span aria-hidden="true">{i + 1}</span>
        </a>
      </li>
    {/each}
  </ol>

  <AlbumSummary {facts} {summary} />
</main>

<style>
  main {
    padding: clamp(1.5rem, 5vw, 4rem);
  }

  header {
    margin-bottom: 2.5rem;
  }

  .back {
    color: var(--gilt);
    text-underline-offset: 0.2em;
  }

  h1 {
    font-family: var(--serif);
    font-size: clamp(2rem, 5vw, 3.5rem);
    font-weight: 400;
    line-height: 1.1;
    margin: 1rem 0 0;
    max-width: 30ch;
  }

  header p {
    margin: 0.5rem 0 0;
    color: var(--muted);
  }

  .pages {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-wrap: wrap;
    align-items: flex-end;
    gap: 1.75rem 1.25rem;
  }

  .pages a {
    display: grid;
    justify-items: center;
    gap: 0.4rem;
    color: var(--muted);
    text-decoration: none;
    font-variant-numeric: tabular-nums;
    font-size: 0.85rem;
  }

  img {
    display: block;
    height: clamp(9rem, 22vw, 13rem);
    width: auto;
    background: var(--shelf);
    box-shadow: 0 0.5rem 1rem -0.5rem rgb(0 0 0 / 0.6);
  }

  .pages a:hover,
  .pages a:focus-visible {
    color: var(--text);
  }

  .pages a:focus-visible {
    outline: none;
  }

  .pages a:focus-visible img {
    outline: 3px solid var(--gilt);
    outline-offset: 3px;
  }
</style>
