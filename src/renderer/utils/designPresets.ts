import { useState, useEffect, useRef } from 'react'
import { usePresentationStore } from '../store/presentationStore'
import type { Slide, SlideElement, TextElement, ChartElement, ImageElement, ShapeElement, TableElement } from '../../shared/types'

// 预设布局
export const layouts = {
  'title-left': {
    name: '标题左对齐',
    elements: [
      { id: 'title', x: 50, y: 50, w: 860, h: 80, fontSize: 48 },
      { id: 'content', x: 50, y: 150, w: 860, h: 350, fontSize: 20 }
    ]
  },
  'title-center': {
    name: '居中标题',
    elements: [
      { id: 'title', x: 100, y: 180, w: 760, h: 80, fontSize: 48, align: 'center' },
      { id: 'subtitle', x: 100, y: 280, w: 760, h: 50, fontSize: 24, align: 'center' }
    ]
  },
  'title-right': {
    name: '标题右对齐',
    elements: [
      { id: 'title', x: 50, y: 50, w: 860, h: 80, fontSize: 48, align: 'right' },
      { id: 'content', x: 50, y: 150, w: 860, h: 350, fontSize: 20, align: 'right' }
    ]
  },
  'two-column': {
    name: '双栏布局',
    elements: [
      { id: 'title', x: 50, y: 30, w: 860, h: 50, fontSize: 36 },
      { id: 'col1', x: 50, y: 100, w: 400, h: 380, fontSize: 18 },
      { id: 'col2', x: 510, y: 100, w: 400, h: 380, fontSize: 18 }
    ]
  },
  'list': {
    name: '列表布局',
    elements: [
      { id: 'title', x: 50, y: 30, w: 860, h: 50, fontSize: 36 },
      { id: 'items', x: 50, y: 100, w: 860, h: 400, fontSize: 20 }
    ]
  },
  'comparison': {
    name: '对比布局',
    elements: [
      { id: 'title', x: 50, y: 30, w: 860, h: 50, fontSize: 36 },
      { id: 'left', x: 50, y: 100, w: 400, h: 380, fontSize: 18 },
      { id: 'right', x: 510, y: 100, w: 400, h: 380, fontSize: 18 }
    ]
  },
  'quote': {
    name: '引用布局',
    elements: [
      { id: 'quote', x: 100, y: 150, w: 760, h: 200, fontSize: 32, align: 'center', italic: true },
      { id: 'author', x: 100, y: 380, w: 760, h: 40, fontSize: 18, align: 'center' }
    ]
  },
  'stats': {
    name: '统计布局',
    elements: [
      { id: 'title', x: 50, y: 30, w: 860, h: 50, fontSize: 36 },
      { id: 'stat1', x: 50, y: 100, w: 200, h: 150, fontSize: 48 },
      { id: 'stat2', x: 280, y: 100, w: 200, h: 150, fontSize: 48 },
      { id: 'stat3', x: 510, y: 100, w: 200, h: 150, fontSize: 48 },
      { id: 'stat4', x: 740, y: 100, w: 200, h: 150, fontSize: 48 }
    ]
  }
}

// 预设配色方案
export const colorSchemes = {
  'dark-blue': {
    name: '深蓝科技',
    background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
    text: '#FFFFFF',
    accent: '#38BDF8',
    secondary: '#1E40AF'
  },
  'blue-purple': {
    name: '蓝紫渐变',
    background: 'linear-gradient(135deg, #312e81 0%, #1e1b4b 100%)',
    text: '#FFFFFF',
    accent: '#A78BFA',
    secondary: '#6366F1'
  },
  'green-nature': {
    name: '自然绿',
    background: 'linear-gradient(135deg, #064e3b 0%, #022c22 100%)',
    text: '#FFFFFF',
    accent: '#34D399',
    secondary: '#059669'
  },
  'orange-warm': {
    name: '暖橙色',
    background: 'linear-gradient(135deg, #7c2d12 0%, #451a03 100%)',
    text: '#FFFFFF',
    accent: '#FB923C',
    secondary: '#EA580C'
  },
  'corporate': {
    name: '企业商务',
    background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
    text: '#FFFFFF',
    accent: '#F59E0B',
    secondary: '#D97706'
  },
  'light-minimal': {
    name: '简约白',
    background: '#FFFFFF',
    text: '#1E293B',
    accent: '#2563EB',
    secondary: '#3B82F6'
  }
}

// 动画预设
export const animations = {
  'none': { name: '无', duration: 0 },
  'fade': { name: '淡入淡出', duration: 500 },
  'slide-left': { name: '向左滑动', duration: 400 },
  'slide-right': { name: '向右滑动', duration: 400 },
  'slide-up': { name: '向上滑动', duration: 400 },
  'slide-down': { name: '向下滑动', duration: 400 },
  'zoom': { name: '缩放', duration: 300 },
  'flip': { name: '翻转', duration: 500 },
  'bounce': { name: '弹跳', duration: 600 }
}

// 图表样式预设
export const chartStyles = {
  'bar-gradient': {
    name: '渐变柱状图',
    type: 'bar',
    colors: ['#38BDF8', '#34D399', '#FBBF24', '#F472B6', '#A78BFA']
  },
  'line_smooth': {
    name: '平滑折线图',
    type: 'line',
    smooth: true,
    area: true
  },
  'pie-rainbow': {
    name: '彩虹饼图',
    type: 'pie',
    colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD']
  },
  'radar': {
    name: '雷达图',
    type: 'radar'
  }
}

// 应用布局到幻灯片
export function applyLayout(slide: Slide, layoutKey: string, content?: { title?: string; items?: string[] }): Slide {
  const layout = layouts[layoutKey]
  if (!layout) return slide

  const newElements: SlideElement[] = []
  
  layout.elements.forEach((el, index) => {
    if (el.id === 'title') {
      newElements.push({
        id: `title-${Date.now()}`,
        type: 'text',
        position: { x: el.x, y: el.y, width: el.w, height: el.h },
        style: { 
          fontSize: el.fontSize, 
          fontWeight: 'bold', 
          color: '#FFFFFF',
          textAlign: (el.align as any) || 'left'
        },
        content: content?.title || '标题'
      } as TextElement)
    } else if (el.id === 'content' || el.id === 'items') {
      newElements.push({
        id: `content-${Date.now()}`,
        type: 'text',
        position: { x: el.x, y: el.y, width: el.w, height: el.h },
        style: { fontSize: el.fontSize, color: '#CBD5E1' },
        content: content?.items?.join('\n') || '点击添加内容...\n- 要点1\n- 要点2\n- 要点3'
      } as TextElement)
    } else if (el.id === 'col1') {
      newElements.push({
        id: `col1-${Date.now()}`,
        type: 'text',
        position: { x: el.x, y: el.y, width: el.w, height: el.h },
        style: { fontSize: el.fontSize, color: '#CBD5E1' },
        content: '左侧内容\n\n• 要点1\n• 要点2'
      } as TextElement)
    } else if (el.id === 'col2') {
      newElements.push({
        id: `col2-${Date.now()}`,
        type: 'text',
        position: { x: el.x, y: el.y, width: el.w, height: el.h },
        style: { fontSize: el.fontSize, color: '#CBD5E1' },
        content: '右侧内容\n\n• 要点3\n• 要点4'
      } as TextElement)
    } else if (el.id === 'quote') {
      newElements.push({
        id: `quote-${Date.now()}`,
        type: 'text',
        position: { x: el.x, y: el.y, width: el.w, height: el.h },
        style: { 
          fontSize: el.fontSize, 
          color: '#94A3B8', 
          fontStyle: 'italic',
          textAlign: (el.align as any) || 'center'
        },
        content: content?.title || '"引用内容"'
      } as TextElement)
    } else if (el.id.startsWith('stat')) {
      const statIndex = parseInt(el.id.replace('stat', '')) - 1
      const stats = content?.items || ['100%', '50+', '1M+', '99%']
      newElements.push({
        id: `stat-${Date.now()}-${index}`,
        type: 'text',
        position: { x: el.x, y: el.y, width: el.w, height: el.h },
        style: { 
          fontSize: el.fontSize, 
          color: '#38BDF8',
          textAlign: 'center'
        },
        content: stats[statIndex] || '0'
      } as TextElement)
    }
  })

  return {
    ...slide,
    elements: newElements
  }
}

// 应用配色方案
export function applyColorScheme(slide: Slide, schemeKey: string): Slide {
  const scheme = colorSchemes[schemeKey]
  if (!scheme) return slide

  return {
    ...slide,
    background: scheme.background
  }
}

// 组件：布局选择器
export function LayoutSelector({ onSelect }: { onSelect: (layout: string) => void }) {
  return (
    <div className="grid grid-cols-4 gap-2 p-2">
      {Object.entries(layouts).map(([key, layout]) => (
        <button
          key={key}
          onClick={() => onSelect(key)}
          className="p-2 text-xs bg-slate-700 hover:bg-slate-600 rounded text-center"
        >
          {layout.name}
        </button>
      ))}
    </div>
  )
}

// 组件：配色选择器
export function ColorSchemeSelector({ onSelect }: { onSelect: (scheme: string) => void }) {
  return (
    <div className="grid grid-cols-3 gap-2 p-2">
      {Object.entries(colorSchemes).map(([key, scheme]) => (
        <button
          key={key}
          onClick={() => onSelect(key)}
          className="p-2 text-xs rounded text-center"
          style={{ background: scheme.background, color: scheme.text }}
        >
          {scheme.name}
        </button>
      ))}
    </div>
  )
}

// 组件：动画选择器
export function AnimationSelector({ onSelect }: { onSelect: (animation: string) => void }) {
  return (
    <div className="grid grid-cols-3 gap-2 p-2">
      {Object.entries(animations).map(([key, anim]) => (
        <button
          key={key}
          onClick={() => onSelect(key)}
          className="p-2 text-xs bg-slate-700 hover:bg-slate-600 rounded text-center"
        >
          {anim.name}
        </button>
      ))}
    </div>
  )
}
