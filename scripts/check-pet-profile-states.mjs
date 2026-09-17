import { chromium } from 'playwright-core';
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import nextEnv from '@next/env';
nextEnv.loadEnvConfig(process.cwd());
const out=process.env.PET_PROFILE_OUTPUT||'../tmp/pet-detail-redesign';
await fs.mkdir(out,{recursive:true});
const run=Date.now();const emptyId=`qa-empty-profile-${run}`;const loadingId=`qa-loading-profile-${run}`;
const response=await fetch((process.env.STRAPI_API_URL||'http://localhost:1443/api')+'/pets/uvpj4x6wdj2urazegzoxcqtf?populate=*',{headers:{Authorization:'Bearer '+(process.env.STRAPI_READ_TOKEN||process.env.REST_API_KEY||'')}});
assert.ok(response.ok,'Representative pet must be available before isolated state tests');
const real=(await response.json()).data;
const blank={id:999,documentId:'qa-empty-profile',name:'Маленькие друзья приюта',type:'cat',sex:'unknown',petStatus:'shelter',photos:[]};
let release;const hold=new Promise(resolve=>release=resolve);let outage=true;
const proxy=createServer(async(req,res)=>{
 if(req.url.includes('qa-missing-profile')){res.writeHead(404,{'content-type':'application/json'});res.end(JSON.stringify({data:null,error:{status:404,name:'NotFoundError',message:'Not Found'}}));return}
 if(req.url.includes('qa-loading-profile'))await hold;
 if(req.url.includes('qa-error-profile')&&outage){res.writeHead(503,{'content-type':'application/json'});res.end('{}');return}
 res.writeHead(200,{'content-type':'application/json'});
 res.end(JSON.stringify({data:req.url.startsWith('/api/pets?')?[{...real,documentId:loadingId}]:req.url.includes('qa-empty-profile')?{...blank,documentId:emptyId}:{...real,documentId:loadingId},meta:{pagination:{total:1}}}));
});
await new Promise(resolve=>proxy.listen(1457,'127.0.0.1',resolve));
const server=spawn(process.execPath,['node_modules/next/dist/bin/next','start','-p','3004'],{cwd:process.cwd(),env:{...process.env,STRAPI_API_URL:'http://127.0.0.1:1457/api'},stdio:['ignore','pipe','pipe'],windowsHide:true});
let logs='';server.stdout.on('data',d=>logs+=d);server.stderr.on('data',d=>logs+=d);
const browser=await chromium.launch({channel:'chrome',headless:true});
try{
 for(let i=0;i<40&&!logs.includes('Ready');i++)await new Promise(r=>setTimeout(r,250));
 const page=await browser.newPage({viewport:{width:390,height:844}});
 await page.goto('http://localhost:3004/pets/qa-missing-profile-'+run,{waitUntil:'networkidle'});assert.match(await page.locator('h1').innerText(),/не найден/);
 await page.goto('http://localhost:3004/pets/'+emptyId,{waitUntil:'networkidle'});
 assert.match(await page.locator('main').innerText(),/Возраст уточняется/);assert.equal(await page.locator('.pet-profile__ratings').count(),0);assert.equal(await page.locator('.pet-gallery__expand').count(),0);assert.equal(await page.locator('.pet-gallery__empty:visible').count(),1);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await page.screenshot({path:out+'/state-empty-mobile.png',fullPage:true});
 await page.goto('http://localhost:3004/pets/'+loadingId,{waitUntil:'commit'});
 await page.locator('main[aria-busy=true]').waitFor();await page.screenshot({path:out+'/state-loading-390.png'});
 await page.setViewportSize({width:1440,height:1000});await page.screenshot({path:out+'/state-loading-1440.png'});release();await page.locator('#pet-name:visible').waitFor();await page.setViewportSize({width:390,height:844});
 await page.goto('http://localhost:3004/pets/qa-error-profile-'+run,{waitUntil:'networkidle'});if(!await page.locator('h1').count())throw new Error('Missing retry state');assert.match(await page.locator('h1').innerText(),/Не удалось загрузить страницу/);await page.screenshot({path:out+'/state-error-mobile.png'});outage=false;await page.getByRole('button',{name:'Попробовать снова'}).click();await page.locator('#pet-name:visible').waitFor();assert.equal(await page.locator('#pet-name:visible').innerText(),real.name);
 await page.goto('http://localhost:3003/pets/v1z7kkj01b7ch2tl5u6s1o1j',{waitUntil:'networkidle'});assert.equal(await page.locator('#meet-pet').count(),0);assert.match(await page.locator('.pet-profile__status').innerText(),/Уже дома/);await page.screenshot({path:out+'/state-home-mobile.png'});
 await page.goto('http://localhost:3003/pets/uvpj4x6wdj2urazegzoxcqtf',{waitUntil:'networkidle'});
 await page.locator('.pet-gallery__stage').evaluate(target=>{target.dispatchEvent(new TouchEvent('touchstart',{bubbles:true,touches:[new Touch({identifier:0,target,clientX:250,clientY:300})]}));target.dispatchEvent(new TouchEvent('touchend',{bubbles:true,changedTouches:[new Touch({identifier:0,target,clientX:80,clientY:300})]}));});assert.match(await page.locator('.pet-gallery__image').getAttribute('alt'),/Фото 2/);
 await page.getByRole('button',{name:'Открыть фото целиком'}).click();await page.addScriptTag({content:await fs.readFile('../tmp/axe.min.js','utf8')});const violations=await page.evaluate(async()=>{const r=await axe.run(document.querySelector('dialog'),{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}});return r.violations.map(v=>v.id)});assert.deepEqual(violations,[]);await page.screenshot({path:out+'/gallery-mobile.png'});
 await fs.writeFile(out+'/states.json',JSON.stringify({empty:'passed',loading:'passed (real route with delayed CMS)',error:'passed',retry:'passed',home:'passed',swipe:'passed',dialogAxe:violations},null,2));console.log('Empty, loading, error, retry, home, swipe, modal axe: passed');
}catch(error){await fs.writeFile(out+'/states-failure.txt',logs);throw error}finally{release();await browser.close();server.kill();await new Promise(resolve=>proxy.close(resolve));}
