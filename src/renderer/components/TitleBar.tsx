import { usePresentationStore } from '../store/presentationStore'

export default function TitleBar() {
  const { presentation, setTitle, setSubtitle } = usePresentationStore()

  return (
    <div className="h-10 bg-slate-800 border-b border-slate-700 flex items-center justify-between px-4">
      <div className="flex items-center gap-3">
        <span className="text-blue-400 font-bold">📊</span>
        <input
          type="text"
          value={presentation.title}
          onChange={(e) => setTitle(e.target.value)}
          className="bg-transparent border-none text-white font-medium focus:outline-none"
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={presentation.subtitle || ''}
          onChange={(e) => setSubtitle(e.target.value)}
          placeholder="副标题"
          className="bg-transparent border-none text-slate-400 text-sm focus:outline-none"
        />
      </div>
      <div className="flex items-center gap-1">
        <button 
          onClick={() => window.electron?.minimize()}
          className="p-2 hover:bg-slate-700 rounded"
        >
          ─
        </button>
        <button 
          onClick={() => window.electron?.maximize()}
          className="p-2 hover:bg-slate-700 rounded"
        >
          □
        </button>
        <button 
          onClick={() => window.electron?.close()}
          className="p-2 hover:bg-red-600 rounded"
        >
          ✕
        </button>
      </div>
    </div>
  )
}
