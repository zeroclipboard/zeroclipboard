// The AMDJS logic branch is evaluated first to avoid potential confusion over
// the CommonJS syntactical sugar offered by AMD.
if (typeof define === "function" && define.amd) {
  // Alternative `define` that requires these special CommonJS "free variable"
  // dependencies. AMD loaders are required to implement this special use case
  // per the AMDJS spec:
  //   https://github.com/amdjs/amdjs-api/wiki/AMD#wiki-define-dependencies

  define(
    ["require", "exports", "module"],
    function(require, exports, module) {
      // Automatically set the `_amdModuleId` value if loading via AMD
      _amdModuleId = (module && module.id) || null;

      return ZeroClipboard;
    });
}
else if (typeof module === "object" && module && typeof module.exports === "object" && module.exports && typeof window.require === "function") {
  // CommonJS module loaders are required to provide an `id` property on the
  // `module` object that can be used to uniquely load this module again,
  // i.e. `require(module.id)`. This requirement is per the CommonJS modules
  // spec: "Module Context", 3.1.
  //   http://wiki.commonjs.org/articles/m/o/d/Modules_1.1.1_5572.html#Module_Context
  //
  // ZeroClipboard also needs to be able access itself via a globally available `require`.

  // Automatically set the `_cjdModuleId` value if loading via CommonJS
  _cjsModuleId = module.id || null;

  module.exports = ZeroClipboard;
}
else {
  window.ZeroClipboard = ZeroClipboard;
}

})((function() { return this; })());
