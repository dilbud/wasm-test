#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e
set -x

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

exit 0