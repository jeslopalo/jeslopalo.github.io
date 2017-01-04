#!/bin/sh

set -e

jekyll clean

bundle exec jekyll serve --watch --safe --unpublished --trace --drafts --config _config.yml,_config_dev.yml