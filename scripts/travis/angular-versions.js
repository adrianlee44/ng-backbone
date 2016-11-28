var fs = require('fs'),
    path = require('path'),
    pkg = require('../../package.json');

var angularVersion = process.env['ANGULAR_VERSION'];

pkg.dependencies['angular'] = angularVersion;
pkg.devDependencies['angular-mocks'] = angularVersion;

var writeData = JSON.stringify(pkg, null, '  ');

var pkgPath = path.join(process.cwd(), 'package.json');
fs.writeFile(pkgPath, writeData);
