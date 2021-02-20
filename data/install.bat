@ECHO OFF

{{{winDownloadForgeScript}}}

java -jar forge.jar --installServer

cls

del forge.jar
del forge.jar.log

mkdir mods

{{{winDownloadModScript}}}

cls

echo Installation Successful

PAUSE