const { exec } = require('pkg');

exec([ './src/generate.js', '--target', 'win,macos,linux', '--output', 'dist/app' ])