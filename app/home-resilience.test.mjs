import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import test from 'node:test';
import assert from 'node:assert/strict';

const code = ts.transpileModule(fs.readFileSync(new URL('./page.tsx', import.meta.url), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
}).outputText;
async function render(failing) {
  const source = (key, value) => async () => { if (failing === key) throw Error('Injected outage'); return value; };
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
  const nodes = {};
  function visit(node) {
    if (!node || typeof node !== 'object') return;
    if(node.type) nodes[node.type]=node.props;
    Object.values(node).forEach(value=>Array.isArray(value)?value.forEach(visit):visit(value));
  }
  visit(await loaded.exports.default()); return nodes;
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
