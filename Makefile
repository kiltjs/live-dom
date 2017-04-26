
install:
	npm install

eslint:
	$(shell npm bin)/eslint live-dom.js

karma:
	@$(shell npm bin)/karma start karma.conf.js

test: install eslint karma

publish: test
	npm version patch
	git push origin $(shell git rev-parse --abbrev-ref HEAD)
	npm publish
