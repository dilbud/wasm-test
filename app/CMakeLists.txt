
add_executable(hello hello.cpp)

set_target_properties(hello PROPERTIES LINK_FLAGS "\
    -sMODULARIZE \
    -sEXPORT_ES6 \
    -s ENVIRONMENT=web \
")