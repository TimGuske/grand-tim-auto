import test from 'node:test';import assert from 'node:assert/strict';
import {drainEnergy,energySpeed,canRefill,SPRITZ_STAND} from './energy.js';
test('energy lasts 200 active seconds and never goes below zero',()=>{
 assert.equal(drainEnergy(100,100),50);assert.equal(drainEnergy(100,200),0);assert.equal(drainEnergy(1,200),0);assert.equal(drainEnergy(50,0),50);
});
test('empty energy slows Tim but still lets him reach the stand',()=>{
 assert.equal(energySpeed(100),6.1);assert.equal(energySpeed(0),.85);assert.ok(energySpeed(12)>.85&&energySpeed(12)<6.1);
 assert.ok(energySpeed(0)<energySpeed(100)/7,'empty tank seriously penalizes timed challenges');
 assert.ok(energySpeed(5)<2);assert.equal(energySpeed(25),6.1);
 assert.ok(canRefill(SPRITZ_STAND));assert.equal(canRefill({x:0,z:7}),false);
});

test('Aperol alarm warns once per refill and waits for speech or mute to end',async()=>{
 const {createAperolAlarm}=await import('./energy.js'),alarm=createAperolAlarm();
 assert.equal(alarm.update(100,true),false);assert.equal(alarm.update(25,true),false);
 assert.equal(alarm.update(24,false),false);assert.equal(alarm.update(23,true),true);
 for(const energy of [22,15,5,0])assert.equal(alarm.update(energy,true),false);
 alarm.update(100,true);assert.equal(alarm.update(24,true),true);
});
