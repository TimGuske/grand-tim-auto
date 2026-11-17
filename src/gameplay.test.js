import test from 'node:test';
import assert from 'node:assert/strict';
import { moveWithinWorld, WORLD, FOUNTAIN, canBump, scoreForCombo } from './gameplay.js';
test('square bounds contain even a large step',()=>{const p=moveWithinWorld({x:0,z:0},100,-100);assert.ok(p.x<WORLD.maxX);assert.ok(p.z>WORLD.minZ);});
test('fountain pushes a character outside the basin, including its exact center',()=>{for(const p of [{x:3.8,z:-3},{x:2,z:-3}]){const q=moveWithinWorld(p,0,0);assert.ok(Math.hypot(q.x-FOUNTAIN.x,q.z-FOUNTAIN.z)>=FOUNTAIN.radius+.479);}});
test('only nearby, recovered NPCs can be bumped',()=>{assert.equal(canBump({x:0,z:0},{x:1,z:0,air:0,cooldown:0}),true);for(const n of [{x:5,z:0,air:0,cooldown:0},{x:1,z:0,air:1,cooldown:0},{x:1,z:0,air:0,cooldown:1}])assert.equal(canBump({x:0,z:0},n),false);});
test('combo score starts at 25 and caps at 100',()=>{assert.deepEqual([0,1,2,3,4,20].map(scoreForCombo),[25,25,50,75,100,100]);});
