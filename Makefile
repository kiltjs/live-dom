
git_branch := $(shell git rev-parse --abbrev-ref HEAD)

.PHONY: test publish

install:
	npm install

eslint:
	$(shell npm bin)/eslint live-dom.js

tmp-umd:
	$(shell npm bin)/webpack --run-dev --entry ./live-dom.js --output ./.tmp/live-dom.js --output-library 'live' --output-library-target umd
	$(shell npm bin)/webpack --run-dev --entry ./component.js --output ./.tmp/component.js --output-library 'component' --output-library-target umd

karma: tmp-umd
	@$(shell npm bin)/karma start karma.conf.js

test: install eslint karma
# test: install eslint

publish.release:
	@echo "\nrunning https://gist.githubusercontent.com/jgermade/d394e47341cf761286595ff4c865e2cd/raw/\n"
	$(shell curl -fsSL https://gist.githubusercontent.com/jgermade/d394e47341cf761286595ff4c865e2cd/raw/ -o - | sh -)

release: test publish.release
