// Scroll offsets that put a point of the image (fx, fy as fractions 0..1)
// in the middle of the viewport, kept inside the scrollable range
export function centerOn(
  fx: number,
  fy: number,
  image: { width: number; height: number },
  viewport: { width: number; height: number },
): { left: number; top: number } {
  const clamp = (value: number, max: number) =>
    Math.round(Math.min(Math.max(value, 0), Math.max(max, 0)));
  return {
    left: clamp(
      fx * image.width - viewport.width / 2,
      image.width - viewport.width,
    ),
    top: clamp(
      fy * image.height - viewport.height / 2,
      image.height - viewport.height,
    ),
  };
}

// Point of an element under the pointer, as fractions 0..1 of its size
export function pointAt(
  event: { clientX: number; clientY: number },
  element: Element,
): { fx: number; fy: number } {
  const box = element.getBoundingClientRect();
  return {
    fx: (event.clientX - box.left) / box.width,
    fy: (event.clientY - box.top) / box.height,
  };
}

// Index of the first stamp whose box contains the point, or -1
export function stampAt(
  stamps: { box?: [number, number, number, number] }[],
  fx: number,
  fy: number,
): number {
  return stamps.findIndex(
    ({ box }) =>
      box !== undefined &&
      fx >= box[0] &&
      fx <= box[2] &&
      fy >= box[1] &&
      fy <= box[3],
  );
}
