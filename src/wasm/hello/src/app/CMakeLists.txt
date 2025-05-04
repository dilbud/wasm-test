set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -std=c++14 -g -msimd128 -msse --emit-tsd hello.d.ts")
add_executable(hello hello.cpp)

set_target_properties(hello PROPERTIES LINK_FLAGS "\
    -sMODULARIZE \
    -sEXPORT_ES6 \
    -s ENVIRONMENT=web \
")

add_library(wasm STATIC wasm.cpp wasm.hpp)

target_link_libraries(hello PRIVATE wasm)

if(EMSCRIPTEN)
    message("EMSCRIPTEN")
    set(CMAKE_EXECUTABLE_SUFFIX ".js")
    # set(CMAKE_EXECUTABLE_SUFFIX ".html")
endif(EMSCRIPTEN)