NODE_PATH ?= ./node_modules
JS_COMPILER = $(NODE_PATH)/uglify-js/bin/uglifyjs
JS_BEAUTIFIER = $(NODE_PATH)/uglify-js/bin/uglifyjs -b -i 2 -nm -ns
JS_TEST = $(NODE_PATH)/nodeunit/bin/nodeunit
JS_HINT = $(NODE_PATH)/jshint/bin/hint

all: \
	node_modules \
	clean \
	ZeroClipboard.min.js \
	LICENSE \
	test \

node_modules: Makefile
	npm install

clean: Makefile
	@rm -f ./ZeroClipboard*.js
	@rm -f ./LICENSE

LICENSE: clean
	@node src/build.js ./src/license.js $@
	@chmod a-w $@

ZeroClipboard.js: clean
	@node src/build.js ./src/javascript/ZeroClipboard.js $@
	@chmod a-w $@

ZeroClipboard.min.js: ZeroClipboard.js
	$(JS_COMPILER) ./ZeroClipboard.js > $@
	@chmod a-w $@

test: ZeroClipboard.min.js
	$(JS_HINT) ./ZeroClipboard.js
	$(JS_TEST) ./test.js

testpage:
	git stash
	git checkout gh-pages
	git checkout master ZeroClipboard.min.js ZeroClipboard.swf
	rm -f javascript/ZeroClipboard*
	mv ZeroClipboard.* javascripts/
	git add .
	git commit -a -m "Update demo files to latest changes."
	git push
	git checkout master
	git stash pop

.PHONY: all test clean