/* Keep track of the current element that is being hovered. */
var currentElement;

/* Keep track of the state of the Flash object. */
var flashState = {
  // Flash object reference
  bridge: null,

  // Flash metadata
  version: "0.0.0",

  // Flash state
  disabled: null,
  outdated: null,
  ready: null
};

/* Keep track of data for the pending clipboard transaction. */
var _clipData = {};

/* Keep track of the ZeroClipboard client instance counter. */
var clientIdCounter = 0;

/*
 * Keep track of the state of the client instances.
 *
 * Entry structure:
 *   _clientMeta[client.id] = {
 *     instance: client,
 *     elements: [],
 *     handlers: {}
 *   };
 */
var _clientMeta = {};

/* Keep track of the ZeroClipboard clipped elements counter. */
var elementIdCounter = 0;

/*
 * Keep track of the state of the clipped element relationships to clients.
 *
 * Entry structure:
 *   _elementMeta[element.zcClippingId] = [client1.id, client2.id];
 */
var _elementMeta = {};

/* AMD module ID or path to access the ZeroClipboard object */
var _amdModuleId = null;

/* CommonJS module ID or path to access the ZeroClipboard object */
var _cjsModuleId = null;