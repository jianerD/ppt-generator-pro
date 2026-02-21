import pptxgen from 'pptxgenjs'
import type { Presentation, Slide, SlideElement, TextElement, ChartElement, ImageElement, ShapeElement, TableElement } from '../shared/types'

// 导出PPT
export function exportToPPT(presentation: Presentation): void {
  const pres = new pptxgen()
  
  // 设置演示文稿属性
  pres.title = presentation.title
  pres.subject = presentation.subtitle || ''
  pres.author = presentation.author || 'PPTGenerator-Pro'
  
  // 遍历幻灯片
  presentation.slides.forEach((slide: Slide) => {
    const pptSlide = pres.addSlide()
    
    // 设置背景
    if (slide.background.includes('gradient')) {
      // 解析渐变背景
      const colors = slide.background.match(/#[0-9A-Fa-f]{6}/g) || ['#1e293b', '#0f172a']
      pptSlide.background = { type: 'solid', color: colors[0] }
    } else {
      pptSlide.background = { type: 'solid', color: slide.background.replace(/.*#([0-9A-Fa-f]{6}).*/, '#$1') || '1e293b' }
    }
    
    // 添加元素
    slide.elements.forEach((element: SlideElement) => {
      switch (element.type) {
        case 'text':
          addTextElement(pptSlide, element as TextElement)
          break
        case 'chart':
          addChartElement(pptSlide, element as ChartElement)
          break
        case 'image':
          addImageElement(pptSlide, element as ImageElement)
          break
        case 'shape':
          addShapeElement(pptSlide, element as ShapeElement)
          break
        case 'table':
          addTableElement(pptSlide, element as TableElement)
          break
      }
    })
  })
  
  // 保存文件
  pres.writeFile({ fileName: `${presentation.title}.pptx` })
}

// 添加文本元素
function addTextElement(slide: pptxgen.AnySlide, element: TextElement): void {
  const options: pptxgen.TextOpts = {
    x: element.position.x / 96, // 转换为英寸 (96 DPI)
    y: element.position.y / 96,
    w: element.position.width / 96,
    h: element.position.height / 96,
    fontSize: element.style.fontSize || 18,
    color: element.style.color?.replace('#', '') || 'FFFFFF',
    align: element.style.textAlign || 'left',
    bold: element.style.fontWeight === 'bold',
  }
  
  slide.addText(element.content, options)
}

// 添加图表元素
function addChartElement(slide: pptxgen.AnySlide, element: ChartElement): void {
  const chartOptions: pptxgen.ChartOpts = {
    x: element.position.x / 96,
    y: element.position.y / 96,
    w: element.position.width / 96,
    h: element.position.height / 96,
    chartColors: ['38BDF8', '34D399', 'FBBF24', 'F472B6', 'A78BFA'],
    barDir: 'col',
    barGrouping: 'clustered',
    showValue: true,
  }
  
  slide.addChart(element.chartType === 'bar' ? pptxgen.ChartType.bar :
                 element.chartType === 'line' ? pptxgen.ChartType.line :
                 element.chartType === 'pie' ? pptxgen.ChartType.pie :
                 pptxgen.ChartType.bar, element.data as any, chartOptions)
}

// 添加图片元素
function addImageElement(slide: pptxgen.AnySlide, element: ImageElement): void {
  slide.addImage({
    path: element.src,
    x: element.position.x / 96,
    y: element.position.y / 96,
    w: element.position.width / 96,
    h: element.position.height / 96,
  })
}

// 添加形状元素
function addShapeElement(slide: pptxgen.AnySlide, element: ShapeElement): void {
  const shapeType = element.shapeType === 'circle' ? 'oval' : 
                   element.shapeType === 'triangle' ? 'triangle' : 'rect'
  
  slide.addShape(shapeType as any, {
    x: element.position.x / 96,
    y: element.position.y / 96,
    w: element.position.width / 96,
    h: element.position.height / 96,
    fill: { color: element.fill?.replace('#', '') || '38BDF8' },
    line: element.stroke ? { color: element.stroke.replace('#', ''), pt: element.strokeWidth || 1 } : undefined,
  })
}

// 添加表格元素
function addTableElement(slide: pptxgen.AnySlide, element: TableElement): void {
  const tableData = element.headers ? [element.headers, ...element.rows] : element.rows
  
  slide.addTable(tableData, {
    x: element.position.x / 96,
    y: element.position.y / 96,
    w: element.position.width / 96,
    fontSize: 12,
    color: 'FFFFFF',
    border: { pt: 0.5, color: '64748B' },
    rowH: 0.3,
  })
}

// 导出为Blob (用于Electron)
export async function exportToPPTBlob(presentation: Presentation): Promise<Blob> {
  const pres = new pptxgen()
  
  pres.title = presentation.title
  pres.subject = presentation.subtitle || ''
  pres.author = 'PPTGenerator-Pro'
  
  presentation.slides.forEach((slide: Slide) => {
    const pptSlide = pres.addSlide()
    
    pptSlide.background = { type: 'solid', color: '1e293b' }
    
    slide.elements.forEach((element: SlideElement) => {
      if (element.type === 'text') {
        const textEl = element as TextElement
        pptSlide.addText(textEl.content, {
          x: textEl.position.x / 96,
          y: textEl.position.y / 96,
          w: textEl.position.width / 96,
          h: textEl.position.height / 96,
          fontSize: textEl.style.fontSize || 18,
          color: textEl.style.color?.replace('#', '') || 'FFFFFF',
        })
      }
    })
  })
  
  // 返回base64
  const base64 = await pres.write({ base64: true })
  const binaryString = atob(base64)
  const bytes = new Uint8Array(binaryString.length)
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }
  return new Blob([bytes], { type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' })
}
