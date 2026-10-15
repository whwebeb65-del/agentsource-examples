import {pathToFileURL} from 'node:url';

// Educational examples, separate from the website's complete integration kit.
export function unixUtc(value, unit) {
  if (!['s', 'ms'].includes(unit)) throw new TypeError('Declare the unit: s or ms');
  if (!Number.isSafeInteger(value)) throw new RangeError('Use a safe integer timestamp');
  const date = new Date(unit === 's' ? value * 1000 : value);
  if (!Number.isFinite(date.getTime())) throw new RangeError('Timestamp outside Date range');
  return date.toISOString();
}

export function utf8Base64(text) {
  return Buffer.from(text, 'utf8').toString('base64');
}

export function base64Utf8(encoded) {
  const text = encoded.replace(/\s/g, '');
  if (text.length % 4 !== 0 || !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(text)) throw new TypeError('Expected padded standard Base64');
  const bytes = Buffer.from(text, 'base64');
  if (bytes.toString('base64') !== text) throw new TypeError('Non-canonical Base64 padding bits');
  return new TextDecoder('utf-8', {fatal: true}).decode(bytes);
}

export function queryPairs(address) {
  const url = new URL(address);
  if (!['http:', 'https:'].includes(url.protocol)) throw new TypeError('Expected an HTTP or HTTPS URL');
  // An array preserves both repeated keys and their order.
  return [...url.searchParams.entries()];
}

export function jsonIntegerExample() {
  return {
    numeric: JSON.parse('{"id":9007199254740993}').id,
    string: JSON.parse('{"id":"9007199254740993"}').id
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  console.log(JSON.stringify({
    seconds: unixUtc(1000, 's'),
    milliseconds: unixUtc(1000, 'ms'),
    chinese: utf8Base64('你好'),
    decoded: base64Utf8('5L2g5aW9'),
    repeatedParameters: queryPairs('https://example.com/?tag=tools&tag=data&q=a+b&literal=a%2Bb'),
    jsonInteger: jsonIntegerExample()
  }, null, 2));
}
