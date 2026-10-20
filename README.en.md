# AgentSource Examples

Reproducible JavaScript examples for small data-handling mistakes: timestamp units, UTF-8 Base64, repeated URL parameters, and JSON number precision.

[Free browser tools](https://agent-source-lab.maple-poppy-4553.chatgpt.site/en/) · [10 reproducible presets](https://agent-source-lab.maple-poppy-4553.chatgpt.site/examples.html) · [中文说明](README.md)

## New: one request, four boundaries

Try the [free editable request preview](https://agent-source-lab.maple-poppy-4553.chatgpt.site/cases/node-intake.html): preserve a long string ID, declare timestamp units, decode UTF-8 Base64, and retain repeated query parameters. The preview and [copyable walkthrough in Chinese](guides/request-boundaries.md) are free. The full interface is currently in Simplified Chinese.

For developers who want organized local files, the [separate kit page](https://agent-source-lab.maple-poppy-4553.chatgpt.site/products/integration-kit.html) lists a Node.js HTTP server, client, 15 integration tests, eight utility modules and 64 base cases. The listed price is CNY 29 for one delivery via Afdian, which requires login. It is local learning material, without a hosted API, authentication, database or production security audit. No purchase is required to use this repository or the browser preview.

## Run locally

Use Node.js 22 or later. There are no third-party dependencies and no installation step.

```sh
node examples.mjs
npm test
```

The repository includes seven tests. The examples are educational and AI-assisted; passing these tests is not a production audit.

## Import the examples

```js
import {unixUtc, utf8Base64, base64Utf8, queryPairs} from './examples.mjs';

unixUtc(1000, 's');  // 1970-01-01T00:16:40.000Z
unixUtc(1000, 'ms'); // 1970-01-01T00:00:01.000Z

utf8Base64('你好');      // 5L2g5aW9
base64Utf8('5L2g5aW9'); // 你好

queryPairs('https://example.com/?tag=tools&tag=data');
// [['tag', 'tools'], ['tag', 'data']]
```

Timestamp units are required. The example accepts safe integer values and rejects invalid or out-of-range dates. The Base64 decoder checks padding, unused bits, and UTF-8 validity. URL parameters remain an ordered array so repeated keys survive; a query-string `+` is a space, while `%2B` is a literal plus sign.

## Valid JSON can still change a number

```js
JSON.parse('{"id":9007199254740993}').id;   // 9007199254740992
JSON.parse('{"id":"9007199254740993"}').id; // '9007199254740993'
```

A long identifier that is not used in calculations can be represented as a string by agreement across the entire data path. Converting an already-rounded number to a string cannot recover its original digits.

## The website

AgentSource provides eight free browser-local tools with documented rules, sources and limits. The English page is an overview; full tool interfaces and guides are currently in Simplified Chinese. Preset links contain public example IDs rather than visitor input.

In compatible browsers, an open tool page also exposes a WebMCP calculation action. It uses the same validated, visible form workflow. The website does not offer a remote calculation API. [Read the browser-agent guide](https://agent-source-lab.maple-poppy-4553.chatgpt.site/agents.html).

This repository contains independent learning examples. It does not include the complete website source or the separate engineering kit. For reproducible issues with these examples, use this repository's Issues. Attribute AgentSource and the relevant version when citing the original examples; third-party references retain their own terms.

## Primary references

- [MDN: Unix time](https://developer.mozilla.org/en-US/docs/Glossary/Unix_time)
- [Node.js: Buffer and character encodings](https://nodejs.org/api/buffer.html)
- [MDN: URLSearchParams](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams)
- [MDN: Number.MAX_SAFE_INTEGER](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/MAX_SAFE_INTEGER)
