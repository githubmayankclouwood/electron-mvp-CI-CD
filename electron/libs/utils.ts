import path from 'path';
import { platform } from 'os';
import { app } from 'electron';
import { readdir } from 'node:fs/promises';
import { statSync } from 'node:fs'
import net from 'net';
import { exec } from 'child_process'

const resourcePath =
  app.isPackaged
    ? path.join(process.resourcesPath)
    : path.join(app.getAppPath(), 'resources')

export function getPlatform() {
  switch (platform()) {
    case 'aix':
    case 'freebsd':
    case 'linux':
    case 'openbsd':
    case 'android':
      return 'linux';
    case 'darwin':
    case 'sunos':
      return 'mac';
    case 'win32':
      return 'win';
    default:
      return null;
  }
}

const isWin = getPlatform() === 'win'

export function getBinariesPath() {
  const { isPackaged } = app;
  const arch = process.arch;

  const binariesPath =
    isPackaged
      ? path.join(resourcePath, 'browser')
      : path.join(resourcePath, getPlatform()!, isWin ? 'app' : arch);

  return binariesPath;
}

const appExt = isWin ? '.exe' : '.app/Contents/MacOS/Chromium'
export const chromiumPath = path.resolve(path.join(getBinariesPath(), `Chromium${appExt}`));
export const extPath = (ext: string | undefined) => path.join(resourcePath, 'browser-data', 'extensions', ext || '');

export async function listFiles(directoryPath: string) {
  try {
    const files = await readdir(directoryPath);
    return files.filter(file => {
      const filePath = path.join(directoryPath, file);
      const stats = statSync(filePath);
      return stats.isFile()
    })
  } catch (err) {
    console.error('Error reading directory:', err);
    return []
  }
}

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const freePort = (port: number): Promise<void> => {
  return new Promise((resolve, reject) => {
    let command: string;

    if (getPlatform() === 'win') {
      // Windows command to find and kill processes using the port
      command = `netstat -ano | findstr :${port}`;
      exec(command, (error, stdout) => {
        if (error) {
          if (stdout.trim() === '') {
            return resolve(); // No processes are using the port
          }
          return reject(new Error(`Error executing command: ${error}`));
        }

        const lines = stdout.split('\n');
        const pids = new Set<string>();

        lines.forEach((line) => {
          const parts = line.trim().split(/\s+/);
          if (parts.length > 4) {
            pids.add(parts[4]); // PID is in the last column
          }
        });

        if (pids.size > 0) {
          const killCommand = `taskkill /F /PID ${Array.from(pids).join(' /PID ')}`;
          exec(killCommand, (killError) => {
            if (killError) {
              return reject(new Error(`Error killing processes on port ${port}: ${killError}`));
            }
            resolve();
          });
        } else {
          resolve(); // No processes to kill
        }
      });

    } else {
      // Unix-based systems command to find and kill processes using the port
      command = `lsof -i :${port} -t | xargs kill -9`;
      exec(command, (error, stdout, stderr) => {
        if (error) {
          if (stderr.includes('No such file')) {
            // No process is using the port
            return resolve();
          }
          return reject(new Error(`Error executing command: ${stderr}`));
        }
        resolve();
      });
    }
  });
};

export const waitForPort = (port: number, timeout = 20000) => {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const checkPort = () => {
      const client = new net.Socket();
      client
        .connect({ port: port }, () => {
          client.destroy();
          resolve(port);
        })
        .on('error', (err) => {
          client.destroy();
          if (Date.now() - start < timeout) {
            setTimeout(checkPort, 100);
          } else {
            reject(new Error('Timed out waiting for Chrome debugger'));
          }
        });
    };
    checkPort();
  });
};
