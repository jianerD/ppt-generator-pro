import { useState } from 'react'
import { usePresentationStore } from '../store/presentationStore'
import { layouts, colorSchemes, animations, applyLayout, applyColorScheme } from '../utils/designPresets'

export default function DesignPanel({ onClose }: { onClose: () => void }) {
  const { presentation, currentSlideIndex, updateSlide } = usePresentationStore()
  const slide = presentation.slides[currentSlideIndex]
  const [activeTab, setActiveTab] = useState<'layouts' | 'colors' | 'animations'>('layouts')

  // 应用布局
  const handleApplyLayout = (layoutKey: string) => {
    const newSlide = applyLayout(slide, layoutKey)
    updateSlide(currentSlideIndex, { elements: newSlide.elements })
  }

  // 应用配色
  const handleApplyColor = (colorKey: string) => {
    const newSlide = applyColorScheme(slide, colorKey)
    updateSlide(currentSlideIndex, { background: newSlide.background })
  }

  // 应用动画
  const handleApplyAnimation = (animKey: string) => {
    const anim = animations[animKey]
    updateSlide(currentSlideIndex, {
      transition: { type: animKey as any, duration: anim.duration }
    })
  }

  return (
    <div className="absolute top-10 right-72 w-64">
      <div className="bg-slate-800 rounded-lg shadow-2xl border border-slate-700">
        <div className="flex items-center justify-between p-3 border-b border-slate-700">
          <h3 className="font-medium">🎨 设计面板</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
        </div>
        
        {/* 标签页 */}
        <div className="flex border-b border-slate-700">
          <button
            onClick={() => setActiveTab('layouts')}
            className={`flex-1 p-2 text-sm ${activeTab === 'layouts' ? 'bg-slate-700 text-blue-400' : 'text-slate-400'}`}
          >
            布局
          </button>
          <button
            onClick={() => setActiveTab('colors')}
            className={`flex-1 p-2 text-sm ${activeTab === 'colors' ? 'bg-slate-700 text-blue-400' : 'text-slate-400'}`}
          >
            配色
          </button>
          <button
            onClick={() => setActiveTab('animations')}
            className={`flex-1 p-2 text-sm ${activeTab === 'animations' ? 'bg-slate-700 text-blue-400' : 'text-slate-400'}`}
          >
            动画
          </button>
        </div>
        
        {/* 内容 */}
        <div className="p-2 max-h-80 overflow-y-auto">
          {activeTab === 'layouts' && (
            <div className="space-y-2">
              {Object.entries(layouts).map(([key, layout]) => (
                <button
                  key={key}
                  onClick={() => handleApplyLayout(key)}
                  className="w-full p-3 bg-slate-700 hover:bg-slate-600 rounded-lg text-left transition-colors"
                >
                  <div className="text-sm font-medium text-white">{layout.name}</div>
                  <div className="text-xs text-slate-400 mt-1">
                    {layout.elements.length} 个元素
                  </div>
                </button>
              ))}
            </div>
          )}
          
          {activeTab === 'colors' && (
            <div className="space-y-2">
              {Object.entries(colorSchemes).map(([key, scheme]) => (
                <button
                  key={key}
                  onClick={() => handleApplyColor(key)}
                  className="w-full p-3 rounded-lg text-left transition-colors"
                  style={{ background: scheme.background }}
                >
                  <div className="text-sm font-medium" style={{ color: scheme.text }}>{scheme.name}</div>
                  <div className="flex gap-1 mt-2">
                    <div className="w-4 h-4 rounded" style={{ background: scheme.accent }} />
                    <div className="w-4 h-4 rounded" style={{ background: scheme.secondary }} />
                  </div>
                </button>
              ))}
            </div>
          )}
          
          {activeTab === 'animations' && (
            <div className="space-y-2">
              {Object.entries(animations).map(([key, anim]) => (
                <button
                  key={key}
                  onClick={() => handleApplyAnimation(key)}
                  className="w-full p-3 bg-slate-700 hover:bg-slate-600 rounded-lg text-left transition-colors"
                >
                  <div className="text-sm font-medium text-white">{anim.name}</div>
                  <div className="text-xs text-slate-400 mt-1">时长: {anim.duration}ms</div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
