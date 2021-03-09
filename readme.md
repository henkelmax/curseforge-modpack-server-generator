# CurseForge Modpack Server Generator

A tool to generate a server from a [CurseForge](https://www.curseforge.com/minecraft/modpacks) modpack zip.

## Useful links

- [CurseForge Modpack Server Generator GitHub Action](https://github.com/henkelmax/build-modpack-server-action)
- [Upload CurseForge Modpack GitHub Action](https://github.com/henkelmax/upload-curseforge-modpack-action)
- [Example Usage](https://github.com/henkelmax/delivery-inc/blob/master/.github/workflows/release.yml)

## Installation

``` sh
yarn install
```

## Example usage

``` sh
node generate.js --modpack-zip "path/to/modpack.zip" --destination-path "out/server.zip"
```
