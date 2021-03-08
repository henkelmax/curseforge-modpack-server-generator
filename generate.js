// @ts-check
const minimist = require('minimist');
const genertateServer = require('./src/serverSetupGenerator');

const args = minimist(process.argv.slice(2));

if (args['modpack-zip'] && args['destination-path']) {
    genertateServer(args['modpack-zip'], args['destination-path']);
} else {
    console.log("Invalid or missing arguments")
    console.log("Use --modpack-zip <path-to-zip> --destination-path <path-to-destination>")
}

module.exports = genertateServer;