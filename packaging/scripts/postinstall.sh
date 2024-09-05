#!/bin/sh

set -eu

if command -v systemctl > /dev/null && [ "$(systemctl is-system-running)" != "offline" ]; then
    systemctl daemon-reload
fi
# systemctl start webssh-oidc.service

export RANDOM=$(openssl rand -base64 32)


test -e /etc/webssh-oidc/environment || {
    test -e /etc/webssh-oidc/environment.temp && {
    cat /etc/webssh-oidc/environment.temp \
        | envsubst \
        > /etc/webssh-oidc/environment
