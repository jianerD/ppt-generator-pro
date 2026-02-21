import { app, BrowserWindow, ipcMain, Menu, shell } from 'electron'
import { join } from 'path'

// 禁用GPU加速（可选，解决某些问题）
app.disableHardwareAcceleration()

let mainWindow: BrowserWindow | null = null

// 开发模式判断
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    backgroundColor: '#0F172A',
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false
    },
    show: false
  })

  // 创建菜单
  const menuTemplate: Electron.MenuItemConstructorOptions[] = [
    {
      label: '文件',
      submenu: [
        { label: '新建', accelerator: 'CmdOrCtrl+N', click: () => mainWindow?.webContents.send('menu:new') },
        { label: '打开', accelerator: 'CmdOrCtrl+O', click: () => mainWindow?.webContents.send('menu:open') },
        { label: '保存', accelerator: 'CmdOrCtrl+S', click: () => mainWindow?.webContents.send('menu:save') },
        { label: '另存为', accelerator: 'CmdOrCtrl+Shift+S', click: () => mainWindow?.webContents.send('menu:saveAs') },
        { type: 'separator' },
        { label: '导出PPT', accelerator: 'CmdOrCtrl+E', click: () => mainWindow?.webContents.send('menu:export') },
        { type: 'separator' },
        { role: 'quit', label: '退出' }
      ]
    },
    {
      label: '编辑',
      submenu: [
        { label: '撤销', accelerator: 'CmdOrCtrl+Z', click: () => mainWindow?.webContents.send('menu:undo') },
        { label: '重做', accelerator: 'CmdOrCtrl+Shift+Z', click: () => mainWindow?.webContents.send('menu:redo') },
        { type: 'separator' },
        { role: 'cut', label: '剪切' },
        { role: 'copy', label: '复制' },
        { role: 'paste', label: '粘贴' },
        { role: 'delete', label: '删除' },
        { type: 'separator' },
        { role: 'selectAll', label: '全选' }
      ]
    },
    {
      label: '视图',
      submenu: [
        { label: '放大', accelerator: 'CmdOrCtrl+Plus', click: () => mainWindow?.webContents.send('menu:zoomIn') },
        { label: '缩小', accelerator: 'CmdOrCtrl+-', click: () => mainWindow?.webContents.send('menu:zoomOut') },
        { label: '重置缩放', accelerator: 'CmdOrCtrl+0', click: () => mainWindow?.webContents.send('menu:zoomReset') },
        { type: 'separator' },
        { role: 'togglefullscreen', label: '全屏' },
        { type: 'separator' },
        { role: 'toggleDevTools', label: '开发者工具' }
      ]
    },
    {
      label: '插入',
      submenu: [
        { label: '文本框', click: () => mainWindow?.webContents.send('menu:insertText') },
        { label: '图片', click: () => mainWindow?.webContents.send('menu:insertImage') },
        { label: '形状', click: () => mainWindow?.webContents.send('menu:insertShape') },
        { label: '图表', click: () => mainWindow?.webContents.send('menu:insertChart') },
        { label: '表格', click: () => mainWindow?.webContents.send('menu:insertTable') }
      ]
    },
    {
      label: '帮助',
      submenu: [
        { label: '关于', click: () => mainWindow?.webContents.send('menu:about') },
        { type: 'separator' },
        { label: '使用文档', click: () => shell.openExternal('https://github.com/ppt-generator-pro') }
      ]
    }
  ]

  const menu = Menu.buildFromTemplate(menuTemplate)
  Menu.setApplicationMenu(menu)

  // 加载页面
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(join(__dirname, '../dist/index.html'))
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show()
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

// IPC处理
ipcMain.handle('dialog:openFile', async () => {
  const { dialog } = await import('electron')
  const result = await dialog.showOpenDialog(mainWindow!, {
    properties: ['openFile'],
    filters: [
      { name: 'PPT Files', extensions: ['pptx', 'ppt'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  })
  return result
})

ipcMain.handle('dialog:saveFile', async (_, defaultName: string) => {
  const { dialog } = await import('electron')
  const result = await dialog.showSaveDialog(mainWindow!, {
    defaultPath: defaultName,
    filters: [
      { name: 'PPTX Files', extensions: ['pptx'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  })
  return result
})

ipcMain.handle('dialog:openImage', async () => {
  const { dialog } = await import('electron')
  const result = await dialog.showOpenDialog(mainWindow!, {
    properties: ['openFile'],
    filters: [
      { name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'] }
    ]
  })
  return result
})

// 窗口控制
ipcMain.on('window:minimize', () => {
  mainWindow?.minimize()
})

ipcMain.on('window:maximize', () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize()
  } else {
    mainWindow?.maximize()
  }
})

ipcMain.on('window:close', () => {
  mainWindow?.close()
})

// 应用启动
app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
