/*global ZeroClipboard */

"use strict";

(function(module, test) {

  // Helper functions
  var TestUtils = {
    getHtmlBridge: function() {
      return document.getElementById("global-zeroclipboard-html-bridge");
    }
  };

  var mimeType, ax;

  module("ZeroClipboard (built) - Client", {
    setup: function() {
      // Store
      mimeType = window.navigator.mimeTypes["application/x-shockwave-flash"];
      ax = window.ActiveXObject;
      // Modify
      window.navigator.mimeTypes["application/x-shockwave-flash"] = {};
      window.ActiveXObject = function() { };
    },
    teardown: function() {
      window.navigator.mimeTypes["application/x-shockwave-flash"] = mimeType;
      window.ActiveXObject = ax;
      ZeroClipboard.destroy();
    }
  });

  test("`ZeroClipboard` exists", function(assert) {
    assert.expect(1);

    // Arrange -> N/A

    // Act -> N/A

    // Assert
    assert.ok(ZeroClipboard);
  });

  test("Client is created properly", function(assert) {
    assert.expect(2);

    // Arrange & Act
    var client = new ZeroClipboard();

    // Assert
    assert.ok(client);
    assert.ok(client.id);
  });

  test("Client without selector doesn't have elements", function(assert) {
    assert.expect(2);

    // Arrange & Act
    var client = new ZeroClipboard();

    // Assert
    assert.ok(client);
    assert.deepEqual(client.elements(), []);
  });

  test("Object has a title", function(assert) {
    assert.expect(1);

    // Arrange
    var client = new ZeroClipboard();
    var currentEl = document.getElementById("d_clip_button");

    // Act
    client.clip(currentEl);
    ZeroClipboard.activate(currentEl);

    // Assert
    assert.strictEqual(TestUtils.getHtmlBridge().getAttribute("title"), "Click me to copy to clipboard.");

    // Revert
    ZeroClipboard.deactivate();
  });

  test("Object has no title", function(assert) {
    assert.expect(1);

    // Arrange
    var client = new ZeroClipboard();
    var currentEl = document.getElementById("d_clip_button_no_title");

    // Act
    client.clip(currentEl);
    ZeroClipboard.activate(currentEl);

    // Assert
    assert.ok(!TestUtils.getHtmlBridge().getAttribute("title"));
  });

  test("Object doesn't have data-clipboard-text", function(assert) {
    assert.expect(1);

    // Arrange
    var client = new ZeroClipboard();
    var currentEl = document.getElementById("d_clip_button_no_text");

    // Act
    client.clip(currentEl);
    ZeroClipboard.activate(currentEl);

    // Assert
    assert.ok(!TestUtils.getHtmlBridge().getAttribute("data-clipboard-text"));
  });

  test("New client is not the same client (no singleton) but does share the same bridge", function(assert) {
    assert.expect(6);

    // Assert, arrange, assert, act, assert
    assert.strictEqual($(".global-zeroclipboard-container").length, 0);
    var client1 = new ZeroClipboard();
    assert.ok(client1.id);
    assert.strictEqual($(".global-zeroclipboard-container").length, 1);
    var client2 = new ZeroClipboard();
    assert.strictEqual($(".global-zeroclipboard-container").length, 1);
    assert.notEqual(client2.id, client1.id);
    assert.notEqual(client2, client1);
  });

  test("Calculations based on borderWidth never return NaN", function(assert) {
    assert.expect(4);

    // Arrange
    var client = new ZeroClipboard();
    var currentEl = document.getElementById("d_clip_button");

    // Act
    client.clip(currentEl);
    ZeroClipboard.activate(currentEl);

    // Assert
    var htmlBridge = TestUtils.getHtmlBridge();
    assert.strictEqual(/^-?[0-9\.]+px$/.test(htmlBridge.style.top), true);
    assert.strictEqual(/^-?[0-9\.]+px$/.test(htmlBridge.style.left), true);
    assert.strictEqual(/^-?[0-9\.]+px$/.test(htmlBridge.style.width), true);
    assert.strictEqual(/^-?[0-9\.]+px$/.test(htmlBridge.style.height), true);
  });
  
  test("No more client singleton!", function(assert) {
    assert.expect(7);

    // Arrange
    ZeroClipboard.detectFlashSupport = function() {
      return true;
    };

    // Assert, arrange, assert, act, assert
    assert.ok(!ZeroClipboard.prototype._singleton, "The client singleton does not exist on the prototype before creating a client");
    var client1 = new ZeroClipboard();
    assert.ok(!ZeroClipboard.prototype._singleton, "The client singleton does not exist on the prototype after creating a client");
    assert.ok(!client1._singleton, "The client singleton does not exist on the client instance after creating a client");
    var client2 = new ZeroClipboard();
    assert.ok(!ZeroClipboard.prototype._singleton, "The client singleton does not exist on the prototype after creating a second client");
    assert.ok(!client1._singleton, "The client singleton does not exist on the first client instance after creating a second client");
    assert.ok(!client2._singleton, "The client singleton does not exist on the second client instance after creating a second client");
    ZeroClipboard.destroy();
    assert.ok(!ZeroClipboard.prototype._singleton, "The client singleton does not exist on the prototype after calling `destroy`");
  });


  module("ZeroClipboard (built) - Core", {
    setup: function() {
      // Store
      mimeType = window.navigator.mimeTypes["application/x-shockwave-flash"];
      ax = window.ActiveXObject;
      // Modify
      window.navigator.mimeTypes["application/x-shockwave-flash"] = {};
      window.ActiveXObject = function() { };
    },
    teardown: function() {
      window.navigator.mimeTypes["application/x-shockwave-flash"] = mimeType;
      window.ActiveXObject = ax;
      ZeroClipboard.destroy();
    }
  });


  test("`swfPath` finds the expected default URL", function(assert) {
    assert.expect(1);

    // Assert, act, assert
    var pageUrl = window.location.href.split("#")[0].split("?")[0];
    var protocolIndex = pageUrl.lastIndexOf("//");
    var protocol = pageUrl.slice(0, protocolIndex + 2);
    var rootDir = protocol + pageUrl.slice(protocolIndex + 2).split("/").slice(0, -2).join("/") + "/";
    //var zcJsUrl = rootDir + "ZeroClipboard.js";
    var swfPathBasedOnZeroClipboardJsPath = rootDir + "ZeroClipboard.swf";

    // Test that the client has the expected default URL [even if it's not correct]
    assert.strictEqual(ZeroClipboard.config("swfPath"), swfPathBasedOnZeroClipboardJsPath);
  });


  test("`destroy` destroys the bridge", function(assert) {
    assert.expect(3);

    // Arrange
    ZeroClipboard.detectFlashSupport = function() {
      return true;
    };

    // Assert, arrange, assert, act, assert
    assert.equal(TestUtils.getHtmlBridge(), null, "The bridge does not exist before creating a client");
    var client = new ZeroClipboard();
    assert.notEqual(TestUtils.getHtmlBridge(), null, "The bridge does exist after creating a client");
    ZeroClipboard.destroy();
    assert.equal(TestUtils.getHtmlBridge(), null, "The bridge does not exist after calling `destroy`");
  });

  
  /** @deprecated */
  module("ZeroClipboard (built) - DOM - deprecated", {
    setup: function() {
      // Store
      mimeType = window.navigator.mimeTypes["application/x-shockwave-flash"];
      ax = window.ActiveXObject;
      // Modify
      window.navigator.mimeTypes["application/x-shockwave-flash"] = {};
      window.ActiveXObject = function() { };
      ZeroClipboard.config({ debug: false });
    },
    teardown: function() {
      window.navigator.mimeTypes["application/x-shockwave-flash"] = mimeType;
      window.ActiveXObject = ax;
      ZeroClipboard.destroy();
      ZeroClipboard.config({ debug: true });
    }
  });

  /** @deprecated use of `client.ready()` */
  test("Bridge is ready after dispatching `load`", function(assert) {
    assert.expect(2);

    // Arrange
    ZeroClipboard.detectFlashSupport = function() {
      return true;
    };
    var client = new ZeroClipboard();

    // Assert, act, assert
    assert.strictEqual(client.ready(), false);
    // `dispatch`-ing event handlers are async but the internal `ready` state is set synchronously
    ZeroClipboard.dispatch("load", { flashVersion: "MAC 11,0,0" });
    assert.strictEqual(client.ready(), true);
  });


  /** @deprecated */
  module("ZeroClipboard (built) - Client - deprecated", {
    setup: function() {
      // Store
      mimeType = window.navigator.mimeTypes["application/x-shockwave-flash"];
      ax = window.ActiveXObject;
      // Modify
      window.navigator.mimeTypes["application/x-shockwave-flash"] = {};
      window.ActiveXObject = function() { };
      ZeroClipboard.config({ debug: false });
    },
    teardown: function() {
      window.navigator.mimeTypes["application/x-shockwave-flash"] = mimeType;
      window.ActiveXObject = ax;
      ZeroClipboard.destroy();
      ZeroClipboard.config({ debug: true });
    }
  });

  /** @deprecated */
  test("Client sets title properly", function(assert) {
    assert.expect(2);

    // Arrange
    var client = new ZeroClipboard();
    var currentEl = document.getElementById("d_clip_button");

    // Act
    client.clip(currentEl);
    client.setTitle("Click Me");

    // Assert
    assert.ok(TestUtils.getHtmlBridge());
    assert.strictEqual(TestUtils.getHtmlBridge().getAttribute("title"), "Click Me");
  });

})(QUnit.module, QUnit.test);
