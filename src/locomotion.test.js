import test from 'node:test';import assert from 'node:assert/strict';import * as THREE from 'three';import {turnToMovement} from './locomotion.js';
test('loaded 180-degree character faces its movement, without hidden X/Z rotations',()=>{
 const old=new THREE.Object3D();old.rotation.y=Math.PI;const root=new THREE.Object3D();root.quaternion.copy(old.quaternion);const actor={root,heading:Math.PI};
 for(const [dx,dz] of [[0,-1],[1,0],[0,1],[-1,0]]){
  for(let i=0;i<40;i++)turnToMovement(actor,dx,dz,.02);
  const forward=new THREE.Vector3(0,0,1).applyQuaternion(root.quaternion);assert.ok(forward.dot(new THREE.Vector3(dx,0,dz))>.999);assert.equal(root.rotation.x,0);assert.equal(root.rotation.z,0);
 }
});
