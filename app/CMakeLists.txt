
add_executable(hello hello.cpp)

set_target_properties(hello PROPERTIES LINK_FLAGS "-s EXIT_RUNTIME=1")