/**
 * @author Luuxis - master
 * @license CC-BY-NC 4.0 - https://creativecommons.org/licenses/by-nc/4.0
 * 
 * @author Silverdium
 * @author SilverCore
 * @author Mister Papaye
 */

const { app, ipcMain, nativeTheme, session } = require('electron');
const { Microsoft } = require('silver-mc-java-core');
const { autoUpdater } = require('electron-updater')

const path = require('path');
const fs = require('fs');
const os = require('os');


const UpdateWindow = require("./assets/js/windows/updateWindow.js");
const MainWindow = require("./assets/js/windows/mainWindow.js");

let dev = process.env.NODE_ENV === 'dev';

if (dev) {
    let appPath = path.resolve('./data/Launcher').replace(/\\/g, '/');
    let appdata = path.resolve('./data').replace(/\\/g, '/');
    if (!fs.existsSync(appPath)) fs.mkdirSync(appPath, { recursive: true });
    if (!fs.existsSync(appdata)) fs.mkdirSync(appdata, { recursive: true });
    app.setPath('userData', appPath);
    app.setPath('appData', appdata)
}

if (!app.requestSingleInstanceLock()) app.quit();
else app.whenReady().then(() => {
    if (dev) return MainWindow.createWindow()
    UpdateWindow.createWindow()
});


ipcMain.on('main-window-open', () => MainWindow.createWindow())
ipcMain.on('main-window-dev-tools', () => MainWindow.getWindow().webContents.openDevTools({ mode: 'detach' }))
ipcMain.on('main-window-dev-tools-close', () => MainWindow.getWindow().webContents.closeDevTools())
ipcMain.on('main-window-close', () => MainWindow.destroyWindow())
ipcMain.on('main-window-reload', () => MainWindow.getWindow().reload())
ipcMain.on('main-window-progress', (event, options) => MainWindow.getWindow().setProgressBar(options.progress / options.size))
ipcMain.on('main-window-progress-reset', () => MainWindow.getWindow().setProgressBar(-1))
ipcMain.on('main-window-progress-load', () => MainWindow.getWindow().setProgressBar(2))
ipcMain.on('main-window-minimize', () => MainWindow.getWindow().minimize())
ipcMain.on('update-window-close', () => UpdateWindow.destroyWindow())
ipcMain.on('update-window-dev-tools', () => UpdateWindow.getWindow().webContents.openDevTools({ mode: 'detach' }))
ipcMain.on('update-window-progress', (event, options) => UpdateWindow.getWindow().setProgressBar(options.progress / options.size))
ipcMain.on('update-window-progress-reset', () => UpdateWindow.getWindow().setProgressBar(-1))
ipcMain.on('update-window-progress-load', () => UpdateWindow.getWindow().setProgressBar(2))

ipcMain.handle('path-user-data', () => app.getPath('userData'))
ipcMain.handle('appData', e => app.getPath('appData'))

ipcMain.handle('get-pc-info', () => {

    return {
        user: os.userInfo().username,
    
        osInfo: {
            osType: os.type(),
            platform: os.platform(),
            release: os.release(),
            hostname: os.hostname()
        },
    
        cpuInfo: {
            architecture: os.arch(),
            model: os.cpus()[0].model,
            cores: os.cpus().length
        },
    
        memoryInfo: {
            totalMemoryGB: (os.totalmem() / 1024 ** 3).toFixed(2) + ' GB',
            freeMemoryGB: (os.freemem() / 1024 ** 3).toFixed(2) + ' GB',
            totalMemoryMB: (os.totalmem() / 1024 / 1024).toFixed(2),
            freeMemoryMB: (os.freemem() / 1024 / 1024).toFixed(2)
        },
    
        uptimeInfo: {
            uptimeSeconds: os.uptime(),
            uptimeHours: (os.uptime() / 3600).toFixed(2)
        }
    };
    
});

ipcMain.handle('get-cookie', async (event, name) => {
    try {
        const cookies = await session.defaultSession.cookies.get({ name });
        return cookies.length ? cookies[0].value : null;
    } catch (err) {
        console.error('Erreur get-cookie :', err);
        return null;
    }
});

ipcMain.on('main-window-maximize', () => {
    if (MainWindow.getWindow().isMaximized()) {
        MainWindow.getWindow().unmaximize();
    } else {
        MainWindow.getWindow().maximize();
    }
})

ipcMain.on('main-window-hide', () => MainWindow.getWindow().hide())
ipcMain.on('main-window-show', () => MainWindow.getWindow().show())

ipcMain.handle('Microsoft-window', async (_, client_id) => {
    return await new Microsoft(client_id).getAuth();
})

ipcMain.handle('is-dark-theme', (_, theme) => {
    if (theme === 'dark') return true
    if (theme === 'light') return false
    return nativeTheme.shouldUseDarkColors;
})

app.on('window-all-closed', () => app.quit());

autoUpdater.autoDownload = false;

ipcMain.handle('update-app', async () => {
    return await new Promise(async (resolve, reject) => {
        autoUpdater.checkForUpdates().then(res => {
            resolve(res);
        }).catch(error => {
            reject({
                error: true,
                message: error
            })
        })
    })
})

autoUpdater.on('update-available', () => {
    const updateWindow = UpdateWindow.getWindow();
    if (updateWindow) updateWindow.webContents.send('updateAvailable');
});

ipcMain.on('start-update', () => {
    autoUpdater.downloadUpdate();
})

autoUpdater.on('update-not-available', () => {
    const updateWindow = UpdateWindow.getWindow();
    if (updateWindow) updateWindow.webContents.send('update-not-available');
});

autoUpdater.on('update-downloaded', () => {
    autoUpdater.quitAndInstall();
});

autoUpdater.on('download-progress', (progress) => {
    const updateWindow = UpdateWindow.getWindow();
    if (updateWindow) updateWindow.webContents.send('download-progress', progress);
})

autoUpdater.on('error', (err) => {
    const updateWindow = UpdateWindow.getWindow();
    if (updateWindow) updateWindow.webContents.send('error', err);
});