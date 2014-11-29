package {

  import flash.net.URLVariables;


  /**
   * Utility methods for XSS attack prevention.
   */
  internal class XssUtils {

    /**
     * Sanitize any common JSON-serializable object (string, array, object)
     * to mitigate XSS vulnerabilities.
     *
     * @return an XSS safe object
     * @static
     */
    public static function sanitize(
      data:*  // NOPMD
    ): * {  // NOPMD
      if (typeof data === "string") {
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
     * Sanitize a string to mitigate XSS vulnerabilities.
     *
     * @return an XSS safe String
     * @static
     */
    public static function sanitizeString(dirty:String): String {
      return (typeof dirty === "string" && dirty) ? dirty.replace(/\\/g, "\\\\") : "";
    }


    /**
     * Validate the ID against the HTML4 spec for `ID` tokens.
     *
     * @return Boolean
     * @static
     */
    public static function isValidHtmlId(id:String): Boolean {
      return typeof id === "string" && !!id && /^[A-Za-z][A-Za-z0-9_:\-\.]*$/.test(id);
    }


    /**
     * Parse the query string of a URL into an object (hash). The URL provided
     * MUST contain a "?" query string indicator or it will be ignored.
     *
     * @return an object of key-value string pairs (dictionary/hash)
     * @static
     */
    public static function parseQuery(
      url:String
    ): Object {  // NOPMD
      var queryParams:Object = {};  // NOPMD
      if (url) {
       var index:Number = url.indexOf("?");
       url = index !== -1 ? url.slice(index + 1) : "";
       index = url.indexOf("#");
       url = index === -1 ? url : url.slice(0, index);

       //
       // Try to achieve parity with `LoaderInfo#parameters`
       //
       // Eliminate invalid URL escapes. This can prevent a lot of XSS hacks.
       url = url.replace(/%[A-Fa-f0-9]?([^A-Fa-f0-9]|$)/g, "");
       // Double-encode the NUL (null) character. In Firefox, this character actually prevents Flash from loading the SWF at all.
       url = url.replace(/%00/g, "%2500");
       // Eliminate extraneous ampersands
       url = url.replace(/&&+/g, "&");

       if (url) {
          queryParams = new URLVariables(url);

          // If any query with multiple of the same key present, only take the last value
          for (var key:String in queryParams) {
            if (queryParams.hasOwnProperty(key) && queryParams[key] is Array && queryParams[key].length) {
              queryParams[key] = queryParams[key].pop() as String;
            }
          }
        }
      }
      return queryParams;
    }

  }
}