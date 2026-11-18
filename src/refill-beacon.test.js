import test from 'node:test';import assert from 'node:assert/strict';import * as THREE from 'three';
import {createRefillBeacon} from './refill-beacon.js';
test('refill arrow appears below 25%, bobs over the actual stand and hides after refill',()=>{
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(),stand={x:-9,z:1};
 const beacon=createRefillBeacon(scene,stand);
 beacon.update(25,0,camera);assert.equal(beacon.root.visible,false);
 beacon.update(24,0,camera);assert.equal(beacon.root.visible,true);const y=beacon.root.position.y;
 assert.equal(beacon.root.position.x,stand.x);assert.equal(beacon.root.position.z,stand.z);
 beacon.update(24,.3,camera);assert.notEqual(beacon.root.position.y,y);
 beacon.update(24,.3,camera,true,true);assert.equal(beacon.root.position.y,4.2);
 beacon.update(100,1,camera);assert.equal(beacon.root.visible,false);
 beacon.update(24,1,camera,false);assert.equal(beacon.root.visible,false);
});
