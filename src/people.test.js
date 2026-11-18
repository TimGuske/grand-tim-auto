import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import { PEOPLE } from './people.js';
import {stabilizeShoes} from './people-feet.js';
import {createWalkPose} from './people-motion.js';
function asset(name){const bytes=readFileSync(new URL(`../public/models/people/${name}.glb`,import.meta.url));return {bytes,doc:JSON.parse(bytes.toString('utf8',20,20+bytes.readUInt32LE(12)))};}
async function geometryAsset(name){
 const {bytes,doc}=asset(name),n=bytes.readUInt32LE(12);
 for(const node of doc.nodes)if(node.mesh!==undefined)node.extras={isShoe:/shoe|boot|shoose/i.test(doc.meshes[node.mesh].name)};
 delete doc.materials;delete doc.textures;delete doc.images;
 for(const m of doc.meshes)for(const p of m.primitives)delete p.material;
 let j=Buffer.from(JSON.stringify(doc));j=Buffer.concat([j,Buffer.alloc((4-j.length%4)%4,32)]);
 const bin=bytes.subarray(20+n),h=Buffer.alloc(20);h.write('glTF');h.writeUInt32LE(2,4);h.writeUInt32LE(20+j.length+bin.length,8);h.writeUInt32LE(j.length,12);h.write('JSON',16);
 const result=Buffer.concat([h,j,bin]);return new GLTFLoader().parseAsync(result.buffer.slice(result.byteOffset,result.byteOffset+result.byteLength),'');
}
test('all selected cartoon characters contain their original skeleton and embedded textures',()=>{
 assert.deepEqual(PEOPLE.map(([,voice])=>voice),['male','female','male','male']);
 for(const [name] of PEOPLE){const {bytes,doc}=asset(name);
  assert.equal(bytes.toString('ascii',0,4),'glTF');assert.ok(doc.skins.length>0);
  for(const node of doc.nodes.filter(n=>n.skin!==undefined))for(const p of doc.meshes[node.mesh].primitives){assert.ok('JOINTS_0'in p.attributes);assert.ok('WEIGHTS_0'in p.attributes);}
  assert.ok(doc.images.every(i=>'bufferView'in i));assert.ok(!doc.buffers.some(b=>b.uri));
  assert.ok(bytes.length<7_000_000,'bounded mobile download');
 }
});
test('new NPCs walk on their skeleton without changing shoe shape',async()=>{
 for(const [name] of PEOPLE){
  const gltf=await geometryAsset(name),model=gltf.scene;model.updateMatrixWorld(true);
  const original=[];model.traverse(mesh=>{if(mesh.isSkinnedMesh&&mesh.userData.isShoe){mesh.skeleton.update();for(let i=0;i<mesh.geometry.attributes.position.count;i+=19)original.push({mesh,i,v:mesh.getVertexPosition(i,new THREE.Vector3())});}});
  stabilizeShoes(model);
  for(const {mesh,i,v} of original)assert.ok(mesh.getVertexPosition(i,new THREE.Vector3()).distanceTo(v)<1e-5,'shoe rest shape preserved');
  const shoes=[];model.traverse(mesh=>{if(mesh.isSkinnedMesh&&mesh.userData.isShoe)shoes.push(mesh);});
  assert.ok(shoes.length>0,`${name} has shoe meshes`);
  const samples=shoes.flatMap(mesh=>{mesh.skeleton.update();const g=mesh.geometry,s=[];
   for(let i=0;i<g.index.count;i+=Math.max(3,Math.floor(g.index.count/90/3)*3)){
    const a=g.index.getX(i),b=g.index.getX(i+1);
    const length=mesh.getVertexPosition(a,new THREE.Vector3()).distanceTo(mesh.getVertexPosition(b,new THREE.Vector3()));
    if(length>1e-4)s.push({mesh,a,b,length});
   }return s;
  });
  const pose=createWalkPose(model);
  for(let phase=0;phase<6;phase++){
   pose(.4);model.updateMatrixWorld(true);for(const mesh of shoes)mesh.skeleton.update();
   for(const {mesh,a,b,length} of samples){const current=mesh.getVertexPosition(a,new THREE.Vector3()).distanceTo(mesh.getVertexPosition(b,new THREE.Vector3()));
    assert.ok(Math.abs(current/length-1)<.01,`${name} shoe deformation: ${current/length}`);
   }
  }
  assert.ok(samples.length>20);
 }
});
