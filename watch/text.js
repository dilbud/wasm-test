var statusElement = document.getElementById("status");
var progressElement = document.getElementById("progress");
var spinnerElement = document.getElementById("spinner");
var canvasElement = document.getElementById("canvas");
var outputElement = document.getElementById("output");
outputElement && (outputElement.value = "")
  canvasElement.addEventListener(
    "webglcontextlost",
    (e) => {
      alert("WebGL context lost. You will need to reload the page."),
        e.preventDefault();
    },
    !1
  );



var Module = {
  print(...e) {
    if ((console.log(...e), outputElement)) {
      var t = e.join(" ");
      (outputElement.value += t + "\n"),
        (outputElement.scrollTop = outputElement.scrollHeight);
    }
  },
  canvas: canvasElement,
  setStatus(e) {
    if (
      ((Module.setStatus.last ??= { time: Date.now(), text: "" }),
      e !== Module.setStatus.last.text)
    ) {
      var t = e.match(/([^(]+)\((\d+(\.\d+)?)\/(\d+)\)/),
        n = Date.now();
      (t && n - Module.setStatus.last.time < 30) ||
        ((Module.setStatus.last.time = n),
        (Module.setStatus.last.text = e),
        t
          ? ((e = t[1]),
            (progressElement.value = 100 * parseInt(t[2])),
            (progressElement.max = 100 * parseInt(t[4])),
            (progressElement.hidden = !1),
            (spinnerElement.hidden = !1))
          : ((progressElement.value = null),
            (progressElement.max = null),
            (progressElement.hidden = !0),
            e || (spinnerElement.style.display = "none")),
        (statusElement.innerHTML = e));
    }
  },
  totalDependencies: 0,
  monitorRunDependencies(e) {
    (this.totalDependencies = Math.max(this.totalDependencies, e)),
      Module.setStatus(
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
Module.setStatus("Downloading...")
window.onerror = (e) => {
    Module.setStatus("Exception thrown, see JavaScript console"),
      (spinnerElement.style.display = "none"),
      (Module.setStatus = (e) => {
        e && console.error("[post-exception status] " + e);
      });
  }
