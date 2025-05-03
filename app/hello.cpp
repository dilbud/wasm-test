#include <stdio.h>

#include "wasm.hpp"

int main(int argc, char *argv[]) {
  // simple hello world
  printf("Hello, world! argc:%d\n", argc);
  for (int i = 0; i < argc; ++i) {
    printf("hello[%d]:[%s]\n", i, argv[i]);
  }
}