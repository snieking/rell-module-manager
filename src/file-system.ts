import * as fs from 'fs';

export async function recreateDirectory(directory: string) {
  try {
    await fs.promises.rm(directory, { recursive: true });
  } catch (error) {}

  await fs.promises.mkdir(directory);
}

export async function ensureRellModulesDirectory(directory: string) {
  try {
    await fs.promises.mkdir(`${directory}/src/rell_modules`);
  } catch (error) {}
}

// Read a tar file and return a buffer
export function readFile(file: string): Promise<Buffer> {
  return new Promise<Buffer>((resolve, reject) => {
    fs.readFile(file, (error, buffer) => {
      if (error) {
        reject(error);
      } else {
        resolve(buffer);
      }
    });
  });
}
