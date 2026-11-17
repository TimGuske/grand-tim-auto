import test from 'node:test';
import fs from 'node:fs';import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';import * as T from 'three';import {rigTim} from './tim-model.js';import {extendRig,poseBoxing} from './boxing-motion.js';
test('boxing preserves the hands, plants feet, extends the right arm and follows the player transform',async()=>{
const b=fs.readFileSync(new URL('../public/models/tim-v4.glb',import.meta.url)),n=b.readUInt32LE(12),doc=JSON.parse(b.toString('utf8',20,20+n));delete doc.materials;delete doc.textures;delete doc.images;delete doc.extensionsRequired;delete doc.extensionsUsed;for(const m of doc.meshes)for(const p of m.primitives)delete p.material;
let j=Buffer.from(JSON.stringify(doc));j=Buffer.concat([j,Buffer.alloc((4-j.length%4)%4,32)]);const bin=b.subarray(20+n);const h=Buffer.alloc(20);h.write('glTF');h.writeUInt32LE(2,4);h.writeUInt32LE(20+j.length+bin.length,8);h.writeUInt32LE(j.length,12);h.write('JSON',16);const result=Buffer.concat([h,j,bin]);const g=await new GLTFLoader().parseAsync(result.buffer.slice(result.byteOffset,result.byteOffset+result.byteLength),'');const tim=extendRig(rigTim(g.scene));

const assert=(ok,message)=>{if(!ok)throw new Error(message);};
const point=o=>o.getWorldPosition(new T.Vector3());
const handsRest=tim.hands.map(h=>h.scale.toArray());
let previousRight=null,guardRight=null,contactRight=null;
for(let time=0;time<=1.450001;time+=.025){
 poseBoxing(tim,Math.min(time,1.45));
 const fullyGuard=time>=.28&&time<=1.14;
 for(let i=0;i<2;i++){
  const side=i===0?-1:1;
  const wrist=point(tim.hands[i]),elbow=point(tim.elbows[i]);
  assert(wrist.toArray().every(Number.isFinite),'finite wrist pose');
  assert(tim.hands[i].scale.toArray().every((n,k)=>n===handsRest[i][k]),'hand dimensions unchanged');
  if(fullyGuard){
   const palm=new T.Vector3(side*.027,-.22,.006).normalize().applyQuaternion(tim.hands[i].getWorldQuaternion(new T.Quaternion()));
   assert(palm.dot(wrist.clone().sub(elbow).normalize())>.9999,'palm must align with forearm');
   assert(Math.abs(point(tim.box.feet[i]).y-.11)<.002,'feet remain planted');
  }
 }
 for(const mesh of tim.body.children.filter(o=>o.isSkinnedMesh)){
  mesh.skeleton.update();
  for(let i=0;i<mesh.geometry.attributes.position.count;i+=113){
   const v=mesh.getVertexPosition(i,new T.Vector3());assert(v.toArray().every(Number.isFinite),'finite skinned geometry');
   if(time===0){const original=new T.Vector3().fromBufferAttribute(mesh.geometry.attributes.position,i);assert(v.distanceTo(original)<1e-5,'rest shape preserved');}
  }
 }
}
poseBoxing(tim,.30);guardRight=point(tim.hands[0]);assert(guardRight.y>=2.46,'higher guard');
poseBoxing(tim,.64);contactRight=point(tim.hands[0]);
const shoulder=point(tim.arms[0]),elbow=point(tim.elbows[0]);
const elbowAngle=180-elbow.clone().sub(shoulder).angleTo(contactRight.clone().sub(elbow))*180/Math.PI;
assert(elbowAngle>170,'right arm extends at contact');assert(contactRight.z-guardRight.z>.4,'strike travels forward from guard');
assert(tim.box.pelvis.rotation.y>.1&&tim.box.chest.rotation.y>.1,'hips and chest contribute');

// The same pose must remain relative to Tim anywhere on the square.
const contactLocal=contactRight.clone();
tim.root.position.set(8,0,-11);tim.root.rotation.y=1.2;
poseBoxing(tim,.64);
const translated=point(tim.hands[0]);tim.root.worldToLocal(translated);
assert(translated.distanceTo(contactLocal)<1e-6,'punch follows translated and turned player');
});
