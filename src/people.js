import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { clone } from 'three/addons/utils/SkeletonUtils.js';
import { stabilizeShoes } from './people-feet.js';
import { createWalkPose } from './people-motion.js';
export const PEOPLE = [['canino-man','male'],['canino-woman','female'],['canino-casual','male'],['elder-man','male']];
const assets=new Map();
export async function loadPerson(index){
 const [name,voice]=PEOPLE[[0,1,2,1,3,0,1,2,0,1,3,2][index%12]];
 if(!assets.has(name))assets.set(name,new GLTFLoader().loadAsync(`${import.meta.env.BASE_URL}models/people/${name}.glb?v=0.3`));
 const gltf=await assets.get(name),root=new THREE.Group(),body=new THREE.Group(),model=clone(gltf.scene);
 root.add(body);body.add(model);
 if(name==='elder-man'){
  const posed=new Set();model.traverse(o=>{if(o.isSkinnedMesh&&!posed.has(o.skeleton)){o.skeleton.pose();posed.add(o.skeleton);}});model.updateMatrixWorld(true);
  const position=prefix=>{let p;model.traverse(o=>{if(o.isBone&&o.name.startsWith(prefix+'_'))p=o.getWorldPosition(new THREE.Vector3());});return p;};
  const up=position('tete').sub(position('piedG').add(position('piedD')).multiplyScalar(.5)).normalize();
  const right=position('bras1G').sub(position('bras1D')).normalize(),forward=new THREE.Vector3().crossVectors(right,up).normalize();right.crossVectors(up,forward).normalize();
  model.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(right,up,forward).invert());
 }
 model.updateMatrixWorld(true);
 const bounds=new THREE.Box3().setFromObject(model),center=bounds.getCenter(new THREE.Vector3());
 const scale=(voice==='female'?2.85:3.0)/(bounds.max.y-bounds.min.y);
 model.scale.multiplyScalar(scale);model.position.set(-center.x*scale,-bounds.min.y*scale,-center.z*scale);
 // Clothing color variants share textures/geometry while keeping materials independent.
 const tints=voice==='male'?['#ffffff','#b0d5e4','#d4bca7']:['#ffffff','#efb6cb','#b4d5d2'];
 model.traverse(o=>{if(!o.isMesh)return;o.castShadow=true;o.receiveShadow=true;o.frustumCulled=false;
  const materials=(Array.isArray(o.material)?o.material:[o.material]).map(m=>{const material=m.clone();if(/lambert3|lambert7|shirt|tshirt/i.test(m.name))material.color.multiply(new THREE.Color(tints[Math.floor(index/PEOPLE.length)%3]));return material;});
  o.material=Array.isArray(o.material)?materials:materials[0];
 });
 stabilizeShoes(model);
 const animate=createWalkPose(model,index*.71);animate(0);
 return {root,body,voice,modelName:name,animate};
}
