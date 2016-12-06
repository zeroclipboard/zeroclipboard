package {

  import flash.external.ExternalInterface;
  import flash.net.navigateToURL;
  import flash.net.URLRequest;


  /**
   * An abstraction for communicating with JavaScript from Flash.
   */
  internal class JsProxy {
    private static const PROXIED_CALLBACK_PREFIX:String = "__proxied__";
    private static const JS_DATA_PROCESSOR_FN:String = '\
function processData(data, stringProcessorFn) {\
  if (typeof data === "string" && data.length > 0) {\
    data = stringProcessorFn(data);\
  }\
  else if (typeof data === "object" && data.length > 0) {\
    for (var i = 0; i < data.length; i++) {\
      data[i] = processData(data[i], stringProcessorFn);\
    }\
  }\
  else if (typeof data === "object" && data != null) {\
    for (var prop in data) {\
      if (data.hasOwnProperty(prop)) {\
        data[prop] = processData(data[prop], stringProcessorFn);\
      }\
    }\
  }\
  return data;\
};\
';
    private static const JS_DATA_ENCODER_FN:String = '\
function encodeDataForFlash(data) {\
  return processData(data, encodeURIComponent);\
};\
';
    private static const JS_DATA_DECODER_FN:String = '\
function decodeDataFromFlash(data) {\
  return processData(data, decodeURIComponent);\
};\
';
    private static const processData:Function = function(
      data:*,  // NOPMD
      stringProcessorFn:Function
    ): * { // NOPMD
      if (typeof data === "string" && data.length > 0) {
        data = stringProcessorFn(data);
      }
      else if (typeof data === "object" && data.length > 0) {
        for (var i:int = 0; i < data.length; i++) {
          data[i] = processData(data[i], stringProcessorFn);
        }
      }
      else if (typeof data === "object" && data != null) {
        for (var prop:String in data) {
          if (data.hasOwnProperty(prop)) {
            data[prop] = processData(data[prop], stringProcessorFn);
          }
        }
      }
      return data;
    };
    private static const encodeDataForJS:Function = function(
      data:*  // NOPMD
    ): * { // NOPMD
      return processData(data, encodeURIComponent);
    };
    private static const decodeDataFromJS:Function = function(
      data:*  // NOPMD
    ): * { // NOPMD
      return processData(data, decodeURIComponent);
    };

    private var metadata:Object = { // NOPMD
      objectId: null,
      hosted: false,
      bidirectional: false,
      disabled: false,
      fidelityEnsured: false
    };


    /**
     * @constructor
     */
    public function JsProxy() {
      // The JIT Compiler does not compile constructors, so any
      // cyclomatic complexity higher than 1 is discouraged.
      this.ctor();
    }


    /**
     * The real constructor.
     *
     * @return `undefined`
     */
    private function ctor(): void {
      // We do NOT want to marshall JS exceptions into Flash (other than during detection)
      var preferredMarshalling:Boolean = false;
      ExternalInterface.marshallExceptions = preferredMarshalling;

      // What is the HTML element ID that is actually hosting this SWF object?
      this.metadata.objectId = ExternalInterface.objectID || null;

      // Do we authoritatively know that this Flash object is hosted in a browser?
      this.metadata.hosted = ExternalInterface.available === true && !!this.metadata.objectId;

      // Temporarily start marshalling JS exceptions into Flash
      ExternalInterface.marshallExceptions = true;

      // Try this regardless of the value of `this.metadata.hosted`.
      try {
        // Can we retrieve values from JavaScript?
        this.metadata.bidirectional = ExternalInterface.call("(function() { return true; })") === true;
      }
      catch (err:Error) {
        // We do NOT authoritatively know if this Flash object is hosted in a browser,
        // nor if JavaScript is disabled.
        this.metadata.bidirectional = false;
      }

      // Revert the behavior for marshalling JS exceptions into Flash
      ExternalInterface.marshallExceptions = preferredMarshalling;

      // If hosted but cannot bidirectionally communicate with JavaScript,
      // then JavaScript is disabled on the page!
      this.metadata.disabled = this.metadata.hosted && !this.metadata.bidirectional;

      // Do some feature testing and patching to ensure string fidelity
      // during cross-boundary communications between Flash and JavaScript.
      this.metadata.fidelityEnsured = this.ensureStringFidelity();
    }


    /**
     * Test the Flash -> JS communication channel for data fidelity.
     * If any data experiences loss of fidelity, try to patch it.
     * If the data still loses fidelity on a subsequent test, it cannot
     * be patched simply.
     *
     * @return Boolean: `true` if high fidelity, `false` if not
     */
    private function ensureStringFidelity(): Boolean {  // NOPMD
      var didPatchJS:Boolean = false;

      // Export some data fidelity-patching functions in advance
      try {
        didPatchJS = ExternalInterface.call([
          '(function() {',
          JS_DATA_PROCESSOR_FN,
          '',
          '  var objectId = "' + this.metadata.objectId + '",',
          '      swf = document[objectId] || document.getElementById(objectId);',
          '  if (swf) {',
          '    swf._encodeDataForFlash = ' + JS_DATA_ENCODER_FN + ';',
          '    swf._decodeDataFromFlash = ' + JS_DATA_DECODER_FN + ';',
          '  }',
          '  return !!swf && typeof swf._encodeDataForFlash === "function" && typeof swf._decodeDataFromFlash === "function";',
          '})'
        ].join('\n')) === true;
      }
      catch (err:Error) {
        didPatchJS = false;
      }

      return didPatchJS;
    }


    /**
     * What is the actual `ExternalInterface.objectID`?
     *
     * @return Boolean
     */
    public function getObjectId(): String {
      return this.metadata.objectId;
    }


    /**
     * Are we authoritatively certain that we can execute JavaScript bidirectionally?
     *
     * @return Boolean
     */
    public function isComplete(): Boolean {
      return this.metadata.hosted && this.metadata.bidirectional;
    }


    /**
     * Can we authoritatively communicate with JavaScript without any loss of data fidelity?
     *
     * @return Boolean
     */
    public function isHighFidelity(): Boolean {
      return this.isComplete() && this.metadata.fidelityEnsured;
    }


    /**
     * Register an ActionScript closure as callable from the container's JavaScript.
     * To unregister, pass `null` as the closure to remove an existing callback.
     *
     * This will execute the JavaScript ONLY if ExternalInterface is completely
     * available (hosted in the browser AND supporting bidirectional communication).
     *
     * @return anything
     */
    public function addCallback(functionName:String, closure:Function): void {
      if (closure == null) {
        this.removeCallback(functionName);
      }

      if (this.isComplete()) {

        // Patch addCallback's outgoing result value on Flash side before returning it
        var wrapperFn:Function = function(...args): * {  // NOPMD
          args = decodeDataFromJS(args);
          var result:* = //NOPMD
                closure.apply(this, args);
          return encodeDataForJS(result);
        };


        // IMPORTANT:
        // This patch changes the name of the registered callback as some browser/Flash
        // implementations will not allow us to directly override the exposed callback
        // on the SWF object, despite the fact that the JS object property descriptors
        // indicate it should be allowed!

        var proxiedFunctionName:String = PROXIED_CALLBACK_PREFIX + functionName;
        ExternalInterface.addCallback(proxiedFunctionName, wrapperFn);

        // Patch addCallback's incoming parameters on JS side before calling it
        this.call(
          [
            '(function() {',
            '  var objectId = "' + this.metadata.objectId + '",',
            '      swf = document[objectId] || document.getElementById(objectId),',
            '      desiredSwfCallbackName = "' + functionName + '",',
            '      actualSwfCallbackName = "' + proxiedFunctionName + '",',
            '      swfCallback;',
            '',
            '  if (swf && typeof swf[actualSwfCallbackName] === "function" && typeof swf._encodeDataForFlash === "function" && typeof swf._decodeDataFromFlash === "function") {',
            '    swfCallback = swf && swf[actualSwfCallbackName];',
            '    swf[desiredSwfCallbackName] = function() {',
            '      var swf = this;',
            '      var args = swf._encodeDataForFlash([].slice.call(arguments));',
            '      var result = swfCallback.apply(this, args);',
            '      return swf._decodeDataFromFlash(result);',
            '    };',
            '  }',
            '  // Drop the reference',
            '  swf = null;',
            '})'
          ].join('\n')
        );
      }
    }


    /**
     * Unegister an ActionScript closure as callable from the container's JavaScript.
     *
     * This will execute the JavaScript ONLY if ExternalInterface is completely
     * available (hosted in the browser AND supporting bidirectional communication).
     *
     * @return `undefined`
     */
    public function removeCallback(functionName:String): void {
      if (this.isComplete()) {

        // IMPORTANT:
        // See comments in the `JsProxy#addCallback` method body for more information
        // on why special cleanup is necessary to remove this proxied callback fully.

        var proxiedFunctionName:String = PROXIED_CALLBACK_PREFIX + functionName;
        ExternalInterface.addCallback(proxiedFunctionName, null);

        this.call(
          [
            '(function() {',
            '  var objectId = "' + this.metadata.objectId + '",',
            '      swf = document[objectId] || document.getElementById(objectId),',
            '      desiredSwfCallbackName = "' + functionName + '";',
            '',
            '  if (swf && typeof swf[desiredSwfCallbackName] === "function") {',
            '    swf[desiredSwfCallbackName] = null;',
            '    delete swf[desiredSwfCallbackName];',
            '  }',
            '  // Drop the reference',
            '  swf = null;',
            '})'
          ].join('\n')
        );
      }
    }


    /**
     * Execute a function expression or named function, with optional arguments,
     * and receive its return value.
     *
     * This will execute the JavaScript ONLY if ExternalInterface is completely
     * available (hosted in the browser AND supporting bidirectional communication).
     *
     * @example
     * var jsProxy:JsProxy = new JsProxy("global-zeroclipboard-flash-bridge");
     * var result:Object = jsProxy.call("ZeroClipboard.emit", { type: "copy" });
     * jsProxy.call("(function(eventObj) { return ZeroClipboard.emit(eventObj); })", { type: "ready"});
     *
     * @return `undefined`, or anything
     */
    public function call(
      jsFuncExpr:String,
      ...args
    ): * {  // NOPMD
      var result:* = undefined;  // NOPMD
      if (jsFuncExpr && this.isComplete()) {
        args = encodeDataForJS(args);

        jsFuncExpr = [
          '(function() {',
          '  var objectId = "' + this.metadata.objectId + '",',
          '      swf = document[objectId] || document.getElementById(objectId),',
          '      args, result;',
          '  if (swf && typeof swf._encodeDataForFlash === "function" && typeof swf._decodeDataFromFlash === "function") {',
          '    args = swf._decodeDataFromFlash([].slice.call(arguments));',
          '    result = (' + jsFuncExpr + ').apply(this, args);',
          '    return swf._encodeDataForFlash(result);',
          '  }',
          '})'
        ].join('\n');

        result = ExternalInterface.call.apply(ExternalInterface, [jsFuncExpr].concat(args));
        result = decodeDataFromJS(result);
      }
      return result;
    }


    /**
     * Execute a function expression or named function, with optional arguments.
     * No return values will ever be received.
     *
     * This will attempt to execute the JavaScript, even if ExternalInterface is
     * not available; in which case: the worst thing that can happen is that
     * the JavaScript is not executed (i.e. if JavaScript is disabled, or if
     * the SWF is not allowed to communicate with JavaScript on its host page).
     *
     * @return `undefined`
     */
    public function send(jsFuncExpr:String, ...args): void {
      if (jsFuncExpr) {
        if (this.isComplete()) {
          this.call.apply(this, [jsFuncExpr].concat(args));
        }
        else if (!this.metadata.disabled) {
          var argsStr:String = "";
          for (var counter:int = 0; counter < args.length; counter++) {
            argsStr += JSON.stringify(args[counter]);
            if ((counter + 1) < args.length) {
              argsStr += ", ";
            }
          }
          navigateToURL(new URLRequest("javascript:" + jsFuncExpr + "(" + encodeDataForJS(argsStr) + ");"), "_self");
        }
      }
    }
  }
}
