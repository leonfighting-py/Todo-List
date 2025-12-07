import { app, BrowserWindow } from 'electron';
import path from 'path';

// Fix missing Node.js type definitions
declare const require: any;
declare const __dirname: string;

// 处理 Windows 安装过程中的创建快捷方式等事件
if (require('electron-squirrel-startup')) {
  app.quit();
}

let mainWindow: BrowserWindow | null = null;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 600,
    backgroundColor: '#09090b', // 默认深色背景
    title: 'FlowLog',
    icon: path.join(__dirname, 'icon.png'), // 如果你有图标的话
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false, // 简化版配置，生产环境建议开启隔离并使用 preload
      webSecurity: false // 允许加载本地资源
    },
    autoHideMenuBar: true, // 隐藏默认菜单栏
  });

  // 开发环境下加载 Vite 服务，生产环境下加载打包文件
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
};

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if ((process as any).platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});