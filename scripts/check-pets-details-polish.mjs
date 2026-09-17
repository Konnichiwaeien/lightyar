import {chromium} from 'playwright-core';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const out='../tmp/pets-details-polish';
await fs.mkdir(out,{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true});
const report=[];
try {
  for(const [width,height,dpr] of [[320,740,2],[390,844,3],[600,960,2],[768,1024,2],[1024,768,1],[1280,800,1],[1366,768,1],[1440,900,1],[1920,1080,1],[2560,1440,1]]){
    if(process.argv.length>3&&!process.argv.slice(3).map(Number).includes(width))continue;
    const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:dpr,isMobile:width<600,hasTouch:width<600});
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.goto((process.argv[2]||'http://localhost:3000')+'/pets',{waitUntil:'networkidle'});
    await page.evaluate(()=>document.fonts.ready);
    await page.waitForTimeout(1100);
    await page.locator('.pets-cover').screenshot({path:`${out}/hero-${width}.png`});
    if(width===1440){
      const cta=page.locator('.pets-cover .pets-button');const initialWidth=await cta.evaluate(e=>getComputedStyle(e).width);
      await cta.hover();await page.waitForTimeout(240);
      assert.equal(await cta.evaluate(e=>getComputedStyle(e).backgroundColor),'rgb(255, 255, 255)');
      assert.equal(await cta.evaluate(e=>getComputedStyle(e).width),initialWidth);
      await cta.screenshot({path:`${out}/hero-button-hover.png`});
      await page.keyboard.press('Tab');await cta.focus();
      assert.notEqual(await cta.evaluate(e=>getComputedStyle(e).outlineStyle),'none');
      await cta.screenshot({path:`${out}/hero-button-focus.png`});
      await cta.hover();await page.mouse.down();await page.waitForTimeout(150);
      assert.match(await cta.evaluate(e=>getComputedStyle(e).transform),/0\.96/);
      await cta.screenshot({path:`${out}/hero-button-pressed.png`});
      await page.mouse.move(0,0);await page.mouse.up();
    }
    const images=await page.locator('.pets-cover img').evaluateAll(es=>es.filter(e=>getComputedStyle(e).display!=='none').map(e=>({src:e.currentSrc,width:e.clientWidth,complete:e.complete,naturalWidth:e.naturalWidth,sizes:e.sizes})));
    assert.ok(images.every(e=>e.complete&&e.naturalWidth));
    const search=page.locator('.pets-search');
    await search.scrollIntoViewIfNeeded();
    const button=search.locator('[type=submit]');
    assert.equal(await button.locator('svg').count(),1);
    await search.screenshot({path:`${out}/search-${width}.png`});
    await page.locator('#pet-search').fill('Альма');
    await search.screenshot({path:`${out}/search-filled-${width}.png`});
    const originalWidth=await button.evaluate(e=>getComputedStyle(e).width);
    if(width>=1024){
      await button.hover();await page.waitForTimeout(230);
      assert.equal(await button.evaluate(e=>getComputedStyle(e).backgroundColor),'rgb(245, 158, 11)');
      assert.equal(await button.evaluate(e=>getComputedStyle(e).color),'rgb(36, 35, 31)');
      assert.equal(await button.evaluate(e=>getComputedStyle(e).width),originalWidth);
      await search.screenshot({path:`${out}/search-hover-${width}.png`});
    }
    await page.keyboard.press('Tab');await button.focus();
    assert.notEqual(await button.evaluate(e=>getComputedStyle(e).outlineStyle),'none');
    await search.screenshot({path:`${out}/search-focus-${width}.png`});
    for(const section of ['pets-help','pets-meeting']){
      const el=page.locator('.'+section);await el.scrollIntoViewIfNeeded();
      await el.locator('img').evaluate(e=>e.decode());
      await el.screenshot({path:`${out}/${section}-${width}.png`});
    }
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
    assert.equal(overflow,false);
    let axe=[];
    if([320,390,1440].includes(width)){
      await page.addScriptTag({content:await fs.readFile('../tmp/axe.min.js','utf8')});
      axe=await page.evaluate(async()=>{const r=await window.axe.run(document.querySelector('main'),{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}});return r.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}));});
      assert.deepEqual(axe,[]);
    }
    assert.deepEqual(errors,[]);
    report.push({width,height,dpr,images,overflow,axe,errors});
    await fs.writeFile(`${out}/${process.argv.length>3?'recheck':'report'}.json`,JSON.stringify(report,null,2));
    console.log(`PASS ${width} DPR ${dpr}`);await page.close();
  }
}finally{await browser.close();}
