# set a environment variable to override this to your location. export SWF_COMPILER = /My/Location/bin/mxmlc
SWF_COMPILER ?= /Applications/Adobe\ Flash\ Builder\ 4.7/sdks/4.6.0/bin/mxmlc -static-link-runtime-shared-libraries=true

NODE_PATH ?= ./node_modules
JS_COMPILER = $(NODE_PATH)/uglify-js/bin/uglifyjs
JS_BEAUTIFIER = $(NODE_PATH)/uglify-js/bin/uglifyjs -b -i 2 -nm -ns
JS_TEST = $(NODE_PATH)/nodeunit/bin/nodeunit
JS_HINT = $(NODE_PATH)/jshint/bin/hint

all: \
	node_modules \
	ZeroClipboard.min.js \
	ZeroClipboard.swf \
	component.json \
	LICENSE \
	test \

node_modules: Makefile
	npm install

ZeroClipboard.js: Makefile
	@rm -f $@
	@node src/build.js ./src/javascript/ZeroClipboard.js > $@
	@chmod a-w $@

ZeroClipboard.min.js: ZeroClipboard.js
	@rm -f $@
	$(JS_COMPILER) ./ZeroClipboard.js > $@
	@chmod a-w $@

ZeroClipboard10.swf: Makefile
	@rm -f $@
	$(SWF_COMPILER) -output $@ src/flash/ZeroClipboard10.as -source-path src/flash
	@chmod a-w $@

ZeroClipboard.swf: Makefile
	@rm -f $@
	$(SWF_COMPILER) -output $@ src/flash/ZeroClipboard.as -source-path src/flash
	@chmod a-w $@

LICENSE: Makefile
	@rm -f $@
	@node src/build.js ./src/license.js > $@
	@chmod a-w $@

component.json: Makefile
	@rm -f $@
	@node src/build.js ./src/component.js > $@
	@chmod a-w $@

test: ZeroClipboard.min.js
	$(JS_HINT) ./ZeroClipboard.js
	$(JS_TEST) ./test

clean:
	rm -f ./component.json ./ZeroClipboard*.js ./ZeroClipboard.swf ./LICENSE

.PHONY: all test clean