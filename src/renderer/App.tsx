import { useEffect } from 'react'
import { usePresentationStore } from './store/presentationStore'
import SlideList from './components/SlideList'
import Canvas from './components/Canvas'
import PropertyPanel from './components/PropertyPanel'
import Toolbar from './components/Toolbar'
import TitleBar from './components/TitleBar'
import AIPanel from './components/AIPanel'

function App() {
  const { 
    undo, redo, newPresentation, 
    currentSlideIndex, addSlide,
    zoom, setZoom 
  } = usePresentationStore()

  // 监听菜单事件
  useEffect(() => {
    const electron = window.electron
    if (!electron) return

    const cleanups = [
      electron.onMenuNew(() => newPresentation()),
      electron.onMenuUndo(() => undo()),
      electron.onMenuRedo(() => redo()),
      electron.onMenuZoomIn(() => setZoom(zoom + 10)),
      electron.onMenuZoomOut(() => setZoom(zoom - 10)),
      electron.onMenuZoomReset(() => setZoom(100)),
    ]

    return () => cleanups.forEach(cleanup => cleanup())
  }, [zoom])

  // 键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Z 撤销
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        undo()
      }
      // Ctrl+Shift+Z 重做
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) {
        e.preventDefault()
        redo()
      }
      // Ctrl+N 新建
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault()
        newPresentation()
      }
      // Delete 删除元素
      if (e.key === 'Delete') {
        const { selectedElementId, removeElement, currentSlideIndex } = usePresentationStore.getState()
        if (selectedElementId) {
          removeElement(currentSlideIndex, selectedElementId)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div className="h-screen flex flex-col bg-dark">
      {/* 标题栏 */}
      <TitleBar />
      
      {/* 工具栏 */}
      <Toolbar />
      
      {/* 主内容区 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 左侧：幻灯片列表 */}
        <SlideList />
        
        {/* 中间：画布 */}
        <Canvas />
        
        {/* 右侧：属性面板 */}
        <PropertyPanel />
      </div>
      
      {/* 底部状态栏 */}
      <div className="h-8 bg-slate-800 border-t border-slate-700 flex items-center justify-between px-4 text-sm text-slate-400">
        <span>幻灯片 {currentSlideIndex + 1} / {usePresentationStore.getState().presentation.slides.length}</span>
        <span>缩放: {zoom}%</span>
      </div>
    </div>
  )
}

export default App
