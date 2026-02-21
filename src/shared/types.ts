// 共享类型定义

export type ElementType = 'text' | 'image' | 'shape' | 'chart' | 'table';

export interface Position {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Style {
  fontSize?: number;
  fontWeight?: string;
  color?: string;
  backgroundColor?: string;
  textAlign?: 'left' | 'center' | 'right';
  borderRadius?: number;
  opacity?: number;
}

export interface BaseElement {
  id: string;
  type: ElementType;
  position: Position;
  style: Style;
  rotation?: number;
  zIndex?: number;
}

export interface TextElement extends BaseElement {
  type: 'text';
  content: string;
}

export interface ImageElement extends BaseElement {
  type: 'image';
  src: string;
  alt?: string;
}

export interface ShapeElement extends BaseElement {
  type: 'shape';
  shapeType: 'rect' | 'circle' | 'triangle' | 'line';
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
}

export interface ChartElement extends BaseElement {
  type: 'chart';
  chartType: 'bar' | 'line' | 'pie' | 'scatter';
  data: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor?: string | string[];
      borderColor?: string;
    }[];
  };
}

export interface TableElement extends BaseElement {
  type: 'table';
  rows: string[][];
  headers?: string[];
}

export type SlideElement = TextElement | ImageElement | ShapeElement | ChartElement | TableElement;

export type TransitionType = 'none' | 'fade' | 'slide' | 'zoom' | 'flip';

export interface Transition {
  type: TransitionType;
  duration: number;
  direction?: 'left' | 'right' | 'up' | 'down';
}

export type SlideType = 'title' | 'content' | 'chart' | 'image' | 'blank';

export interface Slide {
  id: string;
  type: SlideType;
  background: string;
  elements: SlideElement[];
  transition: Transition;
}

export type TemplateType = 'dark' | 'blue' | 'purple' | 'green' | 'corporate';

export interface Template {
  id: string;
  name: string;
  type: TemplateType;
  background: string;
  textColor: string;
  accentColor: string;
}

export interface Presentation {
  id: string;
  title: string;
  subtitle?: string;
  author?: string;
  slides: Slide[];
  template: Template;
  createdAt: Date;
  updatedAt: Date;
}

export interface AIConfig {
  provider: 'minimax' | 'openai' | 'baidu';
  apiKey: string;
  model?: string;
}
