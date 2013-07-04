if (typeof define === "function" && define.amd) {
  define(function() {
    return ZeroClipboard;
  });
} else if (typeof module !== "undefined") {
  module.exports = ZeroClipboard;
} else {
  window.ZeroClipboard = ZeroClipboard;
}

})();
