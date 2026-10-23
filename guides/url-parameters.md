# URL 参数没少，为什么解析后少了一个 tag？

[English](url-parameters.en.md) · [一键打开免费网页示例](https://agent-source-lab.maple-poppy-4553.chatgpt.site/tools/url.html?example=url-tags)

先看 [28 秒视频、可选字幕与完整文字稿](https://agent-source-lab.maple-poppy-4553.chatgpt.site/guides/url-duplicates.html#url-video-title)，或在 [B站观看](https://www.bilibili.com/video/BV1nZna65Es4/)。视频为 AI 辅助的原创排版、实际网页截图与本机合成语音，非连续录屏。

用这条合成 URL 复现，不需要账号，也不会访问 example.com：

```text
https://example.com/?tag=tools&tag=data&q=a+b&literal=a%2Bb
```

## 同一个查询串，三种读取结果

```js
const p = new URL('https://example.com/?tag=tools&tag=data&q=a+b&literal=a%2Bb').searchParams;
p.get('tag');                // 'tools'：第一个
p.getAll('tag');             // ['tools', 'data']：全部
Object.fromEntries(p).tag;   // 'data'：对象的同名属性被后一个覆盖
[...p];                     // 保留两个 tag，以及参数顺序
```

普通对象每个键只能有一个属性值。若业务允许一个筛选条件有多个值，使用 `getAll`；若需要保留所有参数的整体顺序，使用键值对列表。不要先转成普通对象再试图找回已经丢掉的值。

## 加号也有两种含义

| 查询串片段 | 解析结果 |
| --- | --- |
| `q=a+b` | `a b`，中间是空格 |
| `literal=a%2Bb` | `a+b`，中间是字面加号 |

这是 `URLSearchParams` 使用的表单查询编码规则。不要把这个结论套到整个 URL 的所有部分。

一个相关问题是把标准 Base64 直接拼接进查询串：

```js
new URLSearchParams('bin=E+AXQB+A').get('bin'); // 'E AXQB A'

const safe = new URLSearchParams();
safe.set('bin', 'E+AXQB+A');    // 传原始值，让 API 编码
safe.toString();              // 'bin=E%2BAXQB%2BA'
new URLSearchParams(safe.toString()).get('bin'); // 'E+AXQB+A'
```

调用 `set` 或 `append` 时不要先手动编码，否则 `%` 会再次编码。处理现有查询串则先解析，不要把整个查询串当作单个值编码。

## 本机直接核对

Node.js 22+，没有第三方依赖：

```sh
node guides/url-parameters-demo.mjs
npm test
```

脚本包含 9 个针对上述结果的断言；仓库原有的 7 项测试另行运行。网页示例以列表保留重复参数，输入在浏览器内处理，只解析 URL，不请求目标地址。[源栈工具索引](https://agent-source-lab.maple-poppy-4553.chatgpt.site/)还有 JSON、时间戳和 UTF-8 Base64 等免费工具。

这是独立学习示例，由 AI 辅助编写并实际运行核对，不是 URL 签名、鉴权规范或任意后端框架参数行为的保证。传入工具的示例应先移除真实 token、账号和私密链接。

参考：[MDN URLSearchParams](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams)，尤其是重复参数、百分号编码和保留加号部分。
