import { chromium } from 'playwright-core';
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
const out='../tmp/pet-profile-motion';
await fs.mkdir(out,{recursive:true});
const run=Date.now(), calls=[];
const proxy=createServer((req,res)=>{
 const url=new URL(req.url,'http://local');calls.push(url.pathname+url.search);
 const state=req.url.includes('unavailable')?'unavailable':req.url.includes('empty')?'empty':'ready';
 const isCommunity=/\/api\/(campaigns|donations)/.test(url.pathname);
 if(isCommunity&&state==='unavailable'){res.writeHead(503,{'content-type':'application/json'});res.end('{}');return;}
 let data=[];
 if(url.pathname.startsWith('/api/pets/'))data={id:999,documentId:url.pathname.split('/').pop(),name:'Тестовый питомец',type:'dog',sex:'unknown',petStatus:'shelter',photos:[]};
 if(isCommunity&&state==='ready')data=url.pathname.endsWith('campaigns')?[{id:1,documentId:'qa-fund',slug:'qa-fund',title:'Тестовый сбор на обследование',shortDesc:'Данные только для проверки интерфейса.',current:37500,total:50000,status:'active'}]:[{id:1,documentId:'qa-gift1',donorName:'Тестовый помощник',amount:500,type:'monthly'},{id:2,documentId:'qa-gift2',donorName:'',amount:300,type:'once'}];
 res.writeHead(200,{'content-type':'application/json'});res.end(JSON.stringify({data,meta:{pagination:{total:Array.isArray(data)?data.length:1}}}));
});
await new Promise(resolve=>proxy.listen(1457,'127.0.0.1',resolve));
// A separate project root avoids the owner's dev lock and unrelated CMS prerenders.
// Snapshot the current source: Next's route discovery does not follow an app junction.
const qaRoot=path.resolve('../tmp/pet-community-app-v2');await fs.mkdir(qaRoot,{recursive:true});
for(const dir of ['app','components','lib'])await fs.cp(path.resolve(dir),path.join(qaRoot,dir),{recursive:true});
for(const dir of ['public','node_modules'])await fs.symlink(path.resolve(dir),path.join(qaRoot,dir),'junction').catch(e=>{if(e.code!=='EEXIST')throw e;});
for(const file of ['package.json','tsconfig.json','postcss.config.mjs','next.config.ts'])await fs.copyFile(file,path.join(qaRoot,file));
const server=spawn(process.execPath,['node_modules/next/dist/bin/next','dev',qaRoot,'--webpack','-p','3004'],{env:{...process.env,NODE_ENV:'development',STRAPI_API_URL:'http://127.0.0.1:1457/api'},stdio:['ignore','pipe','pipe'],windowsHide:true});
let logs='';server.stdout.on('data',d=>logs+=d);server.stderr.on('data',d=>logs+=d);
const browser=await chromium.launch({channel:'chrome',headless:true});const report=[];
try{
 for(let i=0;i<80&&!logs.includes('Ready');i++)await new Promise(r=>setTimeout(r,250));
 if(!logs.includes('Ready'))throw new Error('Isolated server failed to start: '+logs);
 const page=await browser.newPage({reducedMotion:'reduce'});
 for(const state of ['ready','empty','unavailable']){
  for(const width of state==='ready'?[320,390,768,1440]:[390]){
   await page.setViewportSize({width,height:1000});
   await page.goto(`http://localhost:3004/pets/qa-${state}-${run}`,{waitUntil:'domcontentloaded',timeout:60000});
   const section=page.locator('.pet-support__community');await section.waitFor();await section.scrollIntoViewIfNeeded();await page.evaluate(()=>document.fonts.ready);
   if(state==='ready'){
    assert.equal(await section.locator('progress').getAttribute('value'),'37500');assert.equal(await section.locator('progress').getAttribute('max'),'50000');
    assert.equal(await section.locator('.pet-support__backers li').count(),2);assert.match(await section.innerText(),/Анонимный помощник/);
    assert.equal(await section.getByRole('link',{name:'Подробнее о сборе'}).getAttribute('href'),'/campaigns/qa-fund');
   }else if(state==='empty'){assert.match(await section.innerText(),/Отдельного сбора сейчас нет/);assert.equal(await section.locator('progress').count(),0);}
   else {assert.match(await section.innerText(),/Не удалось загрузить сборы/);assert.match(await section.innerText(),/Не удалось загрузить список/);assert.doesNotMatch(await section.innerText(),/взносов через сайт нет/);}
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   await page.addScriptTag({content:await fs.readFile('../tmp/axe.min.js','utf8')});
   const axe=await page.evaluate(async()=> (await window.axe.run(document.querySelector('.pet-support__community'),{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}})).violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)})));
   assert.deepEqual(axe,[]);await section.screenshot({path:`${out}/community-${state}-${width}.png`});
   // No related animals: the rounded footer must also have continuous paper here.
   assert.equal(await page.locator('.pet-profile__related').count(),0);
   if(state==='ready'){
    await page.evaluate(()=>{const footer=document.querySelector('footer');window.scrollTo({top:scrollY+footer.getBoundingClientRect().top-100,behavior:'instant'});});
    assert.equal(await page.locator('footer').evaluate(e=>getComputedStyle(e).backgroundColor),'rgb(245, 160, 8)');
    await page.waitForTimeout(250);
    await page.screenshot({path:`${out}/footer-no-related-${width}.png`});
   }
   report.push({state,width,axe});
  }
 }
 assert.ok(calls.some(path=>path.startsWith('/api/donations?')&&path.includes('filters[$or][1][campaign][pet][documentId][$eq]=qa-ready')));
 await fs.writeFile(out+'/community-states.json',JSON.stringify({report,isolated:true},null,2));console.log(JSON.stringify(report));
}catch(error){await fs.writeFile(out+'/community-failure.log',logs);throw error;}finally{await browser.close();server.kill();await new Promise(resolve=>proxy.close(resolve));}
