import test from 'node:test';import assert from 'node:assert/strict';
import fs from 'node:fs';import * as T from 'three';import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {rigTim} from './tim-model.js';import {extendRig} from './boxing-motion.js';
import {poseKick,KICK_DURATION,KICK_CONTACT} from './kick-motion.js';
test('right leg kicks forward while left foot stays planted; pose returns to rest and follows Tim',async()=>{
const b=fs.readFileSync(new URL('../public/models/tim-v4.glb',import.meta.url)),n=b.readUInt32LE(12),doc=JSON.parse(b.toString('utf8',20,20+n));delete doc.materials;delete doc.textures;delete doc.images;delete doc.extensionsRequired;delete doc.extensionsUsed;for(const m of doc.meshes)for(const p of m.primitives)delete p.material;
let j=Buffer.from(JSON.stringify(doc));j=Buffer.concat([j,Buffer.alloc((4-j.length%4)%4,32)]);const bin=b.subarray(20+n);const h=Buffer.alloc(20);h.write('glTF');h.writeUInt32LE(2,4);h.writeUInt32LE(20+j.length+bin.length,8);h.writeUInt32LE(j.length,12);h.write('JSON',16);const result=Buffer.concat([h,j,bin]);const g=await new GLTFLoader().parseAsync(result.buffer.slice(result.byteOffset,result.byteOffset+result.byteLength),'');const tim=extendRig(rigTim(g.scene));
 const point=o=>o.getWorldPosition(new T.Vector3());
 poseKick(tim,0);const left=point(tim.box.feet[1]),right=point(tim.box.feet[0]);
 for(let t=0;t<=KICK_DURATION;t+=.02){
  poseKick(tim,t);
  assert.ok(point(tim.box.feet[1]).distanceTo(left)<.003,'support foot planted');
  for(const bone of tim.box.bones)assert.ok(point(bone).toArray().every(Number.isFinite));
  assert.equal(tim.root.position.y,0,'no jumping');
 }
 poseKick(tim,KICK_CONTACT);const contact=point(tim.box.feet[0]);
 assert.ok(contact.z-right.z>.70,'right foot extends forwards');
 assert.ok(contact.y>.45&&contact.y<.75,'low kick at objects');
 assert.ok(point(tim.hands[0]).y<2,'hands stay below guard');
 const local=contact.clone();tim.root.position.set(8,0,-6);tim.root.rotation.y=1.2;poseKick(tim,KICK_CONTACT);
 assert.ok(tim.root.worldToLocal(point(tim.box.feet[0])).distanceTo(local)<1e-5);
 tim.root.position.set(0,0,0);tim.root.rotation.y=0;poseKick(tim,KICK_DURATION);
 assert.ok(point(tim.box.feet[0]).distanceTo(right)<1e-6,'right foot returns home');
});
