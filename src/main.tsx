import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

import Module, { MainModule } from "./wasm/hello";

const module = {
  print(...e: unknown[]) {
    console.log(...e);
  },
  setStatus(e: string): void {
    console.log(e);
  },
  totalDependencies: 0,
  monitorRunDependencies(e: number): void {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    this.totalDependencies = Math.max(this.totalDependencies, e)
    module.setStatus(
      e
        ? "Preparing... (" +
            (this.totalDependencies - e) +
            "/" +
            this.totalDependencies +
            ")"
        : "All downloads complete."
    );
  },
};
module.setStatus("Downloading...");

Module(module).then((mod: MainModule) => {
  console.log(mod);
  console.log(mod._add(1, 2));
  console.log(mod._sub(1, 2));
  console.log('lerp result: ' + mod.lerp(1, 2, 0.5));

  const instance = new mod.MyClass(10, "hello");
  instance.incrementX();
  console.log(instance.x); // 11
  
  instance.x = 20; // 20
  mod.MyClass.getStringFromInstance(instance);
  console.log(mod.MyClass.getStringFromInstance(instance));
  instance.delete();
});



createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
