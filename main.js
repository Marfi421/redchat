const { app, BrowserWindow } = require('electron');

// START LOCAL SERVER
require('./server');

function createWindow() {

    const win = new BrowserWindow({
        width: 1000,
        height: 700
    });

    // LOAD LOCALHOST
    setTimeout(() => {

        win.loadURL('https://excuse-donor-realtors-respondents.trycloudflare.com');

    }, 1000);

}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {

    if (process.platform !== 'darwin') {
        app.quit();
    }

});