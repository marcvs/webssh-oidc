#!/bin/sh

set -eu

if command -v systemctl >/dev/null; then
    systemctl stop webssh-oidc || true
fi
