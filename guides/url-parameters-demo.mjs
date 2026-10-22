import assert from 'node:assert/strict';

// Educational, synthetic data. No network requests are made.
const url = new URL('https://example.com/?tag=tools&tag=data&q=a+b&literal=a%2Bb');
const params = url.searchParams;
const pairs = [...params];
assert.deepEqual(pairs, [
  ['tag', 'tools'], ['tag', 'data'], ['q', 'a b'], ['literal', 'a+b']
]);
assert.equal(params.get('tag'), 'tools');
assert.deepEqual(params.getAll('tag'), ['tools', 'data']);
assert.deepEqual(Object.fromEntries(params), {tag: 'data', q: 'a b', literal: 'a+b'});
assert.equal(params.get('q'), 'a b');
assert.equal(params.get('literal'), 'a+b');

const base64 = 'E+AXQB+A';
const interpolated = new URLSearchParams('bin=' + base64).get('bin');
assert.equal(interpolated, 'E AXQB A');
const safe = new URLSearchParams();
safe.set('bin', base64); // Pass the original value, not an already encoded value.
assert.equal(safe.toString(), 'bin=E%2BAXQB%2BA');
assert.equal(new URLSearchParams(safe.toString()).get('bin'), base64);

console.log(JSON.stringify({
  pairs,
  firstTag: params.get('tag'),
  allTags: params.getAll('tag'),
  collapsedObject: Object.fromEntries(params),
  rawPlus: params.get('q'),
  encodedPlus: params.get('literal'),
  interpolatedBase64: interpolated,
  serializedBase64: safe.toString(),
  restoredBase64: new URLSearchParams(safe.toString()).get('bin'),
  verifiedAssertions: 9
}, null, 2));
