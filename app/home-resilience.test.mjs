import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import test from 'node:test';
import assert from 'node:assert/strict';

const code = ts.transpileModule(fs.readFileSync(new URL('./page.tsx', import.meta.url), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
}).outputText;
function loadHome(failing, delays = {}) {
  const started = [];
  const source = (key, value) => async () => {
    started.push(key);
    if (delays[key]) await delays[key];
    if (failing === key) throw Error('Injected outage');
    return value;
  };
  const api = {
    newsService: { getLatestNews: source('news', [{title:'News'}]) },
    petsService: { getPets: source('pets', [{id:'pet',name:'Dog'}]) },
    campaignsService: { getCampaigns: source('campaigns', {data:[{title:'Campaign'}]}) },
    donationsService: { getRecentDonations: source('donations', {status:'ready',donations:[]}) },
    siteMediaService: { getSiteMedia: source('media', {heroVideo:'hero.mp4'}) },
    wishlistService: { getItems: source('gifts',[{title:'Food'}]), getSettings: source('settings',{marketplaceName:'Ozon'}) },
    petStatsService: { getPetStats: source('stats',{total:79,dogs:70,cats:9,inCare:72}) },
    EMPTY_PET_STATS: {total:0,dogs:0,cats:0,inCare:0},
    normalizePetData:x=>x, normalizeCampaignData:x=>x,
  };
  const loaded = {exports:{}};
  vm.runInNewContext(code, {exports:loaded.exports,console:{error(){}}, require(name){
    if(name==='react/jsx-runtime')return {jsx:(type,props)=>({type,props}),jsxs:(type,props)=>({type,props}),Fragment:'Fragment'};
    return new Proxy(api,{get:(obj,key)=>key in obj?obj[key]:String(key)});
  }});
  return { home: loaded.exports.default, started };
}
async function collect(tree) {
  const nodes = {};
  async function visit(node) {
    if (!node || typeof node !== 'object') return;
    if (typeof node.type === 'function') { await visit(await node.type(node.props)); return; }
    if(node.type) nodes[node.type]=node.props;
    // Fallbacks are not part of the successfully resolved tree.
    await Promise.all(Object.entries(node).filter(([key])=>key!=='fallback').map(async ([, value])=>
      Array.isArray(value) ? Promise.all(value.map(visit)) : visit(value)));
  }
  await visit(tree); return nodes;
}
async function render(failing) {
  return collect(await loadHome(failing).home());
}
test('a news outage preserves independently loaded homepage sections', async()=>{
  const nodes=await render('news');
  assert.equal(nodes.HeroSection.videoUrl,'hero.mp4');
  assert.equal(nodes.AboutSection.total,79);
  assert.equal(nodes.DogsStoriesSection.initialPets.length,1);
  assert.equal(nodes.CampaignsSection.initialCampaigns.length,1);
  assert.equal(nodes.NeedsSection.items.length,1);
  assert.equal(nodes.NewsSection.unavailable,true);
});
test('unavailable pet statistics are not presented as zero animals',async()=>{
  const nodes=await render('stats');
  assert.equal(nodes.AboutSection.statsAvailable,false);
  assert.equal(nodes.RescuedRing,undefined);
  assert.equal(nodes.NewsSection.initialNews.length,1);
});

test('slow lower sections cannot hold the intro or unrelated boundaries', async () => {
  let release;
  const waiting = new Promise(resolve => { release = resolve; });
  const { home, started } = loadHome(undefined, { news: waiting, campaigns: waiting, donations: waiting, gifts: waiting, settings: waiting });
  let timeout;
  try {
    const tree = await Promise.race([
      home(),
      new Promise((_, reject) => { timeout = setTimeout(()=>reject(Error('Intro waited for lower sections')), 300); }),
    ]);
    clearTimeout(timeout);
    assert.equal(started.length, 8, 'all independent requests start before the critical await');
    const light = await collect(tree.props.lightZone);
    assert.equal(light.HeroSection.videoUrl, 'hero.mp4');
    assert.equal(light.AboutSection.total, 79);
    assert.equal(light.DogsStoriesSection.initialPets.length, 1);
    assert.equal(tree.props.darkZoneTrigger.type, 'Suspense');
    release();
    const completed = await collect(tree);
    assert.equal(completed.CampaignsSection.initialCampaigns.length, 1);
    assert.equal(completed.NeedsSection.items.length, 1);
  } finally { clearTimeout(timeout); release(); }
});
