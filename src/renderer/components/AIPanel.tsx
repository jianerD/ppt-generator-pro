import { useState } from 'react'
import { usePresentationStore } from '../store/presentationStore'
import { v4 as uuidv4 } from 'uuid'
import type { Slide, SlideElement, Template } from '../../shared/types'

// Minimax API 调用
async function callMinimax(apiKey: string, messages: any[]) {
  const response = await fetch('https://api.minimax.chat/v1/text/chatcompletion_pro', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'abab5.5-chat',
      messages
    })
  })
  
  const data = await response.json()
  return data
}

// AI设计建议
async function getDesignSuggestion(apiKey: string, slideContent: string, template: Template) {
  const systemPrompt = `你是一个专业的PPT设计专家。根据幻灯片内容和模板风格，提供设计建议。
  
请以JSON格式返回设计建议，包含以下字段：
- layout: 布局建议 (title-left, title-center, title-right, two-column, list, comparison)
- colorScheme: 颜色方案 (基于当前模板)
- fontSuggestion: 字体建议
- visualElements: 视觉元素建议 (chart, icon, image, quote, stats, timeline)
- animation: 动画效果 (fade, slide, zoom, flip, none)
- designTips: 设计技巧提示

当前模板: ${template.name}
模板背景: ${template.background}
强调色: ${template.accentColor}

只返回JSON，不要其他内容。`

  const result = await callMinimax(apiKey, [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: `幻灯片内容: ${slideContent}` }
  ])

  try {
    const content = result.choices?.[0]?.message?.content
    return JSON.parse(content)
  } catch {
    return null
  }
}

// AI生成完整设计
async function generateFullDesign(apiKey: string, topic: string, slideCount: number, template: Template) {
  const systemPrompt = `你是一个专业的PPT设计和内容策划专家。根据主题生成完整的PPT设计结构。

请以JSON数组格式返回，每张幻灯片包含：
{
  "type": "slide类型 (title, content, chart, image, quote, stats, timeline)",
  "title": "标题",
  "content": "内容要点（用|分隔多行）",
  "layout": "布局 (title-left, title-center, two-column, list, comparison)",
  "visualElements": ["视觉元素数组"],
  "colorAccent": "强调色（可选）",
  "designNotes": "设计备注"
}

主题: ${topic}
幻灯片数量: ${slideCount}
模板风格: ${template.name}

只返回JSON数组。`

  const result = await callMinimax(apiKey, [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: `为主题"${topic}"设计${slideCount}张幻灯片，要求专业美观。` }
  ])

  try {
    const content = result.choices?.[0]?.message?.content
    // 尝试解析JSON
    const jsonMatch = content.match(/\[[\s\S]*\]/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
    return null
  } catch {
    return null
  }
}

// AI优化内容
async function optimizeContent(apiKey: string, content: string, goal: string) {
  const systemPrompt = `你是一个内容优化专家。根据目标优化幻灯片内容。

目标: ${goal}

请直接返回优化后的内容，保持简洁有力。`

  const result = await callMinimax(apiKey, [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: `原始内容: ${content}\n\n请优化这段内容，使其更专业、更有说服力。` }
  ])

  return result.choices?.[0]?.message?.content || content
}

// AI生成图表数据
async function generateChartData(apiKey: string, chartType: string, topic: string) {
  const systemPrompt = `你是一个数据分析专家。根据主题生成图表数据。

请以JSON格式返回：
{
  "labels": ["标签1", "标签2", "标签3", "标签4"],
  "data": [数值1, 数值2, 数值3, 数值4],
  "title": "图表标题"
}

图表类型: ${chart主题: ${topic}

只返回JSON。Type}
`

  const result = await callMinimax(apiKey, [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: `为"${topic}"生成${chartType}图表数据` }
  ])

  try {
    const content = result.choices?.[0]?.message?.content
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
    return null
  } catch {
    return null
  }
}

export default function AIPanel({ onClose }: { onClose: () => void }) {
  const { presentation, aiConfig, setAIConfig, addSlide, currentSlideIndex, slide } = usePresentationStore()
  const [mode, setMode] = useState<'generate' | 'design' | 'optimize' | 'chart'>('generate')
  const [topic, setTopic] = useState('')
  const [slideCount, setSlideCount] = useState(8)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')

  // AI生成完整PPT
  const handleGenerate = async () => {
    if (!topic.trim()) { setError('请输入主题'); return }
    if (!aiConfig.apiKey) { setError('请先配置API Key'); return }

    setLoading(true)
    setError('')

    try {
      const data = await generateFullDesign(aiConfig.apiKey, topic, slideCount, presentation.template)
      
      if (data && Array.isArray(data)) {
        setResult(data)
      } else {
        // 使用默认模板
        setResult(generateDefaultContent(topic, slideCount))
      }
    } catch (err) {
      setError('生成失败: ' + err)
    } finally {
      setLoading(false)
    }
  }

  // 生成默认内容
  const generateDefaultContent = (topic: string, count: number) => {
    const templates = [
      { type: 'title', title: topic, content: '专业演示', layout: 'title-center' },
      { type: 'content', title: '目录', content: '1. 概述|2. 核心内容|3. 数据分析|4. 总结', layout: 'list' },
      { type: 'content', title: '背景介绍', content: '项目背景和重要性|市场需求分析|目标与愿景', layout: 'two-column' },
      { type: 'chart', title: '数据分析', content: '', layout: 'title-left', visualElements: ['chart'] },
      { type: 'content', title: '核心功能', content: '功能一|功能二|功能三|功能四', layout: 'list' },
      { type: 'quote', title: '用户评价', content: '这是一个优秀的产品', layout: 'title-center' },
      { type: 'stats', title: '核心指标', content: '100万+|用户总数|95%|满意度|50万+|日活|10亿+|交易额', layout: 'two-column' },
      { type: 'content', title: '总结', content: '主要成果|未来展望|感谢聆听', layout: 'list' }
    ]
    return templates.slice(0, count)
  }

  // 应用生成的幻灯片
  const handleApply = () => {
    if (!result) return
    
    // 清空并创建新幻灯片
    result.forEach((item: any, index: number) => {
      const newSlide: Slide = {
        id: uuidv4(),
        type: item.type || 'content',
        background: presentation.template.background,
        elements: [],
        transition: { type: 'fade', duration: 300 }
      }
      
      // 添加标题
      newSlide.elements.push({
        id: uuidv4(),
        type: 'text',
        position: { x: 50, y: 30, width: 860, height: 60 },
        style: { 
          fontSize: item.type === 'title' ? 48 : 36, 
          fontWeight: 'bold', 
          color: '#FFFFFF',
          textAlign: item.layout?.includes('center') ? 'center' : 'left'
        },
        content: item.title
      } as SlideElement)
      
      // 添加内容
      if (item.content) {
        const contentLines = item.content.split('|')
        contentLines.forEach((line: string, i: number) => {
          newSlide.elements.push({
            id: uuidv4(),
            type: 'text',
            position: { 
              x: item.layout === 'two-column' && i % 2 === 0 ? 50 : 500, 
              y: 120 + Math.floor(i/2) * 60, 
              width: 400, 
              height: 50 
            },
            style: { fontSize: 18, color: '#CBD5E1' },
            content: line
          } as SlideElement)
        })
      }
      
      // 添加图表占位
      if (item.visualElements?.includes('chart')) {
        newSlide.elements.push({
          id: uuidv4(),
          type: 'chart',
          chartType: 'bar',
          position: { x: 100, y: 200, width: 760, height: 300 },
          style: {},
          data: {
            labels: ['A', 'B', 'C', 'D'],
            datasets: [{ label: '数据', data: [65, 59, 80, 81], backgroundColor: ['#38BDF8', '#34D399', '#FBBF24', '#F472B6'] }]
          }
        } as SlideElement)
      }
      
      usePresentationStore.setState((state) => ({
        presentation: {
          ...state.presentation,
          slides: [...state.presentation.slides, newSlide]
        }
      }))
    })
    
    onClose()
  }

  // 获取设计建议
  const handleGetDesignSuggestion = async () => {
    if (!aiConfig.apiKey) { setError('请先配置API Key'); return }
    
    setLoading(true)
    try {
      const slideContent = slide?.elements.map(e => e.type === 'text' ? (e as any).content : '').join(', ') || ''
      const suggestion = await getDesignSuggestion(aiConfig.apiKey, slideContent, presentation.template)
      setResult(suggestion)
    } catch (err) {
      setError('获取建议失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="absolute top-10 left-1/2 transform -translate-x-1/2 z-50 w-[500px]">
      <div className="bg-slate-800 rounded-lg shadow-2xl border border-slate-700 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h3 className="font-medium">🤖 AI设计助手</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
        </div>
        
        {/* 模式选择 */}
        <div className="flex gap-2 p-4 border-b border-slate-700">
          <button 
            onClick={() => setMode('generate')}
            className={`px-3 py-1 rounded ${mode === 'generate' ? 'bg-blue-600' : 'bg-slate-700'}`}
          >
            智能生成
          </button>
          <button 
            onClick={() => setMode('design')}
            className={`px-3 py-1 rounded ${mode === 'design' ? 'bg-blue-600' : 'bg-slate-700'}`}
          >
            设计建议
          </button>
          <button 
            onClick={() => setMode('optimize')}
            className={`px-3 py-1 rounded ${mode === 'optimize' ? 'bg-blue-600' : 'bg-slate-700'}`}
          >
            内容优化
          </button>
          <button 
            onClick={() => setMode('chart')}
            className={`px-3 py-1 rounded ${mode === 'chart' ? 'bg-blue-600' : 'bg-slate-700'}`}
          >
            图表生成
          </button>
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
          
          {mode === 'generate' && (
            <>
              <div>
                <label className="text-sm text-slate-400">演示主题</label>
                <textarea
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="例如：年度销售总结、产品发布会..."
                  className="input w-full mt-1 h-20"
                />
              </div>
              <div>
                <label className="text-sm text-slate-400">幻灯片数量</label>
                <select
                  value={slideCount}
                  onChange={(e) => setSlideCount(Number(e.target.value))}
                  className="input w-full mt-1"
                >
                  <option value="5">5页</option>
                  <option value="8">8页</option>
                  <option value="10">10页</option>
                  <option value="12">12页</option>
                </select>
              </div>
            </>
          )}
          
          {mode === 'design' && (
            <div>
              <p className="text-sm text-slate-400 mb-2">为当前幻灯片获取AI设计建议</p>
              <button onClick={handleGetDesignSuggestion} className="btn btn-primary w-full">
                🎨 获取设计建议
              </button>
            </div>
          )}
          
          {error && <p className="text-red-400 text-sm">{error}</p>}
          
          {/* 结果预览 */}
          {result && (
            <div className="max-h-60 overflow-y-auto bg-slate-900 rounded p-3">
              <pre className="text-xs text-green-400 whitespace-pre-wrap">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
          
          {/* 按钮 */}
          <div className="flex gap-2">
            {mode === 'generate' && (
              <button onClick={handleGenerate} disabled={loading} className="btn btn-primary flex-1">
                {loading ? '生成中...' : '✨ AI生成'}
              </button>
            )}
            {result && mode === 'generate' && (
              <button onClick={handleApply} className="btn btn-success">
                应用设计
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
