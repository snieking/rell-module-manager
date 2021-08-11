import { BlockchainClient } from 'simple-postchain';
import { install } from './install';
import { log } from './logger';
import { loadManifest, saveManifest } from './manifest';
import { requireBlockchain, requireRid } from './requires';

export async function addModule(args: any) {
  let module: string = args._[1];
  if (!module) {
    log('No module to add specified');
    process.exit(1);
  }

  requireBlockchain(args);
  requireRid(args);

  const directory = process.cwd();
  const manifest = await loadManifest(directory);

  try {
    if (!module.includes(':')) {
      const client = BlockchainClient.initializeByBrid(
        args.blockchain,
        args.rid
      );
      const version = await client
        .query<string>()
        .name('core.get_latest_version')
        .addParameter('name', module)
        .send();

      module += `:${version}`;
    }

    if (manifest.dependencies) {
      manifest.dependencies = manifest.dependencies.filter(
        (dep: string) => !dep.startsWith(`${args._[1]}:`)
      );

      manifest.dependencies.push(module);
      manifest.dependencies.sort((a: string, b: string) => a.localeCompare(b));
    } else {
      manifest.dependencies = [module];
    }

    await saveManifest(manifest, directory);
    await install(args, false);
    log(`🎉 Successfully added ${module}`);
  } catch (error) {
    log(`😵 Error adding ${module}: ${error.message}`);
  }
}
