var fs = require('fs'),
    path = require('path');

var bowerPkgPath = path.join(process.cwd(), 'bower.json'),
    angularVersion = process.env['ANGULAR_VERSION'];

fs.readFile(bowerPkgPath, {encoding: 'utf8'}, function(err, data) {
  var json, writeData;

  if (err) throw err;

  json = JSON.parse(data);

  json.dependencies['angular'] = angularVersion;
  json.devDependencies['angular-mocks'] = angularVersion;

  writeData = JSON.stringify(json, null, '  ');

  fs.writeFile(bowerPkgPath, writeData);
});
