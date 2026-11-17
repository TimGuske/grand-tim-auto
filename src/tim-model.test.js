import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { timWeights, rigTim } from './tim-model.js';

test('skin weights stay normalized across torso and limb boundaries', () => {
  for (let x = -1; x <= 1; x += .05) for (let y = 0; y <= 3.1; y += .05) {
    const weights = timWeights(x,y);
    assert.ok(weights.every(([bone,w]) => bone >= 0 && bone < 12 && w >= 0 && w <= 1));
    assert.ok(Math.abs(weights.reduce((sum,[,w])=>sum+w,0)-1)<1e-10);
  }
  assert.deepEqual(timWeights(.1,2.8,true),[[7,1]]);
});

test('rig preserves resting vertices and moves the original head as one piece', () => {
  const model = new THREE.Group(), head = new THREE.Group();head.userData.timHead=true;model.add(head);
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(.7,1,.5),new THREE.MeshStandardMaterial());
  mesh.position.y=2;head.add(mesh);
  const rig = rigTim(model,1);rig.root.updateMatrixWorld(true);
  const skin=rig.body.children.find(o=>o.isSkinnedMesh);
  for(let i=0;i<skin.geometry.attributes.position.count;i++){
    const original=new THREE.Vector3().fromBufferAttribute(skin.geometry.attributes.position,i);
    assert.ok(skin.getVertexPosition(i,new THREE.Vector3()).distanceTo(original)<1e-6);
  }
  rig.head.rotation.y=.5;rig.root.updateMatrixWorld(true);
  skin.skeleton.update();
  assert.ok(skin.getVertexPosition(0,new THREE.Vector3()).distanceTo(new THREE.Vector3().fromBufferAttribute(skin.geometry.attributes.position,0))>.01);
});

test('right straight punch extends the arm in a straight line at upper-shoulder height; left arm stays at rest', async () => {
  const RIGHT=0,LEFT=1;
  const {poseTimArms}=await import('./tim-model.js');
  const {PUNCH_DURATION,PUNCH_CONTACT}=await import('./combat.js');
  const model=new THREE.Group();model.add(new THREE.Mesh(new THREE.BoxGeometry(1,3.05,.5),new THREE.MeshStandardMaterial()));
  const tim=rigTim(model);
  poseTimArms(tim,0,PUNCH_DURATION-PUNCH_CONTACT);tim.root.updateMatrixWorld(true);
  const shoulder=tim.arms[RIGHT].getWorldPosition(new THREE.Vector3());
  const elbow=tim.elbows[RIGHT].getWorldPosition(new THREE.Vector3());
  const fist=tim.hands[RIGHT].getWorldPosition(new THREE.Vector3());
  for(const point of [elbow,fist]){assert.ok(point.y>shoulder.y);assert.ok(Math.abs(point.x-shoulder.x)<1e-6);}
  assert.ok(fist.y>2.35);
  assert.ok(elbow.clone().sub(shoulder).normalize().distanceTo(fist.clone().sub(elbow).normalize())<1e-6);
  assert.ok(fist.z>elbow.z&&elbow.z>shoulder.z);
  assert.equal(tim.fists,undefined);
  assert.deepEqual(tim.hands[RIGHT].scale.toArray(),[1,1,1]);
  assert.ok(tim.arms[LEFT].quaternion.angleTo(new THREE.Quaternion())<1e-6);
  poseTimArms(tim,0,0);assert.deepEqual(tim.hands[RIGHT].scale.toArray(),[1,1,1]);
});
