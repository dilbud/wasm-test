
add_executable(hello hello.cpp)

set_target_properties(hello PROPERTIES LINK_FLAGS "\
    -sMODULARIZE \
    -sEXPORT_ES6 \
    -s ENVIRONMENT=web \
")

add_library(wasm STATIC wasm.cpp wasm.hpp)

target_link_libraries(hello PRIVATE wasm)