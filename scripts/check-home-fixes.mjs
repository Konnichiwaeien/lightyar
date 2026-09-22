import { chromium } from 'playwright-core';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const out = '../tmp/home-fixes-2026-09-18';
await fs.mkdir(out,{recursive:true});
const browser = await chromium.launch({channel:'chrome',headless:true});
const report=[];
const base=process.argv[2] || 'http://localhost:3000';
const scrollTo = async(page,selector,end=false)=>{
  await page.locator(selector).evaluate((e,end)=>window.scrollTo({top:Math.max(0,e.getBoundingClientRect().top+scrollY+(end?e.clientHeight-innerHeight-4:0)),behavior:'instant'}),end);
  await page.waitForTimeout(700);
};
try {
for(const width of [320,390,768,1024,1440,1920,2560]) {
  const page=await browser.newPage({viewport:{width,height:width<600?844:1080},hasTouch:width<600,isMobile:width<600});
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('console',m=>{if(m.type()==='error'&&/hydration|hydrated/i.test(m.text()))errors.push(m.text().slice(0,200));});
  await page.goto(base,{waitUntil:'load',timeout:120000});
  await page.locator('[data-ring-hydrated]').waitFor();
  await page.evaluate(()=>document.fonts.ready);
  await page.addStyleTag({content:'nextjs-portal{display:none!important}'});
  await scrollTo(page,'#rescued',width>1180);
  await page.screenshot({caret:'initial',path:`${out}/home-ring-${width}.png`});
  if(width<600) await page.locator('#rescued').screenshot({caret:'initial',path:`${out}/home-ring-full-${width}.png`});
  const ring=await page.locator('#rescued').evaluate(e=>({overflow:document.documentElement.scrollWidth>innerWidth,numbers:[...e.querySelectorAll('.ring-mark__value')].map(n=>n.textContent),font:parseFloat(getComputedStyle(e.querySelector('.ring-foot')).fontSize),portraits:[...e.querySelectorAll('.ring-portrait')].filter(n=>getComputedStyle(n).display!=='none').length}));
  assert.equal(ring.overflow,false,`overflow ${width}`);
  assert.ok(ring.numbers.every(n=>Number(n)>0),`numbers ${width}`);
  // Rescued ring restored to its original responsive layout on 2026-09-21.
  await scrollTo(page,'.wishlist-scene');
  await page.locator('.wishlist-scene[data-visible="true"]').waitFor();
  const before=await page.locator('.wishlist-orbit__slot').first().evaluate(e=>getComputedStyle(e).transform);
  await page.waitForTimeout(500);
  const after=await page.locator('.wishlist-orbit__slot').first().evaluate(e=>getComputedStyle(e).transform);
  assert.notEqual(before,after,`orbit ${width}`);
  await page.screenshot({caret:'initial',path:`${out}/wishlist-${width}.png`});
  const videoPaused=await page.locator('video').first().evaluate(e=>e.paused);
  assert.ok(videoPaused,'offscreen hero video must pause');
  await scrollTo(page,'#campaigns');
  for (const img of await page.locator('#campaigns img').all()) {
    await img.scrollIntoViewIfNeeded();
    await img.evaluate(e=>e.complete&&e.naturalWidth>0?Promise.resolve():new Promise(resolve=>e.addEventListener('load',resolve,{once:true})));
  }
  await page.waitForFunction(()=>[...document.querySelectorAll('#campaigns img')].every(e=>e.complete&&e.naturalWidth>0),{},{timeout:30000});
  await scrollTo(page,'#campaigns');
  await page.screenshot({caret:'initial',path:`${out}/campaigns-${width}.png`});
  const covers=await page.locator('#campaigns img').evaluateAll(es=>es.map(e=>({src:e.currentSrc,ok:e.naturalWidth>0})));
  const newsHref=await page.locator('a[href^="/news/"]').first().getAttribute('href');
  const campaignLink=page.locator('#campaigns a[href^="/campaigns/"]').first();
  await campaignLink.click();
  await page.waitForURL('**/campaigns/*');
  await page.waitForTimeout(700);
  const navigationY=await page.evaluate(()=>scrollY);
  assert.ok(navigationY<5,`campaign navigation retains ${navigationY}px at ${width}`);
  await page.screenshot({caret:'initial',path:`${out}/campaign-detail-${width}.png`});
  await page.goto(base+newsHref,{waitUntil:'load'});
  await page.addStyleTag({content:'nextjs-portal{display:none!important}'});
  await page.evaluate(()=>document.fonts.ready);
  await page.locator('.news-slider-shell').scrollIntoViewIfNeeded();
  await page.waitForTimeout(900);
  const pagination=await page.locator('.news-slider-shell').evaluate(e=>{const s=e.getBoundingClientRect(),p=e.querySelector('.swiper-pagination')?.getBoundingClientRect();return p?{sliderBottom:s.bottom,paginationBottom:p.bottom,paginationTop:p.top,sliderTop:s.top}:null;});
  assert.ok(pagination&&pagination.paginationTop>(pagination.sliderTop+pagination.sliderBottom)/2);
  await page.screenshot({caret:'initial',path:`${out}/news-slider-${width}.png`});
  const news=await page.locator('article').evaluate(e=>({title:e.querySelector('h1').textContent.trim(),body:e.querySelector('.news-article-content').textContent.trim(),lead:e.querySelector('.news-article-lead')?.textContent.trim()}));
  assert.ok(!news.body.startsWith(news.title),'duplicate news opening');
  assert.ok(!news.lead?.startsWith(news.title),'duplicate news lead');
  await page.goto(base+'/pets',{waitUntil:'load'});
  await page.addStyleTag({content:'nextjs-portal{display:none!important}'});
  await page.evaluate(()=>document.fonts.ready);
  await page.screenshot({caret:'initial',path:`${out}/pets-${width}.png`});
  const hero=await page.locator('.pets-cover').evaluate(e=>[...e.querySelectorAll('.pets-cover__copy,.pets-cover__animal')].map(n=>({opacity:getComputedStyle(n).opacity,animation:getComputedStyle(n).animationName})));
  assert.ok(hero.every(x=>x.opacity==='1'&&x.animation==='none'));
  assert.ok(await page.locator('link[rel="icon"]').count());
  assert.ok(await page.locator('link[rel="apple-touch-icon"]').count());
  report.push({width,ring,navigationY,videoPaused,covers,pagination,news,errors});
  console.log(`PASS ${width}px: layout, orbit, covers, scroll reset, news, pets, icons; errors=${errors.length}`);
  await page.close();
}
}finally{await fs.writeFile(`${out}/browser-report.json`,JSON.stringify(report,null,2));await browser.close();}
