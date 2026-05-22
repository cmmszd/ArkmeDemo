# Arkme Demo

# Arkme Demo - 安排模块
基于即我 Demo 项目开发的智能安排模块，支持 AI 自然语言识别、手动创建、完成管理和数据持久化。

## 功能特性

### ✅ 已实现
- **手动创建安排**：标题 + 日期，简单快速
- **AI 智能识别**：输入自然语言，自动提取标题和日期
  - 支持：今天、明天、后天、下周五等日期识别
  - 无日期时默认今天
- **安排管理**：完成/删除、已完成自动下沉、可折叠区域
- **数据持久化**：localStorage 存储，刷新不丢失
- **移动端优化**：响应式设计，触摸友好

### 🚧 待扩展
- 对话自动识别（从聊天消息中自动提取安排）
- 日历视图
- 提醒通知

## 技术栈
- React 18 + TypeScript
- Vite 5
- Tailwind CSS
- 阿里云百炼 API（通义千问 qwen-max）

## 配置 API Key（AI 功能需要）
- 创建 .env 文件：
- VITE_ALIYUN_API_KEY=你的API密钥
- VITE_ALIYUN_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
- VITE_ALIYUN_MODEL=qwen-max

### 安装依赖
npm install

### 启动开发服务器
npm run dev


### 访问安排模块
打开浏览器：http://localhost:5173/arrangement

## 项目结构
src/
├── pages/
│   └── Arrangement/        # 安排模块
│       └── index.tsx       # 主页面
├── services/
│   └── aliyun.ts           # 阿里云 API 封装
├── types/
│   └── arrangement.ts      # 类型定义
└── hooks/
    └── useLocalStorage.ts  # 持久化 Hook

## 开发者
丁梦琳 - 即我 Demo 安排模块实现


