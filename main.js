const { app, BrowserWindow, dialog } = require('electron');
const { autoUpdater } = require('electron-updater');

require('./server');

let win;

function createWindow() {

    win = new BrowserWindow({
        width: 1000,
        height: 700
    });

    setTimeout(() => {

        win.loadURL('https://excuse-donor-realtors-respondents.trycloudflare.com');

    }, 1500);

    autoUpdater.checkForUpdatesAndNotify();

}

app.whenReady().then(createWindow);

autoUpdater.on('update-available', () => {

    dialog.showMessageBox({
        type: 'info',
        title: 'Update',
        message: 'Downloading new RedChat update...'
    });

});

autoUpdater.on('update-downloaded', () => {

    dialog.showMessageBox({
        type: 'info',
        title: 'Update Ready',
        message: 'RedChat will restart and update now.'
    }).then(() => {

        autoUpdater.quitAndInstall();

    });

});

app.on('window-all-closed', () => {

    if (process.platform !== 'darwin') {
        app.quit();
    }

});