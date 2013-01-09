# set an environment variable to override this to your location. export SWF_COMPILER = /My/Location/bin/mxmlc
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

.INTERMEDIATE ZeroClipboard.js: \
	src/javascript/start.js \
	src/javascript/ZeroClipboard/utils.js \
	src/javascript/ZeroClipboard/client.js \
	src/javascript/ZeroClipboard/core.js \
	src/javascript/ZeroClipboard/dom.js \
	src/javascript/ZeroClipboard/event.js \
	src/javascript/end.js

ZeroClipboard.js:
	@rm -f $@
	cat $^ | node src/build.js | $(JS_BEAUTIFIER) > $@
	@chmod a-w $@

ZeroClipboard.min.js: ZeroClipboard.js
	@rm -f $@
	$(JS_COMPILER) ./ZeroClipboard.js > $@
	@chmod a-w $@

ZeroClipboard.swf: src/flash/ZeroClipboard.as
	@rm -f $@
	$(SWF_COMPILER) -output $@ $^ -source-path src/flash
	@chmod a-w $@

LICENSE: Makefile
	@rm -f $@
	cat ./src/license.js | node src/build.js > $@
	@chmod a-w $@

component.json: Makefile
	@rm -f $@
	cat ./src/component.js | node src/build.js > $@
	@chmod a-w $@

test: ZeroClipboard.min.js
	$(JS_HINT) ./src/javascript/ZeroClipboard/*.js
	$(JS_TEST) ./test

clean:
	rm -rf ./component.json ./ZeroClipboard* ./LICENSE

.PHONY: all test clean
