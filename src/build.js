if(process.argv.length != 4) {
  console.error("ERROR: Wrong number of arguments");
  return false;
}

var FILE_ENCODING = 'utf-8',
    SRC_PATH = process.argv[2]
    DIST_PATH = process.argv[3];

var _handlebars = require('Handlebars'),
    _fs = require('fs');

var distContent = _fs.readFileSync(SRC_PATH, FILE_ENCODING);
var template = _handlebars.compile(distContent);

//reuse package.json data and add build date
var data = JSON.parse( _fs.readFileSync('package.json', FILE_ENCODING) );
data.build_date = (new Date()).toUTCString();

_fs.writeFileSync(DIST_PATH, template(data), FILE_ENCODING);
