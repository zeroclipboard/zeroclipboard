package {

  import flash.system.Capabilities;
  import flash.system.System;
  import flash.desktop.Clipboard;
  import flash.desktop.ClipboardFormats;
  import flash.utils.ByteArray;


  /**
   * An abstraction for injecting data into the user's clipboard.
   */
  internal class ClipboardInjector {
    /**
     * Use the fancy "Desktop" clipboard for expanded text support (e.g. HTML, RTF, etc.) if not on Linux
     */
    private var useEnhancedClipboard:Boolean = Capabilities.os.slice(0, 5).toLowerCase() !== "linux";


    /**
     * @constructor
     */
    public function ClipboardInjector(forceEnhancedClipboard:Boolean = false) {
      // The JIT Compiler does not compile constructors, so any
      // cyclomatic complexity higher than 1 is discouraged.
      this.ctor(forceEnhancedClipboard);
    }


    /**
     * The real constructor.
     *
     * @return `undefined`
     */
    private function ctor(forceEnhancedClipboard:Boolean = false): void {
      // Should we use the fancy "Desktop" clipboard for expanded text support (e.g. HTML, RTF, etc.)?
      this.useEnhancedClipboard = this.useEnhancedClipboard || forceEnhancedClipboard;
    }


    /**
     * Inject data into the user's clipboard.
     *
     * @return A clipboard "results" object
     */
    public function inject(
      clipData:Object  // NOPMD
    ): Object {  // NOPMD
      var results:Object = {};  // NOPMD
      results.success = {};
      results.errors = [];

      // Set all data formats' results to `false` (failed) initially
      for (var dataFormat:String in clipData) {
        if (dataFormat && clipData.hasOwnProperty(dataFormat)) {
          results.success[dataFormat] = false;
        }
      }

      // If there is any viable data to copy...
      if (ClipboardInjector.hasData(clipData)) {
        var plainTextOnly:Boolean = ClipboardInjector.hasOnlyPlainText(clipData);

        // ...and we only need to handle plain text...
        if (!this.useEnhancedClipboard || plainTextOnly) {
          // Use the system clipboard
          ClipboardInjector.injectPlainTextOnly(clipData, results);
        }

        // ...otherwise, if there is viable data to copy and we can copy enhanced formats, OR
        // if using the system clipboard for plain text failed unexpectedly...
        if (this.useEnhancedClipboard || (plainTextOnly && !results.success.text)) {
          // Use the desktop clipboard
          ClipboardInjector.injectEnhancedData(clipData, results);
        }
      }

      return results;
    }



    /**
     * Inject plain text into the System clipboard (i.e. Flash 9+ Clipboard).
     *
     * @return `undefined`
     */
    private static function injectPlainTextOnly(
      clipData:Object,  // NOPMD
      results:Object  // NOPMD
    ): void {
      // Linux currently doesn't use the correct clipboard buffer with the new
      // Flash 10 API, so we need to use this until we can figure out an alternative
      try {
        System.setClipboard(clipData.text);
        results.success.text = true;
      }
      catch (err:Error) {
        results.success.text = false;
        results.errors.push(ClipboardInjector.serializeError(err, "text", "system"));
      }
    }


    /**
     * Inject plain text, HTML, and RTF into the Desktop clipboard (i.e. Flash 10+ Clipboard).
     *
     * @return `undefined`
     */
    private static function injectEnhancedData(
      clipData:Object,  // NOPMD
      results:Object  // NOPMD
    ): void {
      // Clear out the clipboard before starting to copy data
      Clipboard.generalClipboard.clear();

      //
      // Handle each data type in succession...
      //
      // Plain text
      if (typeof clipData.text === "string" && clipData.text) {
        try {
          results.success.text = Clipboard.generalClipboard.setData(ClipboardFormats.TEXT_FORMAT, clipData.text);
        }
        catch (err:Error) {
          results.success.text = false;
          results.errors.push(ClipboardInjector.serializeError(err, "text", "desktop"));
        }
      }

      // HTML
      if (typeof clipData.html === "string" && clipData.html) {
        try {
          results.success.html = Clipboard.generalClipboard.setData(ClipboardFormats.HTML_FORMAT, clipData.html);
        }
        catch (err:Error) {
          results.success.html = false;
          results.errors.push(ClipboardInjector.serializeError(err, "html", "desktop"));
        }
      }

      // Rich Text (RTF)
      if (typeof clipData.rtf === "string" && clipData.rtf) {
        try {
          var bytes:ByteArray = new ByteArray();
          bytes.writeUTFBytes(clipData.rtf);
          if (bytes && bytes.length > 0) {
            results.success.rtf = Clipboard.generalClipboard.setData(ClipboardFormats.RICH_TEXT_FORMAT, bytes);
          }
        }
        catch (err:Error) {
          results.success.rtf = false;
          results.errors.push(ClipboardInjector.serializeError(err, "rtf", "desktop"));
        }
      }
    }


    /**
     * Check if data object contains any keys with associated values that are non-empty Strings.
     *
     * @return Boolean
     */
    private static function hasData(
      clipData:Object  // NOPMD
    ): Boolean {
      return typeof clipData === "object" && clipData &&
        (
          (typeof clipData.text === "string" && clipData.text) ||
          (typeof clipData.html === "string" && clipData.html) ||
          (typeof clipData.rtf  === "string" && clipData.rtf )
        );
    }


    /**
     * Check if a data object's ONLY injectable data is plain text.
     *
     * @return Boolean
     */
    private static function hasOnlyPlainText(
      clipData:Object  // NOPMD
    ): Boolean {
      var hasPlainText:Boolean = false;
      var hasOtherTypes:Boolean = false;
      if (typeof clipData === "object" && clipData) {
        hasPlainText = typeof clipData.text === "string" && clipData.text;
        hasOtherTypes = (
          (typeof clipData.html === "string" && clipData.html) ||
          (typeof clipData.rtf  === "string" && clipData.rtf )
        );
      }
      return !hasOtherTypes && hasPlainText;
    }


    /**
     * Convert an ActionScript Error object into a serializable plain object
     *
     * @return Object
     */
    private static function serializeError(
      err:Error,
      format:String,
      clipboardType:String
    ): Object { // NOPMD
      return {
        name: err.name,
        message: err.message,
        errorID: err.errorID,
        // NOTE: In Flash Player <= 11.4, `err.getStackTrace()` will always return `null` unless
        // you are using the debug version of Flash Player.
        stack: err.getStackTrace() || null,
        format: format,
        clipboard: clipboardType
      };
    }
  }
}