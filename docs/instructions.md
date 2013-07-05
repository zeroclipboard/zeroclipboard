# Overview

The *ZeroClipboard* JavaScript library provides an easy way to copy text to the clipboard using an invisible Adobe Flash movie.  The "Zero" signifies that the library is invisible and the user interface is left entirely up to you.

Browsers won't let you access the clipboard directly. So this library puts a flash object on the page to proxy the clipboard for you. The library will move and resize over all the glued objects.


## Setup

If you are installing for node.

```shell
npm install zeroclipboard
```

To use the library, simply include the following JavaScript file in your page:

```html
<script type="text/javascript" src="ZeroClipboard.js"></script>
```

You also need to have the "`ZeroClipboard.swf`" file available to the browser.  If this file is located in the same directory as your web page, then it will work out of the box.  However, if the SWF file is hosted elsewhere, you need to set the URL like this (place this code _after_ the script tag):

```js
ZeroClipboard.setDefaults( { moviePath: 'http://YOURSERVER/path/ZeroClipboard.swf' } );
```


## Clients

Now you are ready to create one or more *Clients*.  A client is a single instance of the clipboard library on the page, linked to one or more DOM elements. Here is how to create a client instance:

```js
var clip = new ZeroClipboard();
```

You can also include an element or array of elements in the new client. * This example uses jQuery to find the button.

```js
var clip = new ZeroClipboard($("#my-button"));
```

Next, you can set some options.


## Setting Options

There are default options you can set before, or when you create a new client.

```js
var _defaults = {
  moviePath:         "ZeroClipboard.swf",        // URL to movie
  trustedDomains:    undefined,                  // Domains that we should trust (single string or array of strings)
  hoverClass:        "zeroclipboard-is-hover",   // The class used to hover over the object
  activeClass:       "zeroclipboard-is-active",  // The class used to set object active
  allowScriptAccess: "sameDomain",               // SWF outbound scripting policy
  useNoCache:        true                        // Include a nocache query parameter on requests for the SWF
};
```
You can override the defaults using `ZeroClipboard.setDefaults({ moviePath: "new/path" })` before you create any clients.

You can also set the options when creating a new client by passing an optional json object `new ZeroClipboard($("#d_clip_button"), { moviePath: "new/path", text: "Copy me!" })`


### A note on the `allowScriptAccess` option

For version 1.1.7 and below, the `embed` tag had the `allowScriptAccess` parameter hard-coded to `always`. This allowed the "`ZeroClipboard.swf`" file to be hosted on an external domain. However, to enhance security, versions after 1.1.7 have an option for `allowScriptAccess` with a default of `sameDomain`, which only allows "`ZeroClipboard.swf`" to be served from the same domain as the hosting page.

If you hosted "`ZeroClipboard.swf`" on a different domain than the hosting page on version 1.1.7 or below, when you upgrade to a version above 1.1.7, you should either move "`ZeroClipboard.swf`" to the same domain as the hosting page or set the `allowScriptAccess` option to `always`.

For more information about `allowScriptAccess`, consult the *[official Flash documentation](http://helpx.adobe.com/flash/kb/control-access-scripts-host-web.html)*.


### Cross-Protocol Limitations

ZeroClipboard was intentionally configured to _not_ allow the SWF to be served from a secure domain (HTTPS) but scripted by an insecure domain (HTTP).

If you find yourself in this situation (as in [Issue #170](https://github.com/zeroclipboard/ZeroClipboard/issues/170)), please consider the following options:  
 1. Serve the SWF over HTTP instead of HTTPS. If the page's protocol can vary (e.g. authorized/unauthorized, staging/production, etc.), you should include add the SWF with a relative protocol (`//s3.amazonaws.com/blah/ZeroClipboard.swf`) instead of an absolute protocol (`https://s3.amazonaws.com/blah/ZeroClipboard.swf`).
 2. Serve the page over HTTPS instead of HTTP. If the page's protocol can vary, see the note on the previous option (1).
 3. Update ZeroClipboard's ActionScript codebase to call the [`allowInsecureDomain`](http://help.adobe.com/en_US/FlashPlatform/reference/actionscript/3/flash/system/Security.html#allowInsecureDomain\(\)) method, then recompile the SWF with your custom changes.


### Text To Copy

Setting the clipboard text happens 3 ways.

1. Set the text via `data-clipboard-target` attribute on the button. ZeroClipboard will look for the target element via ID and try and get the text value via `.value` or `.textContent` or `.innerText`.

  ```html
  <button id="my-button" data-clipboard-target="clipboard_text">Copy to Clipboard</button>

  <input type="text" id="clipboard_text" value="Clipboard Text"/>
  <textarea id="clipboard_textarea">Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod
  tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
  quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
  consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse
  cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non
  proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</textarea>
  <pre id="clipboard_pre">Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod
  tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
  quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
  consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse
  cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non
  proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</pre>
  ```

2. Set the text via `data-clipboard-text` attribute on the button. Doing this will let ZeroClipboard take care of the rest.

  ```html
  <button id="my-button" data-clipboard-text="Copy me!">Copy to Clipboard</button>
  ```

3. Set the text via `clip.setText` property.  You can call this function at any time; when the page first loads, or later in an `onMouseOver` or `onMouseDown` handler.  Example:

  ```js
  clip.setText( "Copy me!" );
  ```


### Gluing

Gluing refers to the process of "linking" the Flash movie to a DOM element on the page. Since the Flash movie is completely transparent, the user sees nothing out of the ordinary.

The Flash movie receives the click event and copies the text to the clipboard.  Also, mouse actions like hovering and mouse-down generate events that you can capture (see *[Event Handlers](#event-handlers)* below).

To glue elements, you must pass an element, or array of elements to the glue function.

Here is how to glue your clip library instance to a DOM element:

```js
clip.glue( document.getElementById('d_clip_button') );
```

You can pass in a reference to the actual DOM element object itself or an array of DOM objects.  The rest all happens automatically -- the movie is created, all your options set, and it is floated above the element, awaiting clicks from the user.


### Recommended Implementation

```html
<button id="my-button" data-clipboard-text="Copy me!" title="Click to copy to clipboard.">Copy to Clipboard</button>
```

And the code:

```js
var clip = new ZeroClipboard( $("button#my-button") );
```


### Page Resizing

If the page gets resized, or something happens which moves your DOM element, you will need to reposition the movie.  This can be achieved by calling the `reposition()` method.  Example:

```js
clip.reposition();
```

A typical use of this is to put it inside a `window.onresize` handler.


## CSS Effects

Since the Flash movie is floating on top of your DOM element, it will receive all the mouse events before the browser has a chance to catch them.  However, for convenience these events are passed through to your clipboard client which you can capture (see *Event Handlers* below).  But in addition to this, the Flash movie can also activate CSS classes on your DOM element to simulate the ":hover" and ":active" pseudo-classes.

If this feature is enabled, the CSS classes "hover" and "active" are added / removed to your DOM element as the mouse hovers over and clicks the Flash movie.  This essentially allows your button to behave normally, even though the floating Flash movie is receiving all the mouse events.  Please note that the actual CSS pseudo-classes ":hover" and ":active" are not used -- these cannot be programmatically activated with current browser software.  Instead, sub-classes named "zeroclipboard-is-hover" and "zeroclipboard-is-active" are used.  Example CSS:

```css
  #d_clip_button {
    width:150px;
    text-align:center;
    border:1px solid black;
    background-color:#ccc;
    margin:10px; padding:10px;
  }
  #d_clip_button.zeroclipboard-is-hover { background-color:#eee; }
  #d_clip_button.zeroclipboard-is-active { background-color:#aaa; }
```

These classes are for a DOM element with an ID: "d_clip_button".  The "zeroclipboard-is-hover" and "zeroclipboard-is-active" sub-classes would automatically be activated as the user hovers over, and clicks down on the Flash movie, respectively.  They behave exactly like CSS pseudo-classes of the same names.


## Event Handlers

The clipboard library allows you set a number of different event handlers.  These are all set by calling the `on()` method, as in this example:

```js
clip.on( 'load', my_load_handler );
```

The first argument is the name of the event, and the second is a reference to your function.  The function may be passed by name (string) or an actual reference to the function object

Your custom function will be passed at least one argument -- a reference to the clipboard client object.  However, certain events pass additional arguments, which are described in each section below.  The following subsections describe all the available events you can hook.

Event handlers can be removed by calling the `off()` method, which has the same method signature as `on()`:

```js
clip.off( 'load', my_load_handler );
```


#### load

The `load` event is fired when the Flash movie completes loading and is ready for action.  Please note that you don't need to listen for this event to set options -- those are automatically passed to the movie if you call them before it loads.  Example use:

```js
clip.on( 'load', function ( client, args ) {
  alert( "movie has loaded" );
});
```

The handler is passed these options to the `args`

<dl>
<dt>this</dt>
<dd>The current element that is being provoked. if null this will be the window</dd>
<dt>flashVersion</dt>
<dd>This property contains the users' flash version</dd>
</dl>


#### mouseover

The `mouseover` event is fired when the user's mouse pointer enters the Flash movie.  You can use this to simulate a rollover effect on your DOM element, however see *CSS Effects* for an easier way to do this.  Example use:

```js
clip.on( 'mouseover', function ( client, args ) {
  alert( "mouse is over movie" );
});
```

The handler is passed these options to the `args`

<dl>
<dt>this</dt>
<dd>The current element that is being provoked. if null this will be the window</dd>
<dt>flashVersion</dt>
<dd>This property contains the users' flash version</dd>
<dt>altKey</dt>
<dd>`true` if the Alt key is active</dd>
<dt>ctrlKey</dt>
<dd>`true` on Windows and Linux if the Ctrl key is active. `true` on Mac if either the Ctrl key or the Command key is active. Otherwise, `false`.</dd>
<dt>shiftKey</dt>
<dd>`true` if the Shift key is active; `false` if it is inactive.</dd>
</dl>


#### mouseout

The `mouseout` event is fired when the user's mouse pointer leaves the Flash movie.  You can use this to simulate a rollover effect on your DOM element, however see *CSS Effects* for an easier way to do this.  Example use:

```js
clip.on( 'mouseout', function ( client, args ) {
  alert( "mouse has left movie" );
} );
```

The handler is passed these options to the `args`

<dl>
<dt>this</dt>
<dd>The current element that is being provoked. if null this will be the window</dd>
<dt>flashVersion</dt>
<dd>This property contains the users' flash version</dd>
<dt>altKey</dt>
<dd>`true` if the Alt key is active</dd>
<dt>ctrlKey</dt>
<dd>`true` on Windows and Linux if the Ctrl key is active. `true` on Mac if either the Ctrl key or the Command key is active. Otherwise, `false`.</dd>
<dt>shiftKey</dt>
<dd>`true` if the Shift key is active; `false` if it is inactive.</dd>
</dl>


#### mousedown

The `mousedown` event is fired when the user clicks on the Flash movie.  Please note that this does not guarantee that the user will release the mouse button while still over the movie (i.e. resulting in a click).  You can use this to simulate a click effect on your DOM element, however see *CSS Effects* for an easier way to do this.  Example use:

```js
clip.on( 'mousedown', function ( client, args ) {
  alert( "mouse button is down" );
} );
```

The handler is passed these options to the `args`

<dl>
<dt>this</dt>
<dd>The current element that is being provoked. if null this will be the window</dd>
<dt>flashVersion</dt>
<dd>This property contains the users' flash version</dd>
<dt>altKey</dt>
<dd>`true` if the Alt key is active</dd>
<dt>ctrlKey</dt>
<dd>`true` on Windows and Linux if the Ctrl key is active. `true` on Mac if either the Ctrl key or the Command key is active. Otherwise, `false`.</dd>
<dt>shiftKey</dt>
<dd>`true` if the Shift key is active; `false` if it is inactive.</dd>
</dl>


#### mouseup

The `mouseup` event is fired when the user releases the mouse button (having first pressed the mouse button while hovering over the movie).  Please note that this does not guarantee that the mouse cursor is still over the movie (i.e. resulting in a click).  You can use this to simulate a click effect on your DOM element, however see *CSS Effects* for an easier way to do this.  Example use:

```js
clip.on( 'mouseup', function ( client, args ) {
  alert( "mouse button is up" );
} );
```

The handler is passed these options to the `args`

<dl>
<dt>this</dt>
<dd>The current element that is being provoked. if null this will be the window</dd>
<dt>flashVersion</dt>
<dd>This property contains the users' flash version</dd>
<dt>altKey</dt>
<dd>`true` if the Alt key is active</dd>
<dt>ctrlKey</dt>
<dd>`true` on Windows and Linux if the Ctrl key is active. `true` on Mac if either the Ctrl key or the Command key is active. Otherwise, `false`.</dd>
<dt>shiftKey</dt>
<dd>`true` if the Shift key is active; `false` if it is inactive.</dd>
</dl>


#### complete

The `complete` event is fired when the text is successfully copied to the clipboard.  Example use:

```js
clip.on( 'complete', function ( client, args ) {
  alert("Copied text to clipboard: " + args.text );
} );
```

The handler is passed these options to the `args`

<dl>
<dt>this</dt>
<dd>The current element that is being provoked. if null this will be the window</dd>
<dt>flashVersion</dt>
<dd>This property contains the users' flash version</dd>
<dt>altKey</dt>
<dd>`true` if the Alt key is active</dd>
<dt>ctrlKey</dt>
<dd>`true` on Windows and Linux if the Ctrl key is active. `true` on Mac if either the Ctrl key or the Command key is active. Otherwise, `false`.</dd>
<dt>shiftKey</dt>
<dd>`true` if the Shift key is active; `false` if it is inactive.</dd>
<dt>text</dt>
<dd>The copied text.</dd>
</dl>


#### noflash

The `noflash` event is fired when the user doesn't have flash installed on their system

```js
clip.on( 'noflash', function ( client, args ) {
  alert("You don't support flash");
} );
```

The handler is passed these options to the `args`

<dl>
<dt>this</dt>
<dd>The current element that is being provoked. if null this will be the window</dd>
<dt>flashVersion</dt>
<dd>This property contains the users' flash version</dd>
</dl>


#### wrongflash

The `wrongflash` event is fired when the user has the wrong version of flash. ZeroClipboard supports version 10 and up.

```js
clip.on( 'wrongflash', function ( client, args ) {
  alert("Your flash is too old " + args.flashVersion);
} );
```

The handler is passed these options to the `args`

<dl>
<dt>this</dt>
<dd>The current element that is being provoked. if null this will be the window</dd>
<dt>flashVersion</dt>
<dd>This property contains the users' flash version</dd>
</dl>


#### dataRequested

On mousedown, the flash object will check and see if the `clipText` has been set. If it hasn't, then it will fire off a `dataRequested` event. If the html object has `data-clipboard-text` or `data-clipboard-target` then ZeroClipboard will take care of getting the data. However if it hasn't been set, then it will be up to you to `clip.setText` from that method. Which will complete the loop.

```js
clip.on( 'dataRequested', function ( client, args ) {
  clip.setText( 'Copied to clipboard.' );
} );
```

The handler is passed these options to the `args`

<dl>
<dt>this</dt>
<dd>The current element that is being provoked. if null this will be the window</dd>
<dt>flashVersion</dt>
<dd>This property contains the users' flash version</dd>
</dl>


## Examples

The following are complete, working examples of using the clipboard client library in HTML pages.


### Minimal Example

Here is a quick example using as few calls as possible:

```html
  <html>
  <body>

    <div id="d_clip_button" data-clipboard-text="Copy Me!" title="Click to copy." style="border:1px solid black; padding:20px;">Copy To Clipboard</div>

    <script type="text/javascript" src="ZeroClipboard.js"></script>
    <script language="JavaScript">
      var clip = new ZeroClipboard( document.getElementById('d_clip_button') );
    </script>
  </body>
  </html>
```

When clicked, the text "Copy me!" will be copied to the clipboard.


### Complete Example

Here is a complete example which exercises every option and event handler:

```html
  <html>
  <head>
    <style type="text/css">
      #d_clip_button {
        text-align:center;
        border:1px solid black;
        background-color:#ccc;
        margin:10px; padding:10px;
      }
      #d_clip_button.zeroclipboard-is-hover { background-color:#eee; }
      #d_clip_button.zeroclipboard-is-active { background-color:#aaa; }
    </style>
  </head>
  <body>
    <script type="text/javascript" src="ZeroClipboard.js"></script>

    <div id="d_clip_button" data-clipboard-text="Copy Me!">Copy To Clipboard</div>

    <script language="JavaScript">
      var clip = new ZeroClipboard( $('#d_clip_button') );

      clip.on( 'load', function(client) {
        // alert( "movie is loaded" );
      } );

      clip.on( 'complete', function(client, args) {
        alert("Copied text to clipboard: " + args.text );
      } );

      clip.on( 'mouseover', function(client) {
        // alert("mouse over");
      } );

      clip.on( 'mouseout', function(client) {
        // alert("mouse out");
      } );

      clip.on( 'mousedown', function(client) {

        // alert("mouse down");
      } );

      clip.on( 'mouseup', function(client) {
        // alert("mouse up");
      } );

    </script>
  </body>
  </html>
```


## AMD

If using [AMD](https://github.com/amdjs/amdjs-api/wiki/AMD) with a library such as [RequireJS](http://requirejs.org/), etc., you shouldn't need to do any special configuration for ZeroClipboard to work correctly as an AMD module.

However, in order to correctly dispatch events while using AMD, ZeroClipboard expects a [global `require` function](https://github.com/amdjs/amdjs-api/wiki/require) to exist. If you are using an AMD loader that does _not_ expose a global `require` function (e.g. curl.js), then you will need to add that function yourself. For example, with curl.js:

```js
window.require = curl;
```


## Browser Support

Works in IE7+ and all of the evergreen browsers.
