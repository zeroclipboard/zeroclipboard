package {

  /**
   * Utility methods for XSS attack prevention.
   */
  internal class XssUtils {

    /**
     * Sanitize any object (string, array, object instance) to mitigate XSS
     * vulnerabilities AND bugs in Flash -> JS communication.
     *
     * @return an XSS safe object
     * @static
     */
    public static function sanitize(
      data:*  // NOPMD
    ): * {  // NOPMD
      if (typeof data === "string" && data.length > 0) {
        data = XssUtils.sanitizeString(data);
      }
      else if (typeof data === "object" && data.length > 0) {
        for (var i:int = 0; i < data.length; i++) {
          data[i] = XssUtils.sanitize(data[i]);
        }
      }
      else if (typeof data === "object" && data != null) {
        for (var prop:String in data) {
          if (data.hasOwnProperty(prop)) {
            data[prop] = XssUtils.sanitize(data[prop]);
          }
        }
      }
      return data;
    }


    /**
     * Sanitize a string to mitigate XSS vulnerabilities AND
     * bugs in Flash -> JS communication.
     *
     * @return an XSS safe String
     * @static
     */
    public static function sanitizeString(dirty:String): String {
      return (typeof dirty === "string" && dirty) ? dirty.replace(/\\/g, "\\\\") : "";
    }


    /**
     * Sanitize the Loader parameters by filtering out all URL query parameters,
     * leaving ONLY parameters that were specified via FlashVars in the HTML
     * embedding markup.
     *
     * @return a filtered parameters object, a.k.a. FlashVars
     * @static
     */
    public static function filterToFlashVars(
      parameters:Object  // NOPMD
    ): Object {  // NOPMD
      //
      // TODO: Implement this for real
      // See:  https://github.com/zeroclipboard/zeroclipboard/pull/336
      //
      return parameters;
    }

  }
}