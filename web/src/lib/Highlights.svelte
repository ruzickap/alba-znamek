<script lang="ts">
  import type { Album } from "./albums";
  import { stampMeta } from "./albums";
  import highlights from "./highlights.json";
  import { routeHash } from "./route";

  let { albums }: { albums: Album[] } = $props();

  // Crop size from the stamp's box on its page - no layout jump while the image loads
  const items = $derived(
    highlights.flatMap((stamp, i) => {
      const album = albums.find((a) => a.slug === stamp.album);
      const page = album?.pages[stamp.page - 1];
      if (!album || !page) return [];
      const [x0, y0, x1, y1] = stamp.box;
      return [
        {
          ...stamp,
          src: `photos/highlights/${i + 1}.avif`,
          width: Math.round((x1 - x0) * page.width),
          height: Math.round((y1 - y0) * page.height),
          albumTitle: album.title,
        },
      ];
    }),
  );
</script>

{#if items.length}
  <section aria-labelledby="highlights-heading">
    <h2 id="highlights-heading">Nejcennější známky</h2>
    <p class="intro">
      Odhad podle katalogových a obchodních cen jednoho kusu. Skutečná cena
      závisí na stavu a pravosti známky.
    </p>

    <ol>
      {#each items as stamp, i (stamp.src)}
        <li>
          <a
            class="picture"
            href={routeHash({ album: stamp.album, page: stamp.page })}
            tabindex="-1"
          >
            <img
              src={stamp.src}
              width={stamp.width}
              height={stamp.height}
              loading="lazy"
              alt={stamp.name}
            />
          </a>
          <div class="text">
            <h3>
              <span class="rank" aria-hidden="true">{i + 1}</span>
              {stamp.name}
            </h3>
            <p class="meta">{stampMeta(stamp)}</p>
            <p class="value">{stamp.value}</p>
            <p>{stamp.why}</p>
            <a
              class="where"
              href={routeHash({ album: stamp.album, page: stamp.page })}
            >
              {stamp.albumTitle}, stránka {stamp.page}
            </a>
          </div>
        </li>
      {/each}
    </ol>
  </section>
{/if}

<style>
  section {
    margin-top: clamp(3rem, 8vw, 5rem);
    padding-top: 2rem;
    border-top: 1px solid rgb(255 255 255 / 0.12);
  }

  h2 {
    font-family: var(--serif);
    font-weight: 400;
    font-size: clamp(1.75rem, 4vw, 2.5rem);
    color: var(--gilt);
    margin: 0;
  }

  .intro {
    color: var(--muted);
    margin: 0.5rem 0 2rem;
    max-width: 60ch;
  }

  ol {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(100%, 24rem), 1fr));
    gap: 2rem 2.5rem;
  }

  li {
    display: grid;
    grid-template-columns: 8rem minmax(0, 1fr);
    gap: 1.25rem;
    align-items: start;
  }

  .picture img {
    display: block;
    width: 100%;
    height: auto;
    max-height: 11rem;
    object-fit: contain;
    object-position: top left;
    box-shadow: 0 0.5rem 1rem -0.5rem rgb(0 0 0 / 0.7);
  }

  h3 {
    font-family: var(--serif);
    font-weight: 400;
    font-size: 1.2rem;
    line-height: 1.25;
    margin: 0;
  }

  .rank {
    color: var(--gilt);
    font-variant-numeric: tabular-nums;
  }

  p {
    margin: 0.35rem 0 0;
    max-width: 60ch;
  }

  .meta {
    color: var(--muted);
    font-size: 0.9rem;
  }

  .value {
    font-weight: 600;
  }

  .where {
    display: inline-block;
    margin-top: 0.5rem;
    color: var(--gilt);
    text-underline-offset: 0.2em;
  }

  a:focus-visible {
    outline: 2px solid var(--gilt);
    outline-offset: 2px;
  }
</style>
