#!/bin/sh

set -eu

if command -v systemctl > /dev/null && [ "$(systemctl is-system-running)" != "offline" ]; then
    systemctl daemon-reload
fi
# systemctl start webssh-oidc.service

