
pkg_name := live-dom
git_branch := $(shell git rev-parse --abbrev-ref HEAD)

.PHONY: test publish

install:
	npm install

eslint:
	$(shell npm bin)/eslint live-dom.js

karma:
	@$(shell npm bin)/karma start karma.conf.js

test: install eslint karma

npm.publish:
	npm version patch
	git push origin $(git_branch) && git push --tags
	npm publish
	@echo "published ${PKG_VERSION}"

github.release: export PKG_VERSION=$(shell node -e "console.log('v'+require('./package.json').version);")
github.release: export RELEASE_URL=$(shell curl -s -X POST -H "Content-Type: application/json" -H "Authorization: Bearer ${GITHUB_TOKEN}" \
	-d '{"tag_name": "${PKG_VERSION}", "target_commitish": "$(git_branch)", "name": "${PKG_VERSION}", "body": "", "draft": false, "prerelease": false}' \
	-w '%{url_effective}' "https://api.github.com/repos/kiltjs/$(pkg_name)/releases" )
github.release:
	@echo ${RELEASE_URL}
	@true

release: test npm.publish github.release
