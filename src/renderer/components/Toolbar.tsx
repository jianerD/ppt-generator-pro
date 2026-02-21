import { useState } from 'react'
import { usePresentationStore } from '../store/presentationStore'

export default function Toolbar() {
  const { 
    addSlide, currentSlideIndex, duplicateSlide, removeSlide,
    presentation, undo, redo, history, setIsPlaying, isPlaying
  } = usePresentationStore()
  const [showAI, setShowAI] = useState(false)

  return (
    <>
      <div className="toolbar">
        {/* 文件操作 */}
        <div className="flex items-center gap-1 pr-2 border-r border-slate-600">
          <button onClick={() => window.electron?.openFile()} className="toolbar-btn" title="新建">
            📁 新建
          </button>
        </div>

        {/* 编辑操作 */}
        <div className="flex items-center gap-1 pr-2 border-r border-slate-600">
          <button 
            onClick={undo} 
            disabled={history.past.length === 0}
            className="toolbar-btn disabled:opacity-50" 
            title="撤销 (Ctrl+Z)"
          >
            ↩️ 撤销
          </button>
          <button 
            onClick={redo} 
            disabled={history.future.length === 0}
            className="toolbar-btn disabled:opacity-50" 
            title="重做 (Ctrl+Shift+Z)"
          >
            ↪️ 重做
          </button>
        </div>

        {/* 幻灯片操作 */}
        <div className="flex items-center gap-1 pr-2 border-r border-slate-600">
          <button onClick={() => addSlide('title')} className="toolbar-btn" title="添加标题页">
            + 标题页
          </button>
          <button onClick={() => addSlide('content')} className="toolbar-btn" title="添加内容页">
            + 内容页
          </button>
          <button onClick={() => duplicateSlide(currentSlideIndex)} className="toolbar-btn" title="复制">
            📋 复制
          </button>
          <button 
            onClick={() => removeSlide(currentSlideIndex)} 
            disabled={presentation.slides.length <= 1}
            className="toolbar-btn disabled:opacity-50" 
            title="删除"
          >
            🗑️ 删除
          </button>
        </div>

        {/* 插入操作 */}
        <div className="flex items-center gap-1 pr-2 border-r border-slate-600">
          <button onClick={() => {/* TODO */}} className="toolbar-btn" title="文本">
            📝 文本
          </button>
          <button onClick={async () => {
            const result = await window.electron?.openImage()
            if (!result?.canceled && result?.filePaths?.[0]) {
              // TODO: 添加图片
            }
          }} className="toolbar-btn" title="图片">
            🖼️ 图片
          </button>
          <button onClick={() => {/* TODO */}} className="toolbar-btn" title="形状">
            ⬜ 形状
          </button>
          <button onClick={() => {/* TODO */}} className="toolbar-btn" title="图表">
            📊 图表
          </button>
        </div>

        {/* AI */}
        <div className="flex items-center gap-1 pr-2 border-r border-slate-600">
          <button 
            onClick={() => setShowAI(!showAI)} 
            className={`toolbar-btn ${showAI ? 'active' : ''}`}
            title="AI生成"
          >
            🤖 AI生成
          </button>
        </div>

        {/* 演示 */}
        <div className="flex items-center gap-1 ml-auto">
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className="btn btn-primary"
            title="开始演示"
          >
            ▶ 演示
          </button>
          <button 
            onClick={async () => {
              const result = await window.electron?.saveFile(presentation.title + '.pptx')
              if (!result?.canceled && result?.filePath) {
                // TODO: 导出PPT
              }
            }}
            className="btn btn-secondary"
            title="导出"
          >
            💾 导出
          </button>
        </div>
      </div>

      {/* AI面板 */}
      {showAI && <AIPanel onClose={() => setShowAI(false)} />}
    </>
  )
}
