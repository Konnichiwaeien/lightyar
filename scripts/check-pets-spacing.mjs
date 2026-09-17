import {chromium} from 'playwright-core';
import fs from 'node:fs/promises';
import sharp from 'sharp';
import assert from 'node:assert/strict';
const base=process.argv[2]||'http://localhost:3000';
const out='../tmp/pets-spacing-qa';await fs.mkdir(out,{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true});const report=[];
try{
 const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 for(const width of [320,390,600,768,1024,1280,1366,1440,1920,2560]){
  await page.setViewportSize({width,height:1000});await page.goto(base+'/pets',{waitUntil:'networkidle'});await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(850);
  const intro=await page.locator('.pets-cover__intro').innerText();assert.match(intro,/Они ждут своих людей/);
  await page.locator('.pets-cover').screenshot({path:`${out}/hero-${width}.png`});
  await page.locator('#pets-catalog').evaluate(e=>window.scrollTo({top:e.getBoundingClientRect().top+scrollY-24,behavior:'instant'}));await page.waitForTimeout(220);await page.screenshot({path:`${out}/catalog-${width}.png`});
  await page.locator('.pets-pagination').scrollIntoViewIfNeeded();await page.waitForTimeout(220);await page.screenshot({path:`${out}/pagination-${width}.png`});
  for(const name of ['pets-help','pets-meeting']){const section=page.locator('.'+name);await section.scrollIntoViewIfNeeded();await section.locator('img').evaluateAll(es=>Promise.all(es.map(e=>e.decode().catch(()=>{}))));await section.screenshot({path:`${out}/${name}-${width}.png`});}
  const geometry=await page.evaluate(()=>{
   const gap=(a,b)=>document.querySelector(b).getBoundingClientRect().top-document.querySelector(a).getBoundingClientRect().bottom;
   const pad=s=>{const cs=getComputedStyle(document.querySelector(s));return[parseFloat(cs.paddingTop),parseFloat(cs.paddingBottom)];};
   const rect=s=>{const r=document.querySelector(s).getBoundingClientRect();return{x:r.x,y:r.y,w:r.width,bottom:r.bottom};};
   return{width:innerWidth,scroll:document.documentElement.scrollWidth,catalog:pad('.pets-catalog'),help:pad('.pets-help'),meeting:pad('.pets-meeting'),gridGap:parseFloat(getComputedStyle(document.querySelector('.pets-grid')).rowGap),controlsToCards:gap('.pets-controls','.pets-grid'),gridToPagination:gap('.pets-grid','.pets-pagination'),helpHeadingToText:gap('.pets-help h2','.pets-help p'),helpTextToButton:gap('.pets-help p','.pets-quiz-trigger'),meetingHeadingToText:gap('.pets-meeting h2','.pets-meeting p'),meetingTextToButton:gap('.pets-meeting p','.pets-meeting__button'),button:rect('.pets-cover .pets-button'),noteCount:document.querySelectorAll('.pets-cover__note').length};
  });
  assert.ok(geometry.scroll<=width);for(const key of ['catalog','help','meeting'])assert.equal(geometry[key][0],geometry[key][1]);
  assert.equal(geometry.help[0],geometry.meeting[0]);assert.equal(geometry.controlsToCards,width<=700?24:32);assert.equal(geometry.gridToPagination,32);
  assert.equal(geometry.noteCount,0,'Decorative caption was removed');
  for(const key of ['helpHeadingToText','helpTextToButton','meetingHeadingToText','meetingTextToButton'])assert.ok(Math.abs(geometry[key]-(width<=700?20:24))<1,`${width} ${key}: ${geometry[key]}`);
  if([320,390,1440].includes(width)){
   await page.addScriptTag({content:await fs.readFile('../tmp/axe.min.js','utf8')});const violations=await page.evaluate(async()=>{const r=await axe.run(document.querySelector('main'),{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}});return r.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}));});assert.deepEqual(violations,[]);
  }
  assert.deepEqual(errors,[]);report.push(geometry);await fs.writeFile(`${out}/report.json`,JSON.stringify(report,null,2));console.log('PASS',width);
 }
 for(const [i,widths]of [[320,390,600,768,1024],[1280,1366,1440,1920,2560]].entries()){
  const panels=[];let y=0;
  for(const name of ['hero','catalog','pagination','pets-help','pets-meeting']){
   let max=0;
   for(const [j,w]of widths.entries()){
    panels.push({input:Buffer.from(`<svg width="320" height="26"><text x="8" y="19" font-size="15">${w}px / ${name}</text></svg>`),top:y,left:j*330});
    const {data,info}=await sharp(`${out}/${name}-${w}.png`).resize(320).png().toBuffer({resolveWithObject:true});panels.push({input:data,top:y+28,left:j*330});max=Math.max(max,info.height);
   }y+=max+44;
  }
  await sharp({create:{width:1640,height:y,channels:3,background:'#ded7cb'}}).composite(panels).png().toFile(`${out}/review-${i}.png`);
 }
}finally{await browser.close();}
