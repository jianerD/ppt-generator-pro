import { useRef, useState } from 'react'
import { usePresentationStore } from '../store/presentationStore'
import { v4 as uuidv4 } from 'uuid'
import type { SlideElement, TextElement, ChartElement } from '../../shared/types'
import ChartElementComponent from './ChartElement'

export default function Canvas() {
  const { 
    presentation, currentSlideIndex, selectedElementId,
    setSelectedElementId, addElement, updateElement, zoom
  } = usePresentationStore()
  
  const slide = presentation.slides[currentSlideIndex]
  const canvasRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  // 处理画布点击
  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      setSelectedElementId(null)
    }
  }

  // 添加文本元素
  const addTextElement = () => {
    const element: TextElement = {
      id: uuidv4(),
      type: 'text',
      position: { x: 100, y: 100, width: 300, height: 60 },
      style: { fontSize: 24, color: '#FFFFFF' },
      content: '双击编辑文本'
    }
    addElement(currentSlideIndex, element)
  }

  // 添加图表元素
  const addChartElement = () => {
    const element: ChartElement = {
      id: uuidv4(),
      type: 'chart',
      chartType: 'bar',
      position: { x: 100, y: 150, width: 500, height: 300 },
      style: {},
      data: {
        labels: ['A', 'B', 'C', 'D'],
        datasets: [{
          label: '数据',
          data: [65, 59, 80, 81],
          backgroundColor: ['#38BDF8', '#34D399', '#FBBF24', '#F472B6']
        }]
      }
    }
    addElement(currentSlideIndex, element)
  }

  // 处理元素拖拽
  const handleElementMouseDown = (e: React.MouseEvent, elementId: string) => {
    e.stopPropagation()
    setSelectedElementId(elementId)
    setIsDragging(true)
    setDragStart({ x: e.clientX, y: e.clientY })
  }

  // 处理拖拽
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !selectedElementId) return
    
    const dx = (e.clientX - dragStart.x) / (zoom / 100)
    const dy = (e.clientY - dragStart.y) / (zoom / 100)
    
    const element = slide.elements.find(el => el.id === selectedElementId)
    if (element) {
      updateElement(currentSlideIndex, selectedElementId, {
        position: {
          ...element.position,
          x: Math.max(0, element.position.x + dx),
          y: Math.max(0, element.position.y + dy)
        }
      })
      setDragStart({ x: e.clientX, y: e.clientY })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // 监听菜单插入事件
  useState(() => {
    const electron = window.electron
    if (!electron) return
    
    electron.onMenuInsertText?.(() => addTextElement())
    electron.onMenuInsertChart?.(() => addChartElement())
  })

  return (
    <div className="canvas-container" onClick={handleCanvasClick}>
      <div
        ref={canvasRef}
        className="relative bg-white shadow-2xl"
        style={{
          width: 960,
          height: 540,
          transform: `scale(${zoom / 100})`,
          transformOrigin: 'center center',
          background: slide.background
        }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* 幻灯片元素 */}
        {slide.elements.map((element) => (
          <div
            key={element.id}
            className={`element ${element.id === selectedElementId ? 'selected' : ''}`}
            style={{
              left: element.position.x,
              top: element.position.y,
              width: element.position.width,
              height: element.position.height,
              zIndex: element.zIndex || 1
            }}
            onMouseDown={(e) => handleElementMouseDown(e, element.id)}
          >
            {element.type === 'text' && (
              <div
                style={{
                  fontSize: element.style.fontSize,
                  fontWeight: element.style.fontWeight,
                  color: element.style.color,
                  textAlign: element.style.textAlign,
                  lineHeight: 1.5
                }}
                className="w-full h-full p-2 cursor-text"
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => {
                  updateElement(currentSlideIndex, element.id, {
                    content: (e.target as HTMLDivElement).innerText
                  })
                }}
              >
                {(element as TextElement).content}
              </div>
            )}
            
            {element.type === 'chart' && (
              <ChartElementComponent 
                element={element as ChartElement}
                slideIndex={currentSlideIndex}
              />
            )}
            
            {element.type === 'image' && (
              <img
                src={(element as any).src}
                alt={(element as any).alt || ''}
                className="w-full h-full object-cover"
                draggable={false}
              />
            )}
            
            {element.type === 'shape' && (
              <div
                className="w-full h-full"
                style={{
                  backgroundColor: (element as any).fill || '#38BDF8',
                  borderRadius: (element as any).shapeType === 'circle' ? '50%' : 0
                }}
              />
            )}
          </div>
        ))}
        
        {/* 空状态提示 */}
        {slide.elements.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-slate-500">
            <div className="text-center">
              <p className="mb-4">点击工具栏添加元素</p>
              <button onClick={addTextElement} className="btn btn-primary mr-2">
                + 文本
              </button>
              <button onClick={addChartElement} className="btn btn-secondary">
                + 图表
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
