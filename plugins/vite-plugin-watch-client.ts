import { PluginOption, ViteDevServer } from "vite"
import path from 'path';
import WebSocket from 'ws';
import chokidar, { FSWatcher } from 'chokidar';
import { fileURLToPath } from 'url';

export const watchClient = (config?: object): PluginOption => {
    const options = {
        ...config,
    }

    // Resolve __dirname for ES modules
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    // Connect to the WebSocket server
    let ws: WebSocket;

    const appFolderPath = path.join(__dirname, '../app');
    console.log(appFolderPath);

    let debounceTimeout: NodeJS.Timeout | undefined = undefined;
    const DEBOUNCE_DELAY = 300; // Adjust the delay as needed

    let watcher: FSWatcher | undefined = undefined;

    return {
        name: "vite-plugin-watch-client",

        configureServer(server: ViteDevServer) {

            console.log('Vite server started, setting up WebSocket connection...');

            // Connect to the WebSocket server
            ws = new WebSocket('ws://localhost:8080');
            // Handle WebSocket connection open
            ws.on('open', () => {
                console.log('WebSocket connection established');

                // Path to the app folder in the project root
                // Initialize chokidar watcher
                watcher = chokidar.watch(appFolderPath, {
                    persistent: true,
                    ignoreInitial: true
                });

                // Watch for file changes
                watcher.on('all', (event, filePath) => {
                    console.log(`File ${filePath} changed with event type: ${event}`);

                    // Debounce the WebSocket event emission
                    clearTimeout(debounceTimeout);
                    debounceTimeout = setTimeout(() => {
                        ws.send(JSON.stringify({ eventType: "change", filename: path.relative(appFolderPath, filePath) }));
                    }, DEBOUNCE_DELAY);
                });
                // Handle WebSocket message from the server
                ws.on('message', (message: string) => {
                    try {
                        const event = JSON.parse(message);
                        if (event.eventType === 'build-complete') {
                            console.log('Build completed successfully');
                        }
                        if (event.eventType === 'build-error') {
                            console.error('build error');
                        }
                        if(event.eventType === 'build-error-log') {
                            console.error('build error log:', event.log);
                        }
                        if(event.eventType === 'build-output-log') {
                            console.error('build out log:', event.log);
                        }
                    } catch (err: unknown) {
                        if (err instanceof Error) {
                            console.error('Error parsing message:', err.message);
                        } else {
                            console.error('Unknown error occurred:', err);
                        }
                    }
                });
            });

            // Handle WebSocket connection errors
            ws.on('error', (error) => {
                console.error('WebSocket error:', error);
            });

            // Handle WebSocket connection close
            ws.on('close', () => {
                console.log('WebSocket connection closed');
            });
        },
        closeBundle() {
            if (watcher) {
                watcher.close();
            }
            if (ws) {
                ws.close();
            }
        }
    }
}