/*global ZeroClipboard, _clipData, flashState */

"use strict";

(function(module, test) {

  // Helper functions
  var TestUtils = {
    getHtmlBridge: function() {
      return document.getElementById("global-zeroclipboard-html-bridge");
    }
  };

  var originalFlashDetect;


  module("client", {
    setup: function() {
      // Store
      originalFlashDetect = ZeroClipboard.isFlashUnusable;
      // Modify
      ZeroClipboard.isFlashUnusable = function() {
        return false;
      };
    },
    teardown: function() {
      // Restore
      ZeroClipboard.isFlashUnusable = originalFlashDetect;
      ZeroClipboard.destroy();
    }
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


  test("`setText` works", function(assert) {
    assert.expect(4);

    // Arrange
    var client = new ZeroClipboard();

    // Assert, Act, repeat ad nauseam
    assert.deepEqual(_clipData, {}, "`_clipData` is empty");

    client.setText("zc4evar");
    assert.deepEqual(_clipData, { "text/plain": "zc4evar" }, "`_clipData` contains expected text");

    client.setText("**ZeroClipboard**");
    assert.deepEqual(_clipData, { "text/plain": "**ZeroClipboard**" }, "`_clipData` contains expected updated text");

    _clipData["text/html"] = "<b>Win</b>";
    client.setText("goodbye");
    assert.deepEqual(_clipData, { "text/plain": "goodbye", "text/html": "<b>Win</b>" }, "`_clipData` contains expected updated text AND the other data");
  });


  test("`setHtml` works", function(assert) {
    assert.expect(4);

    // Arrange
    var client = new ZeroClipboard();

    // Assert, Act, repeat ad nauseam
    assert.deepEqual(_clipData, {}, "`_clipData` is empty");

    client.setHtml("zc4evar");
    assert.deepEqual(_clipData, { "text/html": "zc4evar" }, "`_clipData` contains expected HTML");

    client.setHtml("<b>ZeroClipboard</b>");
    assert.deepEqual(_clipData, { "text/html": "<b>ZeroClipboard</b>" }, "`_clipData` contains expected updated HTML");

    _clipData["text/plain"] = "blah";
    client.setHtml("<i>goodbye</i>");
    assert.deepEqual(_clipData, { "text/html": "<i>goodbye</i>", "text/plain": "blah" }, "`_clipData` contains expected updated HTML AND the other data");
  });


  test("`setRichText` works", function(assert) {
    assert.expect(4);

    // Arrange
    var client = new ZeroClipboard();

    // Assert, Act, repeat ad nauseam
    assert.deepEqual(_clipData, {}, "`_clipData` is empty");

    client.setRichText("zc4evar");
    assert.deepEqual(_clipData, { "application/rtf": "zc4evar" }, "`_clipData` contains expected RTF");

    client.setRichText("{\\rtf1\\ansi\n{\\b ZeroClipboard}}");
    assert.deepEqual(_clipData, { "application/rtf": "{\\rtf1\\ansi\n{\\b ZeroClipboard}}" }, "`_clipData` contains expected updated RTF");

    _clipData["text/plain"] = "blah";
    client.setRichText("{\\rtf1\\ansi\n{\\i Foo}}");
    assert.deepEqual(_clipData, { "application/rtf": "{\\rtf1\\ansi\n{\\i Foo}}", "text/plain": "blah" }, "`_clipData` contains expected updated RTF AND the other data");
  });


  test("`setData` works", function(assert) {
    assert.expect(4);

    // Arrange
    var client = new ZeroClipboard();

    // Assert, Act, repeat ad nauseam
    assert.deepEqual(_clipData, {}, "`_clipData` is empty");

    client.setData("text/plain", "zc4evar");
    assert.deepEqual(_clipData, { "text/plain": "zc4evar" }, "`_clipData` contains expected text");

    client.setData("text/x-markdown", "**ZeroClipboard**");
    assert.deepEqual(_clipData, { "text/plain": "zc4evar", "text/x-markdown": "**ZeroClipboard**" }, "`_clipData` contains expected text and custom format");

    client.setData({ "text/html": "<b>Win</b>" });
    assert.deepEqual(_clipData, { "text/html": "<b>Win</b>" }, "`_clipData` contains expected HTML and cleared out old data because an object was passed in");
  });


  test("`clearData` works", function(assert) {
    assert.expect(4);

    // Arrange
    var client = new ZeroClipboard();

    // Assert
    assert.deepEqual(_clipData, {}, "`_clipData` is empty");

    // Arrange & Assert
    _clipData["text/plain"] = "zc4evar";
    _clipData["text/html"] = "<b>Win</b>";
    _clipData["text/x-markdown"] = "**ZeroClipboard**";
    assert.deepEqual(_clipData, {
      "text/plain": "zc4evar",
      "text/html": "<b>Win</b>",
      "text/x-markdown": "**ZeroClipboard**"
    }, "`_clipData` contains all expected data");

    // Act & Assert
    client.clearData("text/html");
    assert.deepEqual(_clipData, {
      "text/plain": "zc4evar",
      "text/x-markdown": "**ZeroClipboard**"
    }, "`_clipData` had 'text/html' successfully removed");

    // Act & Assert
    client.clearData();
    assert.deepEqual(_clipData, {}, "`_clipData` had all data successfully removed");
  });


  test("`setText` overrides the data-clipboard-text attribute", function(assert) {
    assert.expect(2);

    // Arrange
    var client = new ZeroClipboard();
    var currentEl = document.getElementById("d_clip_button");

    // Act
    client.clip(currentEl);
    client.setText("This is the new text");
    ZeroClipboard.activate(currentEl);
    var pendingText = JSON.parse(ZeroClipboard.emit("copy"));

    // Assert
    assert.deepEqual(_clipData, { "text/plain": "This is the new text" });
    assert.deepEqual(pendingText, _clipData);
  });


  test("`setText` overrides data-clipboard-target pre", function(assert) {
    assert.expect(2);

    // Arrange
    var client = new ZeroClipboard();
    var currentEl = document.getElementById("d_clip_button_pre_text");

    // Act
    client.clip(currentEl);
    client.setText("This is the new text");
    ZeroClipboard.activate(currentEl);
    var pendingText = JSON.parse(ZeroClipboard.emit("copy"));

    // Assert
    assert.deepEqual(_clipData, { "text/plain": "This is the new text" });
    assert.deepEqual(pendingText, _clipData);
  });


  test("`setHtml` overrides data-clipboard-target pre", function(assert) {
    assert.expect(2);

    // Arrange
    var client = new ZeroClipboard();
    var currentEl = document.getElementById("d_clip_button_pre_text");

    // Act
    client.clip(currentEl);
    client.setHtml("This is the new HTML");
    ZeroClipboard.activate(currentEl);
    var pendingText = JSON.parse(ZeroClipboard.emit("copy"));

    // Assert
    assert.deepEqual(_clipData, { "text/html": "This is the new HTML" });
    assert.deepEqual(pendingText, _clipData);
  });


  test("`setText` AND `setHtml` override data-clipboard-target pre", function(assert) {
    assert.expect(2);

    // Arrange
    var client = new ZeroClipboard();
    var currentEl = document.getElementById("d_clip_button_pre_text");

    // Act
    client.clip(currentEl);
    client.setText("This is the new text");
    client.setHtml("This is the new HTML");
    ZeroClipboard.activate(currentEl);
    var pendingText = JSON.parse(ZeroClipboard.emit("copy"));

    // Assert
    assert.deepEqual(_clipData, {
      "text/plain": "This is the new text",
      "text/html": "This is the new HTML"
    });
    assert.deepEqual(pendingText, _clipData);
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


  test("Object has data-clipboard-text", function(assert) {
    assert.expect(2);

    // Arrange
    var client = new ZeroClipboard();
    var currentEl = document.getElementById("d_clip_button");

    // Act
    client.clip(currentEl);
    ZeroClipboard.activate(currentEl);
    var pendingText = JSON.parse(ZeroClipboard.emit("copy"));

    // Assert
    assert.strictEqual(_clipData["text/plain"], "Copy me!");
    assert.deepEqual(pendingText, _clipData);

    // Revert
    ZeroClipboard.deactivate();
  });


  test("Object has data-clipboard-target textarea", function(assert) {
    assert.expect(2);

    // Arrange
    var client = new ZeroClipboard();
    var currentEl = document.getElementById("d_clip_button_textarea_text");

    // Act
    client.clip(currentEl);
    ZeroClipboard.activate(currentEl);
    var pendingText = JSON.parse(ZeroClipboard.emit("copy"));

    // Assert
    assert.strictEqual(_clipData["text/plain"].replace(/\r\n/g, '\n'),
      "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod\n"+
      "tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,\n"+
      "quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo\n"+
      "consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse\n"+
      "cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non\n"+
      "proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
    );
    assert.deepEqual(pendingText, _clipData);

    // Revert
    ZeroClipboard.deactivate();
  });


  test("Object has data-clipboard-target pre", function(assert) {
    assert.expect(3);

    // Arrange
    var client = new ZeroClipboard();
    var currentEl = document.getElementById("d_clip_button_pre_text");

    // Act
    client.clip(currentEl);
    ZeroClipboard.activate(currentEl);
    var pendingText = JSON.parse(ZeroClipboard.emit("copy"));

    // Assert
    assert.strictEqual(_clipData["text/plain"].replace(/\r\n/g, '\n'),
      "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod\n"+
      "tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,\n"+
      "quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo\n"+
      "consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse\n"+
      "cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non\n"+
      "proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
    );
    assert.strictEqual(
      _clipData["text/html"]
        .replace(/\r\n/g, '\n')
        .replace(/<\/?pre(?:\s+[^>]*)?>/gi, function($0) { return $0.toLowerCase(); }),

      "<pre id=\"clipboard_pre\">"+
      "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod\n"+
      "tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,\n"+
      "quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo\n"+
      "consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse\n"+
      "cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non\n"+
      "proident, sunt in culpa qui officia deserunt mollit anim id est laborum."+
      "</pre>"
    );
    assert.deepEqual(pendingText, _clipData);

    // Revert
    ZeroClipboard.deactivate();
  });


  test("Object has data-clipboard-target input", function(assert) {
    assert.expect(2);

    // Arrange
    var client = new ZeroClipboard();
    var currentEl = document.getElementById("d_clip_button_input_text");

    // Act
    client.clip(currentEl);
    ZeroClipboard.activate(currentEl);
    var pendingText = JSON.parse(ZeroClipboard.emit("copy"));

    // Assert
    assert.strictEqual(_clipData["text/plain"], "Clipboard Text");
    assert.deepEqual(pendingText, _clipData);

    // Revert
    ZeroClipboard.deactivate();
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
    assert.strictEqual(/^-?[0-9\.]+px$/.test(TestUtils.getHtmlBridge().style.top), true);
    assert.strictEqual(/^-?[0-9\.]+px$/.test(TestUtils.getHtmlBridge().style.left), true);
    assert.strictEqual(/^-?[0-9\.]+px$/.test(TestUtils.getHtmlBridge().style.width), true);
    assert.strictEqual(/^-?[0-9\.]+px$/.test(TestUtils.getHtmlBridge().style.height), true);
  });


  test("No more client singleton!", function(assert) {
    assert.expect(7);

    // Arrange
    ZeroClipboard.isFlashUnusable = function() {
      return false;
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
      originalFlashDetect = ZeroClipboard.isFlashUnusable;
      // Modify
      ZeroClipboard.isFlashUnusable = function() {
        return false;
      };
    },
    teardown: function() {
      // Restore
      ZeroClipboard.isFlashUnusable = originalFlashDetect;
      ZeroClipboard.destroy();
    }
  });


  test("`destroy` clears up the client", function(assert) {
    assert.expect(6);

    // Arrange
    ZeroClipboard.isFlashUnusable = function() {
      return false;
    };

    // Assert, arrange, assert, act, assert
    assert.ok(!ZeroClipboard.prototype._singleton, "The client singleton does not exist before creating a client");
    assert.equal(document.getElementById("global-zeroclipboard-html-bridge"), null, "The HTML bridge does not exist before creating a client");
    var client = new ZeroClipboard();
    assert.ok(!ZeroClipboard.prototype._singleton, "The client singleton does exist after creating a client");
    assert.notEqual(document.getElementById("global-zeroclipboard-html-bridge"), null, "The HTML bridge does exist after creating a client");
    ZeroClipboard.destroy();
    assert.ok(!ZeroClipboard.prototype._singleton, "The client singleton does not exist after calling `destroy`");
    assert.equal(document.getElementById("global-zeroclipboard-html-bridge"), null, "The HTML bridge does not exist after calling `destroy`");
  });




  module("dom", {
    setup: function() {
      // Store
      originalFlashDetect = ZeroClipboard.isFlashUnusable;
      // Modify
      ZeroClipboard.isFlashUnusable = function() {
        return false;
      };
    },
    teardown: function() {
      // Restore
      ZeroClipboard.isFlashUnusable = originalFlashDetect;
      ZeroClipboard.destroy();
    }
  });


  test("Bridge is ready after emitting `ready`", function(assert) {
    assert.expect(2);

    // Arrange
    ZeroClipboard.isFlashUnusable = function() {
      return false;
    };
    var client = new ZeroClipboard();

    // Assert, act, assert
    assert.strictEqual(flashState.ready, false);
    // `emit`-ing event handlers are async (generally) but the internal `ready` state is set synchronously
    ZeroClipboard.emit("ready");
    assert.strictEqual(flashState.ready, true);
  });

})(QUnit.module, QUnit.test);
