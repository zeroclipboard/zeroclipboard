Zero Clipboard

The Zero Clipboard library provides an easy way to copy text to the clipboard using an invisible Adobe Flash movie, and a JavaScript interface. The "Zero" signifies that the library is invisible and the user interface is left entirely up to you.

This library is fully compatible with Flash Player 10, which requires that the clipboard copy operation be initiated by a user click event inside the Flash movie. This is achieved by automatically floating the invisible movie on top of a DOM element of your choice. Standard mouse events are even propagated out to your DOM element, so you can still have rollover and mouse down effects.

See the Instructions Wiki for instructions on how to use the library on your site.

Here is a working Test Page where you can try out ZeroClipboard in your browser.

Here is another test page showing how you can use the same ZeroClipboard object to handle multiple elements of the same size. (jQuery is also used in this example.)

Zero Clipboard 1.0.7 Released
Zero Clipboard 1.0.7 can now copy Rich HTML to the clipboard. When this is pasted into an application that supports rich text, it will show up as fully rendered HTML (not the source that was copied). Since this feature only works in Flash Player 10, it is opt-in, and must be specifically enabled in your code. See the updated Instructions wiki for details. Thanks to jpp at cloudview for the patch!

Here is a new Test Page which shows an example implementation.

Zero Clipboard 1.0.5 Released
Zero Clipboard 1.0.5 can now glue the Flash movie to a relatively positioned parent element (instead of the page body), resulting in perfect positioning of the movie on top of your copy button. This also allows you to use Zero Clipboard inside overflow:auto or position:fixed elements.

See this New Test Page for a working example.

The Instructions Wiki has been updated with details on how to use the new feature. The API is 100% backward compatible with previous versions.

Zero Clipboard Does Not Work From Local Disk
This is a security restriction by Adobe Flash Player. Unfortunately, since we are utilizing the JavaScript-to-Flash interface ("ExternalInterface") this only works while truly online (if the page URL starts with "http://" or "https://"). It won't work running from a local file on disk.

However, there is a way for you to edit your local Flash Player security settings and allow this. Go to this website:

http://www.macromedia.com/support/documentation/en/flashplayer/help/settings_manager04a.html

And add the path to your local "ZeroClipboard.swf" file to the trusted files list, or try the "allow all" option.