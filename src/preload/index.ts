import { contextBridge, ipcRenderer } from 'electron'

// 暴露给渲染进程的API
const electronAPI = {
  // 文件对话框
  openFile: () => ipcRenderer.invoke('dialog:openFile'),
  saveFile: (defaultName: string) => ipcRenderer.invoke('dialog:saveFile', defaultName),
  openImage: () => ipcRenderer.invoke('dialog:openImage'),
  
  // 窗口控制
  minimize: () => ipcRenderer.send('window:minimize'),
  maximize: () => ipcRenderer.send('window:maximize'),
  close: () => ipcRenderer.send('window:close'),
  
  // 菜单事件监听
  onMenuNew: (callback: () => void) => {
    ipcRenderer.on('menu:new', callback)
    return () => ipcRenderer.removeListener('menu:new', callback)
  },
  onMenuOpen: (callback: () => void) => {
    ipcRenderer.on('menu:open', callback)
    return () => ipcRenderer.removeListener('menu:open', callback)
  },
  onMenuSave: (callback: () => void) => {
    ipcRenderer.on('menu:save', callback)
    return () => ipcRenderer.removeListener('menu:save', callback)
  },
  onMenuExport: (callback: () => void) => {
    ipcRenderer.on('menu:export', callback)
    return () => ipcRenderer.removeListener('menu:export', callback)
  },
  onMenuUndo: (callback: () => void) => {
    ipcRenderer.on('menu:undo', callback)
    return () => ipcRenderer.removeListener('menu:undo', callback)
  },
  onMenuRedo: (callback: () => void) => {
    ipcRenderer.on('menu:redo', callback)
    return () => ipcRenderer.removeListener('menu:redo', callback)
  },
  onMenuZoomIn: (callback: () => void) => {
    ipcRenderer.on('menu:zoomIn', callback)
    return () => ipcRenderer.removeListener('menu:zoomIn', callback)
  },
  onMenuZoomOut: (callback: () => void) => {
    ipcRenderer.on('menu:zoomOut', callback)
    return () => ipcRenderer.removeListener('menu:zoomOut', callback)
  },
  onMenuZoomReset: (callback: () => void) => {
    ipcRenderer.on('menu:zoomReset', callback)
    return () => ipcRenderer.removeListener('menu:zoomReset', callback)
  },
  onMenuInsertText: (callback: () => void) => {
    ipcRenderer.on('menu:insertText', callback)
    return () => ipcRenderer.removeListener('menu:insertText', callback)
  },
  onMenuInsertImage: (callback: () => void) => {
    ipcRenderer.on('menu:insertImage', callback)
    return () => ipcRenderer.removeListener('menu:insertImage', callback)
  },
  onMenuInsertShape: (callback: () => void) => {
    ipcRenderer.on('menu:insertShape', callback)
    return () => ipcRenderer.removeListener('menu:insertShape', callback)
  },
  onMenuInsertChart: (callback: () => void) => {
    ipcRenderer.on('menu:insertChart', callback)
    return () => ipcRenderer.removeListener('menu:insertChart', callback)
  }
}

contextBridge.exposeInMainWorld('electron', electronAPI)

// 类型声明
declare global {
  interface Window {
    electron: typeof electronAPI
  }
}
