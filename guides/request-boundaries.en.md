# One request, four data boundaries

[中文](request-boundaries.md) · [Free editable browser preview](https://agent-source-lab.maple-poppy-4553.chatgpt.site/cases/node-intake.html)

Valid JSON is only the beginning. A long identifier, a timestamp, some Chinese text and repeated query parameters can each lose their intended meaning during otherwise successful processing.

## Start with explicit inputs

```json
{
  "id": "9007199254740993",
  "timestamp": "1000",
  "timestampUnit": "seconds",
  "messageBase64": "5Lit5paH",
  "url": "https://example.com/callback?tag=tools&tag=data&q=a+b"
}
```

The ID is a string throughout the data path. The timestamp declares its unit. Text is UTF-8 inside standard Base64. Query parameters remain an ordered list of pairs.

## Four checks worth making

1. **Preserve the identifier at its source.** JavaScript's maximum safe integer is `9007199254740991`. Parsing the numeric JSON value `9007199254740993` produces `9007199254740992`; parsing the quoted string preserves its digits. Converting an already-rounded number to a string cannot recover the original value. Rejecting a numeric ID prevents further use of the wrong representation, but does not repair upstream loss.
2. **Declare timestamp units.** `1000` seconds gives `1970-01-01T00:16:40.000Z`; `1000` milliseconds gives `1970-01-01T00:00:01.000Z`. Both outputs are UTC. Inferring units from digit count is not a substitute for an input contract.
3. **Validate the decoded text.** `5Lit5paH` decodes to the UTF-8 text `中文`. Base64 is an encoding, not encryption, and decoded bytes need not be valid UTF-8. This repository's decoder rejects malformed padding, non-canonical padding bits and invalid UTF-8, such as the bytes represented by `/w==`.
4. **Keep repeated query parameters.** An array retains both `tag=tools` and `tag=data`. Converting those pairs directly to an object overwrites a repeated key. In a query string, `+` is a space; a literal plus is `%2B`.

## Run the small composition

Use Node.js 22+ at this repository's root. Save the following as `request-demo.mjs`, then run `node request-demo.mjs`. No installation or external service is required. This is a fixed-input learning example, rather than a complete request validator.

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

Expected output:

```json
{
  "id": "9007199254740993",
  "utc": "1970-01-01T00:16:40.000Z",
  "message": "中文",
  "query": [["tag", "tools"], ["tag", "data"], ["q", "a b"]]
}
```

Change the unit to `milliseconds` and compare the UTC result. Change the ID to a JSON number and check that the example rejects it.

## Try first; buy organized files only if needed

The [browser preview](https://agent-source-lab.maple-poppy-4553.chatgpt.site/cases/node-intake.html), browser tools and this repository remain free. The preview's interface is in Simplified Chinese; its input and output field names match this walkthrough. Processing stays in the browser and does not fetch the example URL.

For a quick check, copy the complete [request-body JSON](https://agent-source-lab.maple-poppy-4553.chatgpt.site/data/intake-request.json) into the preview and run it. Compare the result with the separate [request-and-expected-result fixture](https://agent-source-lab.maple-poppy-4553.chatgpt.site/data/intake-example.json). The fixture wraps the input in `request` and adds `expected`; submit only its `request` property, rather than the whole fixture.

The [separate engineering kit](https://agent-source-lab.maple-poppy-4553.chatgpt.site/products/integration-kit.html) adds organized local files: an HTTP server, client, 15 HTTP integration tests, eight utility modules and 64 base cases. The listed price is CNY 29 for one delivery through Afdian, which requires login. It is local learning and integration material, without a hosted API, authentication, database or production security audit. Free examples require no purchase.

The project and this walkthrough were made with AI assistance. The code block was actually run, including the milliseconds comparison and numeric-ID rejection. The repository's seven independent tests also pass; these checks do not cover arbitrary inputs or establish production readiness.

## Primary definitions

- [MDN: Number.MAX_SAFE_INTEGER](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/MAX_SAFE_INTEGER)
- [MDN: URLSearchParams](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams)
- [Node.js: Buffer and character encodings](https://nodejs.org/api/buffer.html)
- [MDN: Date](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date)
