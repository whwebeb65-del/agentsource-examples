# AgentSource Examples · 源栈实战示例

[English documentation](README.en.md) · [English website overview](https://agent-source-lab.maple-poppy-4553.chatgpt.site/en/)

小工具也要把边界讲清楚。这里提供可直接运行的 JavaScript 学习示例，帮助核对时间单位、中文编码、URL 重复参数与 JSON 大整数。

**[打开源栈免费工具](https://agent-source-lab.maple-poppy-4553.chatgpt.site/)** · **[实战示例索引](https://agent-source-lab.maple-poppy-4553.chatgpt.site/examples.html)** · [B站项目介绍与反馈](https://t.bilibili.com/1259475524404641816)

## 新增：把四个边界放进一条请求

[阅读可复制运行的教程：一条请求，四个数据边界](guides/request-boundaries.md)。从长 ID 字符串、明确时间单位、UTF-8 Base64 到重复查询参数，逐个核对输入含义。

也可以直接打开[免费可编辑预演](https://agent-source-lab.maple-poppy-4553.chatgpt.site/cases/node-intake.html)，修改正常输入与反例，查看实际结果。需要整理好的 HTTP 服务、客户端和测试文件时，再看[独立工程包的文件清单与适用范围](https://agent-source-lab.maple-poppy-4553.chatgpt.site/products/integration-kit.html)。免费示例不需要购买。

## Run / 直接运行

需要 Node.js 22 或更新版本。没有第三方依赖，不需要 `npm install`。

```sh
node examples.mjs
npm test
```

## Four small problems / 四个容易踩的坑

### 1. 时间戳不能只看数字

```js
unixUtc(1000, 's')  // 1970-01-01T00:16:40.000Z
unixUtc(1000, 'ms') // 1970-01-01T00:00:01.000Z
```

单位应是输入合同的一部分。本例只接受安全整数，并明确拒绝缺少单位或超出 Date 范围的输入。

### 2. 中文先转字节，再做 Base64

```js
utf8Base64('你好')    // 5L2g5aW9
base64Utf8('5L2g5aW9') // 你好
```

Base64 是编码，不是加密。解码得到字节不等于得到有效 UTF-8；本例会拒绝 `/w==` 对应的无效 UTF-8。

### 3. URL 的重复参数别丢掉

```js
queryPairs('https://example.com/?tag=tools&tag=data')
// [['tag', 'tools'], ['tag', 'data']]
```

使用键值对数组保留顺序与重复值。查询参数中的 `+` 会变成空格，字面加号需要 `%2B`。

### 4. JSON 解析成功不代表数值无损

```js
JSON.parse('{"id":9007199254740993}').id   // 9007199254740992
JSON.parse('{"id":"9007199254740993"}').id // '9007199254740993'
```

不参与计算的长 ID，适合在上下游都约定为字符串。普通 JSON 格式化不能恢复已经损失的精度。

## About the project / 关于源栈

源栈提供 8 款免费浏览器工具：JSON、Unix 时间戳、Base64、URL 解析、SHA-256、长度、光子能量、频率与周期。输入在浏览器内处理，页面提供来源与适用范围；没有远程计算 API。

这个仓库提供独立的学习示例，完整网站源码与工程资料包不在这里发布。示例由 AI 辅助编写，已通过仓库内列出的 7 项测试；这不是生产审计或任意场景正确性的保证。

如需反馈，请提交与这些示例有关的 Issue，或到上方 B 站动态留言。引用这些原创例子时请注明源栈与具体版本。第三方规范适用其各自条款。

## Primary references / 参考来源

- [MDN: Unix time](https://developer.mozilla.org/en-US/docs/Glossary/Unix_time)
- [Node.js: Buffer and character encodings](https://nodejs.org/api/buffer.html)
- [MDN: URLSearchParams](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams)
- [MDN: Number.MAX_SAFE_INTEGER](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/MAX_SAFE_INTEGER)

English: Reproducible examples for timestamp units, UTF-8/Base64, repeated URL parameters, and JSON number precision. The website offers free browser-local tools; this repository contains educational examples rather than a hosted API.
