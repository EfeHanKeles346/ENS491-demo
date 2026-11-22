#!/bin/zsh
cd "$(dirname "$0")" || exit 1
npm exec --yes --package=node@24 -- npm start
