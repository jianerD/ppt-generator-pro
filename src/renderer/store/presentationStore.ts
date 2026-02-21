import { create } from 'zustand'
import { v4 as uuidv4 } from 'uuid'
import type { Presentation, Slide, SlideElement, Template, AIConfig } from '../shared/types'

// 默认模板
const defaultTemplate: Template = {
  id: 'dark',
  name: '深色科技风',
  type: 'dark',
  background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
  textColor: '#FFFFFF',
  accentColor: '#38BDF8'
}

// 创建新幻灯片
function createNewSlide(type: Slide['type'] = 'content'): Slide {
  return {
    id: uuidv4(),
    type,
    background: defaultTemplate.background,
    elements: [],
    transition: { type: 'fade', duration: 300 }
  }
}

// 创建默认演示文稿
function createDefaultPresentation(): Presentation {
  const titleSlide = createNewSlide('title')
  const contentSlide = createNewSlide('content')
  
  // 添加标题文本
  titleSlide.elements.push({
    id: uuidv4(),
    type: 'text',
    position: { x: 100, y: 200, width: 800, height: 100 },
    style: { fontSize: 48, fontWeight: 'bold', color: '#FFFFFF', textAlign: 'center' },
    content: '演示标题'
  })
  
  contentSlide.elements.push({
    id: uuidv4(),
    type: 'text',
    position: { x: 100, y: 100, width: 800, height: 60 },
    style: { fontSize: 36, fontWeight: 'bold', color: '#FFFFFF' },
    content: '内容标题'
  })
  
  contentSlide.elements.push({
    id: uuidv4(),
    type: 'text',
    position: { x: 100, y: 180, width: 800, height: 300 },
    style: { fontSize: 20, color: '#CBD5E1', lineHeight: 1.8 },
    content: '点击添加内容...\n- 要点1\n- 要点2\n- 要点3'
  })
  
  return {
    id: uuidv4(),
    title: '未命名演示',
    slides: [titleSlide, contentSlide],
    template: defaultTemplate,
    createdAt: new Date(),
    updatedAt: new Date()
  }
}

interface HistoryState {
  past: Presentation[]
  future: Presentation[]
}

interface PresentationStore {
  // 演示文稿数据
  presentation: Presentation
  currentSlideIndex: number
  selectedElementId: string | null
  zoom: number
  isPlaying: boolean
  
  // 历史记录（撤销/重做）
  history: HistoryState
  
  // AI配置
  aiConfig: AIConfig
  
  // 操作方法
  setPresentation: (presentation: Presentation) => void
  setCurrentSlideIndex: (index: number) => void
  setSelectedElementId: (id: string | null) => void
  setZoom: (zoom: number) => void
  setIsPlaying: (playing: boolean) => void
  setAIConfig: (config: AIConfig) => void
  
  // 幻灯片操作
  addSlide: (type?: Slide['type']) => void
  removeSlide: (index: number) => void
  duplicateSlide: (index: number) => void
  updateSlide: (index: number, updates: Partial<Slide>) => void
  moveSlide: (fromIndex: number, toIndex: number) => void
  
  // 元素操作
  addElement: (slideIndex: number, element: SlideElement) => void
  updateElement: (slideIndex: number, elementId: string, updates: Partial<SlideElement>) => void
  removeElement: (slideIndex: number, elementId: string) => void
  
  // 模板操作
  setTemplate: (template: Template) => void
  
  // 标题/副标题
  setTitle: (title: string) => void
  setSubtitle: (subtitle: string) => void
  
  // 历史操作
  undo: () => void
  redo: () => void
  saveHistory: () => void
  
  // 新建/重置
  newPresentation: () => void
}

export const usePresentationStore = create<PresentationStore>((set, get) => ({
  // 初始状态
  presentation: createDefaultPresentation(),
  currentSlideIndex: 0,
  selectedElementId: null,
  zoom: 100,
  isPlaying: false,
  history: { past: [], future: [] },
  aiConfig: { provider: 'minimax', apiKey: '', model: 'abab5.5-chat' },
  
  // 设置方法
  setPresentation: (presentation) => set({ presentation }),
  setCurrentSlideIndex: (index) => set({ currentSlideIndex: index }),
  setSelectedElementId: (id) => set({ selectedElementId: id }),
  setZoom: (zoom) => set({ zoom: Math.max(25, Math.min(200, zoom)) }),
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  setAIConfig: (config) => set({ aiConfig: config }),
  
  // 幻灯片操作
  addSlide: (type) => {
    const { presentation, saveHistory } = get()
    saveHistory()
    const newSlide = createNewSlide(type)
    const newSlides = [...presentation.slides, newSlide]
    set({
      presentation: { ...presentation, slides: newSlides, updatedAt: new Date() },
      currentSlideIndex: newSlides.length - 1
    })
  },
  
  removeSlide: (index) => {
    const { presentation, currentSlideIndex, saveHistory } = get()
    if (presentation.slides.length <= 1) return
    saveHistory()
    const newSlides = presentation.slides.filter((_, i) => i !== index)
    const newIndex = Math.min(currentSlideIndex, newSlides.length - 1)
    set({
      presentation: { ...presentation, slides: newSlides, updatedAt: new Date() },
      currentSlideIndex: newIndex
    })
  },
  
  duplicateSlide: (index) => {
    const { presentation, saveHistory } = get()
    saveHistory()
    const slide = presentation.slides[index]
    const duplicate = { ...slide, id: uuidv4(), elements: slide.elements.map(e => ({ ...e, id: uuidv4() })) }
    const newSlides = [...presentation.slides]
    newSlides.splice(index + 1, 0, duplicate)
    set({
      presentation: { ...presentation, slides: newSlides, updatedAt: new Date() },
      currentSlideIndex: index + 1
    })
  },
  
  updateSlide: (index, updates) => {
    const { presentation, saveHistory } = get()
    saveHistory()
    const newSlides = [...presentation.slides]
    newSlides[index] = { ...newSlides[index], ...updates }
    set({
      presentation: { ...presentation, slides: newSlides, updatedAt: new Date() }
    })
  },
  
  moveSlide: (fromIndex, toIndex) => {
    const { presentation, saveHistory, currentSlideIndex } = get()
    saveHistory()
    const newSlides = [...presentation.slides]
    const [moved] = newSlides.splice(fromIndex, 1)
    newSlides.splice(toIndex, 0, moved)
    
    let newCurrentIndex = currentSlideIndex
    if (currentSlideIndex === fromIndex) {
      newCurrentIndex = toIndex
    } else if (fromIndex < currentSlideIndex && toIndex >= currentSlideIndex) {
      newCurrentIndex--
    } else if (fromIndex > currentSlideIndex && toIndex <= currentSlideIndex) {
      newCurrentIndex++
    }
    
    set({
      presentation: { ...presentation, slides: newSlides, updatedAt: new Date() },
      currentSlideIndex: newCurrentIndex
    })
  },
  
  // 元素操作
  addElement: (slideIndex, element) => {
    const { presentation, saveHistory } = get()
    saveHistory()
    const newSlides = [...presentation.slides]
    newSlides[slideIndex].elements.push(element)
    set({
      presentation: { ...presentation, slides: newSlides, updatedAt: new Date() },
      selectedElementId: element.id
    })
  },
  
  updateElement: (slideIndex, elementId, updates) => {
    const { presentation, saveHistory } = get()
    saveHistory()
    const newSlides = [...presentation.slides]
    const elements = newSlides[slideIndex].elements.map(e =>
      e.id === elementId ? { ...e, ...updates } : e
    )
    newSlides[slideIndex].elements = elements
    set({
      presentation: { ...presentation, slides: newSlides, updatedAt: new Date() }
    })
  },
  
  removeElement: (slideIndex, elementId) => {
    const { presentation, saveHistory, selectedElementId } = get()
    saveHistory()
    const newSlides = [...presentation.slides]
    newSlides[slideIndex].elements = newSlides[slideIndex].elements.filter(e => e.id !== elementId)
    set({
      presentation: { ...presentation, slides: newSlides, updatedAt: new Date() },
      selectedElementId: selectedElementId === elementId ? null : selectedElementId
    })
  },
  
  // 模板操作
  setTemplate: (template) => {
    const { presentation, saveHistory } = get()
    saveHistory()
    const newSlides = presentation.slides.map(slide => ({
      ...slide,
      background: template.background
    }))
    set({
      presentation: {
        ...presentation,
        template,
        slides: newSlides,
        updatedAt: new Date()
      }
    })
  },
  
  // 标题/副标题
  setTitle: (title) => {
    const { presentation } = get()
    set({
      presentation: { ...presentation, title, updatedAt: new Date() }
    })
  },
  
  setSubtitle: (subtitle) => {
    const { presentation } = get()
    set({
      presentation: { ...presentation, subtitle, updatedAt: new Date() }
    })
  },
  
  // 历史操作
  saveHistory: () => {
    const { presentation, history } = get()
    set({
      history: {
        past: [...history.past.slice(-19), JSON.parse(JSON.stringify(presentation))],
        future: []
      }
    })
  },
  
  undo: () => {
    const { history, presentation } = get()
    if (history.past.length === 0) return
    const previous = history.past[history.past.length - 1]
    const newPast = history.past.slice(0, -1)
    set({
      presentation: previous,
      history: {
        past: newPast,
        future: [JSON.parse(JSON.stringify(presentation)), ...history.future]
      },
      currentSlideIndex: 0,
      selectedElementId: null
    })
  },
  
  redo: () => {
    const { history, presentation } = get()
    if (history.future.length === 0) return
    const next = history.future[0]
    const newFuture = history.future.slice(1)
    set({
      presentation: next,
      history: {
        past: [...history.past, JSON.parse(JSON.stringify(presentation))],
        future: newFuture
      },
      currentSlideIndex: 0,
      selectedElementId: null
    })
  },
  
  // 新建
  newPresentation: () => {
    set({
      presentation: createDefaultPresentation(),
      currentSlideIndex: 0,
      selectedElementId: null,
      history: { past: [], future: [] }
    })
  }
}))
