import { BlockchainClient } from 'simple-postchain';
import { log } from './logger';
import { loadManifest } from './manifest';
import { requireBlockchain, requireRid, requireSigner } from './requires';
import { zipDir } from './zip';

export async function publish(args: any) {
  requireBlockchain(args);
  requireRid(args);
  requireSigner(args);

  const directory = process.cwd();

  const manifest = await loadManifest(directory);

  const buffer = await zipDir(directory, manifest);

  const client = BlockchainClient.initializeByBrid(args.blockchain, args.rid);

  const moduleVersion = `${manifest.name}:${manifest.version}`;
  try {
    await client
      .transaction()
      .addOperation(
        'core.publish_release',
        moduleVersion,
        manifest.dependencies,
        buffer
      )
      .sign(client.createKeyPair(args.signer))
      .send();
  } catch (error) {
    log(`Error publishing module: ${error.message}`);
    process.exit(1);
  }

  log(`Successfully published ${moduleVersion}`);
}
