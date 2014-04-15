package {

  import flash.system.System;


  /**
   * An abstraction for injecting data into the user's clipboard.
   */
  internal class ClipboardInjector {

    /**
     * Inject data into the user's clipboard.
     */
    public static function inject(
      clipData:Object  // NOPMD
    ): Object {  // NOPMD
      var results:Object = {};  // NOPMD

      if (typeof clipData === "object" && clipData) {
        // Prep the results object, setting all values to `false`
        for (var prop:String in clipData) {
          if (clipData[prop]) {
            results[prop] = false;
          }
        }

        // Do the actual clipboard injection
        if (clipData["text/plain"]) {
          // Linux currently doesn't use the correct clipboard buffer with the new
          // Flash 10 API, so we need to use this until we can figure out an alternative
          try {
            System.setClipboard(clipData["text/plain"]);
            results["text/plain"] = true;
          }
          catch (e:Error) {
            // `results["text/plain"]` should already be `false`...
            // but FlexPMD complains about empty `catch` blocks
            results["text/plain"] = false;
          }
        }
      }

      return results;
    }
  }
}