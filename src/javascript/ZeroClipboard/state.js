// Keep track of the current element that is being hovered.
var currentElement;

// Watch glued elements so we don't double glue.
var gluedElements = [];

// Keep track of the state of the Flash object(s).
var flashState = {
  global: {
    noflash: null,
    wrongflash: null,
    version: "0.0.0"
  },
  clients: {}
};