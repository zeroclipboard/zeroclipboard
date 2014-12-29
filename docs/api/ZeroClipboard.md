# ZeroClipboard API

This documents details the ZeroClipboard API, including various types of properties, methods, and events.

Any entry that does not include an annotation similar to "Added in `v2.x.y`" should be assumed to have been available since `v2.0.0`.


## Static

### Static Properties

#### `ZeroClipboard.version`

_[`String`]_ The version of the ZeroClipboard library being used, e.g. `"2.0.0"`.


### Static Methods

#### `ZeroClipboard.config(...)`

```js
var config = ZeroClipboard.config();
```

_[`Object`]_ Get a copy of the active configuration for ZeroClipboard.


```js
var swfPath = ZeroClipboard.config("swfPath");
```

_[`*`]_ Get a copy of the actively configured value for this configuration property for ZeroClipboard.


```js
var config = ZeroClipboard.config({
  forceHandCursor: true
});
```

_[`Object`]_ Set the active configuration for ZeroClipboard. Returns a copy of the updated active configuration. For complete details about what can be configured, see [**Configuration Options** below](#configuration-options).


#### `ZeroClipboard.create()`
_[`undefined`]_ Create the Flash bridge SWF object. _**IMPORTANT:**_ This method should be considered private.


#### `ZeroClipboard.destroy()`
_[`undefined`]_ Emit the [`"destroy"`](#destroy) event, remove all event handlers, and destroy the Flash bridge.


#### `ZeroClipboard.setData(...)`

```js
ZeroClipboard.setData("text/plain", "Blah");
```

_[`undefined`]_ Set the pending `data` of type `format` for clipboard injection.

```js
ZeroClipboard.setData({
  "text/plain": "Blah",
  "text/html": "<b>Blah</b>"
});
```

_[`undefined`]_ Set the pending `data` of various formats for clipboard injection.


#### `ZeroClipboard.clearData(...)`

```js
ZeroClipboard.clearData("text/plain");
```

_[`undefined`]_ Clear the pending data of type `format` for clipboard injection.

```js
ZeroClipboard.clearData();
```

_[`undefined`]_ Clear the pending data of ALL formats for clipboard injection.


#### `ZeroClipboard.getData(...)`

_Added in `v2.1.0`._

```js
var text = ZeroClipboard.getData("text/plain");
```

_[`String`]_ Get the pending data of type `format` for clipboard injection.

```js
var dataObj = ZeroClipboard.getData();
```

_[`Object`]_ Get a copy of the pending data of ALL formats for clipboard injection.


#### `ZeroClipboard.focus(...)`
#### `ZeroClipboard.activate(...)`

_The preferred alias `ZeroClipboard.focus(...)` was added in `v2.1.0`._

```js
ZeroClipboard.focus(document.getElementById("d_clip_button"));
```

_[`undefined`]_ Focus/"activate" the provided element by moving the Flash SWF object in front of it. **NOTE:** The preferred method to use is `focus` but the alias `activate` is available for backward compatibility's sake.


#### `ZeroClipboard.blur()`
#### `ZeroClipboard.deactivate()`

_The preferred alias `ZeroClipboard.blur()` was added in `v2.1.0`._

_[`undefined`]_ Blur/"deactivate" the currently focused/"activated" element, moving the Flash SWF object off the screen. **NOTE:** The preferred method to use is `blur` but the alias `deactivate` is available for backward compatibility's sake.


#### `ZeroClipboard.activeElement()`

_Added in `v2.1.0`._

```js
var el = document.getElementById("d_clip_button");
ZeroClipboard.focus(el);
var activeEl = ZeroClipboard.activeElement();  // activeEl === el
```

_[`HTMLElement` or `null`]_ Return the currently "activated" element that the Flash SWF object is in front of it.


#### `ZeroClipboard.state()`

_[`Object`]_ Diagnostic method that describes the state of the browser, Flash Player, and ZeroClipboard.


#### `ZeroClipboard.isFlashUnusable()`

_[`Boolean`]_ Indicates if Flash Player is **definitely** unusable (disabled, outdated, unavailable, or deactivated). _**IMPORTANT:**_ This method should be considered private.


#### `ZeroClipboard.on(...)`

```js
var listenerFn = function(e) { var ZeroClipboard = this; /* ... */ };
ZeroClipboard.on("ready", listenerFn);

var listenerObj = {
  handleEvent: function(e) { var listenerObj = this; /* ... */ }
};
ZeroClipboard.on("error", listenerObj);
```

_[`undefined`]_ Add a `listener` function/object for an `eventType`.

```js
ZeroClipboard.on("ready error", function(e) { /* ... */ });
```

_[`undefined`]_ Add a `listener` function/object for multiple `eventType`s.

```js
ZeroClipboard.on({
  "ready": function(e) { /* ... */ },
  "error": function(e) { /* ... */ }
});
```

_[`undefined`]_ Add a set of `eventType` to `listener` function/object mappings.


#### `ZeroClipboard.off(...)`

```js
ZeroClipboard.off("ready", listenerFn);
ZeroClipboard.off("error", listenerObj);
```

_[`undefined`]_ Remove a `listener` function/object for an `eventType`.

```js
ZeroClipboard.off("ready error", listenerFn);
```

_[`undefined`]_ Remove a `listener` function/object for multiple `eventType`s.

```js
ZeroClipboard.off({
  "ready": readyListenerFn,
  "error": errorListenerFn
});
```

_[`undefined`]_ Remove a set of `eventType` to `listener` function/object mappings.

```js
ZeroClipboard.off("ready");
```

_[`undefined`]_ Remove ALL listener functions/objects for an `eventType`.

```js
ZeroClipboard.off();
```

_[`undefined`]_ Remove ALL listener functions/objects for ALL registered event types.


#### `ZeroClipboard.emit(...)`

```js
ZeroClipboard.emit("ready");
ZeroClipboard.emit({
  type: "error",
  name: "flash-disabled"
});

var pendingCopyData = ZeroClipboard.emit("copy");
```

_[`undefined`, or a Flash-friendly data `Object` for the `"copy"` event]_ Dispatch an event to all
registered listeners. The emission of some types of events will result in side effects.


#### `ZeroClipboard.handlers(...)`

```js
var listeners = ZeroClipboard.handlers("ready");
```

_[`Array`]_ Retrieves a copy of the registered listener functions/objects for the given `eventType`.


```js
var listeners = ZeroClipboard.handlers();
```

_[`Object`]_ Retrieves a copy of the map of registered listener functions/objects for ALL event types.



### Static Events

#### `"ready"`

The `ready` event is fired when the Flash SWF completes loading and is ready for action.  Please
note that you need to set most configuration options [with [`ZeroClipboard.config(...)`](#zeroclipboardconfig)]
before `ZeroClipboard.create()` is invoked.

```js
ZeroClipboard.on("ready", function(e) {
/*
  e = {
    type: "ready",
    message: "Flash communication is established",
    target: null,
    relatedTarget: null,
    currentTarget: flashSwfObjectRef,
    version: "11.2.202",
    timeStamp: Date.now()
  };
*/
});
```


#### `"beforecopy"`

On `click`, the Flash object will fire off a `beforecopy` event. This event is generally only
used for "UI prepartion" if you want to alter anything before the `copy` event fires.

**IMPORTANT:** Handlers of this event are expected to operate synchronously if they intend to be
finished before the "copy" event is triggered.

```js
ZeroClipboard.on("beforecopy", function(e) {
/*
  e = {
    type: "beforecopy",
    target: currentlyActivatedElementOrNull,
    relatedTarget: dataClipboardElementTargetOfCurrentlyActivatedElementOrNull,
    currentTarget: flashSwfObjectRef,
    timeStamp: Date.now()
  };
*/
});
```


#### `"copy"`

On `click` (and after the `beforecopy` event), the Flash object will fire off a `copy` event. If
the HTML object has `data-clipboard-text` or `data-clipboard-target`, then ZeroClipboard will take
care of getting an initial set of data. It will then invoke any `copy` event handlers, in which you
can call `event.clipboardData.setData` to set the text, which will complete the loop.

**IMPORTANT:** If a handler of this event intends to modify the pending data for clipboard
injection, it _MUST_ operate synchronously in order to maintain the temporarily elevated
permissions granted by the user's `click` event. The most common "gotcha" for this restriction is
if someone wants to make an asynchronous XMLHttpRequest in response to the `copy` event to get the
data to inject &mdash; this won't work; make it a _synchronous_ XMLHttpRequest instead, or do the
work in advance before the `copy` event is fired.

```js
ZeroClipboard.on("copy", function(e) {
/*
  e = {
    type: "copy",
    target: currentlyActivatedElementOrNull,
    relatedTarget: dataClipboardElementTargetOfCurrentlyActivatedElementOrNull,
    currentTarget: flashSwfObjectRef,
    timeStamp: Date.now(),
    clipboardData: {
      setData: ZeroClipboard.setData,
      clearData: ZeroClipboard.clearData
    }
  };
*/
});
```


#### `"aftercopy"`

The `aftercopy` event is fired when the text is copied [or failed to copy] to the clipboard.

```js
ZeroClipboard.on("aftercopy", function(e) {
/*
  e = {
    type: "aftercopy",
    target: currentlyActivatedElementOrNull,
    relatedTarget: dataClipboardElementTargetOfCurrentlyActivatedElementOrNull,
    currentTarget: flashSwfObjectRef,
    timeStamp: Date.now(),
    success: {
      "text/plain": true,
      "text/html": true,
      "application/rtf": false
    },
    data: {
      "text/plain": "Blah",
      "text/html": "<b>Blah</b>",
      "application/rtf": "{\\rtf1\\ansi\n{\\b Blah}}"
    },
    errors: [
      {
        name: "SecurityError",
        message: "Clipboard security error OMG",
        errorID: 7320,
        stack: null,
        format: "application/rtf",
        clipboard: "desktop"
      }
    ]
  };
*/
});
```


#### `"destroy"`

The `destroy` event is fired when `ZeroClipboard.destroy()` is invoked.

**IMPORTANT:** Handlers of this event are expected to operate synchronously if they intend to be
finished before the destruction is complete.

```js
ZeroClipboard.on("destroy", function(e) {
/*
  e = {
    type: "destroy",
    target: null,
    relatedTarget: null,
    currentTarget: flashSwfObjectRef,
    timeStamp: Date.now(),
    success: {
      "text/plain": true,
      "text/html": true,
      "application/rtf": false
    },
    data: {
      "text/plain": "Blah",
      "text/html": "<b>Blah</b>",
      "application/rtf": "{\\rtf1\\ansi\n{\\b Blah}}"
    }
  };
*/
});
```


#### `"error"`

The `error` event is fired under a number of conditions, which will be detailed as sub-sections below.

Some consumers may not consider all `error` types to be critical, and thus ZeroClipboard does not take it upon
itself to implode by calling `ZeroClipboard.destroy()` under error conditions.  However, many consumers may
want to do just that.


##### `error[name = "flash-disabled"]`

This type of `error` event fires when Flash Player is either not installed or not enabled in the browser.

```js
ZeroClipboard.on("error", function(e) {
/*
  e = {
    type: "error",
    name: "flash-disabled",
    messsage: "Flash is disabled or not installed. May also be attempting to run Flash in a sandboxed iframe, which is impossible.",
    target: null,
    relatedTarget: null,
    currentTarget: flashSwfObjectRef,
    timeStamp: Date.now(),
    minimumVersion: "11.0.0"
  };
*/
});
```


##### `error[name = "flash-outdated"]`

This type of `error` event fires when Flash Player is installed in the browser but the version is too old
for ZeroClipboard. ZeroClipboard requires Flash Player 11.0.0 or above.

```js
ZeroClipboard.on("error", function(e) {
/*
  e = {
    type: "error",
    name: "flash-outdated",
    messsage: "Flash is too outdated to support ZeroClipboard",
    target: null,
    relatedTarget: null,
    currentTarget: flashSwfObjectRef,
    timeStamp: Date.now(),
    minimumVersion: "11.0.0",
    version: "10.3.183"
  };
*/
});
```


##### `error[name = "flash-sandboxed"]`

This type of `error` event fires when the page is within a `sandbox`ed `iframe` element. It is impossible for Flash Player to run in such a sandbox.

```js
ZeroClipboard.on("error", function(e) {
/*
  e = {
    type: "error",
    name: "flash-sandboxed",
    messsage: "Attempting to run Flash in a sandboxed iframe, which is impossible",
    target: null,
    relatedTarget: null,
    currentTarget: flashSwfObjectRef,
    timeStamp: Date.now(),
    minimumVersion: "11.0.0",
    version: "11.2.202"
  };
*/
});
```


##### `error[name = "flash-unavailable"]`

This type of `error` event fires when the browser's installation of Flash Player cannot communicate bidirectionally with JavaScript.

```js
ZeroClipboard.on("error", function(e) {
/*
  e = {
    type: "error",
    name: "flash-unavailable",
    messsage: "Flash is unable to communicate bidirectionally with JavaScript",
    target: null,
    relatedTarget: null,
    currentTarget: flashSwfObjectRef,
    timeStamp: Date.now(),
    minimumVersion: "11.0.0",
    version: "11.2.202"
  };
*/
});
```


##### `error[name = "flash-degraded"]`

This type of `error` event fires when the browser's installation of Flash Player cannot communicate bidirectionally with JavaScript without losing data fidelity.

```js
ZeroClipboard.on("error", function(e) {
/*
  e = {
    type: "error",
    name: "flash-degraded",
    messsage: "Flash is unable to preserve data fidelity when communicating with JavaScript",
    target: null,
    relatedTarget: null,
    currentTarget: flashSwfObjectRef,
    timeStamp: Date.now(),
    minimumVersion: "11.0.0",
    version: "11.2.202"
  };
*/
});
```


##### `error[name = "flash-deactivated"]`

This type of `error` event fires when the browser's installation of Flash Player is either too old
for the browser [but _not_ too old for ZeroClipboard] or if Flash objects are configured as
click-to-play and the user does not authorize it within `_globalConfig.flashLoadTimeout`
milliseconds or does not authorize it at all.

This event may also be fired in some browsers if the ZeroClipboard SWF object cannot be loaded at all. See [`error\[name = "swf-not-found"\]`](#error-name--swf-not-found) for more information.

```js
ZeroClipboard.on("error", function(e) {
/*
  e = {
    type: "error",
    name: "flash-deactivated",
    messsage: "Flash is too outdated for your browser and/or is configured as click-to-activate. This may also mean that the ZeroClipboard SWF object could not be loaded, so please check your `swfPath` configuration and/or network connectivity. May also be attempting to run Flash in a sandboxed iframe, which is impossible.",
    target: null,
    relatedTarget: null,
    currentTarget: flashSwfObjectRef,
    timeStamp: Date.now(),
    minimumVersion: "11.0.0",
    version: "11.2.202"
  };
*/
});
```


##### `error[name = "flash-overdue"]`

This type of `error` event fires when the SWF loads successfully but takes longer than
`_globalConfig.flashLoadTimeout` milliseconds to do so. This would likely be caused by
one of the following situations:
 1. Too short of a `_globalConfig.flashLoadTimeout` duration configured
 2. Network latency
 3. The user's installation of Flash is configured as click-to-play but then authorized
    by the user too late such that the SWF does not finish loading before the timeout
    period has expired (or it may have expired before they authorized it at all).

The appropriate response to this event is left up to the consumer. For instance, if they
chose to invoke `ZeroClipboard.destroy()` in response to the earlier
`error[name = "flash-deactivated"]` event but then receive this `error[name = "flash-overdue"]`
event, they may choose to "restart" their process and construct new ZeroClipboard client instances,
or they may choose to just log the error to their server so they can consider increasing the
allowed timeout duration in the future.

This may be especially important for SPA or PJAX-based applications to consider as their users
may remain on a single page for an extended period of time during which they _possibly_ could
have enjoyed an improved experience if ZeroClipboard had been "restarted" after an initial hiccup.

```js
ZeroClipboard.on("error", function(e) {
/*
  e = {
    type: "error",
    name: "flash-overdue",
    messsage: "Flash communication was established but NOT within the acceptable time limit",
    target: null,
    relatedTarget: null,
    currentTarget: flashSwfObjectRef,
    timeStamp: Date.now(),
    minimumVersion: "11.0.0",
    version: "11.2.202"
  };
*/
});
```


##### `error[name = "version-mismatch"]`

_Added in `v2.2.0`._

This type of `error` event fires when the JavaScript side's `ZeroClipboard.version` property value
does not exactly match the `ZeroClipboard.VERSION` property value that was compiled into the SWF.
While this is stricter than usually necessary, it helps avoid weird problems if you accidentally
forget to copy all of the assets when updating your ZeroClipboard installation, or if you run into
any weird caching issues afterward.  In those situations, this `error` event should save you a lot of
time and confusion when you run into the occasional bidirectional API change that will fail to work
unless both the JS and SWF assets are appropriate updated.

```js
ZeroClipboard.on("error", function(e) {
/*
  e = {
    type: "error",
    name: "version-mismatch",
    messsage: "ZeroClipboard JS version number does not match ZeroClipboard SWF version number",
    target: null,
    relatedTarget: null,
    currentTarget: flashSwfObjectRef,
    timeStamp: Date.now(),
    jsVersion: "2.2.1",
    swfVersion: "2.2.0"
  };
*/
});
```


##### `error[name = "clipboard-error"]`

_Added in `v2.2.0`._

This type of `error` event fires when any error occurs while the Flash layer is attempting to inject the pending clipboard data into the clipboard. This event is fired only if the injection of at least 1 data format into the clipboard threw an error but does **not** necessarily mean that the injection failed for _every_ data format.

If it is fired at all, it is fired _after_ the `aftercopy` event and before the bubbled `click` event.

```js
ZeroClipboard.on("error", function(e) {
/*
  e = {
    type: "error",
    name: "clipboard-error",
    messsage: "At least one error was thrown while ZeroClipboard was attempting to inject your data into the clipboard",
    target: currentlyActivatedElementOrNull,
    relatedTarget: dataClipboardElementTargetOfCurrentlyActivatedElementOrNull,
    currentTarget: flashSwfObjectRef,
    timeStamp: Date.now(),
    data: {
      "text/plain": "Blah",
      "text/html": "<b>Blah</b>",
      "application/rtf": "{\\rtf1\\ansi\n{\\b Blah}}"
    },
    errors: [
      {
        name: "SecurityError",
        message: "Clipboard security error OMG",
        errorID: 7320,
        stack: null,
        format: "application/rtf",
        clipboard: "desktop"
      }
    ]
  };
*/
});
```


##### `error[name = "config-mismatch"]`

_Added in `v2.2.0`._

This type of `error` event fires when the certain properties within the
`ZeroClipboard.config` configured values do not match real values within
Flash. For example, if the specified `swfObjectId` config property does
not match the SWF's implicitly known element ID for the SWF object. This
should be extremely rare unless the `swfPath` URL integrity is being
compromised by attempted cross-site scripting (XSS) attacks.

```js
ZeroClipboard.on("error", function(e) {
/*
  e = {
    type: "error",
    name: "config-mismatch",
    messsage: "ZeroClipboard configuration does not match Flash's reality",
    target: null,
    relatedTarget: null,
    currentTarget: flashSwfObjectRef,
    timeStamp: Date.now(),
    property: "swfObjectId",
    configuredValue: "my-zeroclipboard-object",
    actualValue: "global-zeroclipboard-flash-bridge"
  };
*/
});


##### `error[name = "swf-not-found"]`

_Added in `v2.2.0`._

This type of `error` event fires when the ZeroClipboard SWF object cannot be loaded, which typically means one of the following:
 1. Your `swfPath` configuration is incorrect
 2. The server/domain hosting your SWF is down
 3. Your network connectivity has been lost

Unfortunately, this event can only be supported in a limited sub-set of browsers at this time:
 - Firefox
 - IE10 (_specifically_; not IE9, not IE11)

```js
ZeroClipboard.on("error", function(e) {
/*
  e = {
    type: "error",
    name: "swf-not-found",
    messsage: "The ZeroClipboard SWF object could not be loaded, so please check your `swfPath` configuration and/or network connectivity",
    target: null,
    relatedTarget: null,
    currentTarget: flashSwfObjectRef,
    timeStamp: Date.now()
  };
*/
});
```



## Instance

The following properties and methods are accessible via a `ZeroClipboard` client instance, e.g.

```js
var clippedEl = document.getElementById("d_clip_button");
var client = new ZeroClipboard(clippedEl);
```


### Instance Properties

#### `client.id`

_[`String`]_ A unique identifier for this ZeroClipboard client instance.


### Instance Methods

#### `client.destroy()`

_[`undefined`]_ Remove all event handlers and unclip all clipped elements.


#### `client.setText(...)`

```js
client.setText("Blah");
```

_[`this`]_ Set the pending `data` of type `"text/plain"` for clipboard injection.


#### `client.setHtml(...)`

```js
client.setHtml("<b>Blah</b>");
```

_[`this`]_ Set the pending `data` of type `"text/html"` for clipboard injection.


#### `client.setRichText(...)`

```js
client.setRichText("{\\rtf1\\ansi\n{\\b Blah}}");
```

_[`this`]_ Set the pending `data` of type `"application/rtf"` for clipboard injection.


#### `client.setData(...)`

```js
client.setData("text/plain", "Blah");
```

_[`this`]_ Set the pending `data` of type `format` for clipboard injection.

```js
client.setData({
  "text/plain": "Blah",
  "text/html": "<b>Blah</b>"
});
```

_[`this`]_ Set the pending `data` of various formats for clipboard injection. This particular
function signature (passing in an `Object`) will implicitly clear out any existing pending data.


#### `client.clearData(...)`

```js
client.clearData("text/plain");
```

_[`this`]_ Clear the pending data of type `format` for clipboard injection.

```js
client.clearData();
```

_[`this`]_ Clear the pending data of ALL formats for clipboard injection.


#### `client.getData(...)`

_Added in `v2.1.0`._

```js
var text = client.getData("text/plain");
```

_[`String`]_ Get the pending data of type `format` for clipboard injection.

```js
var dataObj = client.getData();
```

_[`Object`]_ Get a copy of the pending data of ALL formats for clipboard injection.


#### `client.clip(...)`

```js
client.clip(document.getElementById("d_clip_button"))
client.clip(document.querySelectorAll(".clip_button"));
client.clip(jQuery(".clip_button"));
```

_[`this`]_ Register clipboard actions for new element(s) to the client. This includes
automatically invoking `ZeroClipboard.focus` on the current element when it is hovered over,
unless the `autoActivate` configuration property is set to `false`.


#### `client.unclip(...)`

```js
client.unclip(document.getElementById("d_clip_button"))
client.unclip(document.querySelectorAll(".clip_button"));
client.unclip(jQuery(".clip_button"));
client.unclip();
```

_[`this`]_ Unregister the clipboard actions of previously registered element(s) on the page.
If no elements are provided, ALL clipped/registered elements will be unregistered.


#### `client.elements()`

```js
var els = client.elements();
```

_[`Array`]_ Get all of the elements to which this client is clipped/registered.


#### `client.on(...)`

```js
var listenerFn = function(e) { var client = this; /* ... */ };
client.on("ready", listenerFn);

var listenerObj = {
  handleEvent: function(e) { var listenerObj = this; /* ... */ }
};
client.on("error", listenerObj);
```

_[`this`]_ Add a `listener` function/object for an `eventType` within this client instance.

```js
client.on("ready error", function(e) { /* ... */ });
```

_[`this`]_ Add a `listener` function/object for multiple `eventType`s within this client instance.

```js
client.on({
  "ready": function(e) { /* ... */ },
  "error": function(e) { /* ... */ }
});
```

_[`this`]_ Add a set of `eventType` to `listener` function/object mappings within this client instance.


#### `client.off(...)`

```js
client.off("ready", listenerFn);
client.off("error", listenerObj);
```

_[`this`]_ Remove a `listener` function/object for an `eventType` within this client instance.

```js
client.off("ready error", listenerFn);
```

_[`this`]_ Remove a `listener` function/object for multiple `eventType`s within this client instance.

```js
client.off({
  "ready": readyListenerFn,
  "error": errorListenerFn
});
```

_[`this`]_ Remove a set of `eventType` to `listener` function/object mappings within this client instance.

```js
client.off("ready");
```

_[`this`]_ Remove ALL listener functions/objects for an `eventType` within this client instance.

```js
client.off();
```

_[`this`]_ Remove ALL listener functions/objects for ALL registered event types within this client instance.


#### `client.emit(...)`

```js
client.emit("ready");
client.emit({
  type: "error",
  name: "flash-disabled"
});
```

_[`undefined`]_ Dispatch an event to all registered listeners within this client instance.


#### `client.handlers(...)`

```js
var listeners = client.handlers("ready");
```

_[`Array`]_ Retrieves a copy of the registered listener functions/objects for the given `eventType` within this client instance.


```js
var listeners = client.handlers();
```

_[`Object`]_ Retrieves a copy of the map of registered listener functions/objects for ALL event types within this client instance.



### Instance Events

See the [Static Events](#static-events) listing.  The ZeroClipboard client instances regurgitate ALL of the `ZeroClipboard.Core` events &mdash; but ONLY if the event is NOT _impertinent_ to this particular client.  The only difference is that the clients' event dispatching will update the `event` object to include a `client` property that references the relevant client instance, e.g.:

```js
var client = new ZeroClipboard();
client.on("ready", function(e) {
  if (e.client === client && client === this) {
    console.log("This client instance is ready!");
  }
});
```



## Configuration Options

These are default values for the global configurations options. You should generally update these _before_ you create your clients.

```js
var _globalConfig = {

  // SWF URL, relative to the page. Default value will be "ZeroClipboard.swf"
  // under the same path as the ZeroClipboard JS file.
  swfPath: _swfPath,

  // SWF inbound scripting policy: page domains that the SWF should trust.
  // (single string, or array of strings)
  trustedDomains: window.location.host ? [window.location.host] : [],

  // Include a "noCache" query parameter on requests for the SWF.
  cacheBust: true,

  // Enable use of the fancy "Desktop" clipboard, even on Linux where it is
  // known to suck.
  forceEnhancedClipboard: false,

  // How many milliseconds to wait for the Flash SWF to load and respond before assuming that
  // Flash is deactivated (e.g. click-to-play) in the user's browser. If you don't care about
  // how long it takes to load the SWF, you can set this to `null`.
  flashLoadTimeout: 30000,

  // Setting this to `false` would allow users to handle calling `ZeroClipboard.focus(...);`
  // themselves instead of relying on our per-element `mouseover` handler.
  autoActivate: true,

  // Bubble synthetic events in JavaScript after they are received by the Flash object.
  bubbleEvents: true,

  // Sets the ID of the `div` encapsulating the Flash object.
  // Value is validated against the [HTML4 spec for `ID` tokens][valid_ids].
  containerId: "global-zeroclipboard-html-bridge",
 
  // Sets the class of the `div` encapsulating the Flash object.
  containerClass: "global-zeroclipboard-container",
 
  // Sets the ID and name of the Flash `object` element.
  // Value is validated against the [HTML4 spec for `ID` and `Name` tokens][valid_ids].
  swfObjectId: "global-zeroclipboard-flash-bridge",

  // The class used to indicate that a clipped element is being hovered over.
  hoverClass: "zeroclipboard-is-hover",

  // The class used to indicate that a clipped element is active (is being clicked).
  activeClass: "zeroclipboard-is-active",



  // Forcibly set the hand cursor ("pointer") for all clipped elements.
  // IMPORTANT: This configuration value CAN be modified while a SWF is actively embedded.
  forceHandCursor: false,

  // Sets the title of the `div` encapsulating the Flash object.
  // IMPORTANT: This configuration value CAN be modified while a SWF is actively embedded.
  title: null,

  // The z-index used by the Flash object.
  // Max value (32-bit): 2147483647.
  // IMPORTANT: This configuration value CAN be modified while a SWF is actively embedded.
  zIndex: 999999999

};
```

You can override the defaults by making calls like `ZeroClipboard.config({ swfPath: "new/path" });`
before you create any clients.


### SWF Inbound Scripting Access: The `trustedDomains` option

This allows other SWF files and HTML pages from the allowed domains to access/call publicly
exposed ActionScript code, e.g. functions shared via `ExternalInterface.addCallback`. In other
words, it controls the SWF inbound scripting access.

If your ZeroClipboard SWF is served from a different origin/domain than your page, you need to tell
the SWF that it's OK to trust your page. The default value of `[window.location.host]` is almost
_**always**_ what you will want unless you specifically want the SWF to communicate with pages from
other domains (e.g. in `iframe`s or child windows).

For more information about trusted domains, consult the [_official Flash documentation for `flash.system.Security.allowDomain(...)`_](http://help.adobe.com/en_US/FlashPlatform/reference/actionscript/3/flash/system/Security.html#allowDomain\(\)).


### SWF Outbound Scripting Access

The `allowScriptAccess` parameter (for Flash embedding markup) allows the SWF file to access/call
JavaScript/HTML functionality of HTML pages on allowed domains, e.g. invoking functions via
`ExternalInterface.call`. In other words, it controls the SWF outbound scripting access.

As of version `v2.0.0-alpha.2`, the `allowScriptAccess` configuration option no longer exists. The
appropriate value will be determined immediately before the Flash object is embedded on the page.
The value is based on a relationship between the current domain (`window.location.host`) and the
value of the `trustedDomains` configuration option.

For more information about `allowScriptAccess`, consult the [_official Flash documentation_](http://helpx.adobe.com/flash/kb/control-access-scripts-host-web.html).


## Protocol Limitations

### Cross-Protocol Limitations

ZeroClipboard was intentionally configured to _not_ allow the SWF to be served from a secure domain (HTTPS) but scripted by an insecure domain (HTTP). If you find yourself in this situation (as in [Issue #170](https://github.com/zeroclipboard/zeroclipboard/issues/170)), see [../instructions.md#cross-protocol-limitations](../instructions.md#cross-protocol-limitations) for an in-depth explanation of this limitation and how to proceed.


### `file://` Protocol Limitations

If you want to either use ZeroClipboard on a page hosted via the `file://` protocol or serve ZeroClipboard's assets via the `file://` protocol, you are almost guaranteed to run into some roadblocks due to Flash Player security restrictions. See [../instructions.md#file-protocol-limitations](../instructions.md#file-protocol-limitations) for an in-depth explanation of this limitation and the potential workarounds.
