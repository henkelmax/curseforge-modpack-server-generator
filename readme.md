# CurseForge Modpack Server Generator

A tool to generate a server from a [CurseForge](https://www.curseforge.com/minecraft/modpacks) Minecraft modpack zip.

## Useful links

- [CurseForge Modpack Server Generator GitHub Action](https://github.com/henkelmax/build-modpack-server-action)
- [Upload CurseForge Modpack GitHub Action](https://github.com/henkelmax/upload-curseforge-modpack-action)
- [Example Usage](https://github.com/henkelmax/delivery-inc/blob/master/.github/workflows/release.yml)

## Prerequisites

- [Node.js](https://nodejs.org/en/)
- [yarn](https://yarnpkg.com/getting-started/install)

## Installation

```sh
yarn install
```

## Command Line Parameters

| Parameter            | Description                                      | Example                              |
| -------------------- | ------------------------------------------------ | ------------------------------------ |
| `--modpack-zip`      | The path to your modpack zip file                | `C:\users\test\mymodpack.zip`        |
| `--destination-path` | The path where your server files should be saved | `C:\users\test\mymodpack-server.zip` |

## Example usage

```sh
yarn generate --modpack-zip "path/to/modpack.zip" --destination-path "out/server.zip"
```
