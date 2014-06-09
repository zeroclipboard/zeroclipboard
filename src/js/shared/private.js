/**
 * Convert an `arguments` object into an Array.
 *
 * @returns The arguments as an Array
 * @private
 */
var _args = function(argumentsObj) {
  return _slice.call(argumentsObj, 0);
};


/**
 * Get the index of an item in an Array.
 *
 * @returns The index of an item in the Array, or `-1` if not found.
 * @private
 */
var _inArray = function(item, array, fromIndex) {
  if (typeof array.indexOf === "function") {
    return array.indexOf(item, fromIndex);
  }

  var i,
      len = array.length;
  if (typeof fromIndex === "undefined") {
    fromIndex = 0;
  }
  else if (fromIndex < 0) {
    fromIndex = len + fromIndex;
  }
  for (i = fromIndex; i < len; i++) {
    if (_hasOwn.call(array, i) && array[i] === item) {
      return i;
    }
  }

  return -1;
};


/**
 * Shallow-copy the owned, enumerable properties of one object over to another, similar to jQuery's `$.extend`.
 *
 * @returns The target object, augmented
 * @private
 */
var _extend = function() {
  var i, len, arg, prop, src, copy,
      args = _args(arguments),
      target = args[0] || {};

  for (i = 1, len = args.length; i < len; i++) {
    // Only deal with non-null/undefined values
    if ((arg = args[i]) != null) {
      // Extend the base object
      for (prop in arg) {
        if (_hasOwn.call(arg, prop)) {
          src = target[prop];
          copy = arg[prop];

          // Prevent never-ending loops
          if (target === copy) {
            continue;
          }

          // Don't bring in `undefined` values
          if (copy !== undefined) {
            target[prop] = copy;
          }
        }
      }
    }
  }
  return target;
};


/**
 * Return a deep copy of the source object or array.
 *
 * @returns Object or Array
 * @private
 */
var _deepCopy = function(source) {
  var copy, i, len, prop;

  // If not a non-null object, just return the original
  if (typeof source !== "object" || source == null) {
    copy = source;
  }
  // If an Array, iterate and recurse
  else if (typeof source.length === "number") {
    copy = [];
    for (i = 0, len = source.length; i < len; i++) {
      // Skip empty indices in sparse arrays
      if (_hasOwn.call(source, i)) {
        // Recurse
        copy[i] = _deepCopy(source[i]);
      }
    }
  }
  // If an Object, enumerate and recurse
  else {
    copy = {};
    for (prop in source) {
      // Skip prototype properties
      if (_hasOwn.call(source, prop)) {
        copy[prop] = _deepCopy(source[prop]);
      }
    }    
  }

  return copy;
};


/**
 * Makes a shallow copy of `obj` (like `_extend`) but filters its properties based on a list of `keys` to keep.
 * The inverse of `_omit`, mostly. The big difference is that these properties do NOT need to be enumerable to
 * be kept.
 *
 * @returns A new filtered object.
 * @private
 */
var _pick = function(obj, keys) {
  var newObj = {};
  for (var i = 0, len = keys.length; i < len; i++) {
    if (keys[i] in obj) {
      newObj[keys[i]] = obj[keys[i]];
    }
  }
  return newObj;
};


/**
 * Makes a shallow copy of `obj` (like `_extend`) but filters its properties based on a list of `keys` to omit.
 * The inverse of `_pick`.
 *
 * @returns A new filtered object.
 * @private
 */
var _omit = function(obj, keys) {
  var newObj = {};
  for (var prop in obj) {
    if (_inArray(prop, keys) === -1) {
      newObj[prop] = obj[prop];
    }
  }
  return newObj;
};


/**
 * Get all of an object's owned, enumerable property names. Does NOT include prototype properties.
 *
 * @returns An Array of property names.
 * @private
 */
var _objectKeys = function(obj) {
  // Avoid the impending `TypeError`
  if (obj == null) {
    return [];
  }
  if (_keys) {
    return _keys(obj);
  }
  var keys = [];
  for (var prop in obj) {
    if (_hasOwn.call(obj,prop)) {
      keys.push(prop);
    }
  }
  return keys;
};


/**
 * Remove all owned, enumerable properties from an object.
 *
 * @returns The original object without its owned, enumerable properties.
 * @private
 */
var _deleteOwnProperties = function(obj) {
  if (obj) {
    for (var prop in obj) {
      if (_hasOwn.call(obj, prop)) {
        delete obj[prop];
      }
    }
  }
  return obj;
};


/**
 * Mark an existing property as read-only.
 * @private
 */
var _makeReadOnly = function(obj, prop) {
  // Convert it into a read-only property, if possible
  if (prop in obj && typeof _defineProperty === "function") {
    _defineProperty(obj, prop, {
      value: obj[prop],
      writable: false,
      configurable: true,
      enumerable: true
    });
  }
};


/**
 * Get the current time in milliseconds since the epoch.
 *
 * @returns Number
 * @private
 */
var _now = (function(Date) {
  return function() {
    var time;
    if (Date.now) {
      time = Date.now();
    }
    else {
      time = (new Date()).getTime();
    }
    return time;
  };
})(_Date);


/**
 * Determine if an element is contained within another element.
 *
 * @returns Boolean
 * @private
 */
var _containedBy = function(el, ancestorEl) {
  if (
    el && el.nodeType === 1 &&
    ancestorEl && (ancestorEl.nodeType === 1 || ancestorEl.nodeType === 9)
  ) {
    do {
      if (el === ancestorEl) {
        return true;
      }
      el = el.parentNode;
    }
    while (el);
  }

  return false;
};
