#!/bin/sh
for i in $(env | grep VITE_)
do
    key=$(echo $i | cut -d '=' -f 1)
    value=$(echo $i | cut -d '=' -f 2-)
    echo "Replacing $key with $value"
    find /usr/share/nginx/html -type f -exec sed -i "s|__${key}__|${value}|g" '{}' +
done

# Start nginx
nginx -g 'daemon off;'