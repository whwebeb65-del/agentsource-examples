import {test} from 'node:test';
import assert from 'node:assert/strict';
import {unixUtc, utf8Base64, base64Utf8, queryPairs, jsonIntegerExample} from './examples.mjs';

test('1000 has different UTC results in seconds and milliseconds',()=>{
  assert.equal(unixUtc(1000,'s'),'1970-01-01T00:16:40.000Z');
  assert.equal(unixUtc(1000,'ms'),'1970-01-01T00:00:01.000Z');
});
test('negative timestamps remain valid and units are required',()=>{
  assert.equal(unixUtc(-1,'s'),'1969-12-31T23:59:59.000Z');
  assert.throws(()=>unixUtc(1000));
  assert.throws(()=>unixUtc(1.5,'s'));
  assert.throws(()=>unixUtc(Number.MAX_SAFE_INTEGER,'s'));
});
test('Chinese text round-trips through explicitly encoded UTF-8',()=>{
  assert.equal(utf8Base64('你好'),'5L2g5aW9');
  assert.equal(base64Utf8('5L2g5aW9'),'你好');
  assert.equal(base64Utf8(utf8Base64('中文 / 🧪')),'中文 / 🧪');
});
test('empty text is a valid round-trip',()=>{
  assert.equal(utf8Base64(''),'');
  assert.equal(base64Utf8(''),'');
});
test('decoding rejects malformed padding, padding bits and invalid UTF-8',()=>{
  for (const value of ['YQ','YR==','/w==','????']) assert.throws(()=>base64Utf8(value));
});
test('URL pairs preserve repeated keys and distinguish plus from space',()=>{
  assert.deepEqual(queryPairs('https://example.com/?tag=tools&tag=data&q=a+b&literal=a%2Bb'),[
    ['tag','tools'],['tag','data'],['q','a b'],['literal','a+b']
  ]);
  assert.throws(()=>queryPairs('javascript:alert(1)'));
});
test('JSON numeric precision loss is observable while string IDs survive',()=>{
  const value=jsonIntegerExample();
  assert.equal(value.numeric,9007199254740992);
  assert.equal(value.string,'9007199254740993');
});
