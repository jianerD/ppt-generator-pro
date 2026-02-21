import { useState, useCallback } from 'react'
import { Rnd } from 'react-rnd'
import { usePresentationStore } from '../store/presentationStore'
import { v4 as uuidv4 } from 'uuid'
import type { SlideElement, TextElement, ChartElement, ImageElement, ShapeElement } from '../../shared/types'
import ChartElementComponent from './ChartElement'

export default function Canvas() {
  const { 
    presentation, currentSlideIndex, selectedElementId,
    setSelectedElementId, addElement, updateElement, zoom
  } = usePresentationStore()
  
  const slide = presentation.slides[currentSlideIndex]
  const [editingId, setEditingId] = useState<string | null>(null)

  // 处理画布点击
  const handleCanvasClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).classList.contains('canvas-area')) {
      setSelectedElementId(null)
    }
  }

  // 添加文本元素
  const addTextElement = () => {
    const element: TextElement = {
      id: uuidv4(),
      type: 'text',
      position: { x: 100, y: 100, width: 300, height: 60 },
      style: { fontSize: 24, color: '#FFFFFF', textAlign: 'left' },
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

  // 添加形状
  const addShapeElement = (shapeType: 'rect' | 'circle' | 'triangle') => {
    const element: ShapeElement = {
      id: uuidv4(),
      type: 'shape',
      shapeType,
      position: { x: 150, y: 150, width: 100, height: 100 },
      style: {},
      fill: '#38BDF8',
      stroke: '#1D4ED8',
      strokeWidth: 2
    }
    addElement(currentSlideIndex, element)
  }

  // 添加图片
  const addImageElement = async () => {
    try {
      const result = await window.electron?.openImage()
      if (!result?.canceled && result?.filePaths?.[0]) {
        const element: ImageElement = {
          id: uuidv4(),
          type: 'image',
          position: { x: 100, y: 100, width: 300, height: 200 },
          style: {},
          src: result.filePaths[0],
          alt: '图片'
        }
        addElement(currentSlideIndex, element)
      }
    } catch (error) {
      console.error('Failed to add image:', error)
    }
  }

  // 元素大小/位置变化
  const handleDragStop = useCallback((elementId: string, data: { x: number; y: number }) => {
    updateElement(currentSlideIndex, elementId, {
      position: {
        x: data.x,
        y: data.y,
        width: 0, // 不改变宽度
        height: 0 // 不改变高度
      }
    })
  }, [currentSlideIndex, updateElement])

  const handleResizeStop = useCallback((elementId: string, data: { width: number; height: number }) => {
    const element = slide.elements.find(el => el.id === elementId)
    if (element) {
      updateElement(currentSlideIndex, elementId, {
        position: {
          ...element.position,
          width: data.width,
          height: data.height
        }
      })
    }
  }, [currentSlideIndex, slide.elements, updateElement])

  // 文本编辑
  const handleTextBlur = (elementId: string, content: string) => {
    updateElement(currentSlideIndex, elementId, { content } as Partial<SlideElement>)
    setEditingId(null)
  }

  return (
    <div className="canvas-container" onClick={handleCanvasClick}>
      <div
        className="canvas-area relative bg-white shadow-2xl"
        style={{
          width: 960,
          height: 540,
          transform: `scale(${zoom / 100})`,
          transformOrigin: 'center center',
          background: slide.background
        }}
      >
        {/* 幻灯片元素 */}
        {slide.elements.map((element) => (
          <Rnd
            key={element.id}
            size={{ width: element.position.width, height: element.position.height }}
            position={{ x: element.position.x, y: element.position.y }}
            onDragStop={(e, d) => handleDragStop(element.id, { x: d.x, y: d.y })}
            onResizeStop={(e, direction, ref, delta, position) => {
              handleResizeStop(element.id, { 
                width: parseInt(ref.style.width), 
                height: parseInt(ref.style.height) 
              })
            }}
            bounds="parent"
            minWidth={50}
            minHeight={30}
            onClick={(e) => {
              e.stopPropagation()
              setSelectedElementId(element.id)
            }}
            style={{
              zIndex: element.id === selectedElementId ? 100 : 1,
            }}
            enableResizing={element.id === selectedElementId ? {
              top: true, right: true, bottom: true, left: true,
              topRight: true, bottomRight: true, bottomLeft: true, topLeft: true
            } : false}
          >
            <div 
              className={`w-full h-full ${element.id === selectedElementId ? 'ring-2 ring-blue-500' : ''}`}
            >
              {element.type === 'text' && (
                <div
                  style={{
                    fontSize: (element as TextElement).style.fontSize,
                    fontWeight: (element as TextElement).style.fontWeight,
                    color: (element as TextElement).style.color,
                    textAlign: (element as TextElement).style.textAlign,
                    lineHeight: 1.5,
                  }}
                  className="w-full h-full p-2 cursor-text"
                  contentEditable={element.id === editingId}
                  suppressContentEditableWarning
                  onDoubleClick={() => setEditingId(element.id)}
                  onBlur={(e) => handleTextBlur(element.id, e.currentTarget.innerText)}
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
                  src={(element as ImageElement).src}
                  alt={(element as ImageElement).alt || ''}
                  className="w-full h-full object-cover pointer-events-none"
                  draggable={false}
                />
              )}
              
              {element.type === 'shape' && (
                <div
                  className="w-full h-full"
                  style={{
                    backgroundColor: (element as ShapeElement).fill || '#38BDF8',
                    borderRadius: (element as ShapeElement).shapeType === 'circle' ? '50%' : 
                                  (element as ShapeElement).shapeType === 'triangle' ? '0' : '4px',
                    border: `${(element as ShapeElement).strokeWidth || 2}px solid ${(element as ShapeElement).stroke || '#1D4ED8'}`
                  }}
                />
              )}
            </div>
          </Rnd>
        ))}
        
        {/* 空状态提示 */}
        {slide.elements.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-slate-500">
            <div className="text-center">
              <p className="mb-4">点击工具栏添加元素</p>
              <button onClick={addTextElement} className="btn btn-primary mr-2">
                + 文本
              </button>
              <button onClick={addChartElement} className="btn btn-secondary mr-2">
                + 图表
              </button>
              <button onClick={() => addShapeElement('rect')} className="btn btn-secondary mr-2">
                + 形状
              </button>
              <button onClick={addImageElement} className="btn btn-secondary">
                + 图片
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
