# PPTGenerator-Pro

🎉 专业PPT生成工具 - 支持AI生成、图表编辑、模板管理

## ✨ 特性

- **AI智能生成** - 输入主题，AI自动生成完整PPT（布局+内容+配色）
- **拖拽编辑** - 元素可自由拖拽和调整大小
- **丰富组件** - 文本、图表、图片、形状（矩形、圆形、三角形）
- **预设布局** - 8种专业布局模板
- **配色方案** - 6种精美配色
- **动画效果** - 9种过渡动画
- **一键导出** - 支持导出为.pptx格式

## 🛠️ 技术栈

- **前端**: React 18 + TypeScript
- **桌面**: Electron 28
- **图表**: ECharts
- **AI**: Minimax API
- **样式**: TailwindCSS
- **PPT导出**: PptxgenJS
- **拖拽**: react-rnd

## 🚀 快速开始

### 安装

```bash
# 克隆项目
git clone https://github.com/jianerD/ppt-generator-pro.git
cd ppt-generator-pro

# 安装依赖
npm install
```

### 运行

```bash
# 开发模式
npm run dev

# 构建发布
npm run electron:build
```

## 📖 功能说明

### AI设计助手

1. **智能生成** - 输入主题，AI自动生成完整PPT
2. **设计建议** - AI分析当前幻灯片，给出专业建议
3. **内容优化** - AI优化文字内容
4. **图表生成** - AI自动生成图表数据

### 设计面板

- **布局**: 标题左/居中/右、双栏、列表、对比、引用、统计
- **配色**: 深蓝科技、蓝紫渐变、自然绿、暖橙色、企业商务、简约白
- **动画**: 淡入淡出、滑动、缩放、翻转、弹跳

### 快捷键

| 快捷键 | 功能 |
|--------|------|
| Ctrl+Z | 撤销 |
| Ctrl+Shift+Z | 重做 |
| Ctrl+N | 新建 |
| Delete | 删除元素 |

## 📁 项目结构

```
ppt-generator-pro/
├── src/
│   ├── main/           # Electron主进程
│   ├── preload/       脚本
│   ├── renderer/       # React前端
│   │   # 预加载 ├── components/ # UI组件
│   │   ├── store/     # 状态管理
│   │   ├── utils/     # 工具函数
│   │   └── styles/    # 样式文件
│   └── shared/        # 共享类型
├── package.json
├── vite.config.ts
└── README.md
```

## 🔧 配置

### Minimax API Key

首次使用AI功能需要配置API Key：
1. 访问 [Minimax开放平台](https://platform.minimaxi.com/)
2. 注册并获取API Key
3. 在AI面板中输入API Key

## 📄 许可证

MIT License

## 👤 作者

jianerD

---

⭐ 如果对你有帮助，欢迎Star！
