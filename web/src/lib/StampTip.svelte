<script lang="ts">
  import type { Stamp } from "./albums";

  // Outline of the stamp under the pointer and a box with its details;
  // placed over the page image (the parent is position: relative)
  let {
    stamp,
    number,
  }: { stamp: Stamp & { box: NonNullable<Stamp["box"]> }; number: number } =
    $props();

  const [x0, y0, x1, y1] = $derived(stamp.box);
  const pct = (fraction: number) => `${fraction * 100}%`;
</script>

<span
  class="outline"
  aria-hidden="true"
  style:left={pct(x0)}
  style:top={pct(y0)}
  style:width={pct(x1 - x0)}
  style:height={pct(y1 - y0)}
></span>
<span
  class="tip"
  role="tooltip"
  style:left={x0 < 0.6 ? pct(x0) : undefined}
  style:right={x0 < 0.6 ? undefined : pct(1 - x1)}
  style:top={y0 < 0.5 ? pct(y1) : undefined}
  style:bottom={y0 < 0.5 ? undefined : pct(1 - y0)}
>
  <span class="name">
    <span class="number">{number}</span>
    {stamp.name}
  </span>
  <span class="meta">
    {stamp.country}, {stamp.year}{#if stamp.catalog}, {stamp.catalog}{/if}
  </span>
  <span class="price">{stamp.price}</span>
</span>

<style>
  .outline,
  .tip {
    position: absolute;
    pointer-events: none;
  }

  .outline {
    outline: 3px solid var(--gilt);
    outline-offset: 1px;
    border-radius: 2px;
  }

  .tip {
    z-index: 1;
    display: grid;
    gap: 0.15rem;
    width: max-content;
    max-width: 18rem;
    margin: 0.5rem 0;
    padding: 0.6rem 0.8rem;
    background: var(--night);
    color: var(--text);
    border: 1px solid var(--gilt);
    border-radius: 6px;
    box-shadow: 0 0.75rem 1.5rem -0.5rem rgb(0 0 0 / 0.8);
    text-align: left;
    font-size: 0.9rem;
    line-height: 1.35;
  }

  .name {
    font-family: var(--serif);
    font-size: 1.05rem;
  }

  .number {
    color: var(--gilt);
  }

  .meta {
    color: var(--muted);
    font-size: 0.85rem;
  }

  .price {
    font-weight: 600;
  }
</style>
