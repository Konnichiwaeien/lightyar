import {chromium} from 'playwright-core';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const require=createRequire(import.meta.url);
require('@next/env').loadEnvConfig(process.cwd(),true,{info(){},error:console.error});
const base=process.argv[2]||'http://localhost:3000';
const out='../tmp/pets-filter-check';await fs.mkdir(out,{recursive:true});
const api=process.env.STRAPI_API_URL||'http://localhost:1443/api';
const token=process.env.STRAPI_READ_TOKEN||process.env.REST_API_KEY;
const query=new URLSearchParams({'pagination[limit]':'1000'});
['name','type','sex','size','birthDate','petStatus'].forEach((field,i)=>query.set(`fields[${i}]`,field));
const response=await fetch(`${api}/pets?${query}`,{headers:token?{Authorization:`Bearer ${token}`}:{}});
assert.equal(response.ok,true,`CMS response ${response.status}`);
const raw=await response.json();const all=raw.data;
assert.equal(all.length,raw.meta.pagination.total,'The independent reference must include all pets');
await fs.writeFile(`${out}/reference.json`,JSON.stringify(all,null,2));
console.log(JSON.stringify({total:all.length,missingDates:all.filter(p=>!p.birthDate).map(p=>p.name),sizes:[...new Set(all.map(p=>p.size))],status:[...new Set(all.map(p=>p.petStatus))]}));
if(process.argv.includes('--snapshot'))process.exit(0);
const byId=new Map(all.map(p=>[p.documentId,p]));
const collator=new Intl.Collator('ru',{sensitivity:'base'});
const browser=await chromium.launch({channel:'chrome',headless:true});
const report={checks:[],errors:[]};
async function save(){await fs.writeFile(`${out}/report.json`,JSON.stringify(report,null,2));}
try {
 const page=await browser.newPage({viewport:{width:1440,height:900}});
 page.on('pageerror',e=>report.errors.push(e.message));
 const ids=async()=>page.locator('.pet-entry h2 a').evaluateAll(es=>es.map(e=>e.getAttribute('href').split('/').pop()));
 page.setDefaultTimeout(15000);page.setDefaultNavigationTimeout(20000);
 const settle=async()=>{await page.waitForFunction(()=>document.querySelector('.pets-controls')?.getAttribute('aria-busy')==='false');};
 const start=async(params='')=>{await page.goto(`${base}/pets${params}`,{waitUntil:'load'});await settle();};
 const select=async(label,value)=>{const control=page.getByRole('combobox',{name:label,exact:true});if(!await control.isVisible())await page.getByRole('button',{name:/Фильтры и порядок/}).click();await control.selectOption(value);const key=({'Порядок':'sort','Кого ищете':'type','Пол':'sex','Размер':'size'})[label];await page.waitForURL(url=>url.searchParams.get(key)===value);await settle();};
 async function collect(){
   const collected=[...await ids()];
   let visited=1;
   while(await page.getByRole('link',{name:'Следующая страница',exact:true}).count()){
     assert.ok(visited++<15,'Pagination did not terminate');
     const next=page.getByRole('link',{name:'Следующая страница',exact:true});const href=await next.getAttribute('href');
     await next.click();await page.waitForURL(new URL(href,base).href);await settle();
     const current=new URL(page.url()).searchParams.get('page')||'1';
     await page.waitForFunction(n=>document.querySelector('.pets-pagination [aria-current=page]')?.textContent===n,current);
     collected.push(...await ids());
   }
   assert.equal(new Set(collected).size,collected.length,'Duplicate pets across pages');return collected;
 }
 async function expectSet(label,filter){
   const actual=await collect();const expected=all.filter(filter).map(p=>p.documentId);
   assert.deepEqual([...actual].sort(),expected.sort(),label);report.checks.push({label,count:actual.length});await save();console.log('PASS',label,actual.length);
 }
 for(const sort of ['name_asc','name_desc','age_asc','age_desc']){
   await start();await select('Порядок',sort);const selected=await collect();
   assert.deepEqual([...selected].sort(),all.filter(p=>p.petStatus==='shelter').map(p=>p.documentId).sort());
   for(let i=1;i<selected.length;i++){
     const a=byId.get(selected[i-1]),b=byId.get(selected[i]);
     if(sort.startsWith('name'))assert.ok((sort==='name_asc'?1:-1)*collator.compare(a.name,b.name)<=0,`${sort}: ${a.name} before ${b.name}`);
     else if(a.birthDate&&b.birthDate)assert.ok((sort==='age_asc'?-1:1)*a.birthDate.localeCompare(b.birthDate)<=0,`${sort}: ${a.name} ${a.birthDate} before ${b.name} ${b.birthDate}`);
   }
   report.checks.push({label:sort,count:selected.length,allPages:true});await save();console.log('PASS',sort,selected.length);
 }
 for(const [key,label,values] of [['type','Кого ищете',['dog','cat']],['sex','Пол',['male','female']],['size','Размер',['small','medium','large']]]){
   for(const value of values){await start();await select(label,value);await expectSet(`${key}=${value}`,p=>p.petStatus==='shelter'&&p[key]===value);}
 }
 await start();await select('Кого ищете','dog');await select('Пол','female');await select('Размер','large');await select('Порядок','age_desc');
 await expectSet('combined dog/female/large + age sort',p=>p.petStatus==='shelter'&&p.type==='dog'&&p.sex==='female'&&p.size==='large');
 await start();await page.getByRole('button',{name:'Уже дома',exact:true}).click();await settle();await expectSet('home status',p=>p.petStatus==='home');
 await start();await page.getByLabel('Имя питомца').fill('  аЛьМа  ');await page.getByRole('button',{name:'Найти питомца',exact:true}).click();await settle();
 await expectSet('case-insensitive trimmed name',p=>p.petStatus==='shelter'&&p.name.toLowerCase().includes('альма'));
 await page.getByRole('button',{name:'Очистить поиск'}).click();await settle();assert.equal(new URL(page.url()).searchParams.has('search'),false);
 await start('?page=3');await select('Кого ищете','cat');assert.equal(new URL(page.url()).searchParams.has('page'),false);report.checks.push({label:'filter resets pagination'});
 await start();
 // Dispatch the second selection without waiting for the first server navigation.
 await page.getByRole('combobox',{name:'Кого ищете',exact:true}).selectOption('dog');
 await page.getByRole('combobox',{name:'Пол',exact:true}).selectOption('female');await settle();
 assert.equal(new URL(page.url()).searchParams.get('type'),'dog');assert.equal(new URL(page.url()).searchParams.get('sex'),'female');
 await expectSet('rapid type + sex retains both',p=>p.petStatus==='shelter'&&p.type==='dog'&&p.sex==='female');
 await page.getByRole('button',{name:'Сбросить фильтры'}).click();await settle();assert.equal(new URL(page.url()).searchParams.has('type'),false);assert.equal(new URL(page.url()).searchParams.has('sex'),false);
 await start();await select('Кого ищете','cat');await select('Пол','female');await page.goBack();await settle();assert.equal(await page.getByRole('combobox',{name:'Пол',exact:true}).inputValue(),'');assert.equal(await page.getByRole('combobox',{name:'Кого ищете',exact:true}).inputValue(),'cat');
 report.checks.push({label:'reset and browser Back restore filter controls'});
 await page.setViewportSize({width:390,height:844});await start();await select('Кого ищете','cat');await select('Порядок','name_desc');await expectSet('mobile combined filter and sort',p=>p.petStatus==='shelter'&&p.type==='cat');
 await page.locator('.pets-controls').screenshot({path:`${out}/mobile-controls.png`});
 assert.deepEqual(report.errors,[]);await save();
}finally{await browser.close();}
