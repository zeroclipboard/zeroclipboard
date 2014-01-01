/*global ZeroClipboard, currentElement:true, flashState:true, _detectFlashSupport:true, _extend, _clipData */

"use strict";

(function(module, test) {

  var originalDetectFlashSupport, originalFlashState;

  module("event", {
    setup: function() {
      // Store
      originalDetectFlashSupport = _detectFlashSupport;
      originalFlashState = _extend({}, flashState);
      // Modify
      _detectFlashSupport = function() { return true; };
      currentElement = null;
      flashState = {
        noflash: null,
        wrongflash: null,
        ready: null,
        version: "0.0.0",
        bridge: null
      };
    },
    teardown: function() {
      _detectFlashSupport = originalDetectFlashSupport;
      ZeroClipboard.destroy();
      currentElement = null;
      flashState = originalFlashState;
    }
  });

  test("Glue element after new client", function(assert) {
    assert.expect(4);

    // Arrange
    var clip = new ZeroClipboard();
    var target = document.getElementById("d_clip_button");

    // Assert, Act, Assert
    assert.strictEqual("zcClippingId" in target, false);
    assert.deepEqual(clip.elements(), []);
    clip.glue(target);
    assert.strictEqual("zcClippingId" in target, true);
    assert.deepEqual(clip.elements(), [target]);
  });

  test("unglue element removes items", function(assert) {
    assert.expect(12);

    // Arrange
    var clip = new ZeroClipboard();
    var targets = [
      document.getElementById("d_clip_button"),
      document.getElementById("d_clip_button2"),
      document.getElementById("d_clip_button3")
    ];

    // Assert pre-conditions
    assert.strictEqual("zcClippingId" in targets[0], false);
    assert.strictEqual("zcClippingId" in targets[1], false);
    assert.strictEqual("zcClippingId" in targets[2], false);
    assert.deepEqual(clip.elements(), []);

    // Act
    clip.glue(targets);

    // Assert initial state
    assert.strictEqual("zcClippingId" in targets[0], true);
    assert.strictEqual("zcClippingId" in targets[1], true);
    assert.strictEqual("zcClippingId" in targets[2], true);
    assert.deepEqual(clip.elements(), targets);

    // Act more
    clip.unglue([
      document.getElementById("d_clip_button3"),
      document.getElementById("d_clip_button2")
    ]);

    // Assert end state
    assert.strictEqual("zcClippingId" in targets[0], true);
    assert.strictEqual("zcClippingId" in targets[1], false);
    assert.strictEqual("zcClippingId" in targets[2], false);
    assert.deepEqual(clip.elements(), [targets[0]]);
  });

  test("Glue element with query string throws TypeError", function(assert) {
    assert.expect(1);

    // Arrange
    var clip = new ZeroClipboard();

    // Assert
    assert["throws"](function() {
      // Act
      clip.glue("#d_clip_button");
    }, TypeError);
  });

  test("Element won't be glued twice", function(assert) {
    assert.expect(3);

    // Arrange
    var clip = new ZeroClipboard();
    var currentEl = document.getElementById("d_clip_button");

    // Assert, act, assert
    assert.deepEqual(clip.elements(), []);
    clip.glue(currentEl);
    assert.deepEqual(clip.elements(), [currentEl]);
    clip.glue(currentEl);
    assert.deepEqual(clip.elements(), [currentEl]);
  });

  test("Registering Events", function(assert) {
    assert.expect(6);

    // Arrange
    var clip = new ZeroClipboard();

    // Act
    clip.on("load", function(){});
    clip.on("onNoFlash", function(){});
    clip.on("onCustomEvent", function(){});

    // Assert
    assert.ok(clip.handlers().load);
    assert.ok(clip.handlers().noflash);
    assert.ok(clip.handlers().customevent);
    assert.strictEqual(clip.handlers().load.length, 1);
    assert.strictEqual(clip.handlers().noflash.length, 1);
    assert.strictEqual(clip.handlers().customevent.length, 1);
  });

  test("Unregistering Events", function(assert) {
    assert.expect(6);

    // Arrange
    var clip = new ZeroClipboard();
    var load = function(){};
    var onNoFlash = function(){};
    var onCustomEvent = function(){};

    // Act
    clip.on("load", load);
    clip.on("onNoFlash", onNoFlash);
    clip.on("onCustomEvent", onCustomEvent);

    // Assert
    assert.deepEqual(clip.handlers().load, [load]);
    assert.deepEqual(clip.handlers().noflash, [onNoFlash]);
    assert.deepEqual(clip.handlers().customevent, [onCustomEvent]);

    // Act & Assert
    clip.off("load", load);
    assert.deepEqual(clip.handlers().load, []);

    // Act & Assert
    clip.off("onNoFlash", onNoFlash);
    assert.deepEqual(clip.handlers().noflash, []);

    // Act & Assert
    clip.off("onCustomEvent", onCustomEvent);
    assert.deepEqual(clip.handlers().customevent, []);
  });

  test("Registering two events works", function(assert) {
    assert.expect(6);

    // Arrange
    var clip = new ZeroClipboard();

    // Assert
    assert.ok(!clip.handlers().load);
    assert.ok(!clip.handlers().complete);

    // Act
    clip.on("load oncomplete", function(){});

    // Assert more
    assert.ok(clip.handlers().load);
    assert.ok(clip.handlers().complete);
    assert.strictEqual(clip.handlers().load.length, 1);
    assert.strictEqual(clip.handlers().complete.length, 1);
  });

  test("Unregistering two events works", function(assert) {
    assert.expect(6);

    // Arrange
    var clip = new ZeroClipboard();
    var func = function() {};

    // Assert
    assert.ok(!clip.handlers().load);
    assert.ok(!clip.handlers().complete);

    // Act
    clip.on("load oncomplete", func);

    // Assert more
    assert.deepEqual(clip.handlers().load, [func]);
    assert.deepEqual(clip.handlers().complete, [func]);

    // Act more
    clip.off("load oncomplete", func);

    // Assert even more
    assert.deepEqual(clip.handlers().load, []);
    assert.deepEqual(clip.handlers().complete, []);
  });

  test("`on` can add multiple handlers for the same event", function(assert) {
    assert.expect(3);

    // Arrange
    var clip = new ZeroClipboard();
    var func1 = function() {};
    var func2 = function() {};

    // Assert
    assert.ok(!clip.handlers().load);

    // Act
    clip.on("load", func1);

    // Assert more
    assert.deepEqual(clip.handlers().load, [func1]);

    // Act more
    clip.on("load", func2);

    // Assert even more
    assert.deepEqual(clip.handlers().load, [func1, func2]);
  });

  test("`off` can remove multiple handlers for the same event", function(assert) {
    assert.expect(5);

    // Arrange
    var clip = new ZeroClipboard();
    var func1 = function() {};
    var func2 = function() {};
    var func3 = function() {};

    // Assert
    assert.ok(!clip.handlers().load);

    // Act
    clip.on("load", func1);
    clip.on("load", func2);
    clip.on("load", func3);

    // Assert more
    assert.deepEqual(clip.handlers().load, [func1, func2, func3]);

    // Act and assert even more
    clip.off("load", func3);  // Remove from the end
    assert.deepEqual(clip.handlers().load, [func1, func2]);

    clip.off("load", func1);  // Remove from the start
    assert.deepEqual(clip.handlers().load, [func2]);

    clip.off("load", func2);  // Remove the last one
    assert.deepEqual(clip.handlers().load, []);
  });

  test("`on` can add more than one entry of the same handler function for the same event", function(assert) {
    assert.expect(2);

    // Arrange
    var clip = new ZeroClipboard();
    var func1 = function() {};

    // Assert
    assert.ok(!clip.handlers().load);

    // Act
    clip.on("load", func1);
    clip.on("load", func1);

    // Assert more
    assert.deepEqual(clip.handlers().load, [func1, func1]);
  });

  test("`off` will remove all entries of the same handler function for the same event", function(assert) {
    assert.expect(3);

    // Arrange
    var clip = new ZeroClipboard();
    var func1 = function() {};

    // Assert
    assert.ok(!clip.handlers().load);

    // Act
    clip.on("load", func1);
    clip.on("load", func1);

    // Assert more
    assert.deepEqual(clip.handlers().load, [func1, func1]);

    // Act more
    clip.off("load", func1);

    // Assert even more
    assert.deepEqual(clip.handlers().load, []);
  });

  test("`off` will remove all handler functions for an event if no function is specified", function(assert) {
    assert.expect(3);

    // Arrange
    var clip = new ZeroClipboard();
    var func1 = function() {};
    var func2 = function() {};
    var func3 = function() {};

    // Assert
    assert.ok(!clip.handlers().load);

    // Act
    clip.on("load", func1);
    clip.on("load", func2);
    clip.on("load", func3);
    clip.on("load", func1);

    // Assert more
    assert.deepEqual(clip.handlers().load, [func1, func2, func3, func1]);

    // Act and assert even more
    clip.off("load");  // Remove all
    assert.deepEqual(clip.handlers().load, []);
  });

  test("`off` will remove all handler functions for all events if no event type is specified", function(assert) {
    assert.expect(6);

    // Arrange
    var clip = new ZeroClipboard();
    var func1 = function() {};
    var func2 = function() {};
    var func3 = function() {};

    // Assert
    assert.ok(!clip.handlers().load);
    assert.ok(!clip.handlers().noflash);

    // Act
    clip.on("load", func1);
    clip.on("load", func2);
    clip.on("noflash", func3);

    // Assert more
    assert.deepEqual(clip.handlers().load, [func1, func2]);
    assert.deepEqual(clip.handlers().noflash, [func3]);

    // Act and assert even more
    clip.off();  // Remove all handlers for all types
    assert.deepEqual(clip.handlers().load, []);
    assert.deepEqual(clip.handlers().noflash, []);
  });

  test("Test noFlash Event", function(assert) {
    assert.expect(1);

    // Arrange
    _detectFlashSupport = function() { return false; };
    var clip = new ZeroClipboard();
    var id = clip.id;

    // Act (should auto-fire immediately but the handler will be invoked asynchronously)
    clip.on( 'noFlash', function(client, args) {
      // Assert
      assert.strictEqual(client.id, id);
      QUnit.start();
    } );
    QUnit.stop();
  });

  test("Test wrongFlash Event", function(assert) {
    assert.expect(1);

    // Arrange
    var clip = new ZeroClipboard();
    var currentEl = document.getElementById("d_clip_button");
    var id = clip.id;
    clip.glue(currentEl);
    clip.on( 'wrongFlash', function(client, args) {
      // Assert
      assert.strictEqual(client.id, id);
      QUnit.start();
    } );

    // Act
    QUnit.stop();
    ZeroClipboard.dispatch("load", { flashVersion: "MAC 9,0,0" });
  });

  test("Test wrongFlash Event after first load", function(assert) {
    assert.expect(1);

    // Arrange
    flashState.noflash = false;
    flashState.wrongflash = true;
    flashState.version = "MAC 9,0,0";
    flashState.ready = false;
    flashState.bridge = {};
    var clip = new ZeroClipboard();
    var id = clip.id;

    // Act (should auto-fire immediately but the handler will be invoked asynchronously)
    clip.on( 'wrongFlash', function(client, args) {
      // Assert
      assert.strictEqual(client.id, id);
      QUnit.start();
    } );
    QUnit.stop();
  });

  test("Test load Event", function(assert) {
    assert.expect(1);

    // Arrange
    var clip = new ZeroClipboard();
    var currentEl = document.getElementById("d_clip_button");
    var id = clip.id;
    clip.glue(currentEl);
    clip.on( 'load', function(client, args) {
      // Assert
      assert.strictEqual(client.id, id);
      QUnit.start();
    } );

    // Act
    QUnit.stop();
    ZeroClipboard.dispatch("load", { flashVersion: "WIN 11,9,0" });
  });

  test("Test load Event after first load", function(assert) {
    assert.expect(1);

    // Arrange
    flashState.noflash = false;
    flashState.wrongflash = false;
    flashState.version = "WIN 11,9,0";
    flashState.ready = true;
    flashState.bridge = {};
    var clip = new ZeroClipboard();
    var id = clip.id;

    // Act (should auto-fire immediately but the handler will be invoked asynchronously)
    clip.on( 'load', function(client, args) {
      // Assert
      assert.strictEqual(client.id, id);
      QUnit.start();
    } );
    QUnit.stop();
  });

  test("Test mouseover and mouseout event", function(assert) {
    assert.expect(2);

    // Arrange
    var clip = new ZeroClipboard();
    var currentEl = document.getElementById("d_clip_button");
    clip.glue(currentEl);
    ZeroClipboard.activate(currentEl);

    // Act
    QUnit.stop();
    ZeroClipboard.dispatch("mouseover", { flashVersion: "MAC 11,0,0" });

    setTimeout(function() {
      // Assert
      assert.strictEqual(/(^| )zeroclipboard-is-hover( |$)/.test(currentEl.className), true);

      // Act more
      ZeroClipboard.dispatch("mouseout", { flashVersion: "MAC 11,0,0" });
      
      setTimeout(function() {
        // Assert more
        assert.strictEqual(/(^| )zeroclipboard-is-hover( |$)/.test(currentEl.className), false);
        QUnit.start();
      }, 25);
    }, 25);
  });

  test("Test mousedown and mouseup event", function(assert) {
    assert.expect(2);

    // Arrange
    var clip = new ZeroClipboard();
    var currentEl = document.getElementById("d_clip_button");
    clip.glue(currentEl);
    ZeroClipboard.activate(currentEl);

    // Act
    QUnit.stop();
    ZeroClipboard.dispatch("mousedown", { flashVersion: "MAC 11,0,0" });

    setTimeout(function() {
      // Assert
      assert.strictEqual(/(^| )zeroclipboard-is-active( |$)/.test(currentEl.className), true);

      // Act more
      ZeroClipboard.dispatch("mouseup", { flashVersion: "MAC 11,0,0" });

      setTimeout(function() {
        // Assert more
        assert.strictEqual(/(^| )zeroclipboard-is-active( |$)/.test(currentEl.className), false);
        QUnit.start();
      }, 25);
    }, 25);
  });

  test("Test that the current Element is passed back to event handler", function(assert) {
    assert.expect(9);

    // Arrange
    var clip = new ZeroClipboard();
    var currentElId = "d_clip_button";
    var currentEl = document.getElementById(currentElId);
    clip.glue(currentEl);
    ZeroClipboard.activate(currentEl);

    clip.on( 'load mousedown mouseover mouseup wrongflash noflash', function(client, args) {
      // Assert
      assert.strictEqual(this.id, currentElId);
    } );
    clip.on( 'complete', function(client, args) {
      // Assert
      assert.strictEqual(this.id, currentElId);
      assert.ok(!_clipData["text/plain"]);
    } );
    clip.on( 'mouseout', function(client, args) {
      // Assert
      assert.strictEqual(this.id, currentElId);
      QUnit.start();
    } );

    // Act
    QUnit.stop();
    ZeroClipboard.dispatch("load", { flashVersion: "MAC 11,0,0" });
    ZeroClipboard.dispatch("wrongflash", { flashVersion: "MAC 11,0,0" });
    ZeroClipboard.dispatch("noflash", { flashVersion: "MAC 11,0,0" });
    ZeroClipboard.dispatch("mousedown", { flashVersion: "MAC 11,0,0" });
    ZeroClipboard.dispatch("mouseover", { flashVersion: "MAC 11,0,0" });
    ZeroClipboard.dispatch("mouseup", { flashVersion: "MAC 11,0,0" });
    ZeroClipboard.dispatch("complete", { flashVersion: "MAC 11,0,0" });
    ZeroClipboard.dispatch("mouseout", { flashVersion: "MAC 11,0,0" });
  });

  test("Test onLoad Event with AMD", function(assert) {
    assert.expect(4);

    // Arrange
    // This is a special private variable inside of ZeroClipboard, so we can
    // only simulate its functionality here
    var _amdModuleId = "zc";

    var requireFn = (function() {
      var amdCache = {};
      amdCache[_amdModuleId] = ZeroClipboard;
      return function(depIds, cb) {
        var depVals = depIds.map(function(id) { return amdCache[id]; });
        setTimeout(function() {
          cb.apply(this, depVals);
        }, 0);
      };
    })();

    var clip = new ZeroClipboard();
    var currentEl = document.getElementById("d_clip_button");
    clip.glue(currentEl);
    ZeroClipboard.activate(currentEl);
    var id = clip.id;

    clip.on( "load", function(client, args) {
      // Assert
      assert.strictEqual(client.id, id);
      QUnit.start();
    } );

    // Act
    QUnit.stop();
    eval(
'(function(eventName, args, amdModuleId) {' +
'  requireFn([amdModuleId], function(zero) {' +
'    assert.strictEqual(zero, ZeroClipboard);' +
'    assert.strictEqual(eventName, "load");' +
'    assert.deepEqual(args, { flashVersion: "MAC 11,0,0" });' +
'    zero.dispatch(eventName, args);' +
'  });' +
'})("load", { flashVersion: "MAC 11,0,0" }, ' + JSON.stringify(_amdModuleId) + ');'
    );
  });

  test("Test onLoad Event with CommonJS", function(assert) {
    assert.expect(4);

    // Arrange
    // This is a special private variable inside of ZeroClipboard, so we can
    // only simulate its functionality here
    var _cjsModuleId = "zc";

    var requireFn = (function() {
      var cjsCache = {};
      cjsCache[_cjsModuleId] = ZeroClipboard;
      return function(id) {
        return cjsCache[id];
      };
    })();

    var clip = new ZeroClipboard();
    var currentEl = document.getElementById("d_clip_button");
    clip.glue(currentEl);
    ZeroClipboard.activate(currentEl);
    var id = clip.id;

    clip.on( "load", function(client, args) {
      // Assert
      assert.strictEqual(client.id, id);
      QUnit.start();
    } );

    // Act
    QUnit.stop();
    eval(
'(function(eventName, args, cjsModuleId) {' +
'  var zero = requireFn(cjsModuleId);' +
'  assert.strictEqual(zero, ZeroClipboard);' +
'  assert.strictEqual(eventName, "load");' +
'  assert.deepEqual(args, { flashVersion: "MAC 11,0,0" });' +
'  zero.dispatch(eventName, args);' +
'})("load", { flashVersion: "MAC 11,0,0" }, ' + JSON.stringify(_cjsModuleId) + ');'
    );
  });



  /** @deprecated */
  module("event - deprecated", {
    setup: function() {
      // Store
      originalDetectFlashSupport = _detectFlashSupport;
      originalFlashState = _extend({}, flashState);
      // Modify
      _detectFlashSupport = function() { return true; };
      currentElement = null;
      flashState = {
        noflash: null,
        wrongflash: null,
        ready: null,
        version: "0.0.0",
        bridge: null
      };
      ZeroClipboard.config({ debug: false });
    },
    teardown: function() {
      _detectFlashSupport = originalDetectFlashSupport;
      ZeroClipboard.destroy();
      currentElement = null;
      flashState = originalFlashState;
      ZeroClipboard.config({ debug: true });
    }
  });

  /** @deprecated */
  test("Registering Events the old way", function(assert) {
    assert.expect(3);

    // Arrange
    var clip = new ZeroClipboard();

    // Assert
    assert.ok(!clip.handlers().load);

    // Act
    clip.addEventListener("load", function(){});

    // Assert
    assert.ok(clip.handlers().load);
    assert.strictEqual(clip.handlers().load.length, 1);
  });

  /** @deprecated */
  test("Unregistering Events the old way", function(assert) {
    assert.expect(3);

    // Arrange
    var clip = new ZeroClipboard();
    var func = function(){};

    // Assert
    assert.ok(!clip.handlers().load);

    // Act & Assert
    clip.addEventListener("load", func);
    assert.deepEqual(clip.handlers().load, [func]);

    // Act & Assert
    clip.removeEventListener("load", func);
    assert.deepEqual(clip.handlers().load, []);
  });

})(QUnit.module, QUnit.test);