import * as THREE from 'three';
import { aimChain, poseBoxing } from './boxing-motion.js';
export const KICK_DURATION=.72, KICK_CONTACT=.30;
const V=(x,y,z)=>new THREE.Vector3(x,y,z);
const frames=[
 [0,0,.11,.05], [.16,1,.54,.32], [.30,1,.60,.80],
 [.35,1,.60,.80], [.51,1,.54,.30], [.72,0,.11,.05],
];
export function sampleKick(time){
 time=THREE.MathUtils.clamp(time,0,KICK_DURATION);
 let i=0;while(i<frames.length-2&&frames[i+1][0]<time)i++;
 const a=frames[i],b=frames[i+1],u=(time-a[0])/(b[0]-a[0]),t=u*u*(3-2*u);
 return a.map((v,j)=>j===0?time:THREE.MathUtils.lerp(v,b[j],t));
}
export function poseKick(tim,time){
 const [,blend,y,z]=sampleKick(time);
 poseBoxing(tim,0);
 const {pelvis,spine,feet}=tim.box;
 // Weight over the planted left leg; right knee chambers, extends and retracts.
 pelvis.position.x=blend*.08;pelvis.position.y-=blend*.025;spine.rotation.x=blend*.06;
 tim.arms[0].rotation.set(-blend*.12,0,-blend*.12);
 tim.arms[1].rotation.set(blend*.12,0,blend*.17);
 tim.elbows[0].rotation.x=-blend*.15;tim.elbows[1].rotation.x=-blend*.20;
 for(let i=0;i<2;i++){
  const side=i===0?-1:1;
  const target=i===0?V(-.22,y,z):V(.22,.11,.05);
  aimChain(tim,tim.legs[i],tim.knees[i],feet[i],target,V(side*.28,.85,.85),1);
  tim.root.updateMatrixWorld(true);
  const flat=tim.knees[i].getWorldQuaternion(new THREE.Quaternion()).invert().multiply(tim.root.getWorldQuaternion(new THREE.Quaternion()));
  feet[i].quaternion.slerp(flat,blend);
 }
 tim.root.updateMatrixWorld(true);
}
