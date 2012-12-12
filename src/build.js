var FILE_ENCODING = 'utf-8';

var _handlebars = require('handlebars'),
    _fs = require('fs');

var distContent = _fs.readFileSync('/dev/stdin', FILE_ENCODING);
var template = _handlebars.compile(distContent);

//reuse package.json data and add build date
var data = JSON.parse( _fs.readFileSync('package.json', FILE_ENCODING) );
data.build_date = (new Date()).toUTCString();

console.log(template(data));