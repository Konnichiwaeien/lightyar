import {chromium} from 'playwright-core';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'chrome',headless:true});
const result=[];
for(const width of [390,1440]){
 const context=await browser.newContext({viewport:{width,height:900}});
 const p=await context.newPage();
 await p.addInitScript(()=>{window.__metrics={lcp:0,cls:0};new PerformanceObserver(list=>{for(const e of list.getEntries())window.__metrics.lcp=e.startTime;}).observe({type:'largest-contentful-paint',buffered:true});new PerformanceObserver(list=>{for(const e of list.getEntries())if(!e.hadRecentInput)window.__metrics.cls+=e.value;}).observe({type:'layout-shift',buffered:true});});
 const response=await p.goto(`${process.argv[2] || 'http://localhost:3002'}/pets`,{waitUntil:'networkidle'});
 await p.evaluate(()=>document.fonts.ready);
 const metrics=await p.evaluate(()=>{const n=performance.getEntriesByType('navigation')[0];const r=performance.getEntriesByType('resource');return {...window.__metrics,ttfb:n.responseStart,domContentLoaded:n.domContentLoadedEventEnd,requests:r.length,scripts:r.filter(x=>x.initiatorType==='script').length,scriptTransfer:r.filter(x=>x.initiatorType==='script').reduce((n,x)=>n+x.transferSize,0),quizRequested:r.some(x=>x.name.includes('/api/pets/quiz')),videos:document.querySelectorAll('video').length};});
 const html=await response.text();
 assert.equal(metrics.quizRequested,false);assert.equal(metrics.videos,0);
 metrics.htmlBytes=Buffer.byteLength(html);metrics.width=width;
 await p.keyboard.press('Tab');
 assert.match(await p.evaluate(()=>document.activeElement.textContent),/Перейти/);
 await p.keyboard.press('Enter');
 assert.equal(await p.evaluate(()=>document.activeElement.id),'main-content');
 result.push(metrics);
 await context.close();
}
await fs.writeFile('../tmp/pets-qa/performance.json',JSON.stringify({environment:'Local production build; no CPU/network throttling; browser cold context, server cache warm. Not field CWV.',results:result},null,2));
await browser.close();console.log(result);
