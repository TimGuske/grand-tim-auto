import test from 'node:test';import assert from 'node:assert/strict';import {createTutorial,TUTORIAL_STEPS} from './tutorial.js';
test('tutorial requires the right real actions in order, including walking empty and actual refilling',()=>{
 const t=createTutorial();t.event('refill');assert.equal(t.active,false);t.start();
 t.event('kick',{target:true});assert.equal(t.step,'move');t.event('walk',{distance:2});assert.equal(t.step,'kick');
 t.event('punch',{people:1});t.event('kick',{target:false});assert.equal(t.step,'kick');t.event('kick',{target:true});assert.equal(t.step,'punch');
 t.event('punch',{people:0});assert.equal(t.step,'punch');t.event('punch',{people:1});assert.equal(t.step,'stand');
 t.event('nearStand');assert.equal(t.step,'empty');t.event('refill');assert.equal(t.step,'empty');
 t.event('walk',{distance:.8});assert.equal(t.step,'empty');t.tick(1.5);assert.equal(t.step,'refill');
 t.event('refill');assert.equal(t.step,'mission');t.event('mission');assert.equal(t.status,'complete');assert.equal(t.active,false);
 assert.equal(TUTORIAL_STEPS.length,7);
});
test('empty demonstration cannot advance by standing still; tutorial can be skipped and restarted',()=>{
 const t=createTutorial();t.start();t.event('walk',{distance:2});t.event('kick',{target:true});t.event('punch',{people:1});t.event('nearStand');
 t.tick(20);assert.equal(t.step,'empty');t.event('walk',{distance:.8});assert.equal(t.step,'refill');
 t.stop();assert.equal(t.active,false);t.start();assert.equal(t.step,'move');
});
