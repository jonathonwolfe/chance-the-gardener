const { app, BrowserWindow } = require('electron');
const { ipcMain } = require('electron');
const requirejs = require('requirejs');

function createWindow () {
	ipcMain.handle('get-temp-path', async () => {
		const path = app.getPath('temp');
		return path;
	});

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
}

app.whenReady().then(() => {
	createWindow();
});

app.on('window-all-closed', function () {
	if (process.platform !== 'darwin') app.quit()
});