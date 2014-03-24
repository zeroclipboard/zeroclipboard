/*
 * @deprecated in [v1.3.0], slated for removal in [v2.0.0]. See docs for alternatives.
 *
 * The CSS class used to indicate that the object is being hovered over. Similar to `:hover`.
 *
 * Originally from "core.js"
 */
_globalConfig.hoverClass = "zeroclipboard-is-hover";


/*
 * @deprecated in [v1.3.0], slated for removal in [v2.0.0]. See docs for alternatives.
 *
 * The CSS class used to indicate that the object is active. Similar to `:active`.
 *
 * Originally from "core.js"
 */
_globalConfig.activeClass = "zeroclipboard-is-active";


/*
 * @deprecated in [v1.3.0], slated for removal in [v2.0.0]. See docs for alternatives.
 *
 * Bridge from the Flash object back to the JavaScript
 *
 * returns nothing
 *
 * Originally from "event.js"
 */
ZeroClipboard.dispatch = function (eventName, args) {
  if (typeof eventName === "string" && eventName) {
    // Sanitize the event name
    var cleanEventName = eventName.toLowerCase().replace(/^on/, "");

    // Receive event from Flash movie, forward to clients
    if (cleanEventName) {
      // Get an array of clients that have been clipped to the `currentElement`, or
      // get ALL clients if no `currentElement` (e.g. for the global Flash events like "load", etc.)
      var clients = (currentElement && _globalConfig.autoActivate === true) ?
                      _getAllClientsClippedToElement(currentElement) :
                      _getAllClients();
      for (var i = 0, len = clients.length; i < len; i++) {
        _receiveEvent.call(clients[i], cleanEventName, args);
      }
    }
  }
};


/*
 * @deprecated in [v1.3.0], slated for removal in [v2.0.0].
 * @private
 *
 * Receive an event from Flash for a specific element/client.
 *
 * returns object instance
 *
 * Originally from "event.js"
 */
var _receiveEvent = function (eventName, args) {
  args = args || {};
  eventName = eventName.toLowerCase().replace(/^on/, '');

  var element = currentElement;
  var context = element;
  var performCallbackAsync = true;

  // special behavior for certain events
  switch (eventName) {
    case 'load':
      // If it took longer the `_globalConfig.flashLoadTimeout` milliseconds to receive
      // this `load` event, Flash will have been marked as "deactivated" by ZeroClipboard.
      // If that is the case:
      //   1. Remove the `deactivated` status (blocker)
      //   2. Add the `overdue` status (non-blocker)
      //   3. Fire an `overdueFlash` event instead of the `load` event
      var isOverdue = flashState.deactivated || flashState.overdue || flashState.ready === null || flashState.bridge === null;

      // SWF loaded successfully, so it shouldn't be considered `deactivated` even if it was
      // overdue on click-to-play authorization
      flashState.deactivated = false;

      if (isOverdue) {
        flashState.overdue = true;
        return _receiveEvent.call(this, 'overdueFlash');
      }

      flashState.ready = true;
      context = null;
      args.flashVersion = flashState.version;
      break;

    case 'noflash':
      flashState.ready = false;
      context = null;
      break;

    case 'wrongflash':
    case 'deactivatedflash':
    case 'overdueflash':
      flashState.ready = false;
      context = null;
      args.flashVersion = flashState.version;
      break;

    // NOTE: This `mouseover` event is coming from Flash, not DOM/JS
    case 'mouseover':
      _addClass(element, _globalConfig.hoverClass);
      break;

    // NOTE: This `mouseout` event is coming from Flash, not DOM/JS
    case 'mouseout':
      if (_globalConfig.autoActivate === true) {
        ZeroClipboard.deactivate();
      }
      break;

    // NOTE: This `mousedown` event is coming from Flash, not DOM/JS
    case 'mousedown':
      _addClass(element, _globalConfig.activeClass);
      break;

    // NOTE: This `mouseup` event is coming from Flash, not DOM/JS
    case 'mouseup':
      _removeClass(element, _globalConfig.activeClass);
      break;

    case 'datarequested':
      if (element) {
        var targetId = element.getAttribute('data-clipboard-target'),
            targetEl = !targetId ? null : document.getElementById(targetId);
        if (targetEl) {
          var textContent = targetEl.value || targetEl.textContent || targetEl.innerText;
          if (textContent) {
            this.setText(textContent);
          }
        }
        else {
          var defaultText = element.getAttribute('data-clipboard-text');
          if (defaultText) {
            this.setText(defaultText);
          }
        }
      }

      // This callback cannot be performed asynchronously as it would prevent the
      // user from being able to call `.setText` successfully before the pending
      // clipboard injection associated with this event fires.
      performCallbackAsync = false;
      break;

    case 'complete':
      _deleteOwnProperties(_clipData);

      // Focus the context back on the trigger element (blur the Flash element)
      if (element && element !== _safeActiveElement() && element.focus) {
        element.focus();
      }
      break;
  } // switch eventName

  context = context || window;
  var eventArgs = [this, args];
  return _dispatchClientCallbacks.call(this, eventName, context, eventArgs, performCallbackAsync);
};