<script lang="ts">
  import type { Attachment } from "svelte/attachments";
  import { photoUrl, type Album, type AlbumStamps } from "./albums";
  import StampList from "./StampList.svelte";
  import StampTip from "./StampTip.svelte";
  import { centerOn, pointAt, stampAt } from "./zoom";

  let {
    album,
    stamps: albumStamps,
    index,
    go,
    close,
  }: {
    album: Album;
    stamps?: AlbumStamps;
    index: number;
    go: (page: number) => void;
    close: () => void;
  } = $props();

  // Zoomed point of the page (fractions 0..1); it belongs to one page only
  let zoom = $state<{ index: number; fx: number; fy: number }>();
  const page = $derived(album.pages[index]);
  const stamps = $derived(albumStamps?.[page.file]);
  const zoomed = $derived(zoom?.index === index ? zoom : undefined);
  const hasPrev = $derived(index > 0);
  const hasNext = $derived(index < album.pages.length - 1);

  // Stamp under the mouse pointer (index into stamps), shown with its details
  let hovered = $state<{ index: number; stamp: number }>();
  const tip = $derived.by(() => {
    if (hovered?.index !== index || !stamps) return undefined;
    const stamp = stamps.stamps[hovered.stamp];
    return stamp?.box
      ? { stamp: { ...stamp, box: stamp.box }, number: hovered.stamp + 1 }
      : undefined;
  });

  function hover(event: PointerEvent) {
    const image = (event.currentTarget as HTMLElement).querySelector("img");
    if (event.pointerType !== "mouse" || !image || !stamps) return;
    const { fx, fy } = pointAt(event, image);
    const stamp = stampAt(stamps.stamps, fx, fy);
    hovered = stamp >= 0 ? { index, stamp } : undefined;
  }

  // Mouse drag pans the zoomed page; a click without dragging zooms out
  let drag: { x: number; y: number; left: number; top: number } | undefined;
  let dragged = false;

  function zoomIn(event: MouseEvent) {
    const image = (event.currentTarget as HTMLElement).querySelector("img")!;
    // Keyboard "click" (Enter / Space) has no pointer position - zoom to the middle
    const { fx, fy } =
      event.detail === 0 ? { fx: 0.5, fy: 0.5 } : pointAt(event, image);
    zoom = { index, fx, fy };
  }

  const scrollToZoom: Attachment<HTMLElement> = (scroller) => {
    if (!zoomed) return;
    const { left, top } = centerOn(zoomed.fx, zoomed.fy, page, {
      width: scroller.clientWidth,
      height: scroller.clientHeight,
    });
    scroller.scrollTo({ left, top });
    scroller.focus();
  };

  // While open, the page behind does not scroll and focus starts in the viewer
  const modal: Attachment<HTMLElement> = (dialog) => {
    const opener = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    dialog.focus();
    return () => {
      document.body.style.overflow = "";
      opener?.focus();
    };
  };

  // A newly shown page starts at the top, above its stamp descriptions
  const scrollToTop: Attachment<HTMLElement> = (dialog) => {
    if (index >= 0) dialog.scrollTop = 0;
  };

  function onpointerdown(event: PointerEvent) {
    dragged = false;
    if (event.pointerType !== "mouse") return;
    const scroller = event.currentTarget as HTMLElement;
    drag = {
      x: event.clientX,
      y: event.clientY,
      left: scroller.scrollLeft,
      top: scroller.scrollTop,
    };
    scroller.setPointerCapture(event.pointerId);
  }

  function onpointermove(event: PointerEvent) {
    if (!drag) {
      hover(event);
      return;
    }
    hovered = undefined;
    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;
    if (Math.abs(dx) + Math.abs(dy) > 4) dragged = true;
    const scroller = event.currentTarget as HTMLElement;
    scroller.scrollLeft = drag.left - dx;
    scroller.scrollTop = drag.top - dy;
  }

  function onkeydown(event: KeyboardEvent) {
    if (event.key === "Escape") {
      if (zoomed) zoom = undefined;
      else close();
    } else if (!zoomed && event.key === "ArrowLeft" && hasPrev) {
      go(index);
    } else if (!zoomed && event.key === "ArrowRight" && hasNext) {
      go(index + 2);
    }
  }
</script>

<svelte:window {onkeydown} />

<div
  class="viewer"
  role="dialog"
  aria-modal="true"
  aria-label={`${album.title}, stránka ${index + 1}`}
  tabindex="-1"
  {@attach modal}
  {@attach scrollToTop}
>
  <header>
    <p>
      <span class="title">{album.title}</span>
      <span class="position">Stránka {index + 1} z {album.pages.length}</span>
    </p>
    <button class="close" onclick={close}>Zavřít</button>
  </header>

  {#if zoomed}
    <div
      class="scroller"
      role="button"
      tabindex="0"
      aria-label="Zmenšit na celou stránku"
      {@attach scrollToZoom}
      {onpointerdown}
      {onpointermove}
      onlostpointercapture={() => (drag = undefined)}
      onpointerleave={() => (hovered = undefined)}
      onclick={() => {
        if (!dragged) zoom = undefined;
      }}
      onkeydown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          zoom = undefined;
        }
      }}
    >
      <div class="zoomed-page">
        <img
          class="full"
          src={photoUrl("full", album, page)}
          width={page.width}
          height={page.height}
          style:background-image={`url("${photoUrl("display", album, page)}")`}
          alt={`Stránka ${index + 1} v plném rozlišení`}
          draggable="false"
        />
        {#if tip}
          <StampTip {...tip} />
        {/if}
      </div>
    </div>
  {:else}
    <div class="stage">
      <button
        class="page"
        onclick={zoomIn}
        onpointermove={hover}
        onpointerleave={() => (hovered = undefined)}
        aria-label="Zvětšit na 100 %"
      >
        <img
          src={photoUrl("display", album, page)}
          width={page.width}
          height={page.height}
          alt={`Stránka ${index + 1}`}
        />
        {#if tip}
          <StampTip {...tip} />
        {/if}
      </button>
      <button class="flip prev" onclick={() => go(index)} disabled={!hasPrev}>
        Předchozí
      </button>
      <button
        class="flip next"
        onclick={() => go(index + 2)}
        disabled={!hasNext}
      >
        Další
      </button>
    </div>
    <p class="hint">
      {#if stamps}
        Najeďte na známku pro její popis, klepnutím zvětšíte stránku na 100 %.
        Všechny známky jsou popsané pod stránkou
      {:else}
        Klepnutím na známku zvětšíte stránku na 100 %
      {/if}
    </p>
    {#if stamps}
      <StampList
        page={stamps}
        photo={page}
        src={photoUrl("display", album, page)}
      />
    {/if}
  {/if}
</div>

<style>
  .viewer {
    --bar: 3.75rem;
    --hint: 2.75rem;

    position: fixed;
    inset: 0;
    z-index: 10;
    overflow-y: auto;
    overscroll-behavior: contain;
    background: var(--night);
    outline: none;
  }

  header {
    position: sticky;
    top: 0;
    z-index: 2;
    box-sizing: border-box;
    min-height: var(--bar);
    background: var(--night);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: max(0.75rem, env(safe-area-inset-top))
      max(clamp(1rem, 3vw, 2rem), env(safe-area-inset-right)) 0.75rem
      max(clamp(1rem, 3vw, 2rem), env(safe-area-inset-left));
  }

  header p {
    margin: 0;
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem 1rem;
    align-items: baseline;
  }

  .title {
    font-family: var(--serif);
    font-size: 1.15rem;
  }

  .position {
    color: var(--muted);
    font-variant-numeric: tabular-nums;
  }

  button {
    font: inherit;
    color: var(--text);
    background: var(--shelf);
    border: 1px solid rgb(255 255 255 / 0.12);
    border-radius: 999px;
    padding: 0.45rem 1.1rem;
    cursor: pointer;
  }

  button:hover:not(:disabled) {
    border-color: var(--gilt);
  }

  button:disabled {
    opacity: 0.35;
    cursor: default;
  }

  button:focus-visible,
  .scroller:focus-visible {
    outline: 3px solid var(--gilt);
    outline-offset: 2px;
  }

  .stage {
    position: relative;
    display: grid;
    place-items: center;
    height: calc(100dvh - var(--bar) - var(--hint));
    padding: 0 clamp(0.5rem, 6vw, 6rem);
  }

  .page {
    position: relative;
    padding: 0;
    border: 0;
    border-radius: 0;
    background: none;
    max-width: 100%;
    max-height: 100%;
    cursor: zoom-in;
  }

  .page img {
    display: block;
    max-width: 100%;
    max-height: calc(100dvh - var(--bar) - var(--hint));
    width: auto;
    height: auto;
  }

  .flip {
    position: absolute;
    top: 50%;
    translate: 0 -50%;
  }

  .prev {
    left: clamp(0.25rem, 1vw, 1rem);
  }

  .next {
    right: clamp(0.25rem, 1vw, 1rem);
  }

  .hint {
    box-sizing: border-box;
    min-height: var(--hint);
    margin: 0;
    padding: 0.5rem 1rem;
    text-align: center;
    color: var(--muted);
    font-size: 0.85rem;
  }

  .scroller {
    position: fixed;
    inset: var(--bar) 0 0;
    z-index: 1;
    background: var(--night);
    overflow: auto;
    overscroll-behavior: contain;
    cursor: grab;
    display: grid;
  }

  .scroller:active {
    cursor: grabbing;
  }

  .zoomed-page {
    position: relative;
    margin: auto;
  }

  .full {
    display: block;
    max-width: none;
    background-size: 100% 100%;
    user-select: none;
  }

  @media (max-width: 40rem) {
    .viewer {
      --hint: 6.5rem;
    }

    .flip {
      top: auto;
      bottom: -3rem;
      translate: none;
    }

    .hint {
      min-height: 0;
      padding-top: 3.5rem;
    }
  }
</style>
