
pkg_name := live-dom

install:
	npm install

eslint:
	$(shell npm bin)/eslint live-dom.js

karma:
	@$(shell npm bin)/karma start karma.conf.js

test: install eslint karma

github.release: export RELEASE_URL=$(shell curl -s -X POST -H "Content-Type: application/json" -H "Authorization: Bearer ${GITHUB_TOKEN}" \
	-d '{"tag_name": "v$(shell npm view $(pkg_name) version)", "target_commitish": "$(git_branch)", "name": "v$(shell npm view $(pkg_name) version)", "body": "", "draft": false, "prerelease": false}' \
	-w '%{url_effective}' "https://api.github.com/repos/kiltjs/$(pkg_name)/releases" )
github.release:
	@echo ${RELEASE_URL}
	@true

publish: test
	npm version patch
	git push origin $(shell git rev-parse --abbrev-ref HEAD)
	npm publish
	github.release
