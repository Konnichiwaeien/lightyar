import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import test from 'node:test';
import assert from 'node:assert/strict';
import { readGiftForm, validGiftFile, MAX_GIFT_FILE_BYTES } from '../../../lib/security/gift-upload.ts';

const code=ts.transpileModule(fs.readFileSync(new URL('./route.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;
function setup({enabled=true,configured=true,createStatus=200}={}) {
  const calls=[]; const exports={};
  vm.runInNewContext(code,{
    exports,Request,Response,File,FormData,AbortSignal,console:{error(){},warn(){}},
    process:{env:{STRAPI_GIFT_WRITE_TOKEN:'test-only',GIFT_ORDERS_ENABLED:enabled?'true':'false'}},
    require(name){
      if(name==='next/server') return {NextResponse:{json:(data,init)=>Response.json(data,init)}};
      if(name.includes('gift-upload')) return {readGiftForm,validGiftFile,MAX_GIFT_FILE_BYTES};
      if(name.includes('wishlist'))return {wishlistService:{getSettings:async()=>({acceptingOrders:configured})}};
      return {clientIp:()=> 'test',rateLimit:()=>({allowed:true})};
    },
    fetch:async(url,init)=>{calls.push({url,...init}); return url.endsWith('/upload')?Response.json([{id:12}]):Response.json({data:{documentId:'order'}},{status:createStatus});},
  });
  return {POST:exports.POST,calls};
}
function request(overrides={}) {
  const form=new FormData();
  const fields={donorName:'Анна',phone:'+79991234567',consent:'true',wishlistItemId:'abcdef123',barcode:new File(['%PDF-1.7\n'],'code.pdf',{type:'application/pdf'}),...overrides};
  for(const [key,value] of Object.entries(fields)) form.set(key,value);
  return new Request('http://localhost/api/gift-orders',{method:'POST',body:form});
}
test('unconfigured gifts never upload donor files',async()=>{
  for(const options of [{enabled:false},{configured:false}]) {
    const app=setup(options);assert.equal((await app.POST(request())).status,503);assert.equal(app.calls.length,0);
  }
});
test('successful order uploads exclusively via the private marker and applies deadlines',async()=>{
  const app=setup();const response=await app.POST(request());
  assert.equal(response.status,200);assert.equal(app.calls.length,2);
  assert.equal(app.calls[0].body.get('path'),'gift-orders');
  assert.ok(app.calls.every(call=>call.signal instanceof AbortSignal));
  assert.equal(JSON.parse(app.calls[1].body).data.barcode,12);
});
test('bad consent, oversized fields and disguised files never reach Strapi',async()=>{
  for(const fields of [{consent:'false'},{donorName:'a'.repeat(101)},{barcode:new File(['<html>'],'fake.pdf',{type:'application/pdf'})}]) {
    const app=setup();assert.equal((await app.POST(request(fields))).status,400);assert.equal(app.calls.length,0);
  }
});
test('a failed order creation is not reported as success',async()=>{
  const app=setup({createStatus:500});assert.equal((await app.POST(request())).status,502);
});
