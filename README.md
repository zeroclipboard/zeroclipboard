Zero Clipboard
==============

The Zero Clipboard library provides an easy way to copy text to the clipboard using an invisible [Adobe Flash](http://en.wikipedia.org/wiki/Adobe_Flash) movie, and a [JavaScript](http://en.wikipedia.org/wiki/JavaScript) interface. The "Zero" signifies that the library is invisible and the user interface is left entirely up to you.

## Simple Example

``` html
<html>
  <body>
    <!-- The "copy-button" *should* be inside a div with "position: relative"
         or something else that "has layout". -->
    <div style="position: relative;">
      <button id="copy-button">Copy to Clipboard</button>
    </div>
    <script src="ZeroClipboard.js"></script>
    <script src="main.js"></script>
  </body>
</html>
```

``` js
// main.js
var clip = new ZeroClipboard.Client();

clip.setText( '' ); // will be set later on mouseDown
clip.setHandCursor( true );
clip.setCSSEffects( true );

clip.addEventListener( 'onLoad', function(client) {
  // alert( "movie is loaded" );
} );

clip.addEventListener( 'onComplete', function(client, text) {
  alert("Copied text to clipboard: " + text );
} );

clip.addEventListener( 'onMouseOver', function(client) {
  // alert("mouse over");
} );

clip.addEventListener( 'onMouseOut', function(client) {
  // alert("mouse out");
} );

clip.addEventListener( 'onMouseDown', function(client) {
  // set text to copy here
  clip.setText( "This was copied." );

  // alert("mouse down");
} );

clip.addEventListener( 'onMouseUp', function(client) {
  // alert("mouse up");
} );

clip.glue( 'copy-button' );
```

See the [instructions](ZeroClipboard/blob/master/docs/instructions.md) for advanced instructions on how to use the library on your site.

Here is a working [test page](http://jonrohan.github.com/ZeroClipboard/#demo) where you can try out ZeroClipboard in your browser.

## Testing ZeroClipboard.swf Locally

To test the page [demo page](http://jonrohan.github.com/ZeroClipboard/#demo) locally. checkout the `gh-pages` branch and run `make`. This should open [localhost:3000](http://localhost:3000/)

```
git co gh-pages
make
```
add `BRANCH=my-dev-branch` to get the assets from a certain branch

```
git co gh-pages
make BRANCH=my-dev-branch
```

## Support

This library is fully compatible with Flash Player 10, which requires that the clipboard copy operation be initiated by a user click event inside the Flash movie. This is achieved by automatically floating the invisible movie on top of a [DOM](http://en.wikipedia.org/wiki/Document_Object_Model) element of your choice. Standard mouse events are even propagated out to your DOM element, so you can still have rollover and mouse down effects.

Works in IE8+. Works in IE7 but requires Sizzle/jQuery. (And of course works in all of the other browsers.)

## Contributing

see [CONTRIBUTING.md](ZeroClipboard/blob/master/CONTRIBUTING.md)

## Last Build

[![Build Status](https://secure.travis-ci.org/jonrohan/ZeroClipboard.png?branch=master)](https://travis-ci.org/jonrohan/ZeroClipboard)
