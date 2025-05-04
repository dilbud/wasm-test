#include <stdio.h>

#include "wasm.hpp"

int main(int argc, char *argv[]) {
  // simple hello world
  printf("Hello, world! argc:%d\n", argc);
  for (int i = 0; i < argc; ++i) {
    printf("gg[%d]:[%s]\n", i, argv[i]);
  }
  printf("add(1, 2) = %d\n", add(1, 2));
}