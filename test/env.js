var _fs = require('fs');

document = require("jsdom").jsdom(_fs.readFileSync('./test/test_template.html', 'utf-8'),
  null,
  { features: { QuerySelector: true } });

window = document.createWindow();

$ = require("jquery");

navigator = window.navigator;
navigator.mimeTypes = {
  "application/x-shockwave-flash": true
};