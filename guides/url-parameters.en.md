# Why did one query parameter disappear?

[中文](url-parameters.md) · [Open the free browser example](https://agent-source-lab.maple-poppy-4553.chatgpt.site/tools/url.html?example=url-tags)

This synthetic URL contains two tags, a space, and a literal plus sign:

```text
https://example.com/?tag=tools&tag=data&q=a+b&literal=a%2Bb
```

```js
const p = new URL('https://example.com/?tag=tools&tag=data&q=a+b&literal=a%2Bb').searchParams;
p.get('tag');               // 'tools': first value
p.getAll('tag');            // ['tools', 'data']: both values
Object.fromEntries(p).tag;  // 'data': later property replaces earlier one
[...p];                    // preserves repeated entries and their order
p.get('q');                 // 'a b'
p.get('literal');           // 'a+b'
```

Use `getAll` for a multivalue filter, or an ordered list of pairs when the order of all entries matters. A plain object has only one property per key; it cannot recover values already discarded during conversion.

The plus-to-space behavior is part of the form query encoding used by `URLSearchParams`, not a rule for every component of a URL.

## Building a query containing Base64

Interpolating a standard Base64 value directly into a query can change its plus signs:

```js
new URLSearchParams('bin=E+AXQB+A').get('bin'); // 'E AXQB A'

const safe = new URLSearchParams();
safe.set('bin', 'E+AXQB+A'); // original value; the API handles encoding
safe.toString();           // 'bin=E%2BAXQB%2BA'
new URLSearchParams(safe.toString()).get('bin'); // 'E+AXQB+A'
```

Do not pre-encode values passed to `set` or `append`: the percent signs would be encoded again. Parse existing query syntax rather than encoding an entire query as one value.

## Reproduce locally

Node.js 22+, no third-party dependencies:

```sh
node guides/url-parameters-demo.mjs
npm test
```

The script checks these results with 9 assertions; the repository's original 7 tests run separately. The [browser URL inspector](https://agent-source-lab.maple-poppy-4553.chatgpt.site/tools/url.html?example=url-tags) keeps repeated parameters as a list and does not request the inspected URL. The interface is currently Chinese. The [English overview](https://agent-source-lab.maple-poppy-4553.chatgpt.site/en/) explains the other free browser-local tools.

This is an AI-assisted educational example, executed and checked locally. It does not define URL signing, authorization, or every backend framework's query behavior. Remove real tokens and private links before sharing examples.

Reference: [MDN URLSearchParams](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams), including duplicate parameters, percent encoding, and preserving plus signs.
