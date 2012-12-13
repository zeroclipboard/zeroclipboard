Zero Clipboard
==============

The Zero Clipboard library provides an easy way to copy text to the clipboard using an invisible [Adobe Flash](http://en.wikipedia.org/wiki/Adobe_Flash) movie, and a [JavaScript](http://en.wikipedia.org/wiki/JavaScript) interface. The "Zero" signifies that the library is invisible and the user interface is left entirely up to you.

See the [Instructions](ZeroClipboard/docs/instructions.md) for instructions on how to use the library on your site.

Here is a working [Test Page](http://jonrohan.github.com/ZeroClipboard/#demo) where you can try out ZeroClipboard in your browser.

### Testing this page locally

To test this page locally checkout the `gh-pages` branch and run `make`. This should open [localhost:3000](http://localhost:3000/)

### Support

This library is fully compatible with Flash Player 10, which requires that the clipboard copy operation be initiated by a user click event inside the Flash movie. This is achieved by automatically floating the invisible movie on top of a [DOM](http://en.wikipedia.org/wiki/Document_Object_Model) element of your choice. Standard mouse events are even propagated out to your DOM element, so you can still have rollover and mouse down effects.

Works in IE8+. Works in IE7 but requires Sizzle/jQuery. (And of course works in all of the other browsers.)

Contributing
==============

see [CONTRIBUTING.md](ZeroClipboard/CONTRIBUTING.md)

### Last Build

[![Build Status](https://secure.travis-ci.org/jonrohan/ZeroClipboard.png?branch=master)](https://travis-ci.org/jonrohan/ZeroClipboard)
