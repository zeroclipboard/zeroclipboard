package {

  import flash.display.Stage;
  import flash.display.StageAlign;
  import flash.display.StageScaleMode;
  import flash.display.StageQuality;
  import flash.display.Sprite;
  import flash.events.*;
  import flash.external.ExternalInterface;
  import flash.system.Security;
  import flash.system.System;


  // ZeroClipboard
  //
  // The ZeroClipboard class creates a simple sprite button that will put
  // text in your clipboard when clicked
  //
  // returns nothing
  [SWF(widthPercent="100%", heightPercent="100%", backgroundColor="#FFFFFF")]
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

    // The text in the clipboard
    private var clipData:Object = {};

    // AMD or CommonJS module ID/path to access the ZeroClipboard object
    private var jsModuleId:String = null;

    /**
     * @constructor
     */
    public function ZeroClipboard() {
      // The JIT Compiler does not compile constructors, so ANY
      // cyclomatic complexity higher than 1 is discouraged.
      this.ctor();
    }

    /**
     * The real constructor.
     *
     * @return void
     */
    private function ctor(): void {
      // If the `stage` is available, begin!
      if (stage) {
        this.init();
      }
      else {
        // Otherwise, wait for the `stage`....
        this.addEventListener(Event.ADDED_TO_STAGE, this.init);
      }
    }

    /**
     * Initialize the class when the Stage is ready.
     *
     * @return void
     */
    private function init(): void {
      // Remove the event listener, if any
      this.removeEventListener(Event.ADDED_TO_STAGE, this.init);

      // Set the stage!
      stage.align = StageAlign.TOP_LEFT;
      stage.scaleMode = StageScaleMode.EXACT_FIT;
      stage.quality = StageQuality.BEST;


      // Get the flashvars
      var flashvars:Object = this.loaderInfo.parameters;

      // Allow the SWF object to communicate with a page on a different origin than its own (e.g. SWF served from CDN)
      if (flashvars.trustedOrigins && typeof flashvars.trustedOrigins === "string") {
        var origins:Array = ZeroClipboard.sanitizeString(flashvars.trustedOrigins).split(",");
        Security.allowDomain.apply(Security, origins);
      }

      // Enable complete AMD (e.g. RequireJS) and CommonJS (e.g. Browserify) support
      if (flashvars.jsModuleId && typeof flashvars.jsModuleId === "string") {
        jsModuleId = ZeroClipboard.sanitizeString(flashvars.jsModuleId);
      }

      // Create an invisible "button" and transparently fill the entire Stage
      var button:Sprite = new Sprite();
      button.graphics.beginFill(0xFFFFFF);
      button.graphics.drawRect(0, 0, stage.stageWidth, stage.stageHeight);
      button.alpha = 0.0;

      // Act like a button. This includes:
      //  - Showing a hand cursor by default
      //  - Receiving click events
      //  - Receiving keypress events of space/"Enter" as click
      //    events IF AND ONLY IF the Sprite is focused.
      button.buttonMode = true;
      button.useHandCursor = false;

      // Add the invisible "button" to the stage!
      this.addChild(button);

      // Adding the event listeners
      button.addEventListener(MouseEvent.CLICK, mouseClick);
      button.addEventListener(MouseEvent.MOUSE_OVER, mouseOver);
      button.addEventListener(MouseEvent.MOUSE_OUT, mouseOut);
      button.addEventListener(MouseEvent.MOUSE_DOWN, mouseDown);
      button.addEventListener(MouseEvent.MOUSE_UP, mouseUp);

      // external functions
      ExternalInterface.addCallback(
        "setHandCursor",
        function(enabled:Boolean) {
          button.useHandCursor = enabled === true;
        }
      );
  
      // signal to the browser that we are ready
      this.emit("ready");
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
        System.setClipboard(clipData["text/plain"]);
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
      this.emit("aftercopy", { serializedData: results });
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
      emit("beforecopy");

      // Request pending clipboard data from the page
      var serializedData:String = emit("copy");

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

    // emit
    //
    // Function through which JavaScript events are emitted
    //
    // returns nothing, or the new clipData
    private function emit(eventType:String, eventObj:Object = null): String {
      if (eventObj == null) {
        eventObj = {};
      }
      eventObj.type = eventType;
      if (this.jsModuleId) {
        return ExternalInterface.call(ZeroClipboard.JS_MODULE_WRAPPED_EMITTER, eventObj, this.jsModuleId);
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
