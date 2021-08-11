import { BlockchainClient } from 'simple-postchain';
import { ensureRellModulesDirectory } from './file-system';
import { log } from './logger';
import { loadManifest } from './manifest';
import { requireBlockchain, requireRid } from './requires';
import { unzipToDir } from './zip';

export async function install(args: any, logSuccess: boolean = true) {
  requireBlockchain(args);
  requireRid(args);

  const directory = process.cwd();

  const manifest = await loadManifest(directory);

  if (manifest.dependencies) {
    await ensureRellModulesDirectory(directory);
    const client = BlockchainClient.initializeByBrid(args.blockchain, args.rid);

    for (const dependency of manifest.dependencies) {
      const definitions = dependency.split(':');
      try {
        const data = await client
          .query<string>()
          .name('core.download_module')
          .addParameter('name', definitions[0])
          .addParameter('version', definitions[1])
          .send();

        if (data) {
          await unzipToDir(
            `${directory}/src/rell_modules`,
            definitions[0],
            Buffer.from(data, 'hex')
          );

          if (logSuccess) {
            log(
              `🎉 Successfully installed ${definitions[0]}:${definitions[1]}`
            );
          }
        }
      } catch (error) {
        log(`😵 Error installing module ${definitions[0]}: ${error.message}`);
      }
    }
  }
}
