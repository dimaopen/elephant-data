import {fetchMerlion} from "./fetcher/merlion";
import Store from 'electron-store';
import os from 'os'

const {app, BrowserWindow, ipcMain, shell} = require('electron');


// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
    app.quit();
}

const createWindow = () => {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        width: 850,
        height: 600,
        webPreferences: {
            preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
        },
        // icon: path.join(__dirname, "elephant-100.png")
    });

    // and load the index.html of the app.
    mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
    mainWindow.removeMenu()

    // mainWindow.webContents.openDevTools();
    return mainWindow
};

const store = new Store({encryptionKey: 'do_not_consider_secure'});

function getProviderSettings() {
    // console.info("get provider settings")
    return store.get('providers')
}

const providers = {
    'merlion': fetchMerlion,
}

async function fetchProvider(event, provider, providerData) {
    const providerFunction = providers[provider];
    if (!providerFunction)
        throw new Error(`No provider found for ${provider}`);
    const providerSettings = store.get('providers');
    providerSettings[provider] = providerData;
    store.set('providers', providerSettings);
    const filePath = providerData.filePath
    delete providerData.filePath
    try {
        return await providerFunction(providerData, filePath)
    } catch (e) {
        console.error(e);
        return {error: e.message};
    }
}

async function saveFileDialog(event, curPath) {
    const {dialog} = require('electron')
    if (!curPath) {
        curPath = os.homedir()
    }
    return await dialog.showSaveDialog(mainWindow,
        {
            title: "Сохранить данные",
            defaultPath: curPath,
            properties: ['createDirectory']
        });
}

function openFile(event, filePath) {
    console.info('open file %s', filePath);
    shell.openPath(filePath)
}

let mainWindow
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
    const providers = store.get('providers')
    if (!providers) {
        store.set('providers', {});
    }
    ipcMain.handle('get-provider-settings', getProviderSettings)
    ipcMain.handle('save-file-dialog', saveFileDialog)
    ipcMain.handle('open-file', openFile)
    ipcMain.handle('fetch-provider', fetchProvider)
    mainWindow = createWindow()
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});


// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
