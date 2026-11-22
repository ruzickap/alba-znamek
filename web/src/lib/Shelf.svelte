<script lang="ts">
  import { pagesLabel, photoUrl, type Album } from "./albums";
  import Highlights from "./Highlights.svelte";
  import { routeHash } from "./route";

  let { albums, summary }: { albums: Album[]; summary: string } = $props();
</script>

<main>
  <header>
    <h1>Alba známek</h1>
    <p>{summary}</p>
  </header>

  <ul class="shelf">
    {#each albums as album (album.slug)}
      <li>
        <a href={routeHash({ album: album.slug })}>
          <img
            src={photoUrl("thumb", album, album.cover)}
            width={album.cover.width}
            height={album.cover.height}
            alt=""
          />
          <span class="title">{album.title}</span>
          <span class="count">{pagesLabel(album.pages.length)}</span>
        </a>
      </li>
    {/each}
  </ul>

  <Highlights {albums} />
</main>

<style>
  main {
    padding: clamp(1.5rem, 5vw, 4rem);
  }

  header {
    margin-bottom: clamp(2rem, 6vw, 4rem);
  }

  h1 {
    font-family: var(--serif);
    font-size: clamp(2.5rem, 8vw, 5.5rem);
    font-weight: 400;
    line-height: 1;
    letter-spacing: -0.01em;
    margin: 0;
    color: var(--gilt);
  }

  header p {
    margin: 0.75rem 0 0;
    color: var(--muted);
  }

  .shelf {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    gap: clamp(1.5rem, 4vw, 3rem) clamp(1rem, 3vw, 2.5rem);
  }

  a {
    display: grid;
    gap: 0.25rem;
    color: inherit;
    text-decoration: none;
    width: min-content;
  }

  img {
    display: block;
    height: clamp(11rem, 26vw, 17rem);
    width: auto;
    border-radius: 3px 6px 6px 3px;
    box-shadow:
      -3px 0 0 rgb(0 0 0 / 0.35) inset,
      0 1.25rem 1.5rem -0.75rem rgb(0 0 0 / 0.6);
    margin-bottom: 0.6rem;
    transition: transform 160ms ease-out;
  }

  a:hover img,
  a:focus-visible img {
    transform: translateY(-0.4rem);
  }

  a:focus-visible {
    outline: none;
  }

  a:focus-visible img {
    outline: 3px solid var(--gilt);
    outline-offset: 4px;
  }

  .title {
    font-family: var(--serif);
    font-size: 1.15rem;
    line-height: 1.25;
    min-width: 10rem;
  }

  .count {
    color: var(--muted);
    font-size: 0.9rem;
  }
</style>
