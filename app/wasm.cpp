#ifdef __EMSCRIPTEN__
#include "emscripten.h"
#else
#define EMSCRIPTEN_KEEPALIVE
#endif

#include "wasm.hpp"

extern "C" {
EMSCRIPTEN_KEEPALIVE
int add(int a, int b) {
  // simply return a + b
  return a + b;
}

EMSCRIPTEN_KEEPALIVE
int sub(int a, int b) {
  // Ooops!
  return a - b;
}
}