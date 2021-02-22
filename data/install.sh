#!/bin/sh

{{{linuxDownloadForgeScript}}}

java -jar forge.jar --installServer

clear

rm forge.jar
rm installer.log

mkdir -p mods

{{{linuxDownloadModScript}}}

clear

echo Installation Successful
