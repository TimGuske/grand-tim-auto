import test from 'node:test';
import assert from 'node:assert/strict';
import { createPassantLines } from './passant-speech.js';
test('only passants speak; shuffled rounds cover every line without immediate repeats', () => {
 const man = {}, woman = {}, tim = {}, pot = {};
 const phrases = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];
 const choose = createPassantLines([man, woman], phrases, () => .4);
 assert.equal(choose(tim), null); assert.equal(choose(pot), null);
 let last;
 for (let round = 0; round < 5; round++) {
  const seen = new Set();
  for (let i = 0; i < phrases.length; i++) {
   const line = choose(i % 2 ? woman : man);
   assert.notEqual(line, last); seen.add(line.id); last = line;
  }
  assert.equal(seen.size, phrases.length);
 }
});
