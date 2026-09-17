import test from 'node:test';
import assert from 'node:assert/strict';
import { parseNewsInline } from './news-inline.ts';

test('renders escaped hashtags and punctuation as literal text', () => {
  assert.equal(parseNewsInline('Спасибо! #приветыиздома\\_Светлый \\<текст\\>').map(x=>x.text).join(''),'Спасибо! #приветыиздома_Светлый <текст>');
});
test('retains editorial Markdown links and escaped labels', () => {
  const parts=parseNewsInline('Привет [Ира \\[волонтёр\\]](https://vk.com/id7)!');
  assert.deepEqual(parts,[{text:'Привет '},{text:'Ира [волонтёр]',href:'https://vk.com/id7'},{text:'!'}]);
});
test('escaped links and unsafe URLs never become anchors', () => {
  for(const input of ['\\[Имя\\](https://vk.com/id7)','[bad](javascript:alert)','[bad](data:text/html,secret)','[bad](https://user:pass@example.org)']) {
    assert.equal(parseNewsInline(input).some(x=>x.href),false);
  }
});
