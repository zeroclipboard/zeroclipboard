# ZeroClipboard

The ZeroClipboard library provides an easy way to copy text to the clipboard using an invisible [Adobe Flash](http://en.wikipedia.org/wiki/Adobe_Flash) movie and a [JavaScript](http://en.wikipedia.org/wiki/JavaScript) interface. The "Zero" signifies that the library is invisible and the user interface is left entirely up to you.


## Simple Example

``` html
<html>
  <body>
    <button id="copy-button" data-clipboard-text="Copy Me!" title="Click to copy me.">Copy to Clipboard</button>
    <script src="ZeroClipboard.js"></script>
    <script src="main.js"></script>
  </body>
</html>
```

``` js
// main.js
var client = new ZeroClipboard( document.getElementById("copy-button"), {
  moviePath: "/path/to/ZeroClipboard.swf"
} );

client.on( "load", function(client) {
  // alert( "movie is loaded" );

  client.on( "complete", function(client, args) {
    // `this` is the element that was clicked
    this.style.display = "none";
    alert("Copied text to clipboard: " + args.text );
  } );
} );
```

See the [instructions](docs/instructions.md) for more advanced options in using the library on your site.

Here is a working [test page](http://zeroclipboard.org/#demo) where you can try out ZeroClipboard in your browser.


## Testing ZeroClipboard Locally

To test the page [demo page](http://zeroclipboard.org/#demo) locally, clone the [website repo](https://github.com/zeroclipboard/zeroclipboard.org).


## Support

This library is fully compatible with Flash Player 10, which requires that the clipboard copy operation be initiated by a user click event inside the Flash movie. This is achieved by automatically floating the invisible movie on top of a [DOM](http://en.wikipedia.org/wiki/Document_Object_Model) element of your choice. Standard mouse events are even propagated out to your DOM element, so you can still have rollover and mouse down effects.

Works in IE7+ and all of the evergreen browsers.


## Contributing

see [CONTRIBUTING.md](CONTRIBUTING.md)


## Releases

Starting with version [1.1.7](https://github.com/zeroclipboard/zeroclipboard/releases/tag/v1.1.7), ZeroClipboard uses [semantic versioning](http://semver.org/).

see [releases](https://github.com/zeroclipboard/zeroclipboard/releases)


## Roadmap

see [roadmap.md](docs/roadmap.md)


## Last Build

[![Build Status](https://secure.travis-ci.org/zeroclipboard/zeroclipboard.png?branch=master)](https://travis-ci.org/zeroclipboard/zeroclipboard)
