# GetMyInvoices

[![GetMyInvoices](https://www.getmyinvoices.com/wp-content/uploads/2023/10/logo-getmyinvoices.svg)](https://www.getmyinvoices.com/de/)


## 👀 Overview

📦 Ready out of the box   
🌱 Easily extendable and customizable  
💪 Supports Node.js API in the renderer process  
🔩 Supports C/C++ native addons  
🐞 Debugger configuration included  
🖥 Easy to implement multiple windows  

## 🛫 Quick Setup

```sh
# clone the project
git clone git@github.com:bjoern-kahle/electron-mvp.git

# enter the project directory
cd electron-mvp

# install dependency
npm install

# develop
npm run dev
```

**Important**: We are currently managing the resources directory manually because it contains large files that can't be tracked using regular Git. We tried using Git LFS, but it didn't work as expected. Please download the resources directory from the link below and place it at the root level of the project. We plan to automate this process in the future:  
[Download Resources Directory](https://drive.google.com/open?id=1--8oDSBSU6SIelH6AWTyjUKmpZVJg5tn&usp=drive_fs)


## 📂 Directory structure

Familiar React application structure, just with `electron` folder on the top :wink:  
*Files in this folder will be separated from your React application and built into `dist-electron`*  

```tree
├── electron                                 Electron-related code
│   ├── main                                 Main-process source code
│   └── preload                              Preload-scripts source code
│
├── release                                  Generated after production build, contains executables
│   └── {version}
│       ├── {os}-{os_arch}                   Contains unpacked application executable
│       └── {app_name}_{version}.{ext}       Installer for the application
│
├── public                                   Static assets
└── src                                      Renderer source code, your React application
```

## 🔧 Additional features

1. electron-updater 👉 [see docs](src/components/update/README.md)
1. playwright
