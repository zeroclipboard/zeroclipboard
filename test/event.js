/*global ZeroClipboard, currentElement:true, flashState:true, _extend, _clipData */

"use strict";

(function(module, test) {

  var originalFlashState, originalConfig;

  module("event", {
    setup: function() {
      // Store
      originalFlashState = _extend({}, flashState);
      originalConfig = ZeroClipboard.config();
      // Modify
      currentElement = null;
      flashState = {
        bridge: null,
        version: "0.0.0",
        disabled: null,
        outdated: null,
        deactivated: null,
        ready: null
      };
    },
    teardown: function() {
      ZeroClipboard.destroy();
      currentElement = null;
      flashState = originalFlashState;
      ZeroClipboard.config(originalConfig);
    }
  });

  test("Clip element after new client", function(assert) {
    assert.expect(4);

    // Arrange
    var client = new ZeroClipboard();
    var target = document.getElementById("d_clip_button");

    // Assert, Act, Assert
    assert.strictEqual("zcClippingId" in target, false);
    assert.deepEqual(client.elements(), []);
    client.clip(target);
    assert.strictEqual("zcClippingId" in target, true);
    assert.deepEqual(client.elements(), [target]);
  });

  test("unclip element removes items", function(assert) {
    assert.expect(12);

    // Arrange
    var client = new ZeroClipboard();
    var targets = [
      document.getElementById("d_clip_button"),
      document.getElementById("d_clip_button2"),
      document.getElementById("d_clip_button3")
    ];

    // Assert pre-conditions
    assert.strictEqual("zcClippingId" in targets[0], false);
    assert.strictEqual("zcClippingId" in targets[1], false);
    assert.strictEqual("zcClippingId" in targets[2], false);
    assert.deepEqual(client.elements(), []);

    // Act
    client.clip(targets);

    // Assert initial state
    assert.strictEqual("zcClippingId" in targets[0], true);
    assert.strictEqual("zcClippingId" in targets[1], true);
    assert.strictEqual("zcClippingId" in targets[2], true);
    assert.deepEqual(client.elements(), targets);

    // Act more
    client.unclip([
      document.getElementById("d_clip_button3"),
      document.getElementById("d_clip_button2")
    ]);

    // Assert end state
    assert.strictEqual("zcClippingId" in targets[0], true);
    assert.strictEqual("zcClippingId" in targets[1], false);
    assert.strictEqual("zcClippingId" in targets[2], false);
    assert.deepEqual(client.elements(), [targets[0]]);
  });

  test("Clip element with query string throws TypeError", function(assert) {
    assert.expect(1);

    // Arrange
    var client = new ZeroClipboard();

    // Assert
    assert["throws"](function() {
      // Act
      client.clip("#d_clip_button");
    }, TypeError);
  });

  test("Element won't be clipped twice", function(assert) {
    assert.expect(3);

    // Arrange
    var client = new ZeroClipboard();
    var currentEl = document.getElementById("d_clip_button");

    // Assert, act, assert
    assert.deepEqual(client.elements(), []);
    client.clip(currentEl);
    assert.deepEqual(client.elements(), [currentEl]);
    client.clip(currentEl);
    assert.deepEqual(client.elements(), [currentEl]);
  });

  test("Registering Events", function(assert) {
    assert.expect(6);

    // Arrange
    var client = new ZeroClipboard();

    // Act
    client.on("load", function(){});
    client.on("onNoFlash", function(){});
    client.on("onCustomEvent", function(){});

    // Assert
    assert.ok(client.handlers().load);
    assert.ok(client.handlers().noflash);
    assert.ok(client.handlers().customevent);
    assert.strictEqual(client.handlers().load.length, 1);
    assert.strictEqual(client.handlers().noflash.length, 1);
    assert.strictEqual(client.handlers().customevent.length, 1);
  });

  test("Registering Events with Maps", function(assert) {
    assert.expect(6);

    // Arrange
    var client = new ZeroClipboard();

    // Act
    client.on({
      "load": function(){},
      "onNoFlash": function(){},
      "onCustomEvent": function(){}
    });

    // Assert
    assert.ok(client.handlers().load);
    assert.ok(client.handlers().noflash);
    assert.ok(client.handlers().customevent);
    assert.strictEqual(client.handlers().load.length, 1);
    assert.strictEqual(client.handlers().noflash.length, 1);
    assert.strictEqual(client.handlers().customevent.length, 1);
  });

  test("Unregistering Events", function(assert) {
    assert.expect(6);

    // Arrange
    var client = new ZeroClipboard();
    var load = function(){};
    var onNoFlash = function(){};
    var onCustomEvent = function(){};

    // Act
    client.on("load", load);
    client.on("onNoFlash", onNoFlash);
    client.on("onCustomEvent", onCustomEvent);

    // Assert
    assert.deepEqual(client.handlers().load, [load]);
    assert.deepEqual(client.handlers().noflash, [onNoFlash]);
    assert.deepEqual(client.handlers().customevent, [onCustomEvent]);

    // Act & Assert
    client.off("load", load);
    assert.deepEqual(client.handlers().load, []);

    // Act & Assert
    client.off("onNoFlash", onNoFlash);
    assert.deepEqual(client.handlers().noflash, []);

    // Act & Assert
    client.off("onCustomEvent", onCustomEvent);
    assert.deepEqual(client.handlers().customevent, []);
  });

  test("Unregistering Events with Maps", function(assert) {
    assert.expect(6);

    // Arrange
    var client = new ZeroClipboard();
    var load = function(){};
    var onNoFlash = function(){};
    var onCustomEvent = function(){};

    // Act
    client.on("load", load);
    client.on("onNoFlash", onNoFlash);
    client.on("onCustomEvent", onCustomEvent);

    // Assert
    assert.deepEqual(client.handlers().load, [load]);
    assert.deepEqual(client.handlers().noflash, [onNoFlash]);
    assert.deepEqual(client.handlers().customevent, [onCustomEvent]);

    // Act & Assert
    client.off({ "load": load });
    assert.deepEqual(client.handlers().load, []);

    // Act & Assert
    client.off({ "onNoFlash": onNoFlash });
    assert.deepEqual(client.handlers().noflash, []);

    // Act & Assert
    client.off({ "onCustomEvent": onCustomEvent });
    assert.deepEqual(client.handlers().customevent, []);
  });

  test("Registering two events works", function(assert) {
    assert.expect(6);

    // Arrange
    var client = new ZeroClipboard();

    // Assert
    assert.ok(!client.handlers().load);
    assert.ok(!client.handlers().complete);

    // Act
    client.on("load oncomplete", function(){});

    // Assert more
    assert.ok(client.handlers().load);
    assert.ok(client.handlers().complete);
    assert.strictEqual(client.handlers().load.length, 1);
    assert.strictEqual(client.handlers().complete.length, 1);
  });

  test("Registering two events with a map works", function(assert) {
    assert.expect(6);

    // Arrange
    var client = new ZeroClipboard();

    // Assert
    assert.ok(!client.handlers().load);
    assert.ok(!client.handlers().complete);

    // Act
    client.on({
      "load oncomplete": function(){}
    });

    // Assert more
    assert.ok(client.handlers().load);
    assert.ok(client.handlers().complete);
    assert.strictEqual(client.handlers().load.length, 1);
    assert.strictEqual(client.handlers().complete.length, 1);
  });

  test("Unregistering two events works", function(assert) {
    assert.expect(6);

    // Arrange
    var client = new ZeroClipboard();
    var func = function() {};

    // Assert
    assert.ok(!client.handlers().load);
    assert.ok(!client.handlers().complete);

    // Act
    client.on("load oncomplete", func);

    // Assert more
    assert.deepEqual(client.handlers().load, [func]);
    assert.deepEqual(client.handlers().complete, [func]);

    // Act more
    client.off("load oncomplete", func);

    // Assert even more
    assert.deepEqual(client.handlers().load, []);
    assert.deepEqual(client.handlers().complete, []);
  });

  test("Unregistering two events with a map works", function(assert) {
    assert.expect(6);

    // Arrange
    var client = new ZeroClipboard();
    var func = function() {};

    // Assert
    assert.ok(!client.handlers().load);
    assert.ok(!client.handlers().complete);

    // Act
    client.on("load oncomplete", func);

    // Assert more
    assert.deepEqual(client.handlers().load, [func]);
    assert.deepEqual(client.handlers().complete, [func]);

    // Act more
    client.off({
      "load oncomplete": func
    });

    // Assert even more
    assert.deepEqual(client.handlers().load, []);
    assert.deepEqual(client.handlers().complete, []);
  });

  test("`on` can add multiple handlers for the same event", function(assert) {
    assert.expect(3);

    // Arrange
    var client = new ZeroClipboard();
    var func1 = function() {};
    var func2 = function() {};

    // Assert
    assert.ok(!client.handlers().load);

    // Act
    client.on("load", func1);

    // Assert more
    assert.deepEqual(client.handlers().load, [func1]);

    // Act more
    client.on("load", func2);

    // Assert even more
    assert.deepEqual(client.handlers().load, [func1, func2]);
  });

  test("`off` can remove multiple handlers for the same event", function(assert) {
    assert.expect(5);

    // Arrange
    var client = new ZeroClipboard();
    var func1 = function() {};
    var func2 = function() {};
    var func3 = function() {};

    // Assert
    assert.ok(!client.handlers().load);

    // Act
    client.on("load", func1);
    client.on("load", func2);
    client.on("load", func3);

    // Assert more
    assert.deepEqual(client.handlers().load, [func1, func2, func3]);

    // Act and assert even more
    client.off("load", func3);  // Remove from the end
    assert.deepEqual(client.handlers().load, [func1, func2]);

    client.off("load", func1);  // Remove from the start
    assert.deepEqual(client.handlers().load, [func2]);

    client.off("load", func2);  // Remove the last one
    assert.deepEqual(client.handlers().load, []);
  });

  test("`on` can add more than one entry of the same handler function for the same event", function(assert) {
    assert.expect(2);

    // Arrange
    var client = new ZeroClipboard();
    var func1 = function() {};

    // Assert
    assert.ok(!client.handlers().load);

    // Act
    client.on("load", func1);
    client.on("load", func1);

    // Assert more
    assert.deepEqual(client.handlers().load, [func1, func1]);
  });

  test("`off` will remove all entries of the same handler function for the same event", function(assert) {
    assert.expect(3);

    // Arrange
    var client = new ZeroClipboard();
    var func1 = function() {};

    // Assert
    assert.ok(!client.handlers().load);

    // Act
    client.on("load", func1);
    client.on("load", func1);

    // Assert more
    assert.deepEqual(client.handlers().load, [func1, func1]);

    // Act more
    client.off("load", func1);

    // Assert even more
    assert.deepEqual(client.handlers().load, []);
  });

  test("`off` will remove all handler functions for an event if no function is specified", function(assert) {
    assert.expect(3);

    // Arrange
    var client = new ZeroClipboard();
    var func1 = function() {};
    var func2 = function() {};
    var func3 = function() {};

    // Assert
    assert.ok(!client.handlers().load);

    // Act
    client.on("load", func1);
    client.on("load", func2);
    client.on("load", func3);
    client.on("load", func1);

    // Assert more
    assert.deepEqual(client.handlers().load, [func1, func2, func3, func1]);

    // Act and assert even more
    client.off("load");  // Remove all
    assert.deepEqual(client.handlers().load, []);
  });

  test("`off` will remove all handler functions for all events if no event type is specified", function(assert) {
    assert.expect(6);

    // Arrange
    var client = new ZeroClipboard();
    var func1 = function() {};
    var func2 = function() {};
    var func3 = function() {};

    // Assert
    assert.ok(!client.handlers().load);
    assert.ok(!client.handlers().noflash);

    // Act
    client.on("load", func1);
    client.on("load", func2);
    client.on("noflash", func3);

    // Assert more
    assert.deepEqual(client.handlers().load, [func1, func2]);
    assert.deepEqual(client.handlers().noflash, [func3]);

    // Act and assert even more
    client.off();  // Remove all handlers for all types
    assert.deepEqual(client.handlers().load, []);
    assert.deepEqual(client.handlers().noflash, []);
  });

  test("Test noFlash Event", function(assert) {
    assert.expect(2);

    // Arrange
    flashState.disabled = true;
    var client = new ZeroClipboard();
    var id = client.id;

    // Act (should auto-fire immediately but the handler will be invoked asynchronously)
    client.on( 'noFlash', function(client, args) {
      // Assert
      assert.strictEqual(this, window);
      assert.strictEqual(client.id, id);
      QUnit.start();
    } );
    QUnit.stop();
  });

  test("Test wrongFlash Event", function(assert) {
    assert.expect(3);

    // Arrange
    flashState.disabled = false;
    flashState.outdated = true;
    flashState.version = "9.0.0";
    var client = new ZeroClipboard();
    var id = client.id;

    // Act
    client.on( 'load', function(client, args) {
      assert.ok(false, 'The `load` event should NOT have fired!');
    } );
    client.on( 'wrongFlash', function(client, args) {
      // Assert
      assert.strictEqual(this, window);
      assert.strictEqual(client.id, id);
      assert.strictEqual(args.flashVersion, "9.0.0");
      QUnit.start();
    } );
    QUnit.stop();
  });

  test("Test deactivatedFlash Event", function(assert) {
    assert.expect(5);

    // Arrange
    flashState.disabled = false;
    flashState.outdated = false;
    flashState.version = "10.0.0";
    ZeroClipboard.config({ flashLoadTimeout: 2000 });
    var client = new ZeroClipboard();
    var id = client.id;
    client.on( 'load', function(client, args) {
      assert.ok(false, 'The `load` event should NOT have fired!');
    } );
    client.on( 'deactivatedFlash', function(client, args) {
      // Assert
      assert.strictEqual(this, window);
      assert.strictEqual(client.id, id);
      assert.strictEqual(flashState.deactivated, true);
      assert.strictEqual(args.flashVersion, "10.0.0");
      QUnit.start();
    } );

    // Act
    setTimeout(function() {
      assert.strictEqual(flashState.deactivated, null);
      flashState.deactivated = true;
    }, 1000);
    QUnit.stop();
    // The "deactivatedFlash" event will automatically fire in 2 seconds if the `load` event does not fire first
  });

  test("Test deactivatedFlash Event after first resolution", function(assert) {
    assert.expect(4);

    // Arrange
    flashState.disabled = false;
    flashState.outdated = false;
    flashState.version = "10.0.0";
    flashState.deactivated = true;
    var client = new ZeroClipboard();
    var currentEl = document.getElementById("d_clip_button");
    var id = client.id;
    client.on( 'load', function(client, args) {
      assert.ok(false, 'The `load` event should NOT have fired!');
    } );
    client.on( 'deactivatedFlash', function(client, args) {
      // Assert
      assert.strictEqual(this, window);
      assert.strictEqual(client.id, id);
      assert.strictEqual(flashState.deactivated, true);
      assert.strictEqual(args.flashVersion, "10.0.0");
      QUnit.start();
    } );

    // Act
    QUnit.stop();
    // The "deactivatedFlash" event will automatically fire in 0 seconds (when the event loop gets to it)
  });

  test("Test load Event", function(assert) {
    assert.expect(4);

    // Arrange
    flashState.version = "11.9.0";
    var client = new ZeroClipboard();
    var currentEl = document.getElementById("d_clip_button");
    var id = client.id;
    client.clip(currentEl);
    client.on( 'load', function(client, args) {
      // Assert
      assert.strictEqual(this, window);
      assert.strictEqual(client.id, id);
      assert.strictEqual(flashState.deactivated, false);
      assert.strictEqual(args.flashVersion, "11.9.0");
      QUnit.start();
    } );

    // Act
    QUnit.stop();
    ZeroClipboard.dispatch("load");
  });

  test("Test load Event after first load", function(assert) {
    assert.expect(4);

    // Arrange
    flashState.disabled = false;
    flashState.outdated = false;
    flashState.deactivated = false;
    flashState.version = "11.9.0";
    flashState.ready = true;
    flashState.bridge = {};
    var client = new ZeroClipboard();
    var id = client.id;

    // Act (should auto-fire immediately but the handler will be invoked asynchronously)
    client.on( 'load', function(client, args) {
      // Assert
      assert.strictEqual(this, window);
      assert.strictEqual(client.id, id);
      assert.strictEqual(flashState.deactivated, false);
      assert.strictEqual(args.flashVersion, "11.9.0");
      QUnit.start();
    } );
    QUnit.stop();
  });

  test("Test overdueFlash Event", function(assert) {
    assert.expect(9);

    // Arrange
    flashState.disabled = false;
    flashState.outdated = false;
    flashState.version = "10.0.0";
    flashState.deactivated = true;
    var client = new ZeroClipboard();
    var currentEl = document.getElementById("d_clip_button");
    var id = client.id;
    client.on( 'load', function(client, args) {
      assert.ok(false, 'The `load` event should NOT have fired!');
    } );
    client.on( 'deactivatedFlash', function(client, args) {
      // Assert
      assert.strictEqual(this, window);
      assert.strictEqual(client.id, id);
      assert.strictEqual(flashState.deactivated, true);
      assert.strictEqual(args.flashVersion, "10.0.0");
    } );
    client.on( 'overdueFlash', function(client, args) {
      // Assert
      assert.strictEqual(this, window);
      assert.strictEqual(client.id, id);
      assert.strictEqual(flashState.deactivated, false);
      assert.strictEqual(flashState.overdue, true);
      assert.strictEqual(args.flashVersion, "10.0.0");
      QUnit.start();
    } );

    // Act
    QUnit.stop();
    // The "deactivatedFlash" event will automatically fire in 0 seconds (when the event loop gets to it)

    setTimeout(function() {
      // Dispatch a "load" event (as if from the SWF) to trigger an "overdueFlash" event
      ZeroClipboard.dispatch("load");
    }, 1000);
  });

  test("Test string function name as handler", function(assert) {
    assert.expect(1);

    // Arrange
    var client = new ZeroClipboard();
    var currentEl = document.getElementById("d_clip_button");
    var id = client.id;
    client.clip(currentEl);
    window.zcLoadCallback = function(client, args) {
      // Assert
      assert.strictEqual(client.id, id);
      QUnit.start();
      delete window.zcLoadCallback;
    };
    client.on( 'load', 'zcLoadCallback' );

    // Act
    QUnit.stop();
    ZeroClipboard.dispatch("load");
  });

  test("Test EventListener object as handler", function(assert) {
    assert.expect(2);

    // Arrange
    var client = new ZeroClipboard();
    var currentEl = document.getElementById("d_clip_button");
    var id = client.id;
    client.clip(currentEl);
    var eventListenerObj = {
      handleEvent: function(client, args) {
        // Assert
        assert.strictEqual(client.id, id);
        assert.strictEqual(this, eventListenerObj);
        QUnit.start();
      }
    };
    client.on( 'load', eventListenerObj );

    // Act
    QUnit.stop();
    ZeroClipboard.dispatch("load");
  });

  test("Test mouseover and mouseout event", function(assert) {
    assert.expect(2);

    // Arrange
    var client = new ZeroClipboard();
    var currentEl = document.getElementById("d_clip_button");
    client.clip(currentEl);
    ZeroClipboard.activate(currentEl);

    // Act
    QUnit.stop();
    ZeroClipboard.dispatch("mouseover");

    setTimeout(function() {
      // Assert
      assert.strictEqual(/(^| )zeroclipboard-is-hover( |$)/.test(currentEl.className), true);

      // Act more
      ZeroClipboard.dispatch("mouseout");
      
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
    var client = new ZeroClipboard();
    var currentEl = document.getElementById("d_clip_button");
    client.clip(currentEl);
    ZeroClipboard.activate(currentEl);

    // Act
    QUnit.stop();
    ZeroClipboard.dispatch("mousedown");

    setTimeout(function() {
      // Assert
      assert.strictEqual(/(^| )zeroclipboard-is-active( |$)/.test(currentEl.className), true);

      // Act more
      ZeroClipboard.dispatch("mouseup");

      setTimeout(function() {
        // Assert more
        assert.strictEqual(/(^| )zeroclipboard-is-active( |$)/.test(currentEl.className), false);
        QUnit.start();
      }, 25);
    }, 25);
  });

  test("Test for appropriate context inside of invoked event handlers", function(assert) {
    assert.expect(15);

    // Arrange
    var client = new ZeroClipboard();
    var currentEl = document.getElementById("d_clip_button");
    assert.ok(currentEl);
    assert.strictEqual(currentEl.id, "d_clip_button");

    client.clip(currentEl);
    ZeroClipboard.activate(currentEl);

    client.on( 'load noflash wrongflash deactivatedflash overdueflash', function(client, args) {
      // Assert
      assert.strictEqual(this, window);
    } );
    client.on( 'mousedown mouseover mouseup', function(client, args) {
      // Assert
      assert.strictEqual(this, currentEl);
    } );
    client.on( 'datarequested', function(client, args) {
      // Assert
      assert.strictEqual(this, currentEl);
      assert.ok(_clipData["text/plain"]);
    } );
    client.on( 'complete', function(client, args) {
      // Assert
      assert.strictEqual(this, currentEl);
      assert.ok(!_clipData["text/plain"]);
    } );
    client.on( 'mouseout', function(client, args) {
      // Assert
      assert.strictEqual(this, currentEl);
      QUnit.start();
    } );

    // Act
    QUnit.stop();
    ZeroClipboard.dispatch("load");
    ZeroClipboard.dispatch("noflash");
    ZeroClipboard.dispatch("wrongflash");
    ZeroClipboard.dispatch("deactivatedflash");
    ZeroClipboard.dispatch("overdueflash");
    ZeroClipboard.dispatch("mouseover");
    ZeroClipboard.dispatch("mousedown");
    ZeroClipboard.dispatch("mouseup");
    ZeroClipboard.dispatch("datarequested");
    ZeroClipboard.dispatch("complete");
    ZeroClipboard.dispatch("mouseout");
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

    var client = new ZeroClipboard();
    var currentEl = document.getElementById("d_clip_button");
    client.clip(currentEl);
    ZeroClipboard.activate(currentEl);
    var id = client.id;

    client.on( "load", function(client, args) {
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
'    assert.deepEqual(args, {});' +
'    zero.dispatch(eventName, args);' +
'  });' +
'})("load", {}, ' + JSON.stringify(_amdModuleId) + ');'
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

    var client = new ZeroClipboard();
    var currentEl = document.getElementById("d_clip_button");
    client.clip(currentEl);
    ZeroClipboard.activate(currentEl);
    var id = client.id;

    client.on( "load", function(client, args) {
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
'  assert.deepEqual(args, {});' +
'  zero.dispatch(eventName, args);' +
'})("load", {}, ' + JSON.stringify(_cjsModuleId) + ');'
    );
  });

})(QUnit.module, QUnit.test);