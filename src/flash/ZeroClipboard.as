package {

  import flash.display.Stage;
  import flash.display.Sprite;
  import flash.display.LoaderInfo;
  import flash.events.*;
  import flash.external.ExternalInterface;
  import flash.utils.*;
  import flash.system.Capabilities;

  // ZeroClipboard
  //
  // The ZeroClipboard class creates a simple sprite button that will put
  // text in your clipboard when clicked
  //
  // returns nothing
  public class ZeroClipboard extends Sprite {

    // CONSTANTS
    // Function through which JavaScript events are emitted normally
    private static const NORMAL_EMITTER:String = "ZeroClipboard.emit";

    // Function through which JavaScript events are emitted if using an AMD/CommonJS module loader
    private static const JS_MODULE_WRAPPED_EMITTER:String =
      "(function (eventObj, jsModuleId) {\n" +
      "  var ZeroClipboard = require(jsModuleId);\n" +
      "  return " + ZeroClipboard.NORMAL_EMITTER + "(eventObj);\n" +
      "})";


    // The button sprite
    private var button:Sprite;

    // The text in the clipboard
    private var clipData:Object = {};

    // AMD or CommonJS module ID/path to access the ZeroClipboard object
    private var jsModuleId:String = null;

    // constructor, setup event listeners and external interfaces
    public function ZeroClipboard() {

      // Align the stage to top left
      stage.align = "TL";
      stage.scaleMode = "noScale";

      // Get the flashvars
      var flashvars:Object = LoaderInfo( this.root.loaderInfo ).parameters;

      // Allow the SWF object to communicate with a page on a different origin than its own (e.g. SWF served from CDN)
      if (flashvars.trustedOrigins && typeof flashvars.trustedOrigins === "string") {
        var origins:Array = ZeroClipboard.sanitizeString(flashvars.trustedOrigins).split(",");
        flash.system.Security.allowDomain.apply(null, origins);
      }

      // Enable complete AMD (e.g. RequireJS) and CommonJS (e.g. Browserify) support
      if (flashvars.jsModuleId && typeof flashvars.jsModuleId === "string") {
        jsModuleId = ZeroClipboard.sanitizeString(flashvars.jsModuleId);
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
      ExternalInterface.addCallback("setSize", setSize);

      // signal to the browser that we are ready
      emit("ready", null);
    }

    // sanitizeString
    //
    // This private function will accept a string, and return a sanitized string
    // to avoid XSS vulnerabilities
    //
    // returns an XSS safe String
    private static function sanitizeString(dirty:String): String {
      return dirty.replace(/\\/g, "\\\\");
    }

    // mouseClick
    //
    // The mouseClick private function handles clearing the clipboard, and
    // setting new clip text. It gets this from the clipData private variable.
    // Once the text has been placed in the clipboard, It then signals to the
    // Javascript that it is done.
    //
    // returns nothing
    private function mouseClick(event:MouseEvent): void {

      // Linux currently doesn't use the correct clipboard buffer with the new
      // Flash 10 API, so we need to use this until we can figure out an alternative
      var success:Boolean = true;
      try {
        flash.system.System.setClipboard(clipData["text/plain"]);
      }
      catch (e:Error) {
        success = false;
      }

      // Compose a results object
      var resultsObj:Object = {
        success: {
          "text/plain": success
        },
        data: clipData
      };
      // Serialize it
      var results:String = JSON.stringify(resultsObj);

      // reset the text
      clipData = {};

      // signal to the page that it is done
      emit("aftercopy", { serializedData: results });
    }

    // mouseOver
    //
    // The mouseOver function signals to the page that the button is being hovered.
    //
    // returns nothing
    private function mouseOver(event:MouseEvent): void {
      emit("mouseover", ZeroClipboard.metaData(event));
    }

    // mouseOut
    //
    // The mouseOut function signals to the page that the button is not being hovered.
    //
    // returns nothing
    private function mouseOut(event:MouseEvent): void {
      emit("mouseout", ZeroClipboard.metaData(event));
    }

    // mouseDown
    //
    // The mouseDown function signals to the page that the button has a mouse button down.
    //
    // returns nothing
    private function mouseDown(event:MouseEvent): void {
      emit("mousedown", ZeroClipboard.metaData(event));

      // Allow for any "UI preparation" work before the "copy" event begins
      emit("beforecopy", null);

      // Request pending clipboard data from the page
      var serializedData:String = emit("copy", null);

      // Deserialize it and consume it, if viable
      var tempData:Object = JSON.parse(serializedData);
      if (typeof tempData === "object" && tempData && tempData["text/plain"]) {
        clipData = tempData;
      }
    }

    // mouseUp
    //
    // The mouseUp function signals to the page that the mouse button has been lifted
    //
    // returns nothing
    private function mouseUp(event:MouseEvent): void {
      emit("mouseup", ZeroClipboard.metaData(event));
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

    // emit
    //
    // Function through which JavaScript events are emitted
    //
    // returns nothing, or the new clipData
    private function emit(eventType:String, eventObj:Object): String {
      if (eventObj == null) {
        eventObj = {};
      }
      eventObj.type = eventType;
      if (jsModuleId) {
        return ExternalInterface.call(ZeroClipboard.JS_MODULE_WRAPPED_EMITTER, eventObj, jsModuleId);
      }
      else {
        return ExternalInterface.call(ZeroClipboard.NORMAL_EMITTER, eventObj);
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

      // create the default options
      var normalOptions:Object = {};

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
  }
}
