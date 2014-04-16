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
     * Inject data into the user's clipboard.
     */
    public function inject(
      originalClipData:Object  // NOPMD
    ): Object {  // NOPMD
      var clipData:Object;  //NOPMD
      var results:Object = {};  // NOPMD

      // Set all data formats' results to `false` (failed) initially
      for (var dataFormat:String in originalClipData) {
        if (originalClipData.hasOwnProperty(dataFormat)) {
          results[XssUtils.sanitizeString(dataFormat)] = false;
        }
      }

      // The extraction also sanitizes the keys so they will match the above
      clipData = ClipboardInjector.extractData(originalClipData);

      // If there is any viable data to copy...
      if (ClipboardInjector.hasData(clipData)) {
        // If we only need to handle plain text...
        if (!this.useEnhancedClipboard || ClipboardInjector.hasOnlyPlainText(clipData)) {
          // Linux currently doesn't use the correct clipboard buffer with the new
          // Flash 10 API, so we need to use this until we can figure out an alternative
          try {
            System.setClipboard(clipData["text/plain"]);
            results["text/plain"] = true;
          }
          catch (e:Error) {
            // Yes, this is already set but FlexPMD complains about empty `catch` blocks
            results["text/plain"] = false;
          }
        }
        else if (this.useEnhancedClipboard) {
          // Clear out the clipboard before starting to copy data
          Clipboard.generalClipboard.clear();

          // Handle each data type in succession
          for (var dataFormat:String in clipData) {
            if (!clipData.hasOwnProperty(dataFormat)) {
              continue;
            }

            // Inject into the clipboard
            var flashDataFormat:String = ClipboardInjector.fixFormat(dataFormat);
            try {
              results[dataFormat] = Clipboard.generalClipboard.setData(flashDataFormat, clipData[dataFormat]);
            }
            catch (e:Error) {
              results[dataFormat] = false;
            }
          }
        }
      }
      return results;
    }


    /**
     * For the 3 "standard" clipboard segments, convert the standard MIME type
     * to the Flash-specific clipboard segment format name.
     *
     * @return String
     */
    private static function fixFormat(dataFormat:String): String {
      var flashDataFormat:String = dataFormat;

      switch (dataFormat.toLowerCase()) {
        case "text/plain":
          flashDataFormat = ClipboardFormats.TEXT_FORMAT;
          break;
        case "text/html":
          flashDataFormat = ClipboardFormats.HTML_FORMAT;
          break;
        case "application/rtf":
          flashDataFormat = ClipboardFormats.RICH_TEXT_FORMAT;
          break;
        default:
          break;
      }

      return flashDataFormat;
    }


    /**
     * Check if data object contains any keys with associated values that are non-empty Strings.
     *
     * @return Boolean
     */
    private static function hasData(
      clipData:Object  // NOPMD
    ): Boolean {
      if (clipData) {
        for (var dataFormat:String in clipData) {
          if (ClipboardInjector.isInjectableData(clipData[dataFormat])) {
            return true;
          }
        }
      }
      return false;
    }


    /**
     * Check if a piece of data is clipboard-injectable.
     *
     * @return Boolean
     */
    private static function isInjectableData(
      data:*  // NOPMD
    ): Boolean {
      return (
        data &&
        (
          typeof data === "string" ||
          data instanceof ByteArray
        ) &&
        typeof data.length === "number" &&
        data.length > 0
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
      var hasPlainText = false;
      var hasOtherTypes = false;
      if (clipData) {
        for (var dataFormat:String in clipData) {
          if (
            clipData.hasOwnProperty(dataFormat) &&
            ClipboardInjector.isInjectableData(clipData[dataFormat])
          ) {
            if (dataFormat === "text/plain") {
              hasPlainText = true;
            }
            else {
              hasOtherTypes = true;

              // Break out early if we already know the final answer
              break;
            }
          }
        }
      }
      return !hasOtherTypes && hasPlainText;
    }


    /**
     * Extract any non-empty Strings from their item pairs and safely XSS-escape them.
     *
     * @return Transformed "clipData" object
     */
    private static function extractData(
      clipData:Object  // NOPMD
    ): Object {  // NOPMD
      var newData:Object = {};  // NOPMD
      var data:* = null;  // NOPMD
      var sanitizedData:* = null;  // NOPMD
      var sanitizedDataFormat:String = null;
      var forceIntoBytes:Boolean = false;

      if (clipData) {
        for (var dataFormat:String in clipData) {
          if (!(clipData.hasOwnProperty(dataFormat) && (data = clipData[dataFormat]))) {
            continue;
          }

          sanitizedDataFormat = XssUtils.sanitizeString(dataFormat);

          // If the sanitized data format is empty, skip this item
          if (!sanitizedDataFormat) {
            continue;
          }

          // Convert RTF strings into bytes
          forceIntoBytes = sanitizedDataFormat.toLowerCase() === "application/rtf";
          // Prepare the data
          sanitizedData = ClipboardInjector.prepareData(data, forceIntoBytes);

          // If there was any real data, add it to the outgoing data object
          if (ClipboardInjector.isInjectableData(sanitizedData)) {
            newData[sanitizedDataFormat] = sanitizedData;
          }
        }
      }
      return newData;
    }


    /**
     * Sanitize data and convert it into ByteArray if necessary.
     *
     * @return String or ByteArray
     */
    private static function prepareData(
      data:*,  //NOPMD
      forceIntoBytes:Boolean = false
    ): * {  //NOPMD
      var sanitizedData:* = null;  // NOPMD
      var needBytes:Boolean = false;

      if (typeof data === "string") {
        sanitizedData = XssUtils.sanitizeString(data);
      }
      else if (
        typeof data === "object" &&
        data &&
        data.hasOwnProperty("bytes") &&
        typeof data.bytes === "string" &&
        data.bytes
      ) {
        sanitizedData = XssUtils.sanitizeString(data.bytes);
        needBytes = true;
      }

      if ((forceIntoBytes || needBytes) && typeof sanitizedData === "string" && sanitizedData) {
        var bytes:ByteArray = new ByteArray();
        bytes.writeUTFBytes(sanitizedData);
        sanitizedData = bytes;
      }

      return sanitizedData;
    }


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
     * @return void
     */
    private function ctor(forceEnhancedClipboard:Boolean = false): void {
      // Should we use the fancy "Desktop" clipboard for expanded text support (e.g. HTML, RTF, etc.)?
      this.useEnhancedClipboard = this.useEnhancedClipboard || forceEnhancedClipboard;
    }
  }
}