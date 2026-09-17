import test from 'node:test';
import assert from 'node:assert/strict';
import { readGiftForm, validGiftFile, MAX_GIFT_FILE_BYTES } from './gift-upload.ts';

test('gift files must match their MIME signature', async()=>{
  assert.equal(await validGiftFile(new File(['<html>evil</html>'],'photo.png',{type:'image/png'})),false);
  assert.equal(await validGiftFile(new File(['%PDF-1.7\n'],'barcode.pdf',{type:'application/pdf'})),true);
  assert.equal(await validGiftFile(new File([new Uint8Array([137,80,78,71,13,10,26,10])],'barcode.png',{type:'image/png'})),true);
  assert.equal(await validGiftFile(new File([''],'barcode.png',{type:'image/png'})),false);
});
test('chunked uploads cannot bypass the request size limit',async()=>{
  let cancelled=false;
  const stream = new ReadableStream({ start(controller){controller.enqueue(new Uint8Array(MAX_GIFT_FILE_BYTES+65537));},cancel(){cancelled=true;} });
  const request=new Request('http://localhost',{method:'POST',body:stream,duplex:'half'} as RequestInit);
  await assert.rejects(readGiftForm(request),/TOO_LARGE/);
  assert.equal(cancelled,true);
});
test('normal multipart forms are decoded with fields intact',async()=>{
  const form=new FormData();form.set('donorName','Мария');
  const result=await readGiftForm(new Request('http://localhost',{method:'POST',body:form}));
  assert.equal(result.get('donorName'),'Мария');
});
