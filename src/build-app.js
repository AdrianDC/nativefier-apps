#!/usr/bin/env node

// Dependencies
const fs = require('fs');
const nativefier = require('nativefier').default;
const path = require('path');
const rimraf = require('rimraf');

// Entrypoint
function buildApp(packagePath, packageJson, platform, arch, out, callback) {
  // Cleanup output
  rimraf.sync(path.join(out, packageJson.name + '*'));

  // Configure nativefier
  const nativefierOptions = {
    name: packageJson.name,
    targetUrl: packageJson.url,
    platform,
    arch,
    out,
    overwrite: true,
    icon: path.join(packagePath, packageJson.iconPng),
    minWidth: 800,
    minHeight: 600,
    showMenuBar: false,
    userAgent: '',
    diskCacheSize: packageJson.clearCache === 'true' ? 0 : null,
    fullScreen: packageJson.fullscreen === 'true',
    maximize: packageJson.maximize === 'true',
    verbose: true,
    disableContextMenu: packageJson.readonly === 'true',
    disableDevTools: packageJson.readonly === 'true',
    singleInstance: false,
    clearCache: packageJson.clearCache === 'true',
    appVersion: packageJson.version,
    buildVersion: packageJson.version,
    appCopyright: packageJson.author,
    win32metadata: {
      CompanyName: packageJson.author,
      ProductName: packageJson.productName,
      InternalName: packageJson.name,
      FileDescription: packageJson.description
    },
    fileDownloadOptions: {
      saveAs: true
    },
    backgroundColor: packageJson.backgroundColor
  };

  // Build header
  console.log('Nativefing app (this may take a while) ...');

  // Build nativefier
  nativefier(nativefierOptions, (err, appPath) => {
    // Error handlings
    if (err) {
      console.error(err, err.stack);
      process.exit(1);
    }

    // Adapt nativefier
    const packageJsonPath = path.join(appPath, 'resources', 'app', 'package.json');
    const packageJsonContent = fs.readFileSync(packageJsonPath).toString();
    const packageJsonObject = JSON.parse(packageJsonContent);
    console.log('Updating package.json', packageJsonPath);
    packageJsonObject.name = packageJson.name;
    packageJsonObject.description = packageJson.description;
    packageJsonObject.author = packageJson.author;
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJsonObject));

    // Build footer
    console.log('App has been nativefied to', appPath);

    // Launch callback
    callback(appPath);
  });
}

// Exports
module.exports = buildApp;
