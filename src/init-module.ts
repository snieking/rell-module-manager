import { saveManifest } from './manifest';
import { requireStandingInCorrectDirectory } from './requires';
import * as readline from 'readline';

export async function init() {
  const manifest: any = {};
  const appName = await askQuestion('App Name: ');
  const version = await askQuestion('Version: ');

  manifest.name = appName;
  manifest.version = version;
  manifest.dependencies = [];

  const directory = process.cwd();
  requireStandingInCorrectDirectory(directory, appName);

  await saveManifest(manifest, directory);
}

async function askQuestion(query: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) =>
    rl.question(query, (ans) => {
      rl.close();
      resolve(ans);
    })
  );
}
