#!/bin/sh

# Substitute environment variables in nginx config
envsubst '${DOMAIN_NAME}' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf

# Execute the main command
exec "$@"
