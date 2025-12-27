#include <stdio.h>

#include "wasm.hpp"

#include "emscripten/bind.h"

int main(int argc, char *argv[]) {
  // simple hello world
  printf("Hello, world! argc:%d\n", argc);
  for (int i = 0; i < argc; ++i) {
    printf("gggg[%d]:[%s]\n", i, argv[i]);
  }
  printf("add(1, 2) = %d\n", add(1, 2));
}

float lerp(float a, float b, float t) {
  return (1 - t) * a + t * b;
}

EMSCRIPTEN_BINDINGS(my_module) {
  emscripten::function("lerp", &lerp);
}

class MyClass {
  public:
    MyClass(int x, std::string y)
      : x(x)
      , y(y)
    {}
  
    void incrementX() {
      ++x;
    }
  
    int getX() const { return x; }
    void setX(int x_) { x = x_; }
  
    static std::string getStringFromInstance(const MyClass& instance) {
      return instance.y;
    }
  
  private:
    int x;
    std::string y;
  };
  
  // Binding code
  EMSCRIPTEN_BINDINGS(my_class_example) {
    emscripten::class_<MyClass>("MyClass")
      .constructor<int, std::string>()
      .function("incrementX", &MyClass::incrementX)
      .property("x", &MyClass::getX, &MyClass::setX)
      .property("x_readonly", &MyClass::getX)
      .class_function("getStringFromInstance", &MyClass::getStringFromInstance)
      ;
  }