// @ts-check
const minimist = require('minimist');
const genertateServer = require('./serverSetupGenerator');
const colors = require('colors/safe');

const args = minimist(process.argv.slice(2));

if (args['modpack-zip'] && args['destination-path']) {
    genertateServer(args['modpack-zip'], args['destination-path']);
} else {
    console.log(colors.red('Invalid or missing arguments'));
    console.log(colors.red('Use --modpack-zip <path-to-zip> --destination-path <path-to-destination>'));
}