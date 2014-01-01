/* Keep track of the current element that is being hovered. */
var currentElement;

/* Keep track of the state of the Flash object(s). */
var flashState = {
  bridge: null,
  version: "0.0.0",
  noflash: null,
  wrongflash: null,
  ready: null
};

/* Keep track of data for the pending clipboard transaction. */
var _clipData = {};

/* Keep track of the ZeroClipboard client instance counter */
var clientIdCounter = 0;

/*
 * Keep track of the state of the client instances
 *
 * Entry structure:
 *   _clientMeta[client.id] = {
 *     instance: client,
 *     elements: [],
 *     handlers: {}
 *   };
 */
var _clientMeta = {};

/* Keep track of the ZeroClipboard glued elements counter */
var elementIdCounter = 0;

/*
 * Keep track of the state of the glued element relationships to clients
 *
 * Entry structure:
 *   _elementMeta[element.zcClippingId] = [client1.id, client2.id];
 */
var _elementMeta = {};