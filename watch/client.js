import path from 'path';
import WebSocket from 'ws';
import chokidar from 'chokidar';
import { fileURLToPath } from 'url';

// Resolve __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connect to the WebSocket server
const ws = new WebSocket('ws://localhost:8080');
const appFolderPath = path.join(__dirname, '../app');
console.log(appFolderPath);

let debounceTimeout;
const DEBOUNCE_DELAY = 300; // Adjust the delay as needed

// Handle WebSocket connection open
ws.on('open', () => {
    console.log('WebSocket connection established');

    // Path to the app folder in the project root
    // Initialize chokidar watcher
    const watcher = chokidar.watch(appFolderPath, {
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

    ws.on('message', (message) => {
        console.log(`Received message from server: ${message}`);
        try {
            const event = JSON.parse(message);
            if (event.eventType === 'build-complete') {
                console.log('Build completed successfully');
            }
        } catch (err) {
            console.error('Error parsing message:', err.message);
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
