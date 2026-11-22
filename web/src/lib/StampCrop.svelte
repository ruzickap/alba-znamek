<script lang="ts">
  import type { Box, Photo } from "./albums";

  // A stamp cut out of the page image with CSS - no extra image files
  let { src, page, box }: { src: string; page: Photo; box: Box } = $props();

  const [x0, y0, x1, y1] = $derived(box);
  const width = $derived(x1 - x0);
  const height = $derived(y1 - y0);
  // background-position % moves the image so that x0 / y0 is at the left / top edge
  const position = (start: number, size: number) =>
    size >= 1 ? "0%" : `${(start / (1 - size)) * 100}%`;
</script>

<span
  class="crop"
  aria-hidden="true"
  style:aspect-ratio={`${width * page.width} / ${height * page.height}`}
  style:background-image={`url("${src}")`}
  style:background-size={`${100 / width}% ${100 / height}%`}
  style:background-position={`${position(x0, width)} ${position(y0, height)}`}
></span>

<style>
  .crop {
    display: block;
    width: 100%;
    background-repeat: no-repeat;
    box-shadow: 0 0.4rem 0.8rem -0.4rem rgb(0 0 0 / 0.7);
  }
</style>
