import test from 'node:test';
import assert from 'node:assert/strict';
import { profileAge, profileDescription, profileRatings } from './profile.ts';
import type { StrapiPet } from '../api/types';

test('unknown, invalid and future birth dates do not invent an age', () => {
  for (const date of [undefined, '', 'oops', '2030-01-01']) assert.equal(profileAge(date, new Date('2026-09-17')), 'Возраст уточняется');
});
test('age respects birthdays and Russian endings', () => {
  const now = new Date('2026-09-17');
  assert.equal(profileAge('2025-09-18', now), '11 месяцев');
  assert.equal(profileAge('2025-09-17', now), '1 год');
  assert.equal(profileAge('2005-09-17', now), '21 год');
  assert.equal(profileAge('2014-09-17', now), '12 лет');
});
test('missing and invalid temperament ratings stay missing', () => {
  assert.deepEqual(profileRatings({ activity: null, friendliness: 0, trainability: 6 } as unknown as StrapiPet), []);
  assert.deepEqual(profileRatings({ activity: 3 } as StrapiPet), [{ key: 'activity', label: 'Активность', value: 3 }]);
});
test('metadata strips markup, limits length and respects adopted status', () => {
  assert.equal(profileDescription({ shortDescr: '<b>Альва</b>  дома' } as StrapiPet), 'Альва дома');
  assert.equal(profileDescription({ descr: 'а'.repeat(300) } as StrapiPet).length, 160);
  assert.match(profileDescription({ name: 'Альва', type: 'dog', petStatus: 'home' } as StrapiPet), /Уже дома/);
});
