import { PluginOption } from "vite"
import {minimatch} from "minimatch"
import path from "node:path"
import { exec } from "node:child_process"

export const watch = (config: {
  pattern: string | string[]
  command: string | string[]
  silent?: boolean
  timeout?: number
  onInit?: boolean
}): PluginOption => {
  const options = {
    silent: false,
    timeout: 500,
    onInit: true,
    ...config,
  }

  const execute = () => {
    ;[options.command].flat().forEach((command) => {
      exec(command, (_exception, output, error) => {
        if (!options.silent && output) console.log(output)
        if (!options.silent && error) console.error(error)
      })
    })
  }

  return {
    name: "vite-plugin-watch",

    buildStart() {
      if (options.onInit) {
        execute()
      }
    },

    handleHotUpdate({ file, server }) {
      const patterns = Array.of(options.pattern).flat()
      console.log(file);
      const shouldRun = patterns.find((pattern) =>
        minimatch(file, path.resolve(server.config.root, pattern).replaceAll("\\", "/"))
      )

      if (shouldRun) {
        console.info("Running", options.command, "\n")

        execute()
      }
    },
  }
}