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
    client.on("ready", function(){});
    client.on("onError", function(){});
    client.on("onCustomEvent", function(){});

    // Assert
    assert.ok(client.handlers().ready);
    assert.ok(client.handlers().error);
    assert.ok(client.handlers().customevent);
    assert.strictEqual(client.handlers().ready.length, 1);
    assert.strictEqual(client.handlers().error.length, 1);
    assert.strictEqual(client.handlers().customevent.length, 1);
  });

  test("Registering Events with Maps", function(assert) {
    assert.expect(6);

    // Arrange
    var client = new ZeroClipboard();

    // Act
    client.on({
      "ready": function(){},
      "onError": function(){},
      "onCustomEvent": function(){}
    });

    // Assert
    assert.ok(client.handlers().ready);
    assert.ok(client.handlers().error);
    assert.ok(client.handlers().customevent);
    assert.strictEqual(client.handlers().ready.length, 1);
    assert.strictEqual(client.handlers().error.length, 1);
    assert.strictEqual(client.handlers().customevent.length, 1);
  });

  test("Unregistering Events", function(assert) {
    assert.expect(6);

    // Arrange
    var client = new ZeroClipboard();
    var ready = function(){};
    var onError = function(){};
    var onCustomEvent = function(){};

    // Act
    client.on("ready", ready);
    client.on("onError", onError);
    client.on("onCustomEvent", onCustomEvent);

    // Assert
    assert.deepEqual(client.handlers().ready, [ready]);
    assert.deepEqual(client.handlers().error, [onError]);
    assert.deepEqual(client.handlers().customevent, [onCustomEvent]);

    // Act & Assert
    client.off("ready", ready);
    assert.deepEqual(client.handlers().ready, []);

    // Act & Assert
    client.off("onError", onError);
    assert.deepEqual(client.handlers().error, []);

    // Act & Assert
    client.off("onCustomEvent", onCustomEvent);
    assert.deepEqual(client.handlers().customevent, []);
  });

  test("Unregistering Events with Maps", function(assert) {
    assert.expect(6);

    // Arrange
    var client = new ZeroClipboard();
    var ready = function(){};
    var onError = function(){};
    var onCustomEvent = function(){};

    // Act
    client.on("ready", ready);
    client.on("onError", onError);
    client.on("onCustomEvent", onCustomEvent);

    // Assert
    assert.deepEqual(client.handlers().ready, [ready]);
    assert.deepEqual(client.handlers().error, [onError]);
    assert.deepEqual(client.handlers().customevent, [onCustomEvent]);

    // Act & Assert
    client.off({ "ready": ready });
    assert.deepEqual(client.handlers().ready, []);

    // Act & Assert
    client.off({ "onError": onError });
    assert.deepEqual(client.handlers().error, []);

    // Act & Assert
    client.off({ "onCustomEvent": onCustomEvent });
    assert.deepEqual(client.handlers().customevent, []);
  });

  test("Registering two events works", function(assert) {
    assert.expect(6);

    // Arrange
    var client = new ZeroClipboard();

    // Assert
    assert.ok(!client.handlers().ready);
    assert.ok(!client.handlers().aftercopy);

    // Act
    client.on("ready onaftercopy", function(){});

    // Assert more
    assert.ok(client.handlers().ready);
    assert.ok(client.handlers().aftercopy);
    assert.strictEqual(client.handlers().ready.length, 1);
    assert.strictEqual(client.handlers().aftercopy.length, 1);
  });

  test("Registering two events with a map works", function(assert) {
    assert.expect(6);

    // Arrange
    var client = new ZeroClipboard();

    // Assert
    assert.ok(!client.handlers().ready);
    assert.ok(!client.handlers().aftercopy);

    // Act
    client.on({
      "ready onaftercopy": function(){}
    });

    // Assert more
    assert.ok(client.handlers().ready);
    assert.ok(client.handlers().aftercopy);
    assert.strictEqual(client.handlers().ready.length, 1);
    assert.strictEqual(client.handlers().aftercopy.length, 1);
  });

  test("Unregistering two events works", function(assert) {
    assert.expect(6);

    // Arrange
    var client = new ZeroClipboard();
    var func = function() {};

    // Assert
    assert.ok(!client.handlers().ready);
    assert.ok(!client.handlers().aftercopy);

    // Act
    client.on("ready onaftercopy", func);

    // Assert more
    assert.deepEqual(client.handlers().ready, [func]);
    assert.deepEqual(client.handlers().aftercopy, [func]);

    // Act more
    client.off("ready onaftercopy", func);

    // Assert even more
    assert.deepEqual(client.handlers().ready, []);
    assert.deepEqual(client.handlers().aftercopy, []);
  });

  test("Unregistering two events with a map works", function(assert) {
    assert.expect(6);

    // Arrange
    var client = new ZeroClipboard();
    var func = function() {};

    // Assert
    assert.ok(!client.handlers().ready);
    assert.ok(!client.handlers().aftercopy);

    // Act
    client.on("ready onaftercopy", func);

    // Assert more
    assert.deepEqual(client.handlers().ready, [func]);
    assert.deepEqual(client.handlers().aftercopy, [func]);

    // Act more
    client.off({
      "ready onaftercopy": func
    });

    // Assert even more
    assert.deepEqual(client.handlers().ready, []);
    assert.deepEqual(client.handlers().aftercopy, []);
  });

  test("`on` can add multiple handlers for the same event", function(assert) {
    assert.expect(3);

    // Arrange
    var client = new ZeroClipboard();
    var func1 = function() {};
    var func2 = function() {};

    // Assert
    assert.ok(!client.handlers().ready);

    // Act
    client.on("ready", func1);

    // Assert more
    assert.deepEqual(client.handlers().ready, [func1]);

    // Act more
    client.on("ready", func2);

    // Assert even more
    assert.deepEqual(client.handlers().ready, [func1, func2]);
  });

  test("`off` can remove multiple handlers for the same event", function(assert) {
    assert.expect(5);

    // Arrange
    var client = new ZeroClipboard();
    var func1 = function() {};
    var func2 = function() {};
    var func3 = function() {};

    // Assert
    assert.ok(!client.handlers().ready);

    // Act
    client.on("ready", func1);
    client.on("ready", func2);
    client.on("ready", func3);

    // Assert more
    assert.deepEqual(client.handlers().ready, [func1, func2, func3]);

    // Act and assert even more
    client.off("ready", func3);  // Remove from the end
    assert.deepEqual(client.handlers().ready, [func1, func2]);

    client.off("ready", func1);  // Remove from the start
    assert.deepEqual(client.handlers().ready, [func2]);

    client.off("ready", func2);  // Remove the last one
    assert.deepEqual(client.handlers().ready, []);
  });

  test("`on` can add more than one entry of the same handler function for the same event", function(assert) {
    assert.expect(2);

    // Arrange
    var client = new ZeroClipboard();
    var func1 = function() {};

    // Assert
    assert.ok(!client.handlers().ready);

    // Act
    client.on("ready", func1);
    client.on("ready", func1);

    // Assert more
    assert.deepEqual(client.handlers().ready, [func1, func1]);
  });

  test("`off` will remove all entries of the same handler function for the same event", function(assert) {
    assert.expect(3);

    // Arrange
    var client = new ZeroClipboard();
    var func1 = function() {};

    // Assert
    assert.ok(!client.handlers().ready);

    // Act
    client.on("ready", func1);
    client.on("ready", func1);

    // Assert more
    assert.deepEqual(client.handlers().ready, [func1, func1]);

    // Act more
    client.off("ready", func1);

    // Assert even more
    assert.deepEqual(client.handlers().ready, []);
  });

  test("`off` will remove all handler functions for an event if no function is specified", function(assert) {
    assert.expect(3);

    // Arrange
    var client = new ZeroClipboard();
    var func1 = function() {};
    var func2 = function() {};
    var func3 = function() {};

    // Assert
    assert.ok(!client.handlers().ready);

    // Act
    client.on("ready", func1);
    client.on("ready", func2);
    client.on("ready", func3);
    client.on("ready", func1);

    // Assert more
    assert.deepEqual(client.handlers().ready, [func1, func2, func3, func1]);

    // Act and assert even more
    client.off("ready");  // Remove all
    assert.deepEqual(client.handlers().ready, []);
  });

  test("`off` will remove all handler functions for all events if no event type is specified", function(assert) {
    assert.expect(6);

    // Arrange
    var client = new ZeroClipboard();
    var func1 = function() {};
    var func2 = function() {};
    var func3 = function() {};

    // Assert
    assert.ok(!client.handlers().ready);
    assert.ok(!client.handlers().error);

    // Act
    client.on("ready", func1);
    client.on("ready", func2);
    client.on("error", func3);

    // Assert more
    assert.deepEqual(client.handlers().ready, [func1, func2]);
    assert.deepEqual(client.handlers().error, [func3]);

    // Act and assert even more
    client.off();  // Remove all handlers for all types
    assert.deepEqual(client.handlers().ready, []);
    assert.deepEqual(client.handlers().error, []);
  });

  test("Test disabledFlash Event", function(assert) {
    assert.expect(6);

    // Arrange
    flashState.disabled = true;
    var client = new ZeroClipboard();
    var id = client.id;

    // Act (should auto-fire immediately but the handler will be invoked asynchronously)
    client.on( 'error', function(event) {
      // Assert
      assert.strictEqual(this, client);
      assert.strictEqual(this.id, id);
      assert.strictEqual(flashState.disabled, true);
      assert.strictEqual(event.type, "error");
      assert.strictEqual(event.name, "flash-disabled");
      assert.strictEqual(event.target, null);
      QUnit.start();
    } );
    QUnit.stop();
  });

  test("Test outdatedFlash Event", function(assert) {
    assert.expect(8);

    // Arrange
    flashState.disabled = false;
    flashState.outdated = true;
    flashState.version = "9.0.0";
    var client = new ZeroClipboard();
    var id = client.id;

    // Act
    client.on( 'ready', function(event) {
      assert.ok(false, 'The `ready` event should NOT have fired!');
    } );
    client.on( 'error', function(event) {
      // Assert
      assert.strictEqual(this, client);
      assert.strictEqual(this.id, id);
      assert.strictEqual(flashState.outdated, true);
      assert.strictEqual(event.type, "error");
      assert.strictEqual(event.name, "flash-outdated");
      assert.strictEqual(event.target, null);
      assert.strictEqual(event.version, "9.0.0");
      assert.strictEqual(event.minimumVersion, "10.0.0");
      QUnit.start();
    } );
    QUnit.stop();
  });

  test("Test deactivatedFlash Event", function(assert) {
    assert.expect(10);

    // Arrange
    flashState.disabled = false;
    flashState.outdated = false;
    flashState.version = "10.0.0";
    ZeroClipboard.config({ flashLoadTimeout: 2000 });
    var client = new ZeroClipboard();
    var id = client.id;
    client.on( 'ready', function(event) {
      assert.ok(false, 'The `ready` event should NOT have fired!');
    } );
    client.on( 'error', function(event) {
      // Assert
      assert.strictEqual(this, client);
      assert.strictEqual(this.id, id);
      assert.strictEqual(flashState.deactivated, true);
      assert.strictEqual(flashState.ready, false);
      assert.strictEqual(event.type, "error");
      assert.strictEqual(event.name, "flash-deactivated");
      assert.strictEqual(event.target, null);
      assert.strictEqual(event.version, "10.0.0");
      assert.strictEqual(event.minimumVersion, "10.0.0");
      QUnit.start();
    } );

    // Act
    setTimeout(function() {
      assert.strictEqual(flashState.deactivated, null);
    }, 500);
    QUnit.stop();
    // The "deactivatedFlash" event will automatically fire in 2 seconds if the `ready` event does not fire first
  });

  test("Test deactivatedFlash Event after first resolution", function(assert) {
    assert.expect(8);

    // Arrange
    flashState.disabled = false;
    flashState.outdated = false;
    flashState.version = "10.0.0";
    flashState.deactivated = true;
    var client = new ZeroClipboard();
    var currentEl = document.getElementById("d_clip_button");
    var id = client.id;
    client.on( 'ready', function(event) {
      assert.ok(false, 'The `ready` event should NOT have fired!');
    } );
    client.on( 'error', function(event) {
      // Assert
      assert.strictEqual(this, client);
      assert.strictEqual(this.id, id);
      assert.strictEqual(flashState.deactivated, true);
      assert.strictEqual(event.type, "error");
      assert.strictEqual(event.name, "flash-deactivated");
      assert.strictEqual(event.target, null);
      assert.strictEqual(event.version, "10.0.0");
      assert.strictEqual(event.minimumVersion, "10.0.0");
      QUnit.start();
    } );

    // Act
    QUnit.stop();
    // The "deactivatedFlash" event will automatically fire in 0 seconds (when the event loop gets to it)
  });

  test("Test ready Event", function(assert) {
    assert.expect(6);

    // Arrange
    flashState.disabled = false;
    flashState.outdated = false;
    flashState.version = "11.9.0";
    var client = new ZeroClipboard();
    var currentEl = document.getElementById("d_clip_button");
    var id = client.id;
    client.clip(currentEl);
    client.on( 'ready', function(event) {
      // Assert
      assert.strictEqual(this, client);
      assert.strictEqual(this.id, id);
      assert.strictEqual(event.type, "ready");
      assert.strictEqual(event.target, null);
      assert.strictEqual(flashState.deactivated, false);
      assert.strictEqual(event.version, "11.9.0");
      QUnit.start();
    } );

    // Act
    QUnit.stop();
    ZeroClipboard.emit("ready");
  });

  test("Test ready Event after first load", function(assert) {
    assert.expect(6);

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
    client.on( "ready", function(event) {
      // Assert
      assert.strictEqual(this, client);
      assert.strictEqual(this.id, id);
      assert.strictEqual(event.type, "ready");
      assert.strictEqual(event.target, null);
      assert.strictEqual(flashState.deactivated, false);
      assert.strictEqual(event.version, "11.9.0");
      QUnit.start();
    } );
    QUnit.stop();
  });

  test("Test overdueFlash Event", function(assert) {
    assert.expect(15);

    // Arrange
    flashState.disabled = false;
    flashState.outdated = false;
    flashState.version = "10.0.0";
    flashState.deactivated = true;
    var client = new ZeroClipboard();
    var currentEl = document.getElementById("d_clip_button");
    var id = client.id;
    client.on( 'ready', function(event) {
      assert.ok(false, 'The `ready` event should NOT have fired!');
    } );
    client.on( 'error', function(event) {
      // Assert
      assert.strictEqual(this, client);
      assert.strictEqual(this.id, id);
      if (event.name === "flash-deactivated") {
        assert.strictEqual(event.type, "error");
        assert.strictEqual(event.name, "flash-deactivated");
        assert.strictEqual(flashState.deactivated, true);
        assert.strictEqual(event.version, "10.0.0");
        assert.strictEqual(event.minimumVersion, "10.0.0");
      }
      else if (event.name === "flash-overdue") {
        assert.strictEqual(event.type, "error");
        assert.strictEqual(event.name, "flash-overdue");
        assert.strictEqual(flashState.deactivated, false);
        assert.strictEqual(flashState.overdue, true);
        assert.strictEqual(event.version, "10.0.0");
        assert.strictEqual(event.minimumVersion, "10.0.0");

        QUnit.start();
      }
    } );

    // Act
    QUnit.stop();
    // The "deactivatedFlash" event will automatically fire in 0 seconds (when the event loop gets to it)

    setTimeout(function() {
      // Emit a "ready" event (as if from the SWF) to trigger an "overdueFlash" event
      ZeroClipboard.emit("ready");
    }, 1000);
  });

  test("Test string function name as handler", function(assert) {
    assert.expect(2);

    // Arrange
    var client = new ZeroClipboard();
    var currentEl = document.getElementById("d_clip_button");
    var id = client.id;
    client.clip(currentEl);
    window.zcLoadCallback = function(event) {
      // Assert
      assert.strictEqual(this.id, id);
      assert.strictEqual(event.type, "ready");
      QUnit.start();
      delete window.zcLoadCallback;
    };
    client.on( "ready", "zcLoadCallback" );

    // Act
    QUnit.stop();
    ZeroClipboard.emit("ready");
  });

  test("Test EventListener object as handler", function(assert) {
    assert.expect(4);

    // Arrange
    var client = new ZeroClipboard();
    var currentEl = document.getElementById("d_clip_button");
    var id = client.id;
    client.clip(currentEl);
    var eventListenerObj = {
      handleEvent: function(event) {
        // Assert
        assert.strictEqual(event.type, "ready");
        assert.strictEqual(event.client, client);
        assert.strictEqual(event.client.id, id);
        assert.strictEqual(this, eventListenerObj);
        QUnit.start();
      }
    };
    client.on( "ready", eventListenerObj );

    // Act
    QUnit.stop();
    ZeroClipboard.emit("ready");
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
    ZeroClipboard.emit("mouseover");

    setTimeout(function() {
      // Assert
      assert.strictEqual(/(^| )zeroclipboard-is-hover( |$)/.test(currentEl.className), true);

      // Act more
      ZeroClipboard.emit("mouseout");
      
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
    ZeroClipboard.emit("mousedown");

    setTimeout(function() {
      // Assert
      assert.strictEqual(/(^| )zeroclipboard-is-active( |$)/.test(currentEl.className), true);

      // Act more
      ZeroClipboard.emit("mouseup");

      setTimeout(function() {
        // Assert more
        assert.strictEqual(/(^| )zeroclipboard-is-active( |$)/.test(currentEl.className), false);
        QUnit.start();
      }, 25);
    }, 25);
  });

  test("Test for appropriate context inside of invoked event handlers", function(assert) {
    assert.expect(16);

    // Arrange
    var client = new ZeroClipboard();
    var currentEl = document.getElementById("d_clip_button");
    assert.ok(currentEl);
    assert.strictEqual(currentEl.id, "d_clip_button");

    client.clip(currentEl);
    ZeroClipboard.activate(currentEl);

    client.on( 'ready error', function(event) {
      // Assert
      assert.strictEqual(this, client);
    } );
    client.on( 'mousedown mouseover mouseup beforecopy', function(event) {
      // Assert
      assert.strictEqual(event.target, currentEl);
    } );
    client.on( 'copy', function(event) {
      // Assert
      assert.strictEqual(event.target, currentEl);
      assert.ok(_clipData["text/plain"]);
    } );
    client.on( 'aftercopy', function(event) {
      // Assert
      assert.strictEqual(event.target, currentEl);
      assert.ok(!_clipData["text/plain"]);
    } );
    client.on( 'mouseout', function(event) {
      // Assert
      assert.strictEqual(event.target, currentEl);
      QUnit.start();
    } );

    // Act
    QUnit.stop();
    ZeroClipboard.emit("ready");
    ZeroClipboard.emit({"type":"error", "name":"flash-disabled"});
    ZeroClipboard.emit({"type":"error", "name":"flash-outdated"});
    ZeroClipboard.emit({"type":"error", "name":"flash-deactivated"});
    ZeroClipboard.emit({"type":"error", "name":"flash-overdue"});
    ZeroClipboard.emit("mouseover");
    ZeroClipboard.emit("mousedown");
    ZeroClipboard.emit("mouseup");
    ZeroClipboard.emit("beforecopy");
    ZeroClipboard.emit("copy");
    ZeroClipboard.emit("aftercopy");
    ZeroClipboard.emit("mouseout");
  });

  test("Test onReady Event with AMD", function(assert) {
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

    client.on( "ready", function(event) {
      // Assert
      assert.strictEqual(this.id, id);
      assert.strictEqual(event.type, "ready");
      QUnit.start();
    } );

    // Act
    QUnit.stop();
    eval(
'(function(event, amdModuleId) {' +
'  requireFn([amdModuleId], function(zero) {' +
'    assert.strictEqual(zero, ZeroClipboard);' +
'    assert.deepEqual(event, {"type": "ready"});' +
'    zero.emit(event);' +
'  });' +
'})({"type": "ready"}, ' + JSON.stringify(_amdModuleId) + ');'
    );
  });

  test("Test onReady Event with CommonJS", function(assert) {
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

    client.on( "ready", function(event) {
      // Assert
      assert.strictEqual(this.id, id);
      assert.strictEqual(event.type, "ready");
      QUnit.start();
    } );

    // Act
    QUnit.stop();
    eval(
'(function(event, cjsModuleId) {' +
'  var zero = requireFn(cjsModuleId);' +
'  assert.strictEqual(zero, ZeroClipboard);' +
'  assert.deepEqual(event, {"type": "ready"});' +
'  zero.emit(event);' +
'})({"type": "ready"}, ' + JSON.stringify(_cjsModuleId) + ');'
    );
  });

})(QUnit.module, QUnit.test);