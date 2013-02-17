if (typeof module !== "undefined") {
  module.exports = ZeroClipboard;
} else if (typeof define === "function" && define.amd) {
  define(function() {
    return ZeroClipboard;
  });
} else {
  window.ZeroClipboard = ZeroClipboard;
}

})();
