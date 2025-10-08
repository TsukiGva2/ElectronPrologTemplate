const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;
let wsServerProcess;

// --- Creates the main application window ---
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 700,
    webPreferences: {
      // We are using the standard browser WebSocket API in the renderer,
      // so we don't need a preload script or Node.js integration.
      // These are secure defaults.
      contextIsolation: true,
      nodeIntegration: false,
    },
    icon: path.join(__dirname, 'icon.png') // Optional: Add an app icon
  });

  mainWindow.loadFile('index.html');

  // Uncomment to open the DevTools on start
  // mainWindow.webContents.openDevTools();
}

// --- Starts the WebSocket server as a child process ---
function startWebSocketServer() {
  console.log('Attempting to start WebSocket server...');
  
  // Use 'npx' to run the 'wserve' package, which provides a simple command-line
  // WebSocket server. This avoids needing a global installation.
  // The '-p 4000' flag sets the port.
  // The '-e' flag makes it an echo server, which is perfect for this demo.
  wsServerProcess = spawn('./server.pl');

  wsServerProcess.stdout.on('data', (data) => {
    console.log(`WebSocket Server stdout: ${data}`);
  });

  wsServerProcess.stderr.on('data', (data) => {
    console.error(`WebSocket Server stderr: ${data}`);
  });

  wsServerProcess.on('close', (code) => {
    console.log(`WebSocket Server process exited with code ${code}`);
  });

  wsServerProcess.on('error', (err) => {
    console.error('Failed to start WebSocket server process.', err);
  });
}

app.whenReady().then(() => {
  startWebSocketServer();
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Before the app quits, ensure the server process is terminated.
app.on('before-quit', () => {
  console.log('Terminating WebSocket server process...');
  if (wsServerProcess) {
    wsServerProcess.kill();
  }
});
