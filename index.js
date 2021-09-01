const { app, BrowserWindow } = require('electron');
const requirejs = require('requirejs');

function createWindow () {
	const win = new BrowserWindow({
		width: 1200,
		height: 800,
		webPreferences: {
			nodeIntegration: true,
			contextIsolation: false,
			enableRemoteModule: true,
		}
	})

	win.loadFile('main-menu.html');
	
	/* For debugging */
	win.webContents.openDevTools();
}

app.whenReady().then(() => {
	createWindow();
});

app.on('window-all-closed', function () {
	if (process.platform !== 'darwin') app.quit()
});