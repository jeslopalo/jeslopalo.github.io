#!/bin/sh

jekyll clean

bundle exec jekyll serve --watch --safe --profile --incremental --trace --drafts --config _config.yml,_config_dev.yml