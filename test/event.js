"use strict";

require("./fixtures/env")

var zeroClipboard, clip;
exports.event = {

  setUp: function (callback) {
    zeroClipboard = require("../ZeroClipboard");
    clip = new zeroClipboard();
    callback();
  },

  tearDown: function (callback) {
    zeroClipboard.destroy();
    callback();
  },

  "Glue element after new client": function (test) {
    test.expect(2);
    clip.glue($("#d_clip_button"))

    // Test the client was created properly
    test.ok(clip.htmlBridge);
    test.ok(clip.handlers);

    test.done();
  },

  "unglue element removes items": function (test) {
    test.expect(0);
    clip.glue($("#d_clip_button, #d_clip_button2, #d_clip_button3"))

    clip.unglue($("#d_clip_button3, #d_clip_button2"));

    test.done();
  },

  "Glue element with query string throws TypeError": function (test) {
    test.expect(1);
    test.throws(function(){
      clip.glue("#d_clip_button")
    }, TypeError);

    test.done();
  },

  "Element won't be glued twice": function(test) {
    test.expect(0);
    test.done();
  },

  "Registering Events": function (test) {
    test.expect(3);
    clip.on("load", function(){});
    clip.on("onNoFlash", function(){});
    clip.on("onPhone", function(){});

    test.ok(clip.handlers.load);
    test.ok(clip.handlers.noflash);
    test.ok(clip.handlers.phone);

    test.done();
  },

  "Unegistering Events": function (test) {
    test.expect(3);
    var load = function(){};
    var onNoFlash = function(){};
    var onPhone = function(){};

    clip.on("load", load);
    clip.on("onNoFlash", onNoFlash);
    clip.on("onPhone", onPhone);

    clip.off("load", load);
    test.ok(!clip.handlers.load);

    clip.off("onNoFlash", onNoFlash);
    test.ok(!clip.handlers.noflash);

    clip.off("onPhone", onPhone);
    test.ok(!clip.handlers.phone);

    test.done();
  },

  "Registering Events the old way": function (test) {
    test.expect(1);
    clip.addEventListener("load", function(){});

    test.ok(clip.handlers.load);

    test.done();
  },

  "Unregistering Events the old way": function (test) {
    test.expect(1);
    var func = function(){};

    clip.addEventListener("load", func);
    clip.removeEventListener("load", func);

    test.ok(!clip.handlers.load);

    test.done();
  },

  "Registering two events works": function (test) {
    test.expect(2);
    clip.on("load oncomplete", function(){});

    test.ok(clip.handlers.load);
    test.ok(clip.handlers.complete);

    test.done();
  },
  
  "Unregistering two events works": function (test) {
    test.expect(2);
    var func = function(){};

    clip.on("load oncomplete",func);
    clip.off("load oncomplete",func);

    test.ok(!clip.handlers.load);
    test.ok(!clip.handlers.complete);

    test.done();
  },

  "Test onNoFlash Event": function (test) {
    test.expect(1);
    navigator.mimeTypes["application/x-shockwave-flash"] = undefined;

    var id = clip.id;

    clip.addEventListener( 'onNoFlash', function(client, text) {
      test.equal(client.id, id);
      navigator.mimeTypes["application/x-shockwave-flash"] = true;
      test.done();
    } );
  },

  "Test onWrongFlash Event": function (test) {
    test.expect(1);
    clip.glue($("#d_clip_button"));

    var id = clip.id;

    clip.addEventListener( 'onWrongFlash', function(client, text) {
      test.equal(client.id, id);
      test.done();
    } );

    // fake load event
    zeroClipboard.dispatch("load", { flashVersion: "MAC 9,0,0" });
  },

  "Test mouseover and mouseout event": function (test) {
    test.expect(3);
    clip.glue($("#d_clip_button"));

    clip.setCurrent($("#d_clip_button")[0]);

    zeroClipboard.dispatch("mouseover", { flashVersion: "MAC 11,0,0" });

    test.ok($("#d_clip_button").hasClass("zeroclipboard-is-hover"));

    zeroClipboard.dispatch("mouseout", { flashVersion: "MAC 11,0,0" });

    test.ok(!$("#d_clip_button").hasClass("zeroclipboard-is-hover"));

    test.equal(clip.htmlBridge.style.left, "-9999px");

    test.done();

  },

  "Test mousedown and mouseup event": function (test) {
    test.expect(2);
    clip.glue($("#d_clip_button"));

    clip.setCurrent($("#d_clip_button")[0]);

    zeroClipboard.dispatch("mousedown", { flashVersion: "MAC 11,0,0" });

    test.ok($("#d_clip_button").hasClass("zeroclipboard-is-active"));

    zeroClipboard.dispatch("mouseout", { flashVersion: "MAC 11,0,0" });

    test.ok(!$("#d_clip_button").hasClass("zeroclipboard-is-active"));

    test.done();

  },

  "Test that the current Element is passed back to event handler": function (test) {
    test.expect(9);
    clip.glue($("#d_clip_button"));

    clip.setCurrent($("#d_clip_button")[0]);

    clip.on( 'load mousedown mouseover mouseup wrongflash noflash', function(client, args) {
      test.equal(this.id, "d_clip_button");
    } );

    clip.on( 'complete', function(client, args) {
      test.equal(this.id, "d_clip_button");
      test.ok(!client._text);
    } );

    clip.on( 'mouseout', function(client, args) {
      test.equal(this.id, "d_clip_button");
      test.done();
    } );

    zeroClipboard.dispatch("load", { flashVersion: "MAC 11,0,0" });
    zeroClipboard.dispatch("wrongflash", { flashVersion: "MAC 11,0,0" });
    zeroClipboard.dispatch("noflash", { flashVersion: "MAC 11,0,0" });
    zeroClipboard.dispatch("mousedown", { flashVersion: "MAC 11,0,0" });
    zeroClipboard.dispatch("mouseover", { flashVersion: "MAC 11,0,0" });
    zeroClipboard.dispatch("mouseup", { flashVersion: "MAC 11,0,0" });
    zeroClipboard.dispatch("complete", { flashVersion: "MAC 11,0,0" });
    zeroClipboard.dispatch("mouseout", { flashVersion: "MAC 11,0,0" });
  },
  
  "Test onLoad Event with AMD": function (test) {
    test.expect(4);
    
    // This is a special private variable inside of ZeroClipboard, so we can
    // only simulate its functionality here
    var _amdModuleId = "zc";
    
    var requireFn = (function() {
      var amdCache = {};
      amdCache[_amdModuleId] = zeroClipboard;
      return function(depIds, cb) {
        var depVals = depIds.map(function(id) { return amdCache[id]; });
        process.nextTick(function() {
          cb.apply(this, depVals);
        });
      };
    })();

    var clip = new zeroClipboard();
    clip.glue($("#d_clip_button"));

    var id = clip.id;

    clip.on( "load", function(client, args) {
      test.equal(client.id, id);
      test.done();
    } );

    // fake load event
    eval(
'\
(function(eventName, args, amdModuleId) {\
  requireFn([amdModuleId], function(ZeroClipboard) {\
    test.equal(ZeroClipboard, zeroClipboard);\
    test.equal(eventName, "load");\
    test.deepEqual(args, { flashVersion: "MAC 11,0,0" });\
    ZeroClipboard.dispatch(eventName, args);\
  });\
})("load", { flashVersion: "MAC 11,0,0" }, ' + JSON.stringify(_amdModuleId) + ');\
'
    );
  },
  
  "Test onLoad Event with CommonJS": function (test) {
    test.expect(4);
    
    // This is a special private variable inside of ZeroClipboard, so we can
    // only simulate its functionality here
    var _cjsModuleId = "zc";
    
    var requireFn = (function() {
      var cjsCache = {};
      cjsCache[_cjsModuleId] = zeroClipboard;
      return function(id) {
        return cjsCache[id];
      };
    })();

    var clip = new zeroClipboard();
    clip.glue($("#d_clip_button"));

    var id = clip.id;

    clip.on( "load", function(client, args) {
      test.equal(client.id, id);
      test.done();
    } );

    // fake load event
    eval(
'\
(function(eventName, args, cjsModuleId) {\
  var ZeroClipboard = requireFn(cjsModuleId);\
  test.equal(ZeroClipboard, zeroClipboard);\
  test.equal(eventName, "load");\
  test.deepEqual(args, { flashVersion: "MAC 11,0,0" });\
  ZeroClipboard.dispatch(eventName, args);\
})("load", { flashVersion: "MAC 11,0,0" }, ' + JSON.stringify(_cjsModuleId) + ');\
'
    );
  }

}
