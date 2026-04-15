import { readdir } from "node:fs/promises";
import { ALBUM_MBID } from "@lib/musicData";

import yoctoSpinner from 'yocto-spinner';

const spinner = yoctoSpinner({text: 'clearing old images'}).start();

// check for existing album images
const mbidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.jpg$/g
let foundExistingImage = false;
await readdir("public/imgs")
    .then(files => files.forEach(async file => {
        if (mbidRegex.test(file)) {
            if (file === `${ALBUM_MBID}.jpg`) { // if the file's alr there
                spinner.info(`existing image for album ${ALBUM_MBID} found. will not download.`);
                foundExistingImage = true;
                return
            }
            await Bun.file(`public/imgs/${file}`).delete()
        }
    }))
    .catch(() => []);

if (foundExistingImage) {
    spinner.success("old images cleared, existing image found, skipping download"); // dont delete if the current image is there
    process.exit(0);
}

spinner.text = "downloading album cover";

const url = `https://coverartarchive.org/release/${ALBUM_MBID}/front-500`;

const res = await fetch(url, { headers: { "User-Agent": "thrzl/xyz v0.1.0" } });
if (!res.ok) {
    throw new Error(`Failed to fetch image: ${res.statusText}`);
}
const imageData = await res.blob();

spinner.text = "saving image";

await Bun.write(`public/imgs/${ALBUM_MBID}.jpg`, imageData);

spinner.success("album cover downloaded and saved");