import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';

function load(path, dependencies = {}) {
  const source = fs.readFileSync(new URL(path, import.meta.url), 'utf8');
  const js = ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
  const exports = {};
  new Function('require','exports',js)(name => dependencies[name] || {}, exports);
  return exports;
}
const query = load('./catalog-query.ts');
test('catalog accepts supported filters and paginates on the server',()=>{
  const result = query.parseCatalogQuery({type:'cat',sex:'female',size:'small',status:'home',page:'3',sort:'age_asc',search:'  Тиша '});
  assert.equal(result.options.type,'cat');
  assert.equal(result.options.status,'home');
  assert.equal(result.options.start,24);
  assert.equal(result.options.limit,12);
  assert.equal(result.options.sort,'birthDate:desc');
  assert.equal(result.options.search,'Тиша');
});
test('invalid and repeated parameters cannot become query operators or invalid offsets',()=>{
  for(const page of ['NaN','-5','2.4','Infinity','0','3abc',['2','4']]) assert.equal(query.parseCatalogQuery({page}).page,1);
  const result=query.parseCatalogQuery({type:'wolf',sort:'name:desc&filters[x]=1',size:['small','large'],favorites:'true',ids:'abc,abc,,<script>,good-id'});
  assert.equal(result.options.type,undefined);
  assert.equal(result.options.size,undefined);
  assert.equal(result.options.sort,'name:asc');
  assert.deepEqual(result.options.ids,['abc','good-id']);
});
test('empty favorites must stay an explicit empty list, never all pets',()=>{
  assert.deepEqual(query.parseCatalogQuery({favorites:'true'}).options.ids,[]);
  assert.equal(query.parseCatalogQuery({}).options.ids,undefined);
});
test('pagination has its own canonical and personalized filters are noindex',()=>{
  assert.equal(query.catalogCanonical({page:'3',status:'home',type:'cat'}),'/pets?status=home&page=3');
  assert.equal(query.catalogCanonical({page:'1'}),'/pets');
  assert.equal(query.hasCatalogFilters({page:'2',status:'home'}),false);
  assert.equal(query.hasCatalogFilters({favorites:'true'}),true);
});
test('malformed stored favorites are safe; only unique identifiers survive',()=>{
  const {parseFavorites}=load('./favorites.ts');
  for(const raw of ['bad JSON','null','{}','42']) assert.deepEqual(parseFavorites(raw),[]);
  assert.deepEqual(parseFavorites('["pet1",42,"pet1","<script>","pet2"]'),['pet1','pet2']);
});
test('normalization does not invent urgency, temperament or a new arrival from an ID',()=>{
  const {normalizePetData}=load('../helpers/pets/normalize-pet-data.ts',{
    '@/lib/api/services/pets':{petsService:{resolveMediaUrl:url=>url}},
    './calculate-age-in-years':{calculateAgeInYears:()=>2},
  });
  for(const documentId of ['a','b','c','d']) {
    const pet=normalizePetData({documentId,name:'Питомец',type:'dog'});
    assert.equal(pet.tag,'Ищет дом');
    assert.equal(pet.gender,'Пол не указан');
    assert.doesNotMatch(pet.description,/ласковый|послушный|приученный/);
    assert.deepEqual(pet.characteristics,{});
  }
  assert.deepEqual(normalizePetData({documentId:'known',type:'dog',activity:4,friendliness:0,trainability:6}).characteristics,{activity:4});
  assert.equal(normalizePetData({documentId:'male',type:'dog',sex:'male'}).gender,'Мальчик');
  assert.equal(normalizePetData({documentId:'female',type:'cat',sex:'female'}).gender,'Девочка');
  assert.equal(normalizePetData({documentId:'group',type:'dog',sex:'mixed'}).gender,'Мальчики и девочки');
  assert.equal(normalizePetData({documentId:'unknown',type:'cat',sex:'unknown'}).gender,'Пол не указан');
});
test('empty favorites cause no CMS request and backend failures are propagated',async()=>{
  const calls=[];
  const {PetsService}=load('../api/services/pets.ts',{'../client':{StrapiClient:class {async fetchJson(path){calls.push(path);throw new Error('offline');}}}});
  const service=new PetsService();
  assert.equal((await service.getPetsCollection({ids:[]})).meta.pagination.total,0);
  assert.equal(calls.length,0);
  await assert.rejects(service.getQuizPets(),/offline/);
});
