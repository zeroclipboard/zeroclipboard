### ZeroClipboard 1.1.4

To the future, 1.1.4 will address any bugs from the previous release.

* [SECURITY] Removing `flash.system.Security.allowDomain("*");` default. now should be set via flashvars.
* [SECURITY] XSS Vunerability, the clipText returned from the flash object needs to be escaped.

### ZeroClipboard 1.1.1, 1.1.2, 1.1.3

Emergency bug release.

* [BUG] IE6/7/8 mouseup and mousedown bug. Events weren't being registered properly #55

### ZeroClipboard 1.1.0

This release re-writes a lot of how zeroclipboard client works. Check the docs for more details.

* [FEATURE] Replace dom selector with simple sizzler query selector
* [FEATURE] Indicate via an event when there is no flash or flash is wrong version
* [FEATURE] More meta info passed with each flash event.
* [FEATURE] Register more than one event `.on("load complete", function() {})`
* [FEATURE] Event handlers can now access the clicked element via `this`
* [BUG] setText doesn't override the default data-clipboard-text attribute.
* [BUG] When creating more than one clip, the second clip doesn't glue.
* [BUG] If there is no currentElement return from reposition #51
* [BUG] ready() wasn't returning false when bridge wasn't ready.

### ZeroClipboard 1.0.9

* [FEATURE] Use `data-clipboard-text` as default text #35
* [FEATURE] When object contains `title` use put that title on swf object #15 #25
* [CHORE] Bower component file
* [CHORE] Makefile for building
* [CHORE] Unit tests with nodeunit and jsdom
* [CHORE] Build scripts
* [BUG] IE8 "Object doesn't support this property" #19

### ZeroClipboard 1.0.8

This version was the first version under new management. Most of what occurred was re-organization and cleaning. But here are some bugs fixed.

* [FEATURE] Vaadin plugin updates #4
* [FEATURE] Adding module export ability #8 #9
* [CHORE] Npm package install ce7b514f9f650f54e8cec0ef52457424e41edc71
* [BUG] XSS Vunerability #2
* [BUG] Fix swf position #16

### Zero Clipboard 1.0.7 Released

Zero Clipboard 1.0.7 can now copy **Rich HTML** to the clipboard. When this is pasted into an application that supports rich text, it will show up as fully rendered HTML (not the source that was copied). Since this feature only works in Flash Player 10, it is opt-in, and must be specifically enabled in your code. See the updated [Instructions](https://github.com/jonrohan/ZeroClipboard/blob/master/docs/instructions.md) for details. Thanks to jpp at cloudview for the patch!

### Zero Clipboard 1.0.5 Released

Zero Clipboard 1.0.5 can now glue the Flash movie to a relatively positioned parent element (instead of the page body), resulting in perfect positioning of the movie on top of your copy button. This also allows you to use Zero Clipboard inside overflow:auto or position:fixed elements.

The [Instructions](https://github.com/jonrohan/ZeroClipboard/blob/master/docs/instructions.md) have been updated with details on how to use the new feature. The API is 100% backward compatible with previous versions.

