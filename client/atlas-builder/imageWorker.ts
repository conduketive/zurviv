import fs from "node:fs";
import Path from "node:path";
import { createCanvas, loadImage } from "canvas";
import { type ImgCache, imageFolder, imagesCacheFolder } from "./atlasBuilder";
import { scaledSprites } from "./atlasDefs";
import { detectEdges, type Edges } from "./detectEdges";

const tmpCanvas = createCanvas(0, 0);
const tmpCtx = tmpCanvas.getContext("2d");

async function renderImage(path: string, hash: string) {
    const pngFileName = Path.join(imagesCacheFolder, `${hash}.png`);

    const scale = scaledSprites[path] ?? 1;

    const image = await loadImage(Path.join(imageFolder, path));
    tmpCanvas.width = Math.ceil(image.width * scale);
    tmpCanvas.height = Math.ceil(image.height * scale);

    tmpCtx.drawImage(image, 0, 0, tmpCanvas.width, tmpCanvas.height);

    let edges: Edges;
    try {
        edges = detectEdges(tmpCanvas, { tolerance: 0 });
    } catch (err) {
        console.warn(`Failed to detect edges for image: ${path}`);
        console.warn(err);
        edges = {
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
        };
    }

    const buff = tmpCanvas.toBuffer("image/png");
    fs.writeFileSync(pngFileName, buff);

    return edges;
}

export interface ParentMsg {
    images: Array<{ path: string; hash: string }>;
}

process.on("message", async (data: ParentMsg) => {
    const images: ImgCache = {};

    for (const image of data.images) {
        try {
            const edges = await renderImage(image.path, image.hash);
            images[image.path] = {
                hash: image.hash,
                edges,
            };
        } catch (err) {
            console.warn(`Failed to render image: ${image.path}`);
            console.warn(err);
        }
    }

    process.send!(images);
});
