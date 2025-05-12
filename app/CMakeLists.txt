set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -std=c++20 \
 -fdebug-prefix-map=/workspaces/wasm-test/app=D:/PROJECTS/learning/wasm/wasm-test/app \
 -g \
 -gsource-map \
 -msimd128 \
 -msse \
 --emit-tsd hello.d.ts")
add_executable(hello hello.cpp)

set_target_properties(hello PROPERTIES LINK_FLAGS "\
    -lembind \
    -fexceptions \
    -sMODULARIZE \
    -sEXPORT_ES6 \
    -sEXPORT_EXCEPTION_HANDLING_HELPERS \
    -s ENVIRONMENT=web \
")

add_library(wasm STATIC wasm.cpp wasm.hpp)

target_link_libraries(hello PRIVATE wasm)

if(EMSCRIPTEN)
    message(STATUS "EMSCRIPTEN")
    # set(CMAKE_EXECUTABLE_SUFFIX ".js")
    set(CMAKE_EXECUTABLE_SUFFIX ".html")
endif(EMSCRIPTEN)