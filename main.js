const { app, BrowserWindow } = require('electron')

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1920,
    height: 1080,
	webPreferences: {
		nodeIntegration: true,
		contextIsolation: false,
	}
  })

  win.loadFile('index.html')
}

app.whenReady().then(() => {
  createWindow()
})