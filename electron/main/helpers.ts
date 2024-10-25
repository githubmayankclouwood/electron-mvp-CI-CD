import { app, Menu, Tray, BrowserWindow, nativeImage } from "electron";
import path from 'path';
import fs from 'fs';
import os from 'os';
import pkg from '../../package.json'
import { appTitle } from '../../configurations/constants'

export const handleAppTray = (mainWindow: BrowserWindow): void => {
  const iconPath = nativeImage.createFromPath(path.join(process.env.VITE_PUBLIC, pkg.name === appTitle ? 'icon.png' : 'icon-dev.png'));

  const tray = new Tray(iconPath.resize({ height: 16, width: 16 }));

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Open',
      click: () => {
        mainWindow.show();
      },
    },
    {
      label: 'Exit',
      click: () => {
        app.quit();
      },
    },
  ]);

  tray.setToolTip(pkg.name);
  tray.setContextMenu(contextMenu);

  tray.on('double-click', () => {
    mainWindow.show();
  });

  mainWindow.on('minimize', (event: any) => {
    event.preventDefault();
    mainWindow.hide();
  });

  app.on('activate', () => {
    mainWindow.show();
  });
}

export const isChromeInstalled = () => {
  const platform = os.platform();

  if (platform === 'win32') {
    const paths = [
      path.join(process.env.LOCALAPPDATA || process.env.APPDATA || '', 'Google', 'Chrome', 'User Data'),
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    ];
    console.log('pathToCheck', paths);

    return paths.some(fs.existsSync);
  } else if (platform === 'darwin') {
    const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
    return fs.existsSync(chromePath);
  }

  // Optionally add more platform checks if needed (e.g., Linux)

  return false;
}

export const getChromeBookmarksPath = () => {
  const platform = os.platform();

  if (platform === 'win32') {
    return path.join(process.env.LOCALAPPDATA || process.env.APPDATA || '', 'Google', 'Chrome', 'User Data', 'Default', 'Bookmarks');
  } else if (platform === 'darwin') {
    return path.join(os.homedir(), 'Library', 'Application Support', 'Google', 'Chrome', 'Default', 'Bookmarks');
  }
  // Add more cases if needed for different platforms
  return null;
}

export const getBookmarks: any = () => {
  const bookmarksPath = getChromeBookmarksPath();

  if (!bookmarksPath || !fs.existsSync(bookmarksPath)) {
    console.error('Bookmarks file not found.');
    return [];
  }

  return new Promise((resolve, reject) => {
    fs.readFile(bookmarksPath, 'utf-8', (err, data) => {
      if (err) {
        console.error('Error reading the bookmarks file:', err);
        return resolve([]);
      }

      try {
        const bookmarks = JSON.parse(data);
        const bookmarksBar = bookmarks?.roots?.bookmark_bar?.children;
        resolve(bookmarksBar);
      } catch (parseError) {
        console.error('Error parsing the bookmarks JSON:', parseError);
        resolve([]);
      }
    });
  });
}
