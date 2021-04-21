// @ts-check
const fs = require('fs-extra');
const path = require('path');
const AdmZip = require('adm-zip');
const Mustache = require('mustache');
const fetch = require('node-fetch');
const os = require('os');
const { v4: uuidv4 } = require('uuid');
const rimraf = require('rimraf');
const archiver = require('archiver');
const colors = require('colors/safe');

module.exports = async function genertateServer(modpackZip, destination) {
    const dir = createTempDir();
    const onExit = () => {
        removeTempFolder(dir);
        process.exit(1);
    };
    process.on('SIGINT', onExit);
    try {
        console.log(`Using temp directory '${dir}'`);

        if (!fs.lstatSync(modpackZip).isFile()) {
            throw new Error(`The path '${modpackZip}' is no file`);
        }

        console.log(`Parsing modpack zip file '${modpackZip}'`);

        const zip = new AdmZip(modpackZip);

        console.log('Reading manifest.json');
        const manifest = JSON.parse(zip.readAsText('manifest.json'));

        const tempDir = createTempDir();
        console.log(`Unpacking modpack zip to '${tempDir}'`);
        zip.extractAllTo(tempDir, true);
        console.log(`Unpacked modpack zip to '${tempDir}'`);
        const overrides = path.join(tempDir, manifest.overrides);
        console.log(`Copying overrides '${overrides}' to '${dir}'`);
        fs.copySync(overrides, dir);
        console.log('Copied overrides');
        console.log(`Deleting '${tempDir}'`);
        rimraf.sync(tempDir);
        console.log(`Deleted '${tempDir}'`);

        console.log('Generating scripts');

        const view = {
            minecraftVersion: manifest.minecraft.version,
            forgeVersion: manifest.minecraft.modLoaders[0].id.replace('forge-', ''),
            minRam: '2G',
            maxRam: '8G',
            winDownloadForgeScript: '',
            winDownloadModScript: '',
            linuxDownloadForgeScript: '',
            linuxDownloadModScript: '',
            modpackName: manifest.name,
        }

        console.log('Generating forge downloading scripts');

        view.winDownloadForgeScript = `powershell -Command "Invoke-WebRequest 'https://files.minecraftforge.net/maven/net/minecraftforge/forge/${view.minecraftVersion}-${view.forgeVersion}/forge-${view.minecraftVersion}-${view.forgeVersion}-installer.jar' -OutFile forge.jar"`;
        view.linuxDownloadForgeScript = `wget -O "forge.jar" "https://files.minecraftforge.net/maven/net/minecraftforge/forge/${view.minecraftVersion}-${view.forgeVersion}/forge-${view.minecraftVersion}-${view.forgeVersion}-installer.jar"`;

        console.log('Adding mod downloads');

        const modList = [];

        for (let mod of manifest.files) {
            console.log(`Fetching information of '${mod.projectID}'`);
            const modInfo = await fetchJSON(`https://addons-ecs.forgesvc.net/api/v2/addon/${mod.projectID}/`);
            modList.push({
                name: modInfo.name,
                by: modInfo.authors.map(author => author.name).join(', '),
                url: modInfo.websiteUrl
            });

            console.log(`Fetching download information of '${modInfo.name}'`);
            const files = await fetchJSON(`https://addons-ecs.forgesvc.net/api/v2/addon/${mod.projectID}/files/`);
            console.log(`Fetched download information of '${modInfo.name}'`);
            console.log(`Searching for file '${mod.fileID}'`);
            const file = files.find(file => file.id === mod.fileID);
            if (!file) {
                throw new Error(`Failed to find file for '${modInfo.name}'`);
            }
            console.log(`Generating download for '${file.fileName}'`);
            view.winDownloadModScript += `powershell -Command "Invoke-WebRequest '${file.downloadUrl}'" -OutFile mods/${file.fileName.replace(/ /g, '_')}\n`;
            view.linuxDownloadModScript += `wget -O "mods/${file.fileName}" "${file.downloadUrl}"\n`;
        }

        renderFile(path.join(__dirname, '../data/start_server.bat'), dir, view);
        renderFile(path.join(__dirname, '../data/start_server.sh'), dir, view);
        renderFile(path.join(__dirname, '../data/install.bat'), dir, view);
        renderFile(path.join(__dirname, '../data/install.sh'), dir, view);
        renderFile(path.join(__dirname, '../data/eula.txt'), dir, view);
        renderFile(path.join(__dirname, '../data/server.properties'), dir, view);

        console.log('Generating mod list');

        let modInfoMD = '# Mods\n\n';
        for (let mod of modList) {
            modInfoMD += `- [${mod.name}](${mod.url}) by ${mod.by}\n`;
        }
        const modlistPath = path.join(dir, 'modlist.md');
        fs.writeFileSync(modlistPath, modInfoMD);

        console.log(`Saved mod list to ${modlistPath}`);

        console.log(`Zipping folder '${dir}' to '${destination}'`);

        await zipFolder(dir, destination, manifest.name);

        console.log(`Zipped folder '${dir}' to '${destination}'`);

        removeTempFolder(dir);
        console.log(colors.green('Successfully generated server files!'));
    } catch (err) {
        removeTempFolder(dir);
        console.error(colors.red(`Failed to build server files: ${err.message}`));
        process.exitCode = 1;
    }
    process.removeListener('SIGINT', onExit);
}

function fetchJSON(url) {
    return new Promise((resolve, reject) => {
        fetch(url).then(res => {
            if (!res.ok) {
                reject(new Error(res.statusText));
                return;
            }
            return res.json();
        }).then(json => resolve(json)).catch(err => reject(err));
    });
}

function removeTempFolder(dir) {
    rimraf.sync(dir);
    console.log(`Removed temporary folder '${dir}'`);
}

function renderFile(file, destination, view) {
    console.log(`Rendering file '${file}'`);
    const fileContents = fs.readFileSync(file, 'utf8');
    const rendered = Mustache.render(fileContents, view);
    fs.writeFileSync(path.join(destination, path.basename(file)), rendered, { encoding: 'utf8' });
    console.log(`Saved file '${file}'`);
}

function createTempDir() {
    const tempDir = path.join(os.tmpdir(), uuidv4());
    fs.mkdirSync(tempDir, { recursive: true });
    if (fs.readdirSync(tempDir).length !== 0) {
        throw new Error('Could not create temp directory!');
    }
    return tempDir;
}

function zipFolder(srcFolder, zipFilePath, name) {
    return new Promise((resolve, reject) => {
        const output = fs.createWriteStream(zipFilePath);
        const zipArchive = archiver('zip');

        output.on('close', () => {
            resolve();
        });

        zipArchive.pipe(output);

        zipArchive.directory(srcFolder, name);

        zipArchive.finalize();
    });
}