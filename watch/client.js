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
        // Emit a WebSocket event to the server
        ws.send(JSON.stringify({ eventType: "change", filename: path.relative(appFolderPath, filePath) }));
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
