import { app, ipcMain } from 'electron';
import path from 'path';
import { mkdir, writeFile, mkdtemp } from 'node:fs/promises';
import { exec } from 'child_process';
import { extPath, chromiumPath, freePort, listFiles, sleep, waitForPort } from '../libs/utils';
// import { existsSync } from 'node:fs';
import { getBookmarks, isChromeInstalled } from './helpers';
import os from 'os';
import getPort from 'get-port';
// @ts-expect-error
import CDP from 'chrome-remote-interface';

let client: any;
let chromePorts: number[] = [];
let chromesData: { [key: number]: { profilePath: string } } = {}

const launchChrome = async (e: any, ext: string) => {
  try {
    const tempDir = await mkdtemp(path.join(app.getPath('temp'), 'chrome-profile-'));
    const isWin = os.platform() === 'win32';
    // if (!existsSync(tempDir)) await mkdir(tempDir);
    const downloadDir = path.join(tempDir, 'downloads');
    await mkdir(downloadDir, { recursive: true });

    await mkdir(path.join(tempDir, 'Default'), { recursive: true });

    const preferences = {
      "download": {
        "prompt_for_download": false,
        "directory_upgrade": false,
        "default_directory": downloadDir
      },
      "plugins": {
        "always_open_pdf_externally": true
      }
    };

    await writeFile(
      path.join(tempDir, 'Default', 'Preferences'),
      JSON.stringify(preferences)
    );

    const loadExtension = ext !== 'None' ? ` \
      --load-extension="${extPath(ext)}"` : ''

    const port = await getPort()
    chromePorts.push(port);
    chromesData[port] = { profilePath: tempDir }

    return new Promise((resolve, reject) => {
      exec(`${isWin ? 'start /min "" ' : ''}"${chromiumPath}" \
      --user-data-dir="${tempDir}" \
      --password-store=basic \
      --disable-features=PasswordImport \
      --no-first-run \ 
      --load-extension=${extPath('ChromiumWebStore')} \
      --remote-debugging-port=${port || 9222} ${loadExtension} \
      --no-default-browser-check`, { shell: isWin ? 'cmd.exe' : undefined }, async (error, stdout, stderr) => {
        if (error) {
          reject(`Error launching Chromium: ${error.message}`);
        }
        console.log(`Chromium session ended successfully.`, port);
        const downloadedFiles = await listFiles(downloadDir)
        if (client) {
          await client.close();
          client = null;
        }
        chromePorts = chromePorts.filter(p => p !== port)
        resolve(downloadedFiles)
      })
    });

  } catch (err) {
    console.error(`Failed to create temp directory or launch Chromium: ${err}`);
    return [];
  }
}

export const ipcMainHandlers = () => {
  ipcMain.handle('launch-chrome', launchChrome);

  ipcMain.handle('get-bookmarks', async (event) => {
    const chromeInstalled = isChromeInstalled()
    if (!chromeInstalled) throw new Error('Chrome not found!')

    const bookmarks = await getBookmarks();
    if (bookmarks?.length) return bookmarks?.map((bk: any) => `${bk.name} - ${bk.url || bk.children[0]?.url}`)
    return [];
  });

  ipcMain.handle('goto-chrome', async (event, url, port) => {
    // await waitForPort(port);

    try {
      client = await CDP({ port });
      const { Network, Page } = client;

      // Enable events
      await Network.enable();
      await Page.enable();

      // Log network requests for logging purpose only
      // Network.requestWillBeSent((params: any) => {
      //   console.log(params.request.url);
      // });

      // Navigate to a URL
      await Page.navigate({ url });
      await Page.loadEventFired();
    } catch (err) {
      console.error(err);
    }
  });

  ipcMain.handle('download-pdf', async (event, port) => {
    try {
      client = await CDP({ port });
      const { Network, Page, Runtime } = client;

      // Enable events
      await Network.enable();
      await Page.enable();

      let screenshotNumber = 1;
      let intervalId = setInterval(async () => {
        try {
          // Capture the screenshot
          const screenshot = await Page.captureScreenshot({ format: 'png' });
          const buffer = Buffer.from(screenshot.data, 'base64');

          // Save the screenshot to a file
          const fileName = `${screenshotNumber}.png`;
          const profileDownload = path.join(chromesData[port].profilePath, 'downloads')
          await writeFile(path.join(profileDownload, fileName), buffer, 'base64');
          console.log(`Saved screenshot as ${fileName}`);

          screenshotNumber++;
        } catch (err) {
          console.error('Failed to capture screenshot:', err);
        }
      }, 5000); // 5000 milliseconds = 5 seconds

      // Handle the case when the connection is closed
      client.on('disconnect', () => {
        console.log('CDP connection lost. Stopping screenshot capture.');
        clearInterval(intervalId);
      });

      // Log network requests for logging purpose only
      // Network.requestWillBeSent((params: any) => {
      //   console.log(params.request.url);
      // });

      // Navigate to Google and search for pdf
      await Page.navigate({ url: 'https://www.google.com/search?q=test.pdf' });
      await Page.loadEventFired();

      // Click on the first result link (Avoiding direct download for security reasons)
      await Runtime.evaluate({
        expression: `document.querySelector('#search a').click();`
      });

    } catch (err) {
      console.error(err);
    }
  });

  ipcMain.handle('get-running-chrome-ports', async (event) => {
    return chromePorts;
  });
}
