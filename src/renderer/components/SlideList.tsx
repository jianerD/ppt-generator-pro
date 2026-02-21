import { usePresentationStore } from '../store/presentationStore'

export default function SlideList() {
  const { 
    presentation, currentSlideIndex, 
    setCurrentSlideIndex, duplicateSlide, removeSlide 
  } = usePresentationStore()

  return (
    <div className="w-56 bg-slate-800 border-r border-slate-700 flex flex-col">
      <div className="p-3 border-b border-slate-700">
        <h3 className="text-sm font-medium text-slate-300">幻灯片</h3>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {presentation.slides.map((slide, index) => (
          <div
            key={slide.id}
            onClick={() => setCurrentSlideIndex(index)}
            className={`slide-thumbnail ${index === currentSlideIndex ? 'active' : ''}`}
            style={{ background: slide.background }}
          >
            {/* 缩略图内容 */}
            <div className="absolute inset-0 p-2">
              {slide.elements.map((el) => (
                <div
                  key={el.id}
                  className="absolute text-white/80 overflow-hidden"
                  style={{
                    left: `${(el.position.x / 960) * 100}%`,
                    top: `${(el.position.y / 540) * 100}%`,
                    width: `${(el.position.width / 960) * 100}%`,
                    height: `${(el.position.height / 540) * 100}%`,
                    fontSize: `${Math.max(4, el.style.fontSize ? el.style.fontSize / 20 : 8)}px`,
                  }}
                >
                  {el.type === 'text' ? el.content.substring(0, 20) : `[${el.type}]`}
                </div>
              ))}
            </div>
            
            {/* 序号 */}
            <div className="absolute bottom-1 left-1 text-xs text-white/60">
              {index + 1}
            </div>
            
            {/* 操作按钮 */}
            <div className="absolute top-1 right-1 opacity-0 hover:opacity-100 transition-opacity flex gap-1">
              <button
                onClick={(e) => { e.stopPropagation(); duplicateSlide(index); }}
                className="p-1 bg-slate-900/80 rounded text-white/80 hover:text-white"
                title="复制"
              >
                📋
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); removeSlide(index); }}
                className="p-1 bg-slate-900/80 rounded text-white/80 hover:text-red-400"
                disabled={presentation.slides.length <= 1}
                title="删除"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
        
        {/* 添加按钮 */}
        <button
          onClick={() => usePresentationStore.getState().addSlide('content')}
          className="w-full aspect-video border-2 border-dashed border-slate-600 rounded-lg flex items-center justify-center text-slate-400 hover:border-slate-400 hover:text-slate-300 transition-colors"
        >
          + 添加幻灯片
        </button>
      </div>
    </div>
  )
}
