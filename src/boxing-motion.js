import * as THREE from 'three';
import { loadTim } from './tim-model.js';
export const DURATION=1.45,CONTACT=.64;
export const PLAYBACK_SPEED=1.65;
const V=(x,y,z)=>new THREE.Vector3(x,y,z);
const ease=t=>t*t*(3-2*t);
const frames=[
 // time, guard blend, hip yaw, chest yaw, dip, right hand x/y/z
 [0,0,0,0,0,-.52,2.47,.40],
 [.28,1,-.05,-.08,.035,-.52,2.47,.40],
 [.49,1,-.12,-.14,.05,-.56,2.45,.35],
 [.64,1,.18,.20,.025,-.31,2.35,1.01],
 [.69,1,.18,.20,.025,-.31,2.35,1.01],
 [.91,1,-.02,-.07,.035,-.52,2.47,.40],
 [1.14,1,-.05,-.08,.035,-.52,2.47,.40],
 [DURATION,0,0,0,0,-.52,2.47,.40],
];
export function sampleMotion(time){
 time=THREE.MathUtils.clamp(time,0,DURATION);
 let i=0;while(i<frames.length-2&&frames[i+1][0]<time)i++;
 const a=frames[i],b=frames[i+1],t=ease((time-a[0])/(b[0]-a[0]));
 return a.map((v,j)=>j===0?time:THREE.MathUtils.lerp(v,b[j],t));
}
export async function loadBoxingTim(){const tim=await loadTim();return extendRig(tim);}
export function extendRig(tim){
 const meshes=[];tim.body.traverse(o=>{if(o.isSkinnedMesh)meshes.push(o);});
 const bones=[...meshes[0].skeleton.bones],base=bones[0];
 // Place each wrist at the sleeve opening, above the palm, rather than inside it.
 for(let i=0;i<2;i++){const side=i===0?-1:1;tim.elbows[i].position.set(side*.16,-.33,.07);tim.hands[i].position.set(side*.10,-.31,.05);}
 const pelvis=new THREE.Bone(),spine=new THREE.Bone(),chest=new THREE.Bone();
 pelvis.name='BoxPelvis';spine.name='BoxSpine';chest.name='BoxChest';
 pelvis.position.y=1.06;spine.position.y=.54;chest.position.y=.50;
 base.add(pelvis);pelvis.add(spine);spine.add(chest);tim.root.updateMatrixWorld(true);
 for(const bone of tim.legs)pelvis.attach(bone);
 for(const bone of [...tim.arms,tim.head])chest.attach(bone);
 bones.push(pelvis,spine,chest);
 const feet=tim.knees.map((knee,i)=>{const foot=new THREE.Bone();foot.name=`BoxFoot${i}`;foot.position.set(0,-.40,.05);knee.add(foot);bones.push(foot);return foot;});
 tim.root.updateMatrixWorld(true);
 const skeleton=new THREE.Skeleton(bones);
 for(const mesh of meshes){
  const g=mesh.geometry,si=g.attributes.skinIndex,sw=g.attributes.skinWeight,p=g.attributes.position;
  for(let i=0;i<p.count;i++){
   const y=p.getY(i),values=new Map();
   // Every vertex of the original hand must follow the wrist. The coarse game
   // weights left fingertips partly attached to the torso, bending them backward.
   if(Math.abs(p.getX(i))>.56&&y>1.05&&y<2.15){
    const side=p.getX(i)<0?0:1,handWeight=1-THREE.MathUtils.smoothstep(y,1.51,1.58);
    const upper=THREE.MathUtils.smoothstep(y,1.76,1.94);
    si.setXYZW(i,10+side,8+side,5+side,0);
    sw.setXYZW(i,handWeight,(1-handWeight)*(1-upper),(1-handWeight)*upper,0);continue;
   }
   const add=(bone,w)=>values.set(bone,(values.get(bone)||0)+w);
   for(let k=0;k<4;k++){
    const bone=si.array[i*4+k],w=sw.array[i*4+k];if(!w)continue;
    if(bone===0){
     const low=1-THREE.MathUtils.smoothstep(y,1.12,1.65),high=THREE.MathUtils.smoothstep(y,1.65,2.05);
     add(12,w*low);add(13,w*(1-low)*(1-high));add(14,w*(1-low)*high);
    }else if((bone===2||bone===4)&&y<.38){
     const rigid=1-THREE.MathUtils.smoothstep(y,.24,.38);add(bone,w*(1-rigid));add(bone===2?15:16,w*rigid);
    }else add(bone,w);
   }
   const sorted=[...values].sort((a,b)=>b[1]-a[1]).slice(0,4),sum=sorted.reduce((s,[,w])=>s+w,0);
   for(let k=0;k<4;k++){si.array[i*4+k]=sorted[k]?.[0]??0;sw.array[i*4+k]=(sorted[k]?.[1]??0)/sum;}
  }
  si.needsUpdate=true;sw.needsUpdate=true;mesh.bind(skeleton,new THREE.Matrix4());
 }
 tim.box={pelvis,spine,chest,feet,bones};return tim;
}
export function aimChain(tim,joint,hinge,end,target,pole,blend){
 tim.root.updateMatrixWorld(true);
 target=target.clone().applyMatrix4(tim.root.matrixWorld);
 pole=pole.clone().applyMatrix4(tim.root.matrixWorld);
 const origin=joint.getWorldPosition(new THREE.Vector3());
 const first=hinge.position.length(),second=end.position.length();
 const direction=target.clone().sub(origin),distance=THREE.MathUtils.clamp(direction.length(),Math.abs(first-second)+.002,first+second-.0015);direction.normalize();
 const projection=pole.clone().sub(origin);projection.addScaledVector(direction,-projection.dot(direction)).normalize();
 const along=(first*first-second*second+distance*distance)/(2*distance),height=Math.sqrt(Math.max(0,first*first-along*along));
 const elbow=origin.clone().addScaledVector(direction,along).addScaledVector(projection,height);
 const parentQ=joint.parent.getWorldQuaternion(new THREE.Quaternion()).invert();
 const upperDirection=elbow.clone().sub(origin).normalize().applyQuaternion(parentQ);
 const q=new THREE.Quaternion().setFromUnitVectors(hinge.position.clone().normalize(),upperDirection);
 joint.quaternion.slerp(q,blend);tim.root.updateMatrixWorld(true);
 const jointQ=joint.getWorldQuaternion(new THREE.Quaternion()).invert();
 const reached=origin.clone().addScaledVector(direction,distance);
 const lowerDirection=reached.sub(elbow).normalize().applyQuaternion(jointQ);
 hinge.quaternion.slerp(new THREE.Quaternion().setFromUnitVectors(end.position.clone().normalize(),lowerDirection),blend);
 tim.root.updateMatrixWorld(true);
}
export function poseBoxing(tim,time){
 const [,guard,hipYaw,chestYaw,dip,x,y,z]=sampleMotion(time);
 const {pelvis,spine,chest,feet}=tim.box;
 for(const bone of tim.box.bones)bone.quaternion.identity();
 pelvis.position.set(-hipYaw*.12,1.06-dip,guard*.035);pelvis.rotation.y=hipYaw;
 spine.rotation.set(-guard*.035,chestYaw*.35,0);chest.rotation.y=chestYaw*.65;
 tim.head.rotation.set(guard*.025,-(hipYaw+chestYaw)*.75,0);
 tim.root.updateMatrixWorld(true);
 // Keep the feet planted while the pelvis and trunk rotate through the cross.
 for(let i=0;i<2;i++){
  const side=i===0?-1:1,target=V(side*.22,.11,guard*(i===0?-.12:.14)+.05);
  aimChain(tim,tim.legs[i],tim.knees[i],feet[i],target,V(side*.25,.65,.8),guard);
  const flat=tim.knees[i].getWorldQuaternion(new THREE.Quaternion()).invert().multiply(tim.root.getWorldQuaternion(new THREE.Quaternion()));
  feet[i].quaternion.slerp(flat,guard);
 }
 // Right cross; left hand stays in guard. The original hand meshes are untouched.
 aimChain(tim,tim.arms[0],tim.elbows[0],tim.hands[0],V(x,y,z),V(-.53,1.95,.70),guard);
 aimChain(tim,tim.arms[1],tim.elbows[1],tim.hands[1],V(.52,2.48,.40),V(.53,1.95,.70),guard);
 // Keep the original palm axis aligned with its forearm. No backward wrist bend.
 for(let i=0;i<2;i++){
  const side=i===0?-1:1;
  const correction=new THREE.Quaternion().setFromUnitVectors(V(side*.027,-.22,.006).normalize(),tim.hands[i].position.clone().normalize());
  tim.hands[i].quaternion.slerp(correction,guard);
 }
 tim.root.updateMatrixWorld(true);
 return {phase:time<.42?'Deckung':time<.49?'Ausholen':time<.69?'Rechte Gerade':time<.91?'Zurückziehen':time<1.14?'Deckung':'Entspannen',contact:Math.abs(time-CONTACT)<.05};
}
