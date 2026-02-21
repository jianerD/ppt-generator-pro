import ReactECharts from 'echarts-for-react'
import type { ChartElement } from '../../shared/types'
import { usePresentationStore } from '../store/presentationStore'

interface Props {
  element: ChartElement
  slideIndex: number
}

export default function ChartElementComponent({ element, slideIndex }: Props) {
  const { updateElement } = usePresentationStore()

  const getOption = () => {
    const baseOption = {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(30, 41, 59, 0.9)',
        textStyle: { color: '#fff' }
      },
      grid: {
        top: 40,
        bottom: 40,
        left: 50,
        right: 20
      },
      xAxis: {
        type: 'category',
        data: element.data.labels,
        axisLine: { lineStyle: { color: '#64748B' } },
        axisLabel: { color: '#94A3B8' }
      },
      yAxis: {
        type: 'value',
        axisLine: { lineStyle: { color: '#64748B' } },
        axisLabel: { color: '#94A3B8' },
        splitLine: { lineStyle: { color: '#334155' } }
      }
    }

    switch (element.chartType) {
      case 'bar':
        return {
          ...baseOption,
          series: [{
            type: 'bar',
            data: element.data.datasets[0].data,
            itemStyle: { 
              color: {
                type: 'linear',
                x: 0, y: 0, x2: 0, y2: 1,
                colorStops: [
                  { offset: 0, color: '#38BDF8' },
                  { offset: 1, color: '#1D4ED8' }
                ]
              },
              borderRadius: [4, 4, 0, 0]
            }
          }]
        }
      case 'line':
        return {
          ...baseOption,
          series: [{
            type: 'line',
            data: element.data.datasets[0].data,
            smooth: true,
            areaStyle: {
              color: {
                type: 'linear',
                x: 0, y: 0, x2: 0, y2: 1,
                colorStops: [
                  { offset: 0, color: 'rgba(56, 189, 248, 0.5)' },
                  { offset: 1, color: 'rgba(56, 189, 248, 0)' }
                ]
              }
            },
            lineStyle: { color: '#38BDF8', width: 3 },
            itemStyle: { color: '#38BDF8' }
          }]
        }
      case 'pie':
        return {
          backgroundColor: 'transparent',
          tooltip: { trigger: 'item' },
          series: [{
            type: 'pie',
            radius: ['40%', '70%'],
            data: element.data.labels.map((label, i) => ({
              name: label,
              value: element.data.datasets[0].data[i],
              itemStyle: { color: element.data.datasets[0].backgroundColor?.[i] || '#38BDF8' }
            })),
            label: { color: '#fff' }
          }]
        }
      default:
        return baseOption
    }
  }

  return (
    <ReactECharts
      option={getOption()}
      style={{ width: '100%', height: '100%' }}
      opts={{ renderer: 'svg' }}
    />
  )
}
