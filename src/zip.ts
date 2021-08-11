import * as fs from 'fs';
import { readFile, recreateDirectory } from './file-system';
const archiver = require('archiver');
const extract = require('extract-zip');

export async function zipDir(
  directory: string,
  manifest: any
): Promise<Buffer> {
  const zipFile = `${directory}/../${manifest.name}.zip`;
  const output = fs.createWriteStream(zipFile);

  const archive = archiver('zip');
  archive.pipe(output);
  archive.directory(directory, false);
  archive.finalize();

  return new Promise<Buffer>((resolve, reject) => {
    output.on('close', async function () {
      const data = await readFile(zipFile);
      resolve(data);
    });
    output.on('error', (error) => reject(error));
  });
}

export async function unzipToDir(
  directory: string,
  moduleName: string,
  data: Buffer
) {
  const zipFile = `${directory}/${moduleName}.zip`;
  await fs.promises.writeFile(zipFile, data);

  const dirPath = `${directory}/${moduleName}`;
  await recreateDirectory(dirPath);

  await extract(zipFile, { dir: dirPath });
  await fs.promises.unlink(zipFile);
}
