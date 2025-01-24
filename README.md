# WebCapture Pro

一款简单易用的 Chrome 扩展，用于将网页保存为高质量图片。

## 功能特点

- 🚀 一键截取整个网页
- 📸 支持 PNG 无损格式
- ✨ 支持 SVG 矢量格式
- 💫 简洁直观的操作界面

## 安装方法

### 从 Chrome 网上应用店安装

1. 访问 Chrome 网上应用店中的 WebCapture Pro 页面
2. 点击"添加到 Chrome"按钮
3. 在弹出的确认框中点击"添加扩展程序"

### 手动安装（开发模式）

1. 下载本仓库的代码
2. 打开 Chrome 浏览器，进入扩展程序页面 (`chrome://extensions/`)
3. 开启右上角的"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择本仓库的文件夹

## 使用方法

1. 点击浏览器工具栏中的 WebCapture Pro 图标
2. 在弹出的界面中选择需要的图片格式（PNG 或 SVG）
3. 点击"保存为图片"按钮
4. 选择保存位置，完成截图

## 文件结构

```
WebCapture Pro/
├── manifest.json      # 扩展配置文件
├── popup.html        # 弹出界面
├── popup.js         # 弹出界面逻辑
├── background.js    # 后台服务
├── content.js       # 内容脚本
└── icons/           # 图标文件
    ├── icon16.png
    ├── icon32.png
    ├── icon48.png
    └── icon128.png
```

## 技术实现

- 使用 Chrome Extension Manifest V3
- 采用 Chrome 原生截图 API
- 支持跨域资源访问
- 实现 PNG 和 SVG 格式转换

## 隐私声明

- 本扩展不收集任何个人信息
- 仅在用户主动使用时获取当前网页的截图权限
- 所有图片均保存在用户本地
- 无需任何额外的网络权限

## 开发说明

### 环境要求

- Chrome 浏览器
- Node.js（用于开发和构建）

### 开发步骤

1. 克隆仓库：
```bash
git clone [repository-url]
```

2. 安装依赖：
```bash
npm install
```

3. 构建图标：
```bash
node convert-icons.js
```

### 调试方法

1. 在 Chrome 扩展程序页面开启开发者模式
2. 加载解压的扩展程序
3. 使用 Chrome DevTools 调试

## 许可证

MIT License

## 作者

[Your Name]

## 更新日志

### 版本 1.0
- 初始版本发布
- 支持 PNG 和 SVG 格式
- 实现基本的网页截图功能 