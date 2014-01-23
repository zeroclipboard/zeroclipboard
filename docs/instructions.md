# Overview

The *ZeroClipboard* JavaScript library provides an easy way to copy text to the clipboard using an invisible Adobe
Flash movie.  The "Zero" signifies that the library is invisible and the user interface is left entirely up to you.

Browsers won't let you access the clipboard directly. So this library puts a Flash object on the page to proxy the
clipboard for you. The library will move and resize over all the clipped objects.


## Installation

If you are installing for Node:

```shell
npm install zeroclipboard
```

If you are installing for the web, you can use Bower:

```shell
bower install zeroclipboard
```


## Setup

To use the library, simply include the following JavaScript file in your page:

```html
<script type="text/javascript" src="ZeroClipboard.js"></script>
```

You also need to have the "`ZeroClipboard.swf`" file available to the browser.  If this file is located in the same
directory as your web page, then it will work out of the box.  However, if the SWF file is hosted elsewhere, you need
to set the URL like this (place this code _after_ the script tag):

```js
ZeroClipboard.config( { moviePath: 'http://YOURSERVER/path/ZeroClipboard.swf' } );
```


## Clients

Now you are ready to create one or more _clients_.  A client is a single instance of the clipboard library on the page,
linked to one or more DOM elements. Here is how to create a client instance:

```js
var client = new ZeroClipboard();
```

You can also include an element or array of elements in the new client. _**This example uses jQuery to find "copy buttons"._

```js
var client = new ZeroClipboard($(".copy-button"));
```

Next, you can set some configuration options.


## Configuration Options

These are default values for the global configurations options. You should generally update these _before_ you create your clients.

```js
var _globalConfig = {
  // NOTE: For versions >= v1.3.x and < v2.x, you must use `swfPath` by setting `moviePath`:
  //   `ZeroClipboard.config({ moviePath: ZeroClipboard.config("swfPath") });`
  // URL to movie, relative to the page. Default value will be "ZeroClipboard.swf" under the
  // same path as the ZeroClipboard JS file.
  swfPath: "path/to/ZeroClipboard.swf",

  // SWF inbound scripting policy: page domains that the SWF should trust. (single string or array of strings)
  trustedDomains: [window.location.host],

  // Include a "nocache" query parameter on requests for the SWF
  cacheBust: true,

  // Forcibly set the hand cursor ("pointer") for all clipped elements
  forceHandCursor: false,

  // The z-index used by the Flash object. Max value (32-bit): 2147483647
  zIndex: 999999999,

  // Debug enabled: send `console` messages with deprecation warnings, etc.
  debug: true,

  // Sets the title of the `div` encapsulating the Flash object
  title: null,

  // Setting this to `false` would allow users to handle calling `ZeroClipboard.activate(...);`
  // themselves instead of relying on our per-element `mouseover` handler
  autoActivate: true,


  /** @deprecated */
  // The class used to indicate that a clipped element is being hovered over
  hoverClass: "zeroclipboard-is-hover",

  /** @deprecated */
  // The class used to indicate that a clipped element is active (is being clicked)
  activeClass: "zeroclipboard-is-active",

  /** @deprecated */
  // DEPRECATED!!! Use `trustedDomains` instead!
  // SWF inbound scripting policy: page origins that the SWF should trust. (single string or array of strings)
  trustedOrigins: null,

  /** @deprecated */
  // SWF outbound scripting policy. Possible values: "never", "sameDomain", "always"
  allowScriptAccess: null,

  /** @deprecated */
  // Include a "nocache" query parameter on requests for the SWF
  useNoCache: true,

  /** @deprecated */
  // URL to movie
  moviePath: "ZeroClipboard.swf"
};
```

You can override the defaults by making a call like `ZeroClipboard.config({ moviePath: "new/path" });` before you create any clients.

You can also set the options when creating a new client by passing an optional "options" object, e.g.  
```js
var client = new ZeroClipboard($("#d_clip_button"), { moviePath: "new/path" });`
```

However, this per-client options overriding is deprecated as of v1.3.0 and will be removed in v2.0.0.

Whenever possible, we recommend that you change the defaults rather than changing options per client. This works out
better in most situations as:
 1. Some options apply outside of `ZeroClipboard` instances, e.g. `debug` currently affects some static methods.
 2. If you have multiple clients clipped to a shared element, having per-client options can result in confusing effects
    when that shared element is being activated, e.g. differing values for `zIndex`, `forceHandCursor`, `hoverClass`,
    `activeClass`, etc.


### The `trustedDomains` option: SWF inbound scripting access

This allows other SWF files and HTML pages from the allowed domains to access/call publicly exposed ActionScript code,
e.g. functions shared via `ExternalInterface.addCallback`. In other words, it controls the SWF inbound scripting access.

If your ZeroClipboard SWF is served from a different origin/domain than your page, you need to tell the SWF that it's
OK to trust your page. The default value of `[window.location.host]` is almost _**always**_ what you will want unless
you specifically want the SWF to communicate with pages from other domains (e.g. in iframes or child windows).

For more information about trusted domains, consult the _[official Flash documentation for `flash.system.Security.allowDomain(...)`](http://help.adobe.com/en_US/FlashPlatform/reference/actionscript/3/flash/system/Security.html#allowDomain\(\))_.


### The `allowScriptAccess` option: SWF outbound scripting access

This allows the SWF file to access/call JavaScript/HTML functionality of HTML pages on allowed domains, e.g. invoking
functions via `ExternalInterface.call`. In other words, it controls the SWF outbound scripting access.

For version 1.1.7 and below, the `embed` tag had the `allowScriptAccess` parameter hard-coded to `always`. This allowed
the "`ZeroClipboard.swf`" file to be hosted on an external domain. However, to enhance security, versions after 1.1.7
have an option for `allowScriptAccess` with a default of `"sameDomain"`, which only allows "`ZeroClipboard.swf`" to be
served from the same domain as the hosting page.

If you hosted "`ZeroClipboard.swf`" on a different domain than the hosting page on version 1.1.7 or below, when you upgrade
to a version above 1.1.7, you should either move "`ZeroClipboard.swf`" to the same domain as the hosting page or set the
`allowScriptAccess` option to `always`.

As of version 1.3.0, it is no longer necessary to set the `allowScriptAccess` configuration option as its default value
is now `null` but the appropriate value will be determined immediately before the Flash object is embedded on the page.
The value is based on a relationship between the current domain (`window.location.host`) and the value of the
`trustedDomains` configuration option.

**TL;DR default values:**
 - &ge; v1.3.0: `null` _(appropriate value determined on-the-fly during embedding)_
 - &gt; v1.1.7 &lt; v1.3.0: `"sameDomain"`
 - &le; v1.1.7: `"always"`

For more information about `allowScriptAccess`, consult the _[official Flash documentation](http://helpx.adobe.com/flash/kb/control-access-scripts-host-web.html)_.


### Cross-Protocol Limitations

ZeroClipboard was intentionally configured to _not_ allow the SWF to be served from a secure domain (HTTPS) but scripted by an insecure domain (HTTP).

If you find yourself in this situation (as in [Issue #170](https://github.com/zeroclipboard/ZeroClipboard/issues/170)), please consider the following options:  
 1. Serve the SWF over HTTP instead of HTTPS. If the page's protocol can vary (e.g. authorized/unauthorized, staging/production, etc.), you should include add the SWF with a relative protocol (`//s3.amazonaws.com/blah/ZeroClipboard.swf`) instead of an absolute protocol (`https://s3.amazonaws.com/blah/ZeroClipboard.swf`).
 2. Serve the page over HTTPS instead of HTTP. If the page's protocol can vary, see the note on the previous option (1).
 3. Update ZeroClipboard's ActionScript codebase to call the [`allowInsecureDomain`](http://help.adobe.com/en_US/FlashPlatform/reference/actionscript/3/flash/system/Security.html#allowInsecureDomain\(\)) method, then recompile the SWF with your custom changes.


### Text To Copy

Setting the clipboard text can be done in 4 ways:

1. Add a `dataRequested` event handler in which you call `client.setText` to set the appropriate text. This event is triggered every time ZeroClipboard tries to inject into the clipboard. Example:

   ```js
   client.on( 'dataRequested', function (client, args) {
      client.setText( "Copy me!" );
   });
   ```

2. Set the text via `data-clipboard-target` attribute on the button. ZeroClipboard will look for the target element via ID and try and get the text value via `.value` or `.textContent` or `.innerText`.

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

3. Set the text via `data-clipboard-text` attribute on the button. Doing this will let ZeroClipboard take care of the rest.

  ```html
  <button id="my-button" data-clipboard-text="Copy me!">Copy to Clipboard</button>
  ```

4. Set the text via `client.setText` property.  You can call this function at any time; when the page first loads, or later like in a `dataRequested` event handler.  Example:

  ```js
  client.setText( "Copy me!" );
  ```
  
  The important caveat of using `client.setText` is that the text it sets is **transient** and _will only be used for a single copy operation_. As such, we do not particularly
  recommend using `client.setText` other than inside of a `dataRequested` event handler; however, the API will not prevent you from using it in other ways.


### Clipping

Clipping refers to the process of "linking" the Flash movie to a DOM element on the page. Since the Flash movie is completely transparent, the user sees nothing out of the ordinary.

The Flash movie receives the click event and copies the text to the clipboard.  Also, mouse actions like hovering and mouse-down generate events that you can capture (see *[Event Handlers](#event-handlers)* below).

To clip elements, you must pass an element, or array of elements to the `clip` function.

Here is how to clip your client library instance to a DOM element:

```js
client.clip( document.getElementById('d_clip_button') );
```

You can pass in a reference to the actual DOM element object itself or an array of DOM objects.  The rest all happens automatically -- the movie is created, all your options set, and it is floated above the element, awaiting clicks from the user.


### Example Implementation

```html
<button id="my-button" data-clipboard-text="Copy me!" title="Click to copy to clipboard.">Copy to Clipboard</button>
```

And the code:

```js
var client = new ZeroClipboard( $("button#my-button") );
```


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
client.on( 'load', my_load_handler );
```

The first argument is the name of the event, and the second is a reference to your function.  The function may be passed by name (string) or an actual reference to the function object

Your custom function will be passed at least one argument -- a reference to the clipboard client object.  However, certain events pass additional arguments, which are described in each section below.  The following subsections describe all the available events you can hook.

Event handlers can be removed by calling the `off()` method, which has the same method signature as `on()`:

```js
client.off( 'load', my_load_handler );
```


#### load

The `load` event is fired when the Flash movie completes loading and is ready for action.  Please note that you don't need to listen for this event to set options -- those are automatically passed to the movie if you call them before it loads.  Example use:

```js
client.on( 'load', function ( client, args ) {
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
client.on( 'mouseover', function ( client, args ) {
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
client.on( 'mouseout', function ( client, args ) {
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
client.on( 'mousedown', function ( client, args ) {
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
client.on( 'mouseup', function ( client, args ) {
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
client.on( 'complete', function ( client, args ) {
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
client.on( 'noflash', function ( client, args ) {
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
client.on( 'wrongflash', function ( client, args ) {
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

On mousedown, the Flash object will check and see if the clipboard text has been set. If it hasn't, then it will fire off a `dataRequested` event. If the html object has `data-clipboard-text` or `data-clipboard-target` then ZeroClipboard will take care of getting the data. However if it hasn't been set, then it will be up to you to `client.setText` from that method. Which will complete the loop.

```js
client.on( 'dataRequested', function ( client, args ) {
  client.setText( 'Copied to clipboard.' );
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
    <script type="text/javascript">
      var client = new ZeroClipboard( document.getElementById('d_clip_button') );
    </script>
  </body>
  </html>
```

When clicked, the text "Copy me!" will be copied to the clipboard.


### Complete Example

Here is a more complete example which exercises many of the configuration options and event handlers:

```html
<html>
  <head>
    <style type="text/css">
      .clip_button {
        text-align: center;
        border: 1px solid black;
        background-color: #ccc;
        margin: 10px;
        padding: 10px;
      }
      .clip_button.zeroclipboard-is-hover { background-color: #eee; }
      .clip_button.zeroclipboard-is-active { background-color: #aaa; }
    </style>
  </head>
  <body>
    <script type="text/javascript" src="//ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js"></script>
    <script type="text/javascript" src="ZeroClipboard.js"></script>

    <div class="clip_button">Copy To Clipboard</div>
    <div class="clip_button">Copy This Too!</div>

    <script type="text/javascript">
      var client = new ZeroClipboard( $('.clip_button') );

      client.on( 'load', function(client) {
        // alert( "movie is loaded" );

        client.on( 'datarequested', function(client) {
          client.setText(this.innerHTML);
        } );

        client.on( 'complete', function(client, args) {
          alert("Copied text to clipboard: " + args.text );
        } );
      } );

      client.on( 'wrongflash noflash', function() {
        ZeroClipboard.destroy();
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


## Known Conflicts With Other Libraries

### [IE freezes when clicking a ZeroClipboard clipped element within a Bootstrap Modal](https://github.com/zeroclipboard/zeroclipboard/issues/159).
 - **Cause:** Bootstrap's Modal has an `enforceFocus` function that tries to keep the focus on the modal.
   However, since the ZeroClipboard container is an immediate child of the `body`, this enforcement conflicts. Note that
   this workaround actually _overrides_ a core Bootstrap Modal function, and as such must be kept in sync as this function
   changes in future versions of Bootstrap.
 - **Workaround:** _Targeted against [Bootstrap v3.x](https://github.com/twbs/bootstrap/blob/96a9e1bae06cb21f8cf72ec528b8e31b6ab27272/js/modal.js#L115-123)._

```js
(function($) {
  var proto = $.fn.modal.Constructor.prototype;
  proto.enforceFocus = function () {
    $(document)
      .off('focusin.bs.modal') // guard against infinite focus loop
      .on('focusin.bs.modal', $.proxy(function (e) {
        if (this.$element[0] !== e.target &&
           !this.$element.has(e.target).length &&
           /* Adding this final condition check is the only real change */
           !$(e.target).closest('.global-zeroclipboard-container').length) {
          this.$element.focus()
        }
      }, this))
  };
})(window.jQuery);
```

### [IE freezes when clicking a ZeroClipboard clipped element within a jQuery UI [Modal] Dialog](https://github.com/zeroclipboard/zeroclipboard/issues/159).
 - **Cause:** jQuery UI's Dialog (with `{ modal: true }` set) has a `_keepFocus` function that tries to keep the focus on the modal.
   However, since the ZeroClipboard container is an immediate child of the `body`, this enforcement conflicts. Luckily, jQuery UI offers
   more natural extension points than Bootstrap, so the workaround is smaller and less likely to be broken in future versions.
 - **Workaround:** _Targeted against [jQuery UI v1.10.x](https://github.com/jquery/jquery-ui/blob/457b275880b63b05b16b7c9ee6c22f29f682ebc8/ui/jquery.ui.dialog.js#L695-703)._

```js
(function($) {
  $.widget( "ui.dialog", $.ui.dialog, {
    _allowInteraction: function( event ) {
      return this._super() || $( event.target ).closest( ".global-zeroclipboard-container" ).length;
    }
  } );
})(window.jQuery);
```


## Browser Support

Works in IE7+ and all of the evergreen browsers.


## OS Considerations

Because ZeroClipboard will be interacting with your users' system clipboards, there are some special considerations
specific to the users' operating systems that you should be aware of. With this information, you can make informed
decisions of how _your_ site should handle each of these situations.

 - **Windows:**
     - If you want to ensure that your Windows users will be able to paste their copied text into Windows
       Notepad and have it honor line breaks, you'll need to ensure that the text uses the sequence `\r\n` instead of
       just `\n` for line breaks.  If the text to copy is based on user input (e.g. a `textarea`), then you can achieve
       this transformation by utilizing the `dataRequested` event handler, e.g.  

      ```js
      client.on('dataRequested', function(client, args) {
          var text = document.getElementById('yourTextArea').value;
          var windowsText = text.replace(/\n/g, '\r\n');
          client.setText(windowsText);
      });
      ```



# Deprecations

By default, ZeroClipboard will issue deprecation warnings to the developer `console`. To disable this, set the
following option:  
```js
ZeroClipboard.config({ debug: false });`
```

The current list of deprecations includes:  
 - `ZeroClipboard.prototype.setHandCursor` &rarr; as of [v1.2.0], removing in [v2.0.0]
     - Use the `forceHandCursor` config option instead!
 - `ZeroClipboard.prototype.reposition` &rarr; as of [v1.2.0], removing in [v2.0.0]
     - Repositioning is now handled more intelligently internally, so this method is simply no longer needed by users.
 - `ZeroClipboard.prototype.receiveEvent` &rarr; as of [v1.2.0], removing in [v2.0.0]
     - This should only be used internally, so this method will be removed from the public API.
 - `ZeroClipboard.detectFlashSupport` &rarr; as of [v1.2.0], removing in [v2.0.0]
     - This should only be used internally, so this method will be removed from the public API.
 - The `hoverClass` config option &rarr; as of [v1.3.0], removing in [v2.0.0]
     - As of [v2.0.0] (but no sooner), you will be able to use normal `:hover` CSS pseudo-class selectors instead!
 - The `activeClass` config option &rarr; as of [v1.3.0], removing in [v2.0.0]
     - As of [v2.0.0] (but no sooner), you will be able to use normal `:active` CSS pseudo-class selectors instead!
 - The `trustedOrigins` config option &rarr; as of [v1.3.0], removing in [v2.0.0]
     - Use the `trustedDomains` config option instead!
 - The `allowScriptAccess` config option &rarr; as of [v1.3.0], removing in [v2.0.0]
     - The correct value can be intelligently calculated internally, so this option is simply no longer needed by users.
 - `new ZeroClipboard(elements, options)` &rarr; as of [v1.3.0], removing in [v2.0.0]
     - Most options actually have a global effect rather than a per-client effect, so we are removing the ability to
       customize options per-client to help avoid confusion. The constructor `new ZeroClipboard(elements)` will remain.
 - `ZeroClipboard.prototype.addEventListener` &rarr; as of [v1.3.0], removing in [v2.0.0]
     - Use `ZeroClipboard.prototype.on` instead!
 - `ZeroClipboard.prototype.removeEventListener` &rarr; as of [v1.3.0], removing in [v2.0.0]
     - Use `ZeroClipboard.prototype.off` instead!
 - `ZeroClipboard.prototype.setCurrent` &rarr; as of [v1.3.0], removing in [v2.0.0]
     - Use `ZeroClipboard.activate` instead!
 - `ZeroClipboard.prototype.resetBridge` &rarr; as of [v1.3.0], removing in [v2.0.0]
     - Use `ZeroClipboard.deactivate` instead!
 - `ZeroClipboard.prototype.setTitle` &rarr; as of [v1.3.0], removing in [v2.0.0]
     - Use the `title` config option instead!
 - `ZeroClipboard.setDefaults` &rarr; as of [v1.3.0], removing in [v2.0.0]
     - Use `ZeroClipboard.config` instead!
 - `ZeroClipboard#handlers` &rarr; as of [v1.3.0], removed in [v1.3.0]
     - Use the `ZeroClipboard.prototype.handlers` method instead!
 - `ZeroClipboard.prototype.ready` &rarr; as of [v1.3.0], removing in [v2.0.0]
     - For v1.x, use the `ZeroClipboard.prototype.on("load", ...);` instead!
     - For v2.x, use the `ZeroClipboard.prototype.on("ready", ...);` instead!
 - `ZeroClipboard.prototype.glue` &rarr; as of [v1.3.0], removing in [v2.0.0]
     - Use `ZeroClipboard.prototype.clip` instead!
 - `ZeroClipboard.prototype.unglue` &rarr; as of [v1.3.0], removing in [v2.0.0]
     - Use `ZeroClipboard.prototype.unclip` instead!
 - The `useNoCache` config option &rarr; as of [v1.3.0], removing in [v2.0.0]
     - Use the `cacheBust` config option instead!
 - The `moviePath` config option &rarr; as of [v1.3.0], removing in [v2.0.0]
     - Use the `swfPath` config option instead!
     - For v1.3.x usage, do: `ZeroClipboard.config({ moviePath: ZeroClipboard.config("swfPath") });`
 - `ZeroClipboard.dispatch` &rarr; as of [v1.3.0], removing in [v2.0.0]
     - Use `ZeroClipboard.emit` instead!
 - All v1.x event names &rarr; as of [v1.3.0], removing in [v2.0.0]
     - Use the [v2.x event names](https://gist.github.com/JamesMGreene/7886534#events) instead!
 - The v1.x event model &rarr; as of [v1.3.0], removing in [v2.0.0]
     - Use the [v2.x event model (based on the DOM event model)](https://gist.github.com/JamesMGreene/7886534#event-handler-format) instead!