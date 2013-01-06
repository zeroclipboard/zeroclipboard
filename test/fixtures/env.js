var _fs = require('fs');
var path = require('path');

document = require("jsdom").jsdom(_fs.readFileSync(path.normalize(__dirname + "/test_template.html", 'utf-8')),
  null,
  { features: {
    QuerySelector: true,
    FetchExternalResources: ["script", "css"],
  } });

window = document.createWindow();

$ = require("jquery");

navigator = window.navigator;
navigator.mimeTypes = {
  "application/x-shockwave-flash": true
};