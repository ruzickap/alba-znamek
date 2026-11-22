<script lang="ts">
  import type { PageStamps, Photo } from "./albums";
  import { stampMeta } from "./albums";
  import StampCrop from "./StampCrop.svelte";

  // `src` is the page image the stamp crops are cut from
  let { page, photo, src }: { page: PageStamps; photo: Photo; src: string } =
    $props();

  // Links only to web pages - the URLs come from the description files
  const isWeb = (url: string) => /^https?:\/\//.test(url);
</script>

<section aria-labelledby="stamps-heading">
  <h2 id="stamps-heading">Známky na stránce</h2>
  {#if page.note}
    <p class="note">{page.note}</p>
  {/if}

  <ol>
    {#each page.stamps as stamp, i (`${i} ${stamp.name}`)}
      <li>
        <span class="number" aria-hidden="true">{i + 1}</span>
        <div class="picture">
          {#if stamp.box}
            <StampCrop {src} page={photo} box={stamp.box} />
          {/if}
        </div>
        <div class="text">
          <h3>{stamp.name}</h3>
          <p class="meta">{stampMeta(stamp)}</p>
          <p>{stamp.description}</p>
          <p class="price">Cena: {stamp.price}</p>
          {#if stamp.sources.length}
            <p class="sources">
              Zdroje:
              {#each stamp.sources.filter( (s) => isWeb(s.url) ) as source (source.url)}
                <span class="source">
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {source.title}
                  </a>
                </span>
              {/each}
            </p>
          {/if}
        </div>
      </li>
    {/each}
  </ol>

  <p class="disclaimer">
    Ceny jsou orientační – podle nabídek obchodníků a aukcí uvedených u každé
    známky. Skutečná cena závisí na stavu známky, razítku a odstínu.
  </p>
</section>

<style>
  section {
    max-width: 52rem;
    margin: 0 auto;
    padding: 2rem clamp(1rem, 4vw, 2rem) max(4rem, env(safe-area-inset-bottom));
  }

  h2 {
    font-family: var(--serif);
    font-weight: 400;
    font-size: 1.75rem;
    color: var(--gilt);
    margin: 0 0 1rem;
  }

  .note {
    color: var(--muted);
    font-style: italic;
  }

  ol {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  /* Numbered in reading order of the page: left to right, top to bottom */
  li {
    display: grid;
    grid-template-columns: 1.75rem 9rem minmax(0, 1fr);
    gap: 0 1.25rem;
    align-items: start;
    padding: 1.5rem 0;
    border-top: 1px solid rgb(255 255 255 / 0.1);
  }

  .number {
    color: var(--gilt);
    font-family: var(--serif);
    font-size: 1.15rem;
    font-variant-numeric: tabular-nums;
  }

  .picture {
    max-height: 12rem;
  }

  h3 {
    font-family: var(--serif);
    font-weight: 400;
    font-size: 1.3rem;
    line-height: 1.25;
    margin: 0;
  }

  p {
    margin: 0.4rem 0 0;
    max-width: 65ch;
  }

  .meta,
  .sources,
  .disclaimer {
    color: var(--muted);
    font-size: 0.9rem;
  }

  .price {
    color: var(--text);
    font-weight: 600;
  }

  a {
    color: var(--gilt);
    text-underline-offset: 0.2em;
  }

  .source + .source::before {
    content: ", ";
  }

  a:focus-visible {
    outline: 2px solid var(--gilt);
    outline-offset: 2px;
  }

  .disclaimer {
    border-top: 1px solid rgb(255 255 255 / 0.1);
    padding-top: 1.25rem;
    margin-top: 0;
  }

  @media (max-width: 36rem) {
    li {
      grid-template-columns: 1.5rem 6rem minmax(0, 1fr);
      gap: 0 0.9rem;
    }
  }
</style>
