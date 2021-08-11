import { log } from './logger';

export function requireBlockchain(args: any) {
  if (!args.blockchain) {
    log('Missing required argument: --blockchain');
    process.exit(1);
  }
}

export function requireRid(args: any) {
  if (!args.rid) {
    log('Missing required argument: --rid');
    process.exit(1);
  }
}

export function requireSigner(args: any) {
  if (!args.signer) {
    log('Missing required argument: --signer');
    process.exit(1);
  }
}

export function requireStandingInCorrectDirectory(
  directory: string,
  appName: string
) {
  if (!directory.endsWith('rell') && !directory.endsWith(appName)) {
    log(
      `Standing in ${directory}, make sure you are standing in the rell directory`
    );
    process.exit(1);
  }
}
