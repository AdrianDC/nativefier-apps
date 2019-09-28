#!/usr/bin/env node

// Dependencies
const fse = require('fs-extra');
const installer = require('electron-installer-redhat');
const path = require('path');
const rimraf = require('rimraf');

// Parameters
const packagePath = process.argv[2] || 'apps/unknown';

// Project
const buildApp = require('./build-app.js');
const packageJson = require(`../${packagePath}/package.json`);

// Target
const arch = 'x64';
const extension = 'rpm';
const instructions = 'x86_64';
const platform = 'linux';
const tag = 'x86_64';
const target = 'redhat';
const out = `./build/${target}`;
const release = `./release/${target}`;

// Build application
buildApp(packagePath, packageJson, platform, arch, out, appPath => {
  // Prepare release
  fse.ensureDirSync(release);
  rimraf.sync(`${release}/${packageJson.name}-*.${extension}`);

  // Generate scripts
  fse.writeFileSync(
    `${out}/${packageJson.name}-${target}.post`,
    `#!/usr/bin/env sh
chmod 4755 /usr/lib/${packageJson.name}/chrome-sandbox
`
  );

  // Release options
  const installerOptions = {
    src: `${out}/${packageJson.name}-${platform}-${arch}`,
    name: packageJson.name,
    dest: release,
    icon: path.join(packagePath, packageJson.iconPng),
    license: packageJson.license,
    categories: [packageJson.category],
    options: {
      name: packageJson.name,
      productName: packageJson.productName,
      description: packageJson.description,
      productDescription: packageJson.description,
      version: packageJson.version,
      arch: instructions,
      icon: path.join(packagePath, packageJson.iconPng),
      scripts: {
        post: `${out}/${packageJson.name}-${target}.post`
      }
    }
  };

  // Release header
  console.log('');
  console.log('Building release (this may take a while) ...');

  // Release installer
  installer(installerOptions, err => {
    // Error handlings
    if (err) {
      console.error(err, err.stack);
      process.exit(1);
    }

    // Release footer
    console.log('Successfully created package at', installerOptions.dest);
    console.log('');
  });
});
