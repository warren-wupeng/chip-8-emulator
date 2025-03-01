# chip-8-emulator
a chip-8 emulator using react

# 如何运行

步骤说明：

1. 安装本地开发服务器：
```bash
npm install -g http-server
```

1. 在项目根目录运行服务器：
```bash
cd /Users/wupeng/projects/chip-8-emulator
http-server src
```

1. 在浏览器中访问：
```
http://localhost:8080
```

注意事项：

1. 确保所有引用的 JavaScript 文件都已正确创建
2. styles.css 文件需要包含必要的样式
3. 项目依赖于 React、ReactDOM、Babel 和 TailwindCSS（已通过 CDN 引入）
4. 需要在 defaultRoms.js 中定义一些默认的 ROM 游戏
5. 由于使用了 Babel 进行实时转换，建议在正式环境中改用预编译的方式

如果遇到跨域问题，可以使用以下命令启动服务器：
```bash
http-server src --cors
```