/*global _args, _extend, _deepCopy, _pick, _omit, _deleteOwnProperties, _containedBy */

(function(module, test) {
  "use strict";

  module("shared/private.js unit tests");

  test("`_args` works", function(assert) {
    assert.expect(4);

    // Arrange
    var _arguments = function() {
      return arguments;
    };
    var fn = function() {};
    var expectedOutput1 = [1, 2, 3];
    var expectedOutput2 = [fn];
    var expectedOutput3 = [{ foo: "bar" }];
    var expectedOutput4 = [[1, 2, 3]];
    var inputArgs1 = _arguments(1, 2, 3);
    var inputArgs2 = _arguments(fn);
    var inputArgs3 = _arguments({ foo: "bar" });
    var inputArgs4 = _arguments([1, 2, 3]);

    // Act
    var actualOutput1 = _args(inputArgs1);
    var actualOutput2 = _args(inputArgs2);
    var actualOutput3 = _args(inputArgs3);
    var actualOutput4 = _args(inputArgs4);

    // Arrange
    assert.deepEqual(actualOutput1, expectedOutput1);
    assert.deepEqual(actualOutput2, expectedOutput2);
    assert.deepEqual(actualOutput3, expectedOutput3);
    assert.deepEqual(actualOutput4, expectedOutput4);
  });


  test("`_extend` works on plain objects", function(assert) {
    assert.expect(5);

    // Plain objects
    var a = {
      "a": "apple",
      "c": "cantalope"
    },
    b = {
      "b": "banana",
      "c": "cherry"  // cuz cantalope sucks  ;)
    },
    c = {
      "a": "apple",
      "b": "banana",
      "c": "cherry"
    };

    assert.deepEqual(_extend({}, a), a, "actual equals expected, `target` is updated, `source` is unaffected");
    assert.deepEqual(_extend({}, b), b, "actual equals expected, `target` is updated, `source` is unaffected");
    assert.deepEqual(_extend({}, c), c, "actual equals expected, `target` is updated, `source` is unaffected");
    assert.deepEqual(_extend(a, b), c, "actual equals expected");
    assert.deepEqual(a, c, "`a` equals `c` because `_extend` updates the `target` argument");
  });


  test("`_extend` only copies owned properties", function(assert) {
    assert.expect(1);

    // Now prototypes...
    var SomeClass = function() {
      this.b = "banana";
    };
    SomeClass.prototype.c = "cantalope";  // cuz cantalope sucks  ;)

    var a = {
      "a": "apple",
      "c": "cherry"
    },
    b = new SomeClass(),
    c = {
      "a": "apple",
      "b": "banana",
      "c": "cherry"
    };

    assert.deepEqual(_extend(a, b), c, "actual equals expected because `_extend` does not copy over prototype properties");
  });


  test("`_extend` only copies owned properties from Array source", function(assert) {
    assert.expect(3);

    var a = {
      "a": "apple",
      "b": "banana"
    },
    b = ["zero", "one", "two"],
    c = {
      "a": "apple",
      "b": "banana",
      "0": "zero",
      "1": "one",
      "2": "two"
    };

    assert.deepEqual(_extend(a, b), c, "actual equals expected because `_extend` does not copy over prototype properties");
    assert.strictEqual("length" in a, false, "`a` should not have gained a `length` property");
    assert.strictEqual("length" in b, true, "`b` should still have a `length` property");
  });


  test("`_extend` will merge multiple objects", function(assert) {
    assert.expect(2);

    var a = {
      "a": "apple",
      "c": "cantalope",
      "d": "dragon fruit"
    },
    b = {
      "b": "banana",
      "c": "cherry"  // cuz cantalope sucks  ;)
    },
    c = {
      "a": "apricot",
      "b": "blueberry"
    },
    d = {
      "a": "apricot",
      "b": "blueberry",
      "c": "cherry",
      "d": "dragon fruit"
    };

    assert.deepEqual(_extend({}, a, b, c), d, "actual equals expected, `target` is updated, `source` is unaffected");
    assert.deepEqual(_extend(a, b, c), d, "actual equals expected");
  });


  test("`_deepCopy` works", function(assert) {
    assert.expect(13);

    // Arrange
    var input1 = {
      "a": "b",
      "b": {
        "c": "d"
      }
    };
    var input2 = [[1, 2], 2];
    var expected1 = {
      "a": "b",
      "b": {
        "c": "d"
      }
    };
    var expected2 = [[1, 2], 2];

    // Act
    var actual1 = _deepCopy(input1);
    var actual2 = _deepCopy(input2);

    // Assert
    assert.deepEqual(actual1, expected1, "Objects are deeply equal");
    assert.notStrictEqual(actual1, expected1, "Objects are not strictly equal");
    assert.strictEqual(actual1.a, expected1.a, "Objects' non-object properties are strictly equal");
    assert.deepEqual(actual1.b, expected1.b, "Objects' object properties are deeply equal");
    assert.notStrictEqual(actual1.b, expected1.b, "Objects' object properties are not strictly equal");
    assert.strictEqual(actual1.b.c, expected1.b.c, "Objects' object properties' non-object properties are strictly equal");

    assert.deepEqual(actual2, expected2, "Arrays are deeply equal");
    assert.notStrictEqual(actual2, expected2, "Arrays are not strictly equal");
    assert.deepEqual(actual2[0], expected2[0], "Sub-arrays are deeply equal");
    assert.notStrictEqual(actual2[0], expected2[0], "Sub-arrays are not strictly equal");
    assert.strictEqual(actual2[0][0], expected2[0][0], "Sub-arrays' first items are strictly equal");
    assert.strictEqual(actual2[0][1], expected2[0][1], "Sub-arrays' second items are strictly equal");
    assert.strictEqual(actual2[1], expected2[1], "Sub-items are strictly equal");
  });


  test("`_pick` works", function(assert) {
    assert.expect(6);

    // Arrange
    var obj1 = {};
    var obj2 = {
      "name": "Zero",
      "version": "v2.x",
      "other": "test"
    };
    var filter1 = [];
    var filter2 = ["name", "version"];
    var filter3 = ["name", "version", "other"];

    var expected1x = {};
    var expected21 = {};
    var expected22 = {
      "name": "Zero",
      "version": "v2.x"
    };
    var expected23 = {
      "name": "Zero",
      "version": "v2.x",
      "other": "test"
    };

    // Act
    var result11 = _pick(obj1, filter1);
    var result12 = _pick(obj1, filter2);
    var result13 = _pick(obj1, filter3);
    var result21 = _pick(obj2, filter1);
    var result22 = _pick(obj2, filter2);
    var result23 = _pick(obj2, filter3);

    // Assert
    assert.deepEqual(result11, expected1x, "An empty object cannot have any properties picked");
    assert.deepEqual(result12, expected1x, "An empty object cannot have any properties picked");
    assert.deepEqual(result13, expected1x, "An empty object cannot have any properties picked");
    assert.deepEqual(result21, expected21, "An object with an empty pick list will have nothing picked");
    assert.deepEqual(result22, expected22, "An object with a subset pick list will have only those properties picked");
    assert.deepEqual(result23, expected23, "An object with a complete pick list will have all of its properties picked");
  });


  test("`_omit` works", function(assert) {
    assert.expect(6);

    // Arrange
    var obj1 = {};
    var obj2 = {
      "name": "Zero",
      "version": "v2.x",
      "other": "test"
    };
    var filter1 = [];
    var filter2 = ["name", "version"];
    var filter3 = ["name", "version", "other"];

    var expected1x = {};
    var expected21 = {
      "name": "Zero",
      "version": "v2.x",
      "other": "test"
    };
    var expected22 = {
      "other": "test"
    };
    var expected23 = {};

    // Act
    var result11 = _omit(obj1, filter1);
    var result12 = _omit(obj1, filter2);
    var result13 = _omit(obj1, filter3);
    var result21 = _omit(obj2, filter1);
    var result22 = _omit(obj2, filter2);
    var result23 = _omit(obj2, filter3);

    // Assert
    assert.deepEqual(result11, expected1x, "An empty object cannot have any properties picked");
    assert.deepEqual(result12, expected1x, "An empty object cannot have any properties picked");
    assert.deepEqual(result13, expected1x, "An empty object cannot have any properties picked");
    assert.deepEqual(result21, expected21, "An object with an empty omit list will have everything picked");
    assert.deepEqual(result22, expected22, "An object with a subset omit list will have everything but those properties picked");
    assert.deepEqual(result23, expected23, "An object with a complete omit list will have nothing picked");
  });


  test("`_deleteOwnProperties` will delete all owned enumerable properties", function(assert) {
    assert.expect(24);

    var getNonObjectKeys = function(obj) {
      var prop,
          keys = [];
      if (obj) {
        for (prop in obj) {
          if (obj.hasOwnProperty(prop)) {
            keys.push(prop);
          }
        }
      }
      return keys;
    };
    var getProtoKeys = function(obj) {
      var prop,
          keys = [];
      if (obj) {
        for (prop in obj) {
          if (!obj.hasOwnProperty(prop)) {
            keys.push(prop);
          }
        }
      }
      return keys;
    };

    var a = {
      "a": "apple",
      "c": "cantalope",
      "d": "dragon fruit"
    },
    b = {},
    c = ["banana", "cherry"],
    d = (function() {
      function SomePrototype() {
        this.protoProp = "foo";
      }
      function SomeClass() {
        this.ownedProp = "bar";
      }
      SomeClass.prototype = new SomePrototype();
      SomeClass.prototype.constructor = SomeClass;

      return new SomeClass();
    })(),
    e = null,
    f; // = undefined;

    assert.deepEqual(Object.keys(a), ["a", "c", "d"]);
    assert.deepEqual(getProtoKeys(a), []);
    _deleteOwnProperties(a);
    assert.deepEqual(Object.keys(a), []);
    assert.deepEqual(getProtoKeys(a), []);

    assert.deepEqual(Object.keys(b), []);
    assert.deepEqual(getProtoKeys(b), []);
    _deleteOwnProperties(b);
    assert.deepEqual(Object.keys(b), []);
    assert.deepEqual(getProtoKeys(b), []);

    assert.deepEqual(getNonObjectKeys(c), ["0", "1"]);
    assert.deepEqual(getProtoKeys(c), []);
    _deleteOwnProperties(c);
    assert.deepEqual(getNonObjectKeys(c), []);
    assert.deepEqual(getProtoKeys(c), []);

    assert.deepEqual(Object.keys(d), ["ownedProp"]);
    assert.deepEqual(getProtoKeys(d), ["protoProp", "constructor"]);
    _deleteOwnProperties(d);
    assert.deepEqual(Object.keys(d), []);
    assert.deepEqual(getProtoKeys(d), ["protoProp", "constructor"]);

    assert.deepEqual(getNonObjectKeys(e), []);
    assert.deepEqual(getProtoKeys(e), []);
    _deleteOwnProperties(e);
    assert.deepEqual(getNonObjectKeys(e), []);
    assert.deepEqual(getProtoKeys(e), []);

    assert.deepEqual(getNonObjectKeys(f), []);
    assert.deepEqual(getProtoKeys(f), []);
    _deleteOwnProperties(f);
    assert.deepEqual(getNonObjectKeys(f), []);
    assert.deepEqual(getProtoKeys(f), []);
  });


  test("`_containedBy` works", function(assert) {
    /*jshint camelcase:false */

    assert.expect(29);

    // Arrange
    var fixture = document.getElementById("qunit-fixture");
    fixture.innerHTML =
      "<div id='container'>" +
        "<div id='contained1'>" +
          "<div id='contained1_1'></div>" +
          "<div id='contained1_2'>" +
            "<div id='contained1_2_1'></div>" +
          "</div>" +
        "</div>" +
        "<div id='contained2'></div>" +
      "</div>" +
      "<div id='not_container'>" +
        "<div id='not_contained'></div>" +
      "</div>";

    var container = document.getElementById("container");
    var contained1 = document.getElementById("contained1");
    var contained1_1 = document.getElementById("contained1_1");
    var contained1_2 = document.getElementById("contained1_2");
    var contained1_2_1 = document.getElementById("contained1_2_1");
    var contained2 = document.getElementById("contained2");
    var not_container = document.getElementById("not_container");
    var not_contained = document.getElementById("not_contained");

    // Act & Assert
    assert.strictEqual(_containedBy(contained1_2_1, contained1_2_1), true);
    assert.strictEqual(_containedBy(contained1_2_1, contained1_2), true);
    assert.strictEqual(_containedBy(contained1_2_1, contained1), true);
    assert.strictEqual(_containedBy(contained1_2_1, container), true);
    assert.strictEqual(_containedBy(contained1_2_1, fixture), true);
    assert.strictEqual(_containedBy(contained1_2_1, not_container), false);

    assert.strictEqual(_containedBy(contained1_1, contained1_1), true);
    assert.strictEqual(_containedBy(contained1_1, contained1), true);
    assert.strictEqual(_containedBy(contained1_1, container), true);
    assert.strictEqual(_containedBy(contained1_1, fixture), true);
    assert.strictEqual(_containedBy(contained1_1, not_container), false);

    assert.strictEqual(_containedBy(contained1, contained1), true);
    assert.strictEqual(_containedBy(contained1, container), true);
    assert.strictEqual(_containedBy(contained1, fixture), true);
    assert.strictEqual(_containedBy(contained1, not_container), false);

    assert.strictEqual(_containedBy(contained2, contained2), true);
    assert.strictEqual(_containedBy(contained2, container), true);
    assert.strictEqual(_containedBy(contained2, fixture), true);
    assert.strictEqual(_containedBy(contained2, not_container), false);

    assert.strictEqual(_containedBy(container, container), true);
    assert.strictEqual(_containedBy(container, fixture), true);
    assert.strictEqual(_containedBy(container, not_container), false);

    assert.strictEqual(_containedBy(not_contained, not_contained), true);
    assert.strictEqual(_containedBy(not_contained, not_container), true);
    assert.strictEqual(_containedBy(not_contained, fixture), true);
    assert.strictEqual(_containedBy(not_contained, container), false);

    assert.strictEqual(_containedBy(not_container, not_container), true);
    assert.strictEqual(_containedBy(not_container, fixture), true);
    assert.strictEqual(_containedBy(not_container, container), false);
  });

})(QUnit.module, QUnit.test);
