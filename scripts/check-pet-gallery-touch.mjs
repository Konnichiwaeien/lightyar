import {chromium} from 'playwright-core';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const b=await chromium.launch({channel:'chrome',headless:true});
const p=await b.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
const errors=[];p.on('pageerror',e=>errors.push(e.message));
try{
 await p.goto('http://localhost:3000/pets/uvpj4x6wdj2urazegzoxcqtf',{waitUntil:'domcontentloaded'});
 await p.locator('.swiper-initialized').waitFor();await p.locator('.pet-gallery__stage').scrollIntoViewIfNeeded();
 const rect=await p.locator('.pet-gallery__stage').boundingBox();const cdp=await p.context().newCDPSession(p);const y=rect.y+rect.height*.45;
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:rect.x+rect.width*.85,y}]});
 for(let i=1;i<=12;i++){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:rect.x+rect.width*(.85-.7*i/12),y}]});await p.waitForTimeout(16);}
 await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await p.waitForTimeout(400);
 assert.match(await p.locator('.pet-gallery__image').getAttribute('alt'),/Фото 2/);
 const opacity=await p.evaluate(async()=>{
  document.querySelector('.pet-gallery__expand').click();const values=[];const start=performance.now();
  while(performance.now()-start<400){await new Promise(requestAnimationFrame);const viewer=document.querySelector('.pet-gallery__viewer');values.push(viewer?Number(getComputedStyle(viewer).opacity):0);}return values;
 });
 assert.ok(opacity.some(v=>v>0&&v<1));
 await p.addScriptTag({content:await fs.readFile('../tmp/axe.min.js','utf8')});
 const axe=await p.evaluate(async()=>(await window.axe.run(document.querySelector('dialog'),{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}})).violations.map(v=>v.id));assert.deepEqual(axe,[]);
 for(let i=0;i<6;i++){await p.keyboard.press('Tab');assert.equal(await p.evaluate(()=>document.querySelector('dialog').contains(document.activeElement)),true);}
 for(let i=0;i<6;i++){await p.keyboard.press('Shift+Tab');assert.equal(await p.evaluate(()=>document.querySelector('dialog').contains(document.activeElement)),true);}
 await p.screenshot({path:'../tmp/pet-profile-motion/modal-touch.png'});
 await p.keyboard.press('Escape');await p.locator('dialog').waitFor({state:'hidden'});
 assert.equal(await p.locator('.pet-gallery__expand').evaluate(e=>e===document.activeElement),true);
 assert.deepEqual(errors,[]);
 await fs.writeFile('../tmp/pet-profile-motion/touch.json',JSON.stringify({touch:'passed',focusTrap:'passed',openingOpacity:opacity,modalAxe:axe,errors},null,2));
 console.log('Real touch swipe, modal entry, bidirectional focus trap and axe: passed');
}finally{await b.close();}
