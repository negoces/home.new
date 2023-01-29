#!/bin/bash

if [ -z ${GITHUB_URL} ]; then
    GITHUB_URL="https://github.com"
fi

cd $(dirname $0)

if [ ! -d "bin" ]; then
    mkdir -p bin
fi

if [ ! -f "bin/tailwindcss-cli" ]; then
    echo "Downloading tailwindcss-linux-x64"
    curl -L "${GITHUB_URL}/tailwindlabs/tailwindcss/releases/latest/download/tailwindcss-linux-x64" -o bin/tailwindcss-cli
    chmod +x bin/tailwindcss-cli
fi

case $1 in
    watch)
        ./bin/tailwindcss-cli -i ./tailwind.css -o ./assets/css/tailwind.css --watch
        ;;
    *)
        ./bin/tailwindcss-cli -i ./tailwind.css -o ./assets/css/tailwind.css
        ;;
esac