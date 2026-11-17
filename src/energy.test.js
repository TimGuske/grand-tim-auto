import test from 'node:test';import assert from 'node:assert/strict';
import {drainEnergy,energySpeed,canRefill,SPRITZ_STAND} from './energy.js';
test('energy lasts 200 active seconds and never goes below zero',()=>{
 assert.equal(drainEnergy(100,100),50);assert.equal(drainEnergy(100,200),0);assert.equal(drainEnergy(1,200),0);assert.equal(drainEnergy(50,0),50);
});
test('empty energy slows Tim but still lets him reach the stand',()=>{
 assert.equal(energySpeed(100),6.1);assert.equal(energySpeed(0),3.4);assert.ok(energySpeed(12)>3.4&&energySpeed(12)<6.1);
 assert.ok(canRefill(SPRITZ_STAND));assert.equal(canRefill({x:0,z:7}),false);
});
