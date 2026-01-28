#!/bin/bash

chmod -R g-w build config etc server.js .env*

[ -d results ] || mkdir -p results

nfpm pkg --packager deb --target results/
nfpm pkg --packager rpm --target results/
