import { usePresentationStore } from '../store/presentationStore'
import type { Template, SlideElement, TextElement } from '../../shared/types'

const templates: Template[] = [
  { id: 'dark', name: '深色科技风', type: 'dark', background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', textColor: '#FFFFFF', accentColor: '#38BDF8' },
  { id: 'blue', name: '蓝色商务风', type: 'blue', background: 'linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%)', textColor: '#FFFFFF', accentColor: '#3B82F6' },
  { id: 'purple', name: '紫色渐变风', type: 'purple', background: 'linear-gradient(135deg, #312e81 0%, #1e1b4b 100%)', textColor: '#FFFFFF', accentColor: '#A78BFA' },
  { id: 'green', name: '绿色清新风', type: 'green', background: 'linear-gradient(135deg, #064e3b 0%, #022c22 100%)', textColor: '#FFFFFF', accentColor: '#34D399' },
  { id: 'corporate', name: '企业商务风', type: 'corporate', background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)', textColor: '#FFFFFF', accentColor: '#F59E0B' },
]

export default function PropertyPanel() {
  const { 
    presentation, currentSlideIndex, selectedElementId,
    setTemplate, updateElement, updateSlide
  } = usePresentationStore()
  
  const slide = presentation.slides[currentSlideIndex]
  const selectedElement = slide.elements.find(el => el.id === selectedElementId)

  return (
    <div className="property-panel">
      {/* 模板选择 */}
      <div className="p-4 border-b border-slate-700">
        <h3 className="text-sm font-medium text-slate-300 mb-3">模板</h3>
        <div className="grid grid-cols-2 gap-2">
          {templates.map(tpl => (
            <button
              key={tpl.id}
              onClick={() => setTemplate(tpl)}
              className={`p-2 rounded-lg text-xs text-left transition-all ${
                presentation.template.id === tpl.id 
                  ? 'ring-2 ring-blue-500' 
                  : 'hover:bg-slate-700'
              }`}
              style={{ background: tpl.background }}
            >
              <span className="text-white">{tpl.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 幻灯片设置 */}
      <div className="p-4 border-b border-slate-700">
        <h3 className="text-sm font-medium text-slate-300 mb-3">幻灯片设置</h3>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-slate-400">背景颜色</label>
            <input
              type="color"
              value={slide.background.includes('#') ? slide.background.match(/#([0-9A-Fa-f]{6})/)?.[1] || '#1e293b' : '#1e293b'}
              onChange={(e) => updateSlide(currentSlideIndex, { background: e.target.value })}
              className="w-full h-8 rounded cursor-pointer"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400">过渡效果</label>
            <select
              value={slide.transition.type}
              onChange={(e) => updateSlide(currentSlideIndex, { 
                transition: { ...slide.transition, type: e.target.value as any } 
              })}
              className="input w-full"
            >
              <option value="none">无</option>
              <option value="fade">淡入淡出</option>
              <option value="slide">滑动</option>
              <option value="zoom">缩放</option>
              <option value="flip">翻转</option>
            </select>
          </div>
        </div>
      </div>

      {/* 元素属性 */}
      {selectedElement && (
        <div className="p-4 border-b border-slate-700">
          <h3 className="text-sm font-medium text-slate-300 mb-3">元素属性</h3>
          <div className="space-y-3">
            {/* 位置 */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-slate-400">X</label>
                <input
                  type="number"
                  value={Math.round(selectedElement.position.x)}
                  onChange={(e) => updateElement(currentSlideIndex, selectedElementId!, {
                    position: { ...selectedElement.position, x: Number(e.target.value) }
                  })}
                  className="input w-full"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">Y</label>
                <input
                  type="number"
                  value={Math.round(selectedElement.position.y)}
                  onChange={(e) => updateElement(currentSlideIndex, selectedElementId!, {
                    position: { ...selectedElement.position, y: Number(e.target.value) }
                  })}
                  className="input w-full"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">宽</label>
                <input
                  type="number"
                  value={Math.round(selectedElement.position.width)}
                  onChange={(e) => updateElement(currentSlideIndex, selectedElementId!, {
                    position: { ...selectedElement.position, width: Number(e.target.value) }
                  })}
                  className="input w-full"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">高</label>
                <input
                  type="number"
                  value={Math.round(selectedElement.position.height)}
                  onChange={(e) => updateElement(currentSlideIndex, selectedElementId!, {
                    position: { ...selectedElement.position, height: Number(e.target.value) }
                  })}
                  className="input w-full"
                />
              </div>
            </div>

            {/* 文本属性 */}
            {selectedElement.type === 'text' && (
              <>
                <div>
                  <label className="text-xs text-slate-400">字体大小</label>
                  <input
                    type="number"
                    value={selectedElement.style.fontSize || 16}
                    onChange={(e) => updateElement(currentSlideIndex, selectedElementId!, {
                      style: { ...selectedElement.style, fontSize: Number(e.target.value) }
                    })}
                    className="input w-full"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400">颜色</label>
                  <input
                    type="color"
                    value={selectedElement.style.color || '#FFFFFF'}
                    onChange={(e) => updateElement(currentSlideIndex, selectedElementId!, {
                      style: { ...selectedElement.style, color: e.target.value }
                    })}
                    className="w-full h-8 rounded cursor-pointer"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400">对齐</label>
                  <select
                    value={selectedElement.style.textAlign || 'left'}
                    onChange={(e) => updateElement(currentSlideIndex, selectedElementId!, {
                      style: { ...selectedElement.style, textAlign: e.target.value as any }
                    })}
                    className="input w-full"
                  >
                    <option value="left">左对齐</option>
                    <option value="center">居中</option>
                    <option value="right">右对齐</option>
                  </select>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* 未选中提示 */}
      {!selectedElement && (
        <div className="p-4 text-center text-slate-500 text-sm">
          点击元素查看属性
        </div>
      )}
    </div>
  )
}
