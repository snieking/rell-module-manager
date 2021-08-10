# Rell Module Manager

## Installlation

The Rell module manager is available as a NPM tool.

```
npm install -g rell-module-manager
```

Once you have it installed, see `rmm --help` for available commands.

## Downloading modules

Modules are defined in a `manifest.json` file located in the `rell` directory. The tool looks inside that file to figure out which modules to download into `rell/src/rell_modules` directory.

Example of `manifest.json`:

```
{
  "name": "my-dapp",
  "version": "1.0.0",
  "dependencies": [
    "my-module:0.0.1
  ]
}

If you don't have a manifest.json yet, then you can initialize one by running `rmm init`.
```

## Publish a module
To publish a library you need to declare a `manifest.json` in the module directory `rell/src/my_module/manifest.json`.

The `manifest.json` file should look like the following:

```
{
  "name": "my_module",
  "version": "0.0.1",
  "dependencies": []
}
```

If you don't have a `manifest.json` you can easy create one by running `rmm init`.

It is important that the name mathces with the directory that you are standing in, the module directory.

Contact me on telegram @snieking and ask for a publishing key for your module.

To create a release run `rmm publish --rid <RID> --signer <PRIVATE_KEY>`.

## Development

### Preparations

1. Run `yarn`
2. Start blockchain by running `yarn rell:start`
3. Run `npm link` to be able to run the tool locally without fetching from npm
4. Run `npx tsc`

### Configuration

A defalt Blockchain and RID is provided in the tool. However, config can be overridden. See `rmm --help` for available parameters.
