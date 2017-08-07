#!/bin/bash

sitespeed.io -n 1 \
    --plugins.load ./node_modules/chrometrace-sitespeedio-plugin \
    --browsertime.chrome.collectTracingEvents \
    https://mobile.twitter.com/sitespeedio
