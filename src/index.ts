#!/usr/bin/env node

import * as fs from 'fs';
import * as readline from 'readline';
import yargs from 'yargs';
import { BlockchainClient } from 'simple-postchain';
const archiver = require('archiver');
const extract = require('extract-zip');

const ENCODING = 'utf8';

const log = console.log;

let logEnabled = true;
console.log = function (message) {
  if (logEnabled) {
    log(message);
  }
};

async function main() {
  yargs
    .usage('Usage: $0 <command> [options]')
    .options({
      blockchain: {
        type: 'string',
        demandOption: false,
        alias: 'bc',
        default: 'https://n0.planevin.se:7751',
      },
      rid: {
        type: 'string',
        demandOption: false,
        alias: 'r',
        default:
          '80FE7DA87FD0C1034098A8C148BDE5E3BE653507E8D928C0F2CC2C66CCB4FF9C',
      },
      signer: { type: 'string', demandOption: false, alias: 's' },
    })
    .command('init', 'Initializes a new project', () => {
      init();
    })
    .command('publish', 'Publish a new version of the module', (yargs) => {
      publish(yargs.argv);
    })
    .command('create', 'Create a new module', (yargs) => {
      create(yargs.argv);
    })
    .command('install', 'Install modules defined in manifest', (yargs) => {
      install(yargs.argv);
    })
    .command('add', 'Install specific module', (yargs) => {
      const args = yargs.positional('module', {
        type: 'string',
        demandOption: false,
      });
      addModule(args.argv);
    }).argv;
}

async function init() {
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

async function create(args: any) {
  requireBlockchain(args);
  requireRid(args);
  requireSigner(args);

  const directory = process.cwd();

  const manifest = await loadManifest(directory);

  logEnabled = false;
  const client = BlockchainClient.initializeByBrid(args.blockchain, args.rid);
  const keyPair = client.createKeyPair();

  await client
    .transaction()
    .addOperation('core.create_module', manifest.name, keyPair.publicKey)
    .sign(client.createKeyPair(args.signer))
    .send();
  logEnabled = true;

  log(
    `Module ${
      manifest.name
    } created using private key: ${keyPair.privateKey.toString('hex')}`
  );
}

async function publish(args: any) {
  requireBlockchain(args);
  requireRid(args);
  requireSigner(args);

  const directory = process.cwd();

  const manifest = await loadManifest(directory);

  const buffer = await zipDir(directory, manifest);

  logEnabled = false;
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
    logEnabled = true;
    log(`Error publishing module: ${error.message}`);
    process.exit(1);
  }
  logEnabled = true;

  log(`Successfully published ${moduleVersion}`);
}

async function addModule(args: any) {
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
      logEnabled = false;
      const client = BlockchainClient.initializeByBrid(
        args.blockchain,
        args.rid
      );
      const version = await client
        .query<string>()
        .name('core.get_latest_version')
        .addParameter('name', module)
        .send();
      logEnabled = true;

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
    await install(args);
  } catch (error) {
    logEnabled = true;
    log(`Error adding module: ${error.message}`);
  }
}

async function install(args: any) {
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
        logEnabled = false;
        const data = await client
          .query<string>()
          .name('core.download_module')
          .addParameter('name', definitions[0])
          .addParameter('version', definitions[1])
          .send();
        logEnabled = true;

        if (data) {
          await unzipToDir(
            `${directory}/src/rell_modules`,
            definitions[0],
            Buffer.from(data, 'hex')
          );

          log(`Successfully installed ${definitions[0]}:${definitions[1]}`);
        }
      } catch (error) {
        logEnabled = true;
        log(`Error installing module ${definitions[0]}: ${error.message}`);
      }
    }
  }
}

async function ensureRellModulesDirectory(directory: string) {
  try {
    await fs.promises.mkdir(`${directory}/src/rell_modules`);
  } catch (error) {}
}

async function recreateDirectory(directory: string) {
  try {
    await fs.promises.rm(directory, { recursive: true });
  } catch (error) {}

  await fs.promises.mkdir(directory);
}

function requireBlockchain(args: any) {
  if (!args.blockchain) {
    log('Missing required argument: --blockchain');
    process.exit(1);
  }
}

function requireRid(args: any) {
  if (!args.rid) {
    log('Missing required argument: --rid');
    process.exit(1);
  }
}

function requireSigner(args: any) {
  if (!args.signer) {
    log('Missing required argument: --signer');
    process.exit(1);
  }
}

function requireStandingInCorrectDirectory(directory: string, appName: string) {
  if (!directory.endsWith('rell') && !directory.endsWith(appName)) {
    log(
      `Standing in ${directory}, make sure you are standing in the rell directory`
    );
    process.exit(1);
  }
}

async function zipDir(directory: string, manifest: any): Promise<Buffer> {
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

async function unzipToDir(directory: string, moduleName: string, data: Buffer) {
  const zipFile = `${directory}/${moduleName}.zip`;
  await fs.promises.writeFile(zipFile, data);

  const dirPath = `${directory}/${moduleName}`;
  await recreateDirectory(dirPath);

  await extract(zipFile, { dir: dirPath });
  await fs.promises.unlink(zipFile);
}

// Read a tar file and return a buffer
function readFile(file: string): Promise<Buffer> {
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

async function loadManifest(directory: string) {
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

async function saveManifest(manifest: any, directory: string) {
  const pretty = JSON.stringify(manifest, null, 2);
  await fs.promises.writeFile(`${directory}/manifest.json`, pretty, ENCODING);
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

main();
