import { chromium } from 'playwright-core';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const base=process.argv[2]||'http://localhost:3000';
const id='uvpj4x6wdj2urazegzoxcqtf';const out=process.env.PET_SUPPORT_OUTPUT||'../tmp/pet-support-qa';await fs.mkdir(out,{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true});const report=[];
try{
 const page=await browser.newPage();const errors=[];const writes=[];page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(r.method()==='POST')writes.push(r.url())});
 for(const width of[320,390,768,1024,1440,1920,2560]){
  await page.setViewportSize({width,height:1000});await page.goto(`${base}/pets/${id}`,{waitUntil:'domcontentloaded',timeout:60000});await page.locator('#help-pet').waitFor();
  await page.locator('#help-pet .donation-tier:has(input[value="300"])').click();await page.locator('#help-pet .donation-tier:has(input[value="500"])').click();await page.evaluate(()=>document.fonts.ready);
  await page.waitForFunction(()=>{const photo=document.querySelector('.pet-gallery__image');return photo?.complete && photo.naturalWidth>0},{},{timeout:30000});
  await page.locator('.pet-profile__hero').screenshot({path:`${out}/hero-${width}.png`});await page.locator('#help-pet').scrollIntoViewIfNeeded();await page.waitForFunction(()=>[...document.querySelectorAll('#help-pet img')].every(img=>img.complete&&img.naturalWidth>0),null,{timeout:60000});await page.locator('#help-pet').screenshot({path:`${out}/support-${width}.png`});
  const geometry=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,form:document.querySelector('.pet-support__form').getBoundingClientRect().width,paymentNotice:getComputedStyle(document.querySelector('#help-pet .donation-provider-button__copy small')).display}));assert.ok(geometry.scroll<=width,`Overflow ${width}`);assert.notEqual(geometry.paymentNotice,'none');
  await page.addScriptTag({content:await fs.readFile('../tmp/axe.min.js','utf8')});geometry.axe=await page.evaluate(async()=>{const r=await axe.run(document.querySelector('#help-pet'),{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}});return r.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}))});report.push(geometry);
 }
 const section=page.locator('#help-pet');assert.equal(await section.locator('[name=donationTargetKind]').inputValue(),'pet');assert.equal(await section.locator('[name=donationTargetId]').inputValue(),id);assert.equal(await section.getByRole('button',{name:'Убрать назначение взноса'}).count(),0);
 await section.locator('.donation-tier:has(input[value="1000"])').click();assert.match(await section.locator('.donation-provider-button').innerText(),/1\s000/);
 await section.getByRole('spinbutton').fill('49');await section.getByRole('spinbutton').blur();assert.match(await section.innerText(),/Минимальная сумма/);
 await section.getByRole('spinbutton').fill('750');await section.getByRole('spinbutton').blur();assert.match(await section.locator('.donation-provider-button').innerText(),/750/);
 await section.locator('.donation-cadence__options label[data-cadence=monthly]').click();assert.equal(await section.locator('[name=donation-cadence]:checked').inputValue(),'monthly');
 await section.getByText('Анонимная помощь',{exact:true}).click();await section.locator('[name=donorName]').waitFor({state:'detached'});assert.equal(await section.locator('[name=donorName]').count(),0);await section.getByText('Анонимная помощь',{exact:true}).click();assert.equal(await section.locator('[name=donorName]').count(),1);
 await page.evaluate(()=>dispatchEvent(new CustomEvent('lightyar:donation-intent',{detail:{kind:'campaign',id:'other-target',title:'Other',amount:3000}})));assert.equal(await section.locator('[name=donationTargetId]').inputValue(),id);assert.equal(await section.locator('.donation-provider-button').isDisabled(),true);assert.deepEqual(writes,[]);
 await page.goto(`${base}/pets/${id}`,{waitUntil:'networkidle'});await page.locator('#pet-name:visible').waitFor();await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await page.waitForFunction(()=>scrollY<1);await page.locator('a[href="#help-pet"]').click();await page.waitForTimeout(100);const mid=await page.evaluate(()=>scrollY);await page.waitForTimeout(1600);const end=await page.evaluate(()=>scrollY);assert.ok(end>mid+50,`Help anchor must animate: ${mid} -> ${end}`);assert.ok(mid>0);
 await page.goto(`${base}/pets/v1z7kkj01b7ch2tl5u6s1o1j`,{waitUntil:'networkidle'});assert.match(await page.locator('#help-pet').innerText(),/уже дома/);assert.equal(await page.locator('#help-pet [name=donationTargetId]').inputValue(),'v1z7kkj01b7ch2tl5u6s1o1j');
 await page.emulateMedia({reducedMotion:'reduce'});assert.equal(await section.locator('.donation-provider-button').evaluate(e=>getComputedStyle(e,'::before').display),'none');
 await fs.writeFile(out+'/report.json',JSON.stringify({report,errors,writes,interactions:'passed'},null,2));console.log(JSON.stringify({report,errors,writes,interactions:'passed'},null,2));assert.deepEqual(errors,[]);assert.ok(report.every(r=>r.axe.length===0),'Axe violations');
}finally{await browser.close()}
