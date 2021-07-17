# Rell Module Manager

## How to

### Preparations

1. Run `yarn`
2. Start blockchain by running `yarn rell:start`
3. Run `npm link` to be able to run the tool locally without fetching from npm
4. Run `npx tsc`

### Publish a library

To publish a library you need to declare a `manifest.json` in the module directory `rell/src/my_module/manifest.json`.

The `manifest.json` file should look like the following.

```
{
  "name": "my-module",
  "version": "0.0.1",
  "dependencies": []
}
```

After that, navigate to that directory and run `rmm create --rid <RID>`. It will return you a private key that should write down which will allow you to publish releases for this module.

To create a release run `rmm publish --rid <RID> --signer <PRIVATE_KEY>`.

### Downloading libraries

Libraries are defined in a `manifest.json` file located in `rell/src` directory. The tool looks inside that file to figure out which modules to download into `rell/src/rell_modules` directory.

Example of `manifest.json`.

```
{
  "name": "my-dapp",
  "version": "1.0.0",
  "dependencies": [
    "my-module:0.0.1
  ]
}
```

Run `rmm install --rid <RID>` to install/update libraries according to the manifest.

### Configuration

We will provide a default Blockchain and RID in the tool. However, config can be overridden. Run `rmm --help` to see available parameters.
