
### 项目简介

本项目是
1.基于vscode实现插件，封装axios请求，实现快照捕获及数据交互等能力
2.通过快照数据，分析用户调试状态，对用户编程调试起到追踪分析作用
3.引入chatgpt，旨在对利用此工具debug起到帮助作用


### 文件路径
入口代码：/src
插件命令入口：extension.js
表单集合：form.html
快照收集逻辑：snapshot
拦截器 && 表单内部逻辑：niepan.js 
命令树视图：tree.js

### 项目本地预览

### Clone repo

```bash
git clone git@git.corp.kuaishou.com:mfe/mp/analysis-tools.git

### 打包.vsix
vsce package

### 在vscode中引入使用
