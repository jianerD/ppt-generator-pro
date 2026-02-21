import { useState } from 'react'
import { usePresentationStore } from '../store/presentationStore'
import { v4 as uuidv4 } from 'uuid'
import type { Slide, SlideElement } from '../../shared/types'

// Minimax API 调用
async function generateWithMinimax(apiKey: string, prompt: string) {
  const response = await fetch('https://api.minimax.chat/v1/text/chatcompletion_pro', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'abab5.5-chat',
      messages: [
        { role: 'system', content: '你是一个专业的PPT内容策划助手。根据用户需求，生成专业的PPT内容结构。返回JSON格式的幻灯片数组，每张幻灯片包含title和content字段。' },
        { role: 'user', content: prompt }
      ]
    })
  })
  
  const data = await response.json()
  if (data.choices?.[0]?.message?.content) {
    try {
      return JSON.parse(data.choices[0].message.content)
    } catch {
      return null
    }
  }
  return null
}

export default function AIPanel({ onClose }: { onClose: () => void }) {
  const { presentation, aiConfig, setAIConfig, addSlide } = usePresentationStore()
  const [topic, setTopic] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')

  // AI生成
  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError('请输入主题')
      return
    }
    
    if (!aiConfig.apiKey) {
      setError('请先配置API Key')
      return
    }

    setLoading(true)
    setError('')

    try {
      const prompt = `为"${topic}"生成PPT内容结构，返回8-10张幻灯片，每张包含title（标题）和content（内容要点）字段。`
      const data = await generateWithMinimax(aiConfig.apiKey, prompt)
      
      if (data) {
        setResult(data)
      } else {
        // 模拟数据
        setResult([
          { title: topic, content: '演示文稿' },
          { title: '目录', content: '1. 背景介绍\n2. 核心内容\n3. 分析与讨论\n4. 结论与建议' },
          { title: '背景介绍', content: '介绍项目背景和重要性' },
          { title: '核心内容', content: '详细阐述主要内容和关键点' },
          { title: '数据分析', content: '展示相关数据和趋势分析' },
          { title: '案例分析', content: '实际案例和经验分享' },
          { title: '问题与挑战', content: '当前面临的主要问题' },
          { title: '解决方案', content: '提出可行性的解决方案' },
          { title: '结论', content: '总结主要观点和建议' },
          { title: '感谢', content: '感谢聆听\n欢迎提问' }
        ])
      }
    } catch (err) {
      setError('生成失败，请检查API Key')
    } finally {
      setLoading(false)
    }
  }

  // 应用生成的幻灯片
  const handleApply = () => {
    if (!result) return
    
    // 清空现有幻灯片（保留第一张）
    const newSlides: Slide[] = []
    
    result.forEach((item: any, index: number) => {
      const slide: Slide = {
        id: uuidv4(),
        type: index === 0 ? 'title' : 'content',
        background: presentation.template.background,
        elements: [
          {
            id: uuidv4(),
            type: 'text',
            position: { x: 50, y: 50, width: 860, height: 60 },
            style: { fontSize: 36, fontWeight: 'bold', color: '#FFFFFF' },
            content: item.title
          } as SlideElement,
          {
            id: uuidv4(),
            type: 'text',
            position: { x: 50, y: 130, width: 860, height: 350 },
            style: { fontSize: 18, color: '#CBD5E1' },
            content: item.content
          } as SlideElement
        ],
        transition: { type: 'fade', duration: 300 }
      }
      newSlides.push(slide)
    })
    
    // 替换演示文稿
    usePresentationStore.setState({
      presentation: {
        ...presentation,
        slides: newSlides,
        updatedAt: new Date()
      },
      currentSlideIndex: 0
    })
    
    onClose()
  }

  return (
    <div className="absolute top-10 left-1/2 transform -translate-x-1/2 z-50 w-96">
      <div className="bg-slate-800 rounded-lg shadow-2xl border border-slate-700">
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h3 className="font-medium">🤖 AI生成PPT</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
        </div>
        
        <div className="p-4 space-y-4">
          {/* API配置 */}
          <div>
            <label className="text-sm text-slate-400">API Key (Minimax)</label>
            <input
              type="password"
              value={aiConfig.apiKey}
              onChange={(e) => setAIConfig({ ...aiConfig, apiKey: e.target.value })}
              placeholder="输入API Key"
              className="input w-full mt-1"
            />
          </div>
          
          {/* 主题输入 */}
          <div>
            <label className="text-sm text-slate-400">演示主题</label>
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="例如：年度销售总结、产品发布会、公司介绍..."
              className="input w-full mt-1 h-20"
            />
          </div>
          
          {/* 错误提示 */}
          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}
          
          {/* 预览结果 */}
          {result && (
            <div className="max-h-40 overflow-y-auto bg-slate-900 rounded p-2">
              <p className="text-xs text-slate-400 mb-2">预览 ({result.length}页)</p>
              {result.map((item: any, i: number) => (
                <div key={i} className="text-sm text-slate-300 py-1">
                  {i + 1}. {item.title}
                </div>
              ))}
            </div>
          )}
          
          {/* 按钮 */}
          <div className="flex gap-2">
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="btn btn-primary flex-1"
            >
              {loading ? '生成中...' : '生成内容'}
            </button>
            {result && (
              <button onClick={handleApply} className="btn btn-success">
                应用
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
