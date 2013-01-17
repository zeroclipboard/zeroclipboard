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

    // The button sprite
    private var button:Sprite;

    // The text in the clipboard
    private var clipText:String = "";

    // constructor, setup event listeners and external interfaces
    public function ZeroClipboard() {

      // Align the stage to top left
      stage.align = "TL";
      stage.scaleMode = "noScale";

      // Get the flashvars
      var flashvars:Object = LoaderInfo( this.root.loaderInfo ).parameters;

      // Allow the swf object to be run on any domain, for when the site hosts the file on a separate server
      if (flashvars.trustedDomain) {
        flash.system.Security.allowDomain(flashvars.trustedDomain.split("\\").join("\\\\"));
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
      ExternalInterface.call( 'ZeroClipboard.dispatch', 'load', metaData());
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
      ExternalInterface.call( 'ZeroClipboard.dispatch', 'complete',  metaData(event, {
        text: clipText.split("\\").join("\\\\")
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
      ExternalInterface.call( 'ZeroClipboard.dispatch', 'mouseOver', metaData(event) );
    }

    // mouseOut
    //
    // The mouseOut function signals to the page that the button is not being hovered.
    //
    // returns nothing
    private function mouseOut(event:MouseEvent): void {
      ExternalInterface.call( 'ZeroClipboard.dispatch', 'mouseOut', metaData(event) );
    }

    // mouseDown
    //
    // The mouseDown function signals to the page that the button has a mouse button down.
    //
    // returns nothing
    private function mouseDown(event:MouseEvent): void {
      ExternalInterface.call( 'ZeroClipboard.dispatch', 'mouseDown', metaData(event) );

      // if the clipText hasn't been set
      if (!clipText) {

        // request data from the page
        ExternalInterface.call( 'ZeroClipboard.dispatch', 'dataRequested', metaData(event) );
      }
    }

    // mouseUp
    //
    // The mouseUp function signals to the page that the mouse button has been lifted
    //
    // returns nothing
    private function mouseUp(event:MouseEvent): void {
      ExternalInterface.call( 'ZeroClipboard.dispatch', 'mouseUp', metaData(event) );
    }

    // metaData
    //
    // The metaData function will take a mouseEvent, and an extra object to
    // create a meta object of more info. This will let the page know if
    // certain modifier keys are down
    //
    // returns an Object of extra event data
    private function metaData(event:MouseEvent = void, extra:Object = void):Object {

      // create the default options, contains flash version
      var normalOptions:Object = {
        flashVersion : Capabilities.version
      }

      // if an event is passed in, return what modifier keys are pressed
      if (event) {
        normalOptions.altKey = event.altKey;
        normalOptions.ctrlKey = event.ctrlKey;
        normalOptions.shiftKey = event.shiftKey;
      }

      // for everything in the extra object, add it to the normal options
      for(var i:String in extra) {
        normalOptions[i] = extra[i];
      }

      return normalOptions;
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
  }
}
