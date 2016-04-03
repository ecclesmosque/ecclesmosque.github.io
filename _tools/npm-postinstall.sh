#!/bin/bash

mkdir -p _sass/vendor/bootstrap;
cp -r node_modules/bootstrap/scss/ _sass/vendor/bootstrap/;

mkdir -p assets/js/vendor/bootstrap;
cp -r node_modules/bootstrap/dist/js/bootstrap.min.js assets/js/vendor/bootstrap/;
