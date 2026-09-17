import {chromium} from 'playwright-core';
import {createServer} from 'node:http';
import {spawn} from 'node:child_process';
import {createRequire} from 'node:module';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url);
require('@next/env').loadEnvConfig(process.cwd(),true,{info(){},error:console.error});
const upstream=(process.env.STRAPI_API_URL||'http://localhost:1443/api').replace(/\/api\/?$/,'');
const out='../tmp/pets-loading-qa';await fs.mkdir(out,{recursive:true});
let release;let hold=Promise.resolve();
const proxy=createServer(async(req,res)=>{
 try{
  if(req.url.startsWith('/api/pets?'))await hold;
  const response=await fetch(upstream+req.url,{headers:req.headers.authorization?{Authorization:req.headers.authorization}:{}});
  res.writeHead(response.status,{'Content-Type':response.headers.get('content-type')||'application/json'});res.end(Buffer.from(await response.arrayBuffer()));
 }catch{res.writeHead(502);res.end();}
});
await new Promise(resolve=>proxy.listen(1456,'127.0.0.1',resolve));
const server=spawn(process.execPath,['node_modules/next/dist/bin/next','start','-p','3003'],{cwd:process.cwd(),env:{...process.env,STRAPI_API_URL:'http://127.0.0.1:1456/api'},stdio:['ignore','pipe','pipe'],windowsHide:true});
const browser=await chromium.launch({channel:'chrome',headless:true});
const report=[];
try{
 await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('Server did not start')),15000);server.stdout.on('data',chunk=>{if(chunk.toString().includes('Ready')){clearTimeout(timer);resolve();}});server.on('exit',code=>reject(Error('Server exited '+code)));});
 for(const width of [320,390,600,768,1024,1280,1366,1440,1920,2560]){
  hold=new Promise(resolve=>{release=resolve;});
  const page=await browser.newPage({viewport:{width,height:900},reducedMotion:width===2560?'reduce':'no-preference'});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(`http://localhost:3003/pets?search=loading-${width}-${Date.now()}`,{waitUntil:'commit'});
  const loading=page.locator('[data-pets-loading]');await loading.waitFor();
  await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(250);
  const heroHeight=await page.locator('.pets-cover').evaluate(e=>e.getBoundingClientRect().height);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  assert.equal(await page.locator('.pets-skeleton-card').count(),12);
  const columns=await page.locator('.pets-skeleton-grid').evaluate(e=>getComputedStyle(e).gridTemplateColumns.split(' ').length);
  assert.equal(columns,width<600?1:width<1000?2:3);
  if(width<=700){assert.equal(await page.locator('.pets-skeleton-controls__fields').isVisible(),false);assert.ok((await page.locator('.pets-controls').boundingBox()).height<230);}
  if(width===2560)assert.equal(await page.locator('.pets-skeleton__block').first().evaluate(e=>getComputedStyle(e).animationName),'none');
  await page.screenshot({path:`${out}/hero-${width}.png`});
  await page.locator('#pets-catalog').evaluate(e=>window.scrollTo({top:e.getBoundingClientRect().top+scrollY-24,behavior:'instant'}));
  await page.waitForTimeout(100);await page.screenshot({path:`${out}/catalog-${width}.png`});
  if([320,390,1440].includes(width)){
   await page.addScriptTag({content:await fs.readFile('../tmp/axe.min.js','utf8')});
   const issues=await page.evaluate(async()=>{const r=await axe.run(document.querySelector('main'),{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}});return r.violations.map(v=>v.id);});assert.deepEqual(issues,[]);
  }
  release();await loading.waitFor({state:'detached'});await page.waitForLoadState('networkidle');
  assert.equal(await page.locator('.pets-cover').evaluate(e=>e.getBoundingClientRect().height),heroHeight);
  assert.deepEqual(errors,[]);report.push({width,columns,heroHeight,errors});console.log('PASS loading -> loaded',width);
  await fs.writeFile(`${out}/report.json`,JSON.stringify(report,null,2));await page.close();
 }
}finally{release?.();await browser.close();server.kill();proxy.closeAllConnections();await new Promise(resolve=>proxy.close(resolve));}
