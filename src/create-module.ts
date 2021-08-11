import { BlockchainClient } from 'simple-postchain';
import { log } from './logger';
import { loadManifest } from './manifest';
import { requireBlockchain, requireRid, requireSigner } from './requires';

export async function create(args: any) {
  requireBlockchain(args);
  requireRid(args);
  requireSigner(args);

  const directory = process.cwd();

  const manifest = await loadManifest(directory);

  const client = BlockchainClient.initializeByBrid(args.blockchain, args.rid);
  const keyPair = client.createKeyPair();

  await client
    .transaction()
    .addOperation('core.create_module', manifest.name, keyPair.publicKey)
    .sign(client.createKeyPair(args.signer))
    .send();

  log(
    `Module ${
      manifest.name
    } created using private key: ${keyPair.privateKey.toString('hex')}`
  );
}
