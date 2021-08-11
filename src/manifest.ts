import * as fs from 'fs';
import { log } from './logger';
const ENCODING = 'utf8';

export async function loadManifest(directory: string) {
  try {
    const manifest = await fs.promises.readFile(
      `${directory}/manifest.json`,
      ENCODING
    );

    return JSON.parse(manifest);
  } catch (error) {
    log(`Error loading manifest.json: ${error.message}`);
    process.exit(1);
  }
}

export async function saveManifest(manifest: any, directory: string) {
  const pretty = JSON.stringify(manifest, null, 2);
  await fs.promises.writeFile(`${directory}/manifest.json`, pretty, ENCODING);
}
