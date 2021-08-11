#!/usr/bin/env node

import yargs from 'yargs';
import { addModule } from './add-module';
import { create } from './create-module';
import { init } from './init-module';
import { install } from './install';
import { publish } from './publish-module';

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

main();
