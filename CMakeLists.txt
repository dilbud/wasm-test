cmake_minimum_required(VERSION 3.8)

project(main)
set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -std=c++14 -msimd128 -msse -O3 --emit-tsd hello.d.ts")
add_subdirectory(app)
if(EMSCRIPTEN)
    message("EMSCRIPTEN")
    set(CMAKE_EXECUTABLE_SUFFIX ".js")
endif(EMSCRIPTEN)

