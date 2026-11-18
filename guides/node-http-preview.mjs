// 源栈免费试跑：在终端运行 node node-http-preview.mjs（Node.js 22+）。
// 用两个固定示例验证本机 HTTP。只监听 127.0.0.1，运行后自动关闭。
import assert from 'node:assert/strict';
import {once} from 'node:events';
import {createServer} from 'node:http';

function send(response, status, body) {
  response.writeHead(status, {'Content-Type':'application/json; charset=utf-8'});
  response.end(JSON.stringify(body));
}

const server=createServer({requestTimeout:5000,headersTimeout:5000},async (request,response)=>{
  if (request.method!=='POST' || request.url!=='/normalize') {
    return send(response,404,{ok:false,error:{code:'NOT_FOUND'}});
  }
  const chunks=[];
  let length=0;
  let input;
  try {
    for await (const chunk of request) {
      length+=chunk.length;
      if (length<=1024) chunks.push(chunk);
    }
    if (length>1024) return send(response,413,{ok:false,error:{code:'BODY_LIMIT'}});
    input=JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    if (!response.destroyed) send(response,400,{ok:false,error:{code:'INVALID_JSON'}});
    return;
  }
  if (typeof input?.id!=='string' || !/^\d{1,40}$/.test(input.id)) {
    return send(response,400,{ok:false,error:{code:'ID_STRING',field:'id'}});
  }
  send(response,200,{ok:true,data:{id:input.id}});
});

const id='9007199254740993';
server.listen(0,'127.0.0.1');
await once(server,'listening');
try {
  const url='http://127.0.0.1:'+server.address().port+'/normalize';
  const fixtures=[
    {label:'字符串 ID',body:'{"id":"'+id+'"}',status:200,result:{ok:true,data:{id}}},
    {label:'数字 ID',body:'{"id":'+id+'}',status:400,result:{ok:false,error:{code:'ID_STRING',field:'id'}}}
  ];
  for (const fixture of fixtures) {
    const response=await fetch(url,{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:fixture.body,
      signal:AbortSignal.timeout(5000)
    });
    const result=await response.json();
    assert.equal(response.status,fixture.status);
    assert.deepEqual(result,fixture.result);
    console.log(fixture.label+' → HTTP '+response.status+' '+JSON.stringify(result));
  }
  console.log('两项试跑通过。');
} finally {
  await new Promise(resolve=>{
    server.close(resolve);
    server.closeAllConnections();
  });
}
