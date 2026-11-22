// Makes the web sizes of the exported album photos and the album list:
//   public/photos/full/<album>/<photo>.avif      (LightCraft export, Git LFS)
//   -> public/photos/display/<album>/<photo>.avif (gallery, long edge 2400 px)
//   -> public/photos/thumb/<album>/<photo>.avif   (grid, long edge 480 px)
//   -> src/lib/albums.json
//   -> public/photos/highlights/<n>.avif (stamps of src/lib/highlights.json, cut from the full photo)
// The first photo of each album (by capture time = file name) is its cover.
import {
  mkdir,
  readFile,
  readdir,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

const PHOTOS = "public/photos";
const SIZES = { display: 2400, thumb: 480 } as const;

// Folder name (as exported from the photo library) -> album title
const TITLES: Record<string, string> = {
  "cervene-album-setrizene": "Červené album, setříděné",
  "cervene-album-postovnich-znamek-setrizene":
    "Červené album poštovních známek",
  "zelene-stachovo-album-znamek-republiky-ceskoslovenske":
    "Stachovo album známek Republiky československé",
  "cerne-album-setrizene": "Černé album, setříděné",
  "cerne-male-album": "Malé černé album",
  "cerne-uzke-album": "Úzké černé album",
  "sede-album-postovnich-znamek-pro-zacatecniky-setrizene":
    "Šedé album pro začátečníky",
  "cervene-male-album": "Malé červené album",
  "fialove-album": "Fialové album",
  "zelene-male-album": "Malé zelené album",
};

type Photo = { file: string; width: number; height: number };

async function isFresh(source: string, target: string): Promise<boolean> {
  try {
    return (await stat(target)).mtimeMs >= (await stat(source)).mtimeMs;
  } catch {
    return false;
  }
}

async function derive(album: string, file: string): Promise<Photo> {
  const source = join(PHOTOS, "full", album, file);
  for (const [size, longEdge] of Object.entries(SIZES)) {
    const target = join(PHOTOS, size, album, file);
    if (await isFresh(source, target)) continue;
    await mkdir(join(PHOTOS, size, album), { recursive: true });
    await sharp(source)
      .resize(longEdge, longEdge, { fit: "inside" })
      .avif({ quality: size === "thumb" ? 55 : 85 })
      .toFile(target);
  }
  const { width, height } = await sharp(source).metadata();
  return { file, width, height };
}

const albums = [];
for (const album of (await readdir(join(PHOTOS, "full"))).sort()) {
  const title = TITLES[album];
  if (!title) throw new Error(`No title for album folder "${album}"`);
  const files = (await readdir(join(PHOTOS, "full", album)))
    .filter((file) => file.endsWith(".avif"))
    .sort();
  if (files.length < 2) throw new Error(`Album "${album}" has no pages`);
  const photos: Photo[] = [];
  for (const file of files) photos.push(await derive(album, file));
  const [cover, ...pages] = photos;
  albums.push({ slug: album, title, cover, pages });
  console.log(`${album}: ${pages.length} pages`);
}
// Albums in the order they were photographed
albums.sort((a, b) => a.cover.file.localeCompare(b.cover.file));
await writeFile("src/lib/albums.json", `${JSON.stringify(albums, null, 2)}\n`);

// The most valuable stamps shown on the shelf, cut out of the full-size page
type Highlight = {
  album: string;
  file: string;
  box: [number, number, number, number];
};
const highlights: Highlight[] = JSON.parse(
  await readFile("src/lib/highlights.json", "utf8"),
);
await rm(join(PHOTOS, "highlights"), { recursive: true, force: true });
await mkdir(join(PHOTOS, "highlights"), { recursive: true });
for (const [i, { album, file, box }] of highlights.entries()) {
  const source = join(PHOTOS, "full", album, file);
  const { width, height } = await sharp(source).metadata();
  const [x0, y0, x1, y1] = box;
  // Round the edges, not the size - left + width must not pass the image edge
  const left = Math.round(x0 * width);
  const top = Math.round(y0 * height);
  await sharp(source)
    .extract({
      left,
      top,
      width: Math.round(x1 * width) - left,
      height: Math.round(y1 * height) - top,
    })
    .resize(640, 640, { fit: "inside" })
    .avif({ quality: 65 })
    .toFile(join(PHOTOS, "highlights", `${i + 1}.avif`));
}
console.log(`highlights: ${highlights.length} stamps`);
