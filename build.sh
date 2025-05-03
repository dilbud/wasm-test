#!/bin/bash

# Exit immediately if a command exits with a non-zero status
# set -e
# Print each command before executing it
# set -x

# Create the build directory if it doesn't exist
if [ ! -d "build/wasm" ]; then
    mkdir -p build/wasm
fi

# Navigate to the build directory
cd build/wasm

# Configure the project for WebAssembly
emcmake cmake ../..

if [ $? -ne 0 ]; then
    echo "CMake configuration failed"
    exit 1
fi

# Build the project
emmake make

if [ $? -ne 0 ]; then
    echo "Build failed"
    exit 1
fi

cp app/hello.wasm ../../src/wasm/hello/dist/
if [ $? -ne 0 ]; then
    echo "Copying wasm file failed"
    exit 1
fi

cp app/hello.js ../../src/wasm/hello/dist/
if [ $? -ne 0 ]; then
    echo "Copying js file failed"
    exit 1
fi

cp app/hello.d.ts ../../src/wasm/hello/dist/@types/
if [ $? -ne 0 ]; then
    echo "Copying d.ts file failed"
    exit 1
fi

exit 0