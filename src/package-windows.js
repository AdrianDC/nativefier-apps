#!/usr/bin/env node

// Dependencies
const fse = require('fs-extra');
const installer = require('electron-winstaller');
const path = require('path');
const rimraf = require('rimraf');

// Parameters
const packagePath = process.argv[2] || 'apps/unknown';

// Project
const buildApp = require('./build-app.js');
const packageJson = require(`../${packagePath}/package.json`);

// Target
const arch = 'ia32';
const extension = 'exe';
const instructions = 'ia32';
const platform = 'windows';
const tag = 'win32';
const target = 'windows';
const out = `./build/${target}`;
const release = `./release/${target}`;

// Build application
buildApp(packagePath, packageJson, platform, arch, out, appPath => {
  // Prepare release
  fse.ensureDirSync(release);
  rimraf.sync(`${release}/${packageJson.name}-*.${extension}`);

  // Release options
  const installerOptions = {
    src: `${out}/${packageJson.name}-${platform}-${arch}`,
    name: packageJson.name,
    appDirectory: `${out}/${packageJson.name}-${tag}-${arch}`,
    outputDirectory: release,
    authors: packageJson.author,
    exe: `${packageJson.name}.${extension}`,
    description: packageJson.description,
    version: packageJson.version,
    title: packageJson.productName,
    iconUrl: packageJson.iconFavicon,
    setupIcon: path.join(packagePath, packageJson.iconIco),
    setupExe: `${packageJson.name}-${packageJson.version}-${tag}.${extension}`
  };

  // Release header
  console.log('');
  console.log('Building release (this may take a while) ...');

  // Release installer
  installer.createWindowsInstaller(installerOptions).then(
    () => {
      // Cleanup intermediates
      rimraf.sync(`${release}/${packageJson.name}-*.nupkg`);
      rimraf.sync(`${release}/RELEASES`);

      // Release footer
      console.log('Successfully created package at', installerOptions.outputDirectory);
      console.log('');
    },
    e => {
      // Error handlings
      console.error(e.message);
    }
  );
});
