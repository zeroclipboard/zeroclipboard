package {

  import flash.display.Stage;
  import flash.display.Sprite;
  import flash.display.LoaderInfo;
  import flash.events.*;
  import flash.external.ExternalInterface;
  import flash.net.URLVariables;
  import flash.system.Capabilities;
  import flash.utils.*;

  // ZeroClipboard
  //
  // The ZeroClipboard class creates a simple sprite button that will put
  // text in your clipboard when clicked
  //
  // returns nothing
  public class ZeroClipboard extends Sprite {

    // CONSTANTS
    // Function through which JavaScript events are dispatched normally
    private static const NORMAL_DISPATCHER:String = "ZeroClipboard.dispatch";

    // Function through which JavaScript events are dispatched if using an AMD/CommonJS module loader
    private static const JS_MODULE_WRAPPED_DISPATCHER:String =
      "(function (event, args, jsModuleId) {\n" +
      "  var ZeroClipboard = require(jsModuleId);\n" +
      "  ZeroClipboard.dispatch(event, args);\n" +
      "})";


    // The button sprite
    private var button:Sprite;

    // The text in the clipboard
    private var clipText:String = "";

    // AMD or CommonJS module ID/path to access the ZeroClipboard object
    private var jsModuleId:String = null;

    // constructor, setup event listeners and external interfaces
    public function ZeroClipboard() {

      // Align the stage to top left
      stage.align = "TL";
      stage.scaleMode = "noScale";

      // Get the FlashVars, filtering out all URL query parameters
      var loaderInfo:LoaderInfo = LoaderInfo(this.root.loaderInfo);
      var flashVars:Object = ZeroClipboard.getFlashVars(loaderInfo.parameters, loaderInfo.url);

      // Allow the SWF object to communicate with a page on a different origin than its own (e.g. SWF served from CDN)
      if (flashVars.trustedOrigins && typeof flashVars.trustedOrigins === "string") {
        var origins:Array = flashVars.trustedOrigins.split(",");
        flash.system.Security.allowDomain.apply(null, origins);
      }

      // Enable complete AMD (e.g. RequireJS) and CommonJS (e.g. Browserify) support
      if (flashVars.jsModuleId && typeof flashVars.jsModuleId === "string") {
        jsModuleId = flashVars.jsModuleId;
      }

      // invisible button covers entire stage
      button = new Sprite();
      button.buttonMode = true;
      button.useHandCursor = false;
      button.graphics.beginFill(0xCCFF00);
      button.graphics.drawRect(0, 0, stage.stageWidth, stage.stageHeight);
      button.alpha = 0.0;
      addChild(button);

      // Adding the event listeners
      button.addEventListener(MouseEvent.CLICK, mouseClick);
      button.addEventListener(MouseEvent.MOUSE_OVER, mouseOver);
      button.addEventListener(MouseEvent.MOUSE_OUT, mouseOut);
      button.addEventListener(MouseEvent.MOUSE_DOWN, mouseDown);
      button.addEventListener(MouseEvent.MOUSE_UP, mouseUp);

      // external functions
      ExternalInterface.addCallback("setHandCursor", setHandCursor);
      ExternalInterface.addCallback("setText", setText);
      ExternalInterface.addCallback("setSize", setSize);

      // signal to the browser that we are ready
      dispatch("load", ZeroClipboard.metaData());
    }

    // sanitizeString
    //
    // This private function will accept a string, and return a sanitized string
    // to avoid XSS vulnerabilities
    //
    // returns an XSS safe String
    private static function sanitizeString(dirty:String): String {
      return dirty.replace(/\\/g,"\\\\")
    }

    // mouseClick
    //
    // The mouseClick private function handles clearing the clipboard, and
    // setting new clip text. It gets this from the clipText private variable.
    // Once the text has been placed in the clipboard, It then signals to the
    // Javascript that it is done.
    //
    // returns nothing
    private function mouseClick(event:MouseEvent): void {

      // Linux currently doesn't use the correct clipboard buffer with the new
      // Flash 10 API, so we need to use this until we can figure out an alternative
      flash.system.System.setClipboard(clipText);

      // signal to the page it is done
      dispatch("complete", ZeroClipboard.metaData(event, {
        text: ZeroClipboard.sanitizeString(clipText)
      }));

      // reset the text
      clipText = "";
    }

    // mouseOver
    //
    // The mouseOver function signals to the page that the button is being hovered.
    //
    // returns nothing
    private function mouseOver(event:MouseEvent): void {
      dispatch("mouseOver", ZeroClipboard.metaData(event));
    }

    // mouseOut
    //
    // The mouseOut function signals to the page that the button is not being hovered.
    //
    // returns nothing
    private function mouseOut(event:MouseEvent): void {
      dispatch("mouseOut", ZeroClipboard.metaData(event));
    }

    // mouseDown
    //
    // The mouseDown function signals to the page that the button has a mouse button down.
    //
    // returns nothing
    private function mouseDown(event:MouseEvent): void {
      dispatch("mouseDown", ZeroClipboard.metaData(event));

      // if the clipText hasn't been set
      if (!clipText) {
        // request data from the page
        dispatch("dataRequested", ZeroClipboard.metaData(event));
      }
    }

    // mouseUp
    //
    // The mouseUp function signals to the page that the mouse button has been lifted
    //
    // returns nothing
    private function mouseUp(event:MouseEvent): void {
      dispatch("mouseUp", ZeroClipboard.metaData(event));
    }

    // setText
    //
    // setText gets the clipboard text to be copied from the javascript.
    //
    // returns nothing
    public function setText(newText:String): void {
      // set the maximum number of files allowed
      clipText = newText;
    }

    // setHandCursor
    //
    // setHandCursor will make the button cursor be a hand on hover.
    //
    // returns nothing
    public function setHandCursor(enabled:Boolean): void {
      button.useHandCursor = enabled;
    }

    // setSize
    //
    // Sets the size of the button to equal the size of the hovered object.
    //
    // returns nothing
    public function setSize(width:Number, height:Number): void {
      button.width = width;
      button.height = height;
    }

    // dispatch
    //
    // Function through which JavaScript events are dispatched
    //
    // returns nothing
    private function dispatch(eventName:String, eventArgs:Object): void {
      if (jsModuleId) {
        ExternalInterface.call(ZeroClipboard.JS_MODULE_WRAPPED_DISPATCHER, eventName, eventArgs, jsModuleId);
      }
      else {
        ExternalInterface.call(ZeroClipboard.NORMAL_DISPATCHER, eventName, eventArgs);
      }
    }

    // metaData
    //
    // The metaData function will take a mouseEvent, and an extra object to
    // create a meta object of more info. This will let the page know if
    // certain modifier keys are down
    //
    // returns an Object of extra event data
    private static function metaData(event:MouseEvent = void, extra:Object = void):Object {

      // create the default options, contains flash version
      var normalOptions:Object = {
        flashVersion: Capabilities.version
      };

      // if an event is passed in, return what modifier keys are pressed
      if (event) {
        normalOptions.altKey = event.altKey;
        normalOptions.ctrlKey = event.ctrlKey;
        normalOptions.shiftKey = event.shiftKey;
      }

      // for everything in the extra object, add it to the normal options
      for (var i:String in extra) {
        normalOptions[i] = extra[i];
      }

      return normalOptions;
    }

    // parseQuery
    //
    // Parse a URL's query string into a hash map object
    //
    // returns Object (hash map of query string)
    private static function parseQuery(url:String): Object {
      var query:Object = null;
      if (url) {
        url = url.split("?").slice(1).join("?");
        if (url) {
          query = new URLVariables(url);
        }
      }
      return query;
    }

    // getFlashVars
    // 
    // Does a symmetric "except" (non-intersect) to filter query params from the `LoaderInfo.parameters`, leaving only FlashVars.
    //
    // returns Object (the actual FlashVars)
    private static function getFlashVars(loaderInfoParameters:Object, swfUrl:String): Object {
      var flashVars:Object = {};
      var queryParams:Object = ZeroClipboard.parseQuery(swfUrl);
      if (queryParams) {
        for (var key:String in loaderInfoParameters) {
          if (loaderInfoParameters.hasOwnProperty(key)) {
            var value:String = ZeroClipboard.sanitizeString(loaderInfoParameters[key] as String);
            if (!(queryParams.hasOwnProperty(key) && ZeroClipboard.sanitizeString(queryParams[key]) === value)) {
              flashVars[key] = value;
            }
          }
        }
      }
      return flashVars;
    }
  }
}
