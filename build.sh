#!/bin/bash

# Clean
rm -rf public/

HUGO_VER="0.110.0"

if [ -z ${GITHUB_URL} ]; then
    GITHUB_URL="https://github.com"
fi

cd $(dirname $0)

if [ ! -d "bin" ]; then
    mkdir -p bin
fi

if [ ! -f "bin/hugo" ]; then
    echo "Downloading hugo_${HUGO_VER}_linux-amd64.tar.gz"
    if [ ! -d "tmp" ]; then
        mkdir -p tmp
    fi
    cd tmp
    curl -LO "${GITHUB_URL}/gohugoio/hugo/releases/download/v${HUGO_VER}/hugo_${HUGO_VER}_linux-amd64.tar.gz"
    tar xf "hugo_${HUGO_VER}_linux-amd64.tar.gz" hugo
    chmod 755 hugo
    mv hugo ../bin
    cd ..
    rm -rf tmp
fi

./tailwind.sh
bin/hugo --minify --templateMetrics --verbose