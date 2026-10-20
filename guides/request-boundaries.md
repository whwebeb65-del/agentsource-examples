# 一条请求，四个数据边界

[English walkthrough](request-boundaries.en.md)

接口返回了合法 JSON，不代表里面的数据仍然表达原来的含义。一个长 ID、一个时间戳、一段中文和两个同名查询参数，就足以暴露四种常见问题。

**[打开免费的可编辑预演](https://agent-source-lab.maple-poppy-4553.chatgpt.site/cases/node-intake.html)**。预演不要求购买；示例只解析 URL，不会访问示例地址。

先动手：打开[请求体 JSON](https://agent-source-lab.maple-poppy-4553.chatgpt.site/data/intake-request.json)，复制完整内容到预演的“模拟请求体”，点击“运行输入处理”。再用[带预期结果的示例](https://agent-source-lab.maple-poppy-4553.chatgpt.site/data/intake-example.json)核对输出。后一份文件额外包含 `expected`，不能整份作为请求体提交；若使用它，只取 `request` 属性。

## 先约定一份输入

```json
{
  "id": "9007199254740993",
  "timestamp": "1000",
  "timestampUnit": "seconds",
  "messageBase64": "5Lit5paH",
  "url": "https://example.com/callback?tag=tools&tag=data&q=a+b"
}
```

这份输入把两个约定写得很明确：ID 是字符串；时间戳的单位单独传递。Base64 文本按 UTF-8 解码；查询参数保留顺序和重复值。

## 1. 长 ID 要从源头就保留为字符串

```js
JSON.parse('{"id":9007199254740993}').id;
// 9007199254740992

JSON.parse('{"id":"9007199254740993"}').id;
// '9007199254740993'
```

JavaScript 的安全整数上限是 `9007199254740991`。合法 JSON 中的数字可能在解析时已经被舍入，后续 `String(id)` 无法恢复原来的末位。

不参与算术的标识符，可以约定上下游全程使用字符串。在免费预演里把 `id` 改为 JSON 数字，会得到字段错误，而不是一个看似正确的成功结果。这样的拒绝只能阻止错误继续传播，不能修复上游已经丢失的精度。

## 2. 时间单位不要靠数字长度猜

同样的 `1000`：

| 明确单位 | UTC 结果 |
| --- | --- |
| seconds | 1970-01-01T00:16:40.000Z |
| milliseconds | 1970-01-01T00:00:01.000Z |

长度启发式无法替代接口合同，特别是在测试数据、较早日期或负时间戳中。展示时间时还应明确时区；本例统一展示 UTC。

## 3. Base64 解码之后还要检查文本编码

`5Lit5paH` 对应 UTF-8 文本“中文”。Base64 本身不是加密，也不规定其中一定是文本。解出字节后，若业务约定为 UTF-8，应以严格方式解码；错误字节不应悄悄替换成看似可读的字符。

仓库的 `base64Utf8` 会检查标准填充、填充位和 UTF-8 有效性。`/w==` 能表示字节，但不是有效 UTF-8 文本，会被拒绝。

## 4. 查询参数不要直接压成普通对象

```js
[...new URL('https://example.com/?tag=tools&tag=data&q=a+b').searchParams]
// [['tag', 'tools'], ['tag', 'data'], ['q', 'a b']]
```

键值对数组保留两个 `tag`。若直接使用 `Object.fromEntries(...)`，同名项会被覆盖。查询字符串中的 `+` 表示空格，字面加号需要编码为 `%2B`。

## 在这个仓库里运行最小组合

需要 Node.js 22+。在仓库根目录新建 `request-demo.mjs`，粘贴下面的代码，然后执行 `node request-demo.mjs`。这只是固定输入的最小示范，完整的可编辑字段校验可以先在网页预演中查看。

```js
import {unixUtc, base64Utf8, queryPairs} from './examples.mjs';

const input = {
  id: '9007199254740993',
  timestamp: '1000',
  timestampUnit: 'seconds',
  messageBase64: '5Lit5paH',
  url: 'https://example.com/callback?tag=tools&tag=data&q=a+b'
};

if (typeof input.id !== 'string' || !/^\d{1,40}$/.test(input.id)) {
  throw new TypeError('id must be a 1–40 digit string');
}
const units = {seconds: 's', milliseconds: 'ms'};
if (!Object.hasOwn(units, input.timestampUnit)) {
  throw new TypeError('Declare seconds or milliseconds');
}
console.log(JSON.stringify({
  id: input.id,
  utc: unixUtc(Number(input.timestamp), units[input.timestampUnit]),
  message: base64Utf8(input.messageBase64),
  query: queryPairs(input.url)
}, null, 2));
```

预期结果包含原样 ID、`1970-01-01T00:16:40.000Z`、“中文”、两个 `tag` 和值为 `a b` 的 `q`。把单位改为 `milliseconds`，UTC 结果随之变化；把 ID 改为数字，代码应直接拒绝。

## 免费内容与完整工程包

网页工具、交互预演和本仓库的学习示例继续免费。只需要核对数据时，使用这些内容即可。

若需要整理好的本地文件，[完整工程包说明页](https://agent-source-lab.maple-poppy-4553.chatgpt.site/products/integration-kit.html)列出了 HTTP 服务、客户端、15 项真实 HTTP 集成测试、8 个工具模块与 64 个基础用例，当前标价 29 元一次性交付。它是本地学习与接入资料，不包含托管 API、鉴权、数据库或生产安全审计；购买入口在爱发电，需要平台登录。没有订单或收益保证。

项目与本文由 AI 辅助制作。上面的组合代码已实际运行；仓库的 7 项独立测试通过。测试覆盖不等于适用于任意输入或生产环境。

## 定义来源

- [MDN：Number.MAX_SAFE_INTEGER](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/MAX_SAFE_INTEGER)
- [MDN：URLSearchParams](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams)
- [Node.js：Buffer 与字符编码](https://nodejs.org/api/buffer.html)
- [MDN：Date](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date)
