import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
function service(file, name, answer) {
 const calls=[];
 class Client {async fetchJson(path, options){calls.push({path,options});return answer(path);}}
 const source=fs.readFileSync(new URL(file,import.meta.url),'utf8');
 const output=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 const exports={};new Function('require','exports',output)(()=>({StrapiClient:Client}),exports);
 return {client:new exports[name](),calls};
}
test('current pet campaigns are restricted to this pet and active status',async()=>{
 const {client,calls}=service('./campaigns.ts','CampaignsService',()=>({data:[]}));
 await client.getCampaigns({petId:'pet&other',status:'active',limit:3});
 const query=new URLSearchParams(calls[0].path.split('?')[1]);
 assert.equal(query.get('filters[pet][documentId][$eq]'),'pet&other');
 assert.equal(query.get('filters[status][$eq]'),'active');
 assert.equal(query.get('pagination[limit]'),'3');
});
test('heroes include direct gifts and this pet’s campaigns, exposing only public fields',async()=>{
 const gift={id:1,donorName:'Анна',amount:500,type:'once'};
 const {client,calls}=service('./donations.ts','DonationsService',()=>({data:[gift]}));
 assert.deepEqual(await client.getPetDonations('pet&other'),{status:'ready',donations:[gift]});
 const query=new URLSearchParams(calls[0].path.split('?')[1]);
 assert.equal(query.get('filters[$or][0][pet][documentId][$eq]'),'pet&other');
 assert.equal(query.get('filters[$or][1][campaign][pet][documentId][$eq]'),'pet&other');
 assert.deepEqual([...query].filter(([key])=>key.startsWith('fields')).map(([,value])=>value),['donorName','amount','type','createdAt']);
 assert.equal(calls[0].options.next.revalidate,60);
});
test('empty donations and failed requests remain distinct',async()=>{
 const empty=service('./donations.ts','DonationsService',()=>({data:[]}));
 const failed=service('./donations.ts','DonationsService',()=>{throw Error('503');});
 assert.deepEqual(await empty.client.getPetDonations('a'),{status:'empty',donations:[]});
 assert.deepEqual(await failed.client.getPetDonations('a'),{status:'unavailable',donations:[]});
});
