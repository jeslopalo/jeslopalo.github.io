#!/bin/sh

set -e

bundle exec jekyll clean
bundle exec jekyll serve --watch --safe --unpublished --trace --drafts --config _config.yml,_config_dev.yml