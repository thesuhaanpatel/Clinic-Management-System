const { app, BrowserWindow } = require('electron');
const path = require('path');
const { exec } = require('child_process');

let nextProcess;

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,  // secure
      contextIsolation: true,  // secure
    },
  });

  // Load Next.js frontend
  win.loadURL('http://localhost:3000');
}

app.whenReady().then(() => {
  // Start Next.js server in production mode
  nextProcess = exec('npm run start', (err, stdout, stderr) => {
    if (err) console.error(err);
    console.log(stdout, stderr);
  });

  createWindow();
});

// Quit Electron when all windows are closed
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Kill Next.js server when Electron quits
app.on('quit', () => {
  if (nextProcess) nextProcess.kill();
});
