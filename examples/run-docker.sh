#!/bin/bash

docker run --rm -v "$(pwd)/node_modules":/node_modules \
    sitespeedio/sitespeed.io \
    --plugins.load /node_modules/chrometrace-sitespeed.io-plugin \
    --browsertime.chrome.collectTracingEvents \
    https://mobile.twitter.com/sitespeedio
