NODE_PATH ?= ./node_modules
JS_COMPILER = $(NODE_PATH)/uglify-js/bin/uglifyjs
JS_BEAUTIFIER = $(NODE_PATH)/uglify-js/bin/uglifyjs -b -i 2 -nm -ns

all: \
	zeroclipboard.min.js \
	LICENSE \

LICENSE: Makefile
	@rm -f $@
	@node src/build.js ./src/license.js $@
	@chmod a-w $@

zeroclipboard.js: Makefile
	@rm -f $@
	@node src/build.js ./src/javascript/zeroclipboard.js $@
	@chmod a-w $@

zeroclipboard.min.js: zeroclipboard.js
	@rm -f $@
	$(JS_COMPILER) ./zeroclipboard.js > $@
	@chmod a-w $@

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