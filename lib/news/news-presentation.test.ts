import test from 'node:test';
import assert from 'node:assert/strict';
import { newsPresentation } from './news-presentation.ts';

test('moves a repeated first line into the title and suppresses imported preview', () => {
  assert.deepEqual(newsPresentation({title:'Спасибо за помощь!', content:'Спасибо за помощь!\n\nПривезли корм.', excerpt:'Спасибо за помощь! Привезли корм.'}), {title:'Спасибо за помощь!',content:'Привезли корм.',excerpt:undefined});
});
test('keeps the rest of a paragraph when its opening sentence is the headline', () => {
  assert.equal(newsPresentation({title:'Тесси дома!',content:'Тесси дома! Теперь у неё своя семья.'}).content, 'Теперь у неё своя семья.');
});
test('replaces a truncated imported heading with a complete first sentence', () => {
  assert.deepEqual(newsPresentation({title:'Сегодня есть повод улыбнуться! Наши подопечные…',content:'Сегодня есть повод улыбнуться! Наши подопечные поехали домой.'}), {title:'Сегодня есть повод улыбнуться!', content:'Наши подопечные поехали домой.',excerpt:undefined});
});
test('never removes an incomplete phrase, unrelated title or a later repetition', () => {
  for (const title of ['Наши питомцы','Совсем другая новость','Очень длинный…']) {
    const content='Наши питомцы ждут вас. Наши питомцы';
    assert.equal(newsPresentation({title,content}).content,content);
  }
});
test('retains a distinct editorial lead and markdown links', () => {
  const input={title:'Спасибо',content:'[Спасибо](https://example.org) всем!',excerpt:'История одной поездки.'};
  assert.deepEqual(newsPresentation(input),input);
});
test('suppresses a duplicate plain preview when the body contains linked pet names', () => {
  const output = newsPresentation({title:'Наши подопечные',content:'Наши подопечные\n\n[Дана](https://example.org/dana) и [Шанель](https://example.org/chanel) ищут дом.',excerpt:'Наши подопечные Дана и Шанель ищут дом.'});
  assert.equal(output.excerpt,undefined);
  assert.match(output.content ?? '', /\[Дана\]/);
});
