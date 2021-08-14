const { app, BrowserWindow } = require('electron')

function createWindow () {
	const win = new BrowserWindow({
		width: 800,
		height: 600,
		webPreferences: {
			nodeIntegration: true,
			contextIsolation: false,
			enableRemoteModule: true,
		}
	})

	win.loadFile('garden-control.html')
	
	/* For debugging */
	win.webContents.openDevTools()
}

app.whenReady().then(() => {
	createWindow()
})

app.on('window-all-closed', function () {
	if (process.platform !== 'darwin') app.quit()
})