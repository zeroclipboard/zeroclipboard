/*global ZeroClipboard */

"use strict";

(function(module, test) {

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

//  test("Client without selector doesn't have element", function(assert) {
//    assert.expect(2);
//
//    // Arrange & Act
//    var clip = new ZeroClipboard();
//
//    // Assert
//    assert.ok(clip);
//    assert.strictEqual(gluedElements.length, 0);
//  });

  test("Clip is created properly", function(assert) {
    assert.expect(3);

    // Arrange & Act
    var clip = new ZeroClipboard();

    // Assert
    assert.ok(clip);
    assert.ok(clip.htmlBridge);
    assert.ok(clip.handlers);
  });

  test("Clip sets title properly", function(assert) {
    assert.expect(2);

    // Arrange
    var clip = new ZeroClipboard();
    var currentEl = document.getElementById("d_clip_button");

    // Act
    clip.glue(currentEl);
    clip.setTitle("Click Me");

    // Assert
    assert.ok(clip.htmlBridge);
    assert.strictEqual(clip.htmlBridge.getAttribute("title"), "Click Me");
  });

  test("setText overrides the data-clipboard-text attribute", function(assert) {
    assert.expect(1);

    // Arrange
    var clip = new ZeroClipboard();
    var currentEl = document.getElementById("d_clip_button");

    // Act
    clip.glue(currentEl);
    clip.setText("This is the new text");
    clip.setCurrent(currentEl);

    // Assert
    assert.strictEqual(clip.options.text, "This is the new text");
  });

  test("Object has a title", function(assert) {
    assert.expect(1);

    // Arrange
    var clip = new ZeroClipboard();
    var currentEl = document.getElementById("d_clip_button");

    // Act
    clip.glue(currentEl);
    clip.setCurrent(currentEl);

    // Assert
    assert.strictEqual(clip.htmlBridge.getAttribute("title"), "Click me to copy to clipboard.");

    // Revert
    clip.resetBridge();
  });

  test("Object has no title", function(assert) {
    assert.expect(1);

    // Arrange
    var clip = new ZeroClipboard();
    var currentEl = document.getElementById("d_clip_button_no_title");

    // Act
    clip.glue(currentEl);
    clip.setCurrent(currentEl);

    // Assert
    assert.ok(!clip.htmlBridge.getAttribute("title"));
  });

  test("Object has data-clipboard-text", function(assert) {
    assert.expect(1);

    // Arrange
    var clip = new ZeroClipboard();
    var currentEl = document.getElementById("d_clip_button");

    // Act
    clip.glue(currentEl);
    clip.setCurrent(currentEl);
    ZeroClipboard.dispatch("datarequested", { flashVersion: "MAC 11,0,0" });

    // Assert
    assert.strictEqual(clip.options.text, "Copy me!");

    // Revert
    clip.resetBridge();
  });

  test("Object has data-clipboard-target textarea", function(assert) {
    assert.expect(1);

    // Arrange
    var clip = new ZeroClipboard();
    var currentEl = document.getElementById("d_clip_button_textarea_text");

    // Act
    clip.glue(currentEl);
    clip.setCurrent(currentEl);
    ZeroClipboard.dispatch("datarequested", { flashVersion: "MAC 11,0,0" });

    // Assert
    assert.strictEqual(clip.options.text.replace(/\r\n/g, '\n'),
      "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod\n"+
      "tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,\n"+
      "quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo\n"+
      "consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse\n"+
      "cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non\n"+
      "proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
    );

    // Revert
    clip.resetBridge();
  });

  test("Object has data-clipboard-target pre", function(assert) {
    assert.expect(1);

    // Arrange
    var clip = new ZeroClipboard();
    var currentEl = document.getElementById("d_clip_button_pre_text");

    // Act
    clip.glue(currentEl);
    clip.setCurrent(currentEl);
    ZeroClipboard.dispatch("datarequested", { flashVersion: "MAC 11,0,0" });

    // Assert
    assert.strictEqual(clip.options.text.replace(/\r\n/g, '\n'),
      "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod\n"+
      "tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,\n"+
      "quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo\n"+
      "consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse\n"+
      "cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non\n"+
      "proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
    );

    // Revert
    clip.resetBridge();
  });

  test("Object has data-clipboard-target input", function(assert) {
    assert.expect(1);

    // Arrange
    var clip = new ZeroClipboard();
    var currentEl = document.getElementById("d_clip_button_input_text");

    // Act
    clip.glue(currentEl);
    clip.setCurrent(currentEl);
    ZeroClipboard.dispatch("datarequested", { flashVersion: "MAC 11,0,0" });

    // Assert
    assert.strictEqual(clip.options.text, "Clipboard Text");

    // Revert
    clip.resetBridge();
  });

  test("Object doesn't have data-clipboard-text", function(assert) {
    assert.expect(1);

    // Arrange
    var clip = new ZeroClipboard();
    var currentEl = document.getElementById("d_clip_button_no_text");

    // Act
    clip.glue(currentEl);
    clip.setCurrent(currentEl);

    // Assert
    assert.ok(!clip.htmlBridge.getAttribute("data-clipboard-text"));
  });

  test("Trying a new client is same client", function(assert) {
    assert.expect(6);

    // Assert, arrange, assert, act, assert
    assert.strictEqual($(".global-zeroclipboard-container").length, 0);
    var clip1 = new ZeroClipboard();
    assert.ok(clip1.htmlBridge);
    assert.strictEqual($(".global-zeroclipboard-container").length, 1);
    var clip2 = new ZeroClipboard();
    assert.strictEqual($(".global-zeroclipboard-container").length, 1);
    assert.strictEqual(clip2.htmlBridge, clip1.htmlBridge);
    
    // NOTE: This doesn't need to be true in the future
    assert.strictEqual(clip2, clip1);
  });

  test("Calculations based on borderWidth never return NaN", function(assert) {
    assert.expect(4);

    // Arrange
    var clip = new ZeroClipboard();
    var currentEl = document.getElementById("d_clip_button");

    // Act
    clip.glue(currentEl);
    clip.setCurrent(currentEl);

    // Assert
    assert.strictEqual(/^-?[0-9\.]+px$/.test(clip.htmlBridge.style.top), true);
    assert.strictEqual(/^-?[0-9\.]+px$/.test(clip.htmlBridge.style.left), true);
    assert.strictEqual(/^-?[0-9\.]+px$/.test(clip.htmlBridge.style.width), true);
    assert.strictEqual(/^-?[0-9\.]+px$/.test(clip.htmlBridge.style.height), true);
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

  test("`destroy` clears up the client", function(assert) {
    assert.expect(6);

    // Arrange
    ZeroClipboard.detectFlashSupport = function() {
      return true;
    };

    // Assert, arrange, assert, act, assert
    assert.ok(!ZeroClipboard.prototype._singleton, "The client singleton does not exist before creating a client");
    assert.equal(document.getElementById("global-zeroclipboard-html-bridge"), null, "The HTML bridge does not exist before creating a client");
    var clip = new ZeroClipboard();
    assert.ok(ZeroClipboard.prototype._singleton, "The client singleton does exist after creating a client");
    assert.notEqual(document.getElementById("global-zeroclipboard-html-bridge"), null, "The HTML bridge does exist after creating a client");
    ZeroClipboard.destroy();
    assert.ok(!ZeroClipboard.prototype._singleton, "The client singleton does not exist after calling `destroy`");
    assert.equal(document.getElementById("global-zeroclipboard-html-bridge"), null, "The HTML bridge does not exist after calling `destroy`");
  });


  module("ZeroClipboard (built) - DOM", {
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

  test("Bridge is ready after dispatching `load`", function(assert) {
    assert.expect(2);

    // Arrange
    ZeroClipboard.detectFlashSupport = function() {
      return true;
    };
    var clip = new ZeroClipboard();

    // Assert, act, assert
    assert.strictEqual(clip.ready(), false);
    // `dispatch`-ing event handlers are async but the internal `ready` state is set synchronously
    ZeroClipboard.dispatch("load", { flashVersion: "MAC 11,0,0" });
    assert.strictEqual(clip.ready(), true);
  });

})(QUnit.module, QUnit.test);
