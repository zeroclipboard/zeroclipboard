/*
 * This wraps the returned element with some basic functions needed for ZeroClipboard
 *
 * returns element with new functions
 */
function elementWrapper(element) {

  // don't wrap twice
  if (!element || element.addClass) return element;

  // paired down version of addClass from jQuery https://github.com/jquery/jquery/blob/master/speed/jquery-basis.js#L1227
  element.addClass = function (value) {
    if (value && typeof value === "string") {
      var classNames = (value || "").split(/\s+/);

      var elem = this;

      if (elem.nodeType === 1) {
        if (!elem.className) {
          elem.className = value;
        } else {
          var className = " " + elem.className + " ", setClass = elem.className;
          for (var c = 0, cl = classNames.length; c < cl; c++) {
            if (className.indexOf(" " + classNames[c] + " ") < 0) {
              setClass += " " + classNames[c];
            }
          }
          // jank trim
          elem.className = setClass.replace(/^\s+|\s+$/g, '');
        }
      }

    }

    return this;
  };

  // paired down version of removeClass from jQuery https://github.com/jquery/jquery/blob/master/speed/jquery-basis.js#L1261
  element.removeClass = function (value) {

    if ((value && typeof value === "string") || value === undefined) {
      var classNames = (value || "").split(/\s+/);

      var elem = this;

      if (elem.nodeType === 1 && elem.className) {
        if (value) {
          var className = (" " + elem.className + " ").replace(/[\n\t]/g, " ");
          for (var c = 0, cl = classNames.length; c < cl; c++) {
            className = className.replace(" " + classNames[c] + " ", " ");
          }
          // jank trim
          elem.className = className.replace(/^\s+|\s+$/g, '');

        } else {
          elem.className = "";
        }
      }

    }

    return this;
  };

  return element;
}

/*
 *
 * returns the found elements
 */
ZeroClipboard.$ = function (query) {

  var ZeroClipboardSelect = function (s, n) { return n.querySelectorAll(s); },
    result;

  // Prefer Sizzle, if available.
  if (typeof Sizzle === "function") {
    ZeroClipboardSelect = function (s, n) { return Sizzle.uniqueSort(Sizzle(s, n)); };
  }

  if (typeof query === "string") {
    result = ZeroClipboardSelect(query, document);
    // last ditch effort for backwards compatibility
    if (result.length === 0) result = [document.getElementById(query)];
  }

  var newresult = [];
  for (var i = 0; i < result.length; i++) {
    if (result[i] !== null) newresult.push(elementWrapper(result[i]));
  }

  return newresult;
};