import { useCallback, useEffect, useRef, useState } from 'react';
import Module, { MainModule } from "../wasm/hello";

/**
 * options.modulePath string path to the Emscripten module JS (e.g. './hello.js')
 * options.refs object with optional refs: { status, progress, spinner, canvas, output }
 */
interface Progress {
  value: number | null;
  max: number | null;
  hidden: boolean;
}

interface Refs {
  status?: React.RefObject<HTMLElement> | string;
  progress?: React.RefObject<HTMLProgressElement> | string;
  spinner?: React.RefObject<HTMLElement> | string;
  canvas?: React.RefObject<HTMLCanvasElement> | string;
  output?: React.RefObject<HTMLTextAreaElement> | string;
}

interface Options {
  modulePath?: string;
  refs?: Refs;
}

interface EmscriptenModule {
  canvas?: HTMLCanvasElement | null;
  totalDependencies: number;
  print: (...args: any[]) => void;
  setStatus: (text: string) => void;
  monitorRunDependencies: (left: number) => void;
  _cleanupWebGL?: () => void;
}

export default function useEmscriptenModule(options: Options = {}) {
  const { modulePath = './hello.js', refs = {} } = options;

  const moduleRef = useRef<EmscriptenModule | null>(null);
  const [status, setStatus] = useState<string>('Idle');
  const [progress, setProgress] = useState<Progress>({ value: null, max: null, hidden: true });
  const [logs, setLogs] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Helper to safely get element from ref or id
  const getEl = (maybeRef: React.RefObject<HTMLElement> | string | undefined): HTMLElement | null => {
    if (!maybeRef) return null;
    return maybeRef.current ?? (typeof maybeRef === 'string' ? document.getElementById(maybeRef) : null);
  };

  // Append log line
  const pushLog = useCallback((text) => {
    setLogs((prev) => [...prev, String(text)]);
  }, []);

  // Build Module object similar to your script
  const buildModule = useCallback((): EmscriptenModule => {
    const statusEl = getEl(refs.status);
    const progressEl = getEl(refs.progress);
    const spinnerEl = getEl(refs.spinner);
    const canvasEl = getEl(refs.canvas);
    const outputEl = getEl(refs.output);

    // Clear output if present
    if (outputEl) outputEl.value = '';

    const Module: EmscriptenModule = {
      canvas: canvasEl,
      totalDependencies: 0,
      print: (...args: any[]) => {
        // mirror console and output textarea
        console.log(...args);
        const text = args.join(' ');
        pushLog(text);
        if (outputEl) {
          outputEl.value += text + '\n';
          outputEl.scrollTop = outputEl.scrollHeight;
        }
      },
      setStatus: (text: string) => {
        // throttle identical consecutive messages
        Module.setStatus.last ??= { time: Date.now(), text: '' };
        if (text === Module.setStatus.last.text) return;
        const m = String(text).match(/([^(]+)\((\d+(\.\d+)?)\/(\d+)\)/);
        const now = Date.now();
        if (m && now - Module.setStatus.last.time < 30) return;
        Module.setStatus.last.time = now;
        Module.setStatus.last.text = text;

        if (m) {
          const label = m[1].trim();
          const cur = parseInt(m[2]) * 100;
          const max = parseInt(m[4]) * 100;
          setProgress({ value: cur, max, hidden: false });
          if (progressEl) {
            progressEl.value = cur;
            progressEl.max = max;
            progressEl.hidden = false;
          }
          setStatus(label);
          if (statusEl) statusEl.innerHTML = label;
          if (spinnerEl) spinnerEl.hidden = false;
        } else {
          setProgress({ value: null, max: null, hidden: true });
          if (progressEl) {
            progressEl.value = null;
            progressEl.max = null;
            progressEl.hidden = true;
          }
          const label = String(text || '');
          setStatus(label);
          if (statusEl) statusEl.innerHTML = label;
          if (!label && spinnerEl) spinnerEl.style.display = 'none';
        }
      },
      monitorRunDependencies: function (left: number) {
        this.totalDependencies = Math.max(this.totalDependencies, left);
        const msg = left ? `Preparing... (${this.totalDependencies - left}/${this.totalDependencies})` : 'All downloads complete.';
        this.setStatus(msg);
      }
    };

    // Attach default onerror handler to update state
    window.onerror = (event) => {
      Module.setStatus('Exception thrown, see JavaScript console');
      if (spinnerEl) spinnerEl.style.display = 'none';
      Module.setStatus = (text) => {
        if (text) console.error('[post-exception status] ' + text);
      };
      setError('Exception thrown, see JavaScript console');
    };

    // WebGL context lost handler
    if (canvasEl) {
      const onLost = (e) => {
        // keep behavior from original script
        alert('WebGL context lost. You will need to reload the page.');
        e.preventDefault();
      };
      canvasEl.addEventListener('webglcontextlost', onLost, false);

      // store cleanup reference
      Module._cleanupWebGL = () => {
        canvasEl.removeEventListener('webglcontextlost', onLost, false);
      };
    }

    return Module;
  }, [refs, pushLog]);

  // Start function to import and initialize the module
  const start = useCallback(async () => {
    setError(null);
    setStatus('Downloading...');
    try {
      const Module = buildModule();
      moduleRef.current = Module;

      // dynamic import of the Emscripten module
      // the module is expected to export a default init function that accepts Module
      const imported = await import(/* @vite-ignore */ modulePath);
      const initModule = imported?.default ?? imported;
      if (typeof initModule !== 'function') {
        throw new Error('Emscripten module did not export an initializer function');
      }

      // call initializer
      initModule(Module);
      setStatus('Module initialized');
    } catch (err) {
      console.error(err);
      setError(String(err));
      setStatus('Initialization failed');
    }
  }, [buildModule, modulePath]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // call any module cleanup hooks
      const M = moduleRef.current;
      if (M) {
        if (typeof M._cleanupWebGL === 'function') M._cleanupWebGL();
        // try to remove any custom properties to avoid leaks
        try {
          delete window.onerror;
        } catch {}
      }
    };
  }, []);

  return {
    start,
    status,
    progress,
    logs,
    error,
    module: moduleRef.current
  };
}