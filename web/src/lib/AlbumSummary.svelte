<script lang="ts">
  import type { AlbumFacts, AlbumSummaryText } from "./albums";
  import { stampsLabel } from "./albums";

  let { facts, summary }: { facts: AlbumFacts; summary?: AlbumSummaryText } =
    $props();

  // Long lists of countries are cut, the most frequent ones come first
  // "a 4 další", "a 5 dalších"
  const SHOWN = 8;
  const rest = $derived(facts.countries.length - SHOWN);
  const countries = $derived(
    rest > 0
      ? `${facts.countries.slice(0, SHOWN).join(", ")} a ${rest} ${rest >= 5 ? "dalších" : "další"}`
      : facts.countries.join(", "),
  );
  const years = $derived(
    facts.years &&
      (facts.years[0] === facts.years[1]
        ? `${facts.years[0]}`
        : facts.years.join("–")),
  );
</script>

{#if facts.stamps || summary}
  <section aria-labelledby="album-summary">
    <h2 id="album-summary">O albu</h2>
    {#if summary?.summary}
      <p class="lead">{summary.summary}</p>
    {/if}

    <dl>
      {#if facts.stamps}
        <dt>Popsané známky</dt>
        <dd>{stampsLabel(facts.stamps)} (bez opakujících se kusů)</dd>
      {/if}
      {#if years}
        <dt>Období</dt>
        <dd>{years}</dd>
      {/if}
      {#if countries}
        <dt>Země</dt>
        <dd>{countries}</dd>
      {/if}
      {#if summary?.value}
        <dt>Odhadovaná cena</dt>
        <dd>{summary.value}</dd>
      {/if}
    </dl>

    {#if summary?.cover}
      <h3>Poznámka na deskách alba</h3>
      <blockquote>{summary.cover}</blockquote>
      {#if summary.coverCheck}
        <p class="check">{summary.coverCheck}</p>
      {/if}
    {/if}
  </section>
{/if}

<style>
  section {
    max-width: 48rem;
    margin-top: 3.5rem;
    padding-top: 2rem;
    border-top: 1px solid rgb(255 255 255 / 0.12);
  }

  h2 {
    font-family: var(--serif);
    font-weight: 400;
    font-size: 1.75rem;
    color: var(--gilt);
    margin: 0 0 0.75rem;
  }

  h3 {
    font-family: var(--serif);
    font-weight: 400;
    font-size: 1.2rem;
    margin: 2rem 0 0.5rem;
  }

  .lead {
    margin: 0 0 1.5rem;
    max-width: 65ch;
    font-size: 1.05rem;
  }

  dl {
    display: grid;
    grid-template-columns: max-content minmax(0, 1fr);
    gap: 0.6rem 1.5rem;
    margin: 0;
  }

  dt {
    color: var(--muted);
  }

  dd {
    margin: 0;
    max-width: 60ch;
  }

  blockquote {
    margin: 0;
    padding-left: 1rem;
    border-left: 3px solid var(--gilt);
    font-family: var(--serif);
    font-style: italic;
    font-size: 1.1rem;
    max-width: 60ch;
  }

  .check {
    margin: 0.75rem 0 0;
    max-width: 65ch;
    color: var(--muted);
  }

  @media (max-width: 36rem) {
    dl {
      grid-template-columns: 1fr;
      gap: 0.15rem;
    }

    dd {
      margin-bottom: 0.6rem;
    }
  }
</style>
