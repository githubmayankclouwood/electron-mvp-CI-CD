import { app, ipcMain, BrowserWindow, Notification } from 'electron'
import { createRequire } from 'node:module'
import pkg from '../../package.json'
import {
    appTitle,
    autoUpdateCheckInterval,
    autoUpdateDevURL,
    autoUpdateProdURL,
} from '../../configurations/constants'

const { autoUpdater } = createRequire(import.meta.url)('electron-updater')

let appUpdateInterval: any = null
const showUpdateNotification = (
    win: Electron.BrowserWindow,
    newVersion: string
) => {
    const notification = new Notification({
        title: 'Update Available',
        body: `A new version v${newVersion} is available.`,
    })
    notification.on('click', () => {
        if (win.isMinimized()) win.restore()
        win.show()
    })

    notification.show()
}

export function autoUpdate(win: Electron.BrowserWindow) {
    // When set to false, the update download will be triggered through the API
    autoUpdater.setFeedURL(
        pkg.name === appTitle ? autoUpdateProdURL : autoUpdateDevURL
    )
    autoUpdater.autoDownload = false
    autoUpdater.disableWebInstaller = false
    autoUpdater.allowDowngrade = false

    // start check
    autoUpdater.on('checking-for-update', () => { })
    // update available
    autoUpdater.on('update-available', (arg: any) => {
        if (appUpdateInterval) clearInterval(appUpdateInterval)
        showUpdateNotification(win, arg?.version)
        win.webContents.send('update-available', {
            message: 'Downloading... 0% completed',
            newVersion: arg?.version,
        })
    })
    // update not available
    autoUpdater.on('update-not-available', (arg: any) => { })
}

// Start downloading and feedback on progress
ipcMain.handle('start-downloading', (event: Electron.IpcMainInvokeEvent) => {
    autoUpdater.on('download-progress', (progressInfo: any) => {
        event.sender.send('update-available', {
            message: `Downloading... ${Math.floor(progressInfo.percent)}% completed`,
        })
    })
    autoUpdater.on('error', (error: Error) => {
        event.sender.send('update-error')
    })
    autoUpdater.on('update-downloaded', () => {
        if (process.platform === 'darwin') {
            autoUpdater.nativeUpdater.quitAndInstall(false, true)
            setTimeout(() => {
                let browserWindows = BrowserWindow.getAllWindows()
                browserWindows.forEach(function (browserWindow: any) {
                    browserWindow.destroy()
                })
            }, 20000)
        } else autoUpdater.quitAndInstall()
    })

    autoUpdater.downloadUpdate()
})

// Checking Update
const checkingUpdateHandler = () => {
    if (app.isPackaged) autoUpdater.checkForUpdates()
}
ipcMain.handle('checking-update', (_, arg) => {
    checkingUpdateHandler()
    appUpdateInterval = setInterval(() => {
        checkingUpdateHandler()
    }, autoUpdateCheckInterval)
})
