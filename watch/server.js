import { WebSocketServer } from 'ws';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

// Resolve __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a WebSocket server
const wss = new WebSocketServer({ port: 8080 });

console.log('WebSocket server is listening on ws://localhost:8080');

// Function to execute the build.sh script
function executeBuildScript(ws) {
    const scriptPath = path.resolve(__dirname, '../build.sh');
    const buildProcess = spawn('bash', [scriptPath]);

    buildProcess.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
        ws.send(JSON.stringify({ eventType: 'build-output-log', log: data.toString() }));
    });

    buildProcess.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
        ws.send(JSON.stringify({ eventType: 'build-error-log', log: data.toString() }));
    });

    buildProcess.on('close', (code) => {
        if (code !== 0) {
            console.error(`build.sh exited with code ${code}`);
            ws.send(JSON.stringify({ eventType: 'build-error'}));
        } else {
            console.log('build.sh executed successfully');
            ws.send(JSON.stringify({ eventType: 'build-complete' }));
        }
    });
}

// Listen for connection events
wss.on('connection', (ws) => {
    console.log('Client connected');

    // Listen for messages from the client
    ws.on('message', (message) => {
        console.log(`Received message: ${message}`);

        try {
            const event = JSON.parse(message);

            // Check if the event is a files-change event
            if (event.eventType === 'change') {
                console.log('Files changed event received. Executing build.sh...');
                executeBuildScript(ws);
            }
        } catch (err) {
            console.error('Error parsing message:', err.message);
        }
    });

    // Handle client disconnection
    ws.on('close', () => {
        console.log('Client disconnected');
    });
});