import * as THREE from 'three';
// Animate the downloaded character's existing skeleton, retaining its skin weights.
export function createWalkPose(model, phase=0) {
 model.updateMatrixWorld(true);
 const find=part=>{let result;model.traverse(o=>{if(o.isBone&&new RegExp(`^CC_Base_${part}_\\d+$`).test(o.name))result=o;});if(!result)throw new Error(`Missing character joint: ${part}`);return result;};
 const parts=['L_Thigh','R_Thigh','L_Calf','R_Calf','L_Foot','R_Foot','L_Upperarm','R_Upperarm','L_Forearm','R_Forearm','Spine02'];
 const joints=Object.fromEntries(parts.map(part=>{
  const bone=find(part),inverse=bone.parent.getWorldQuaternion(new THREE.Quaternion()).invert();
  return [part,{bone,rest:bone.quaternion.clone(),x:new THREE.Vector3(1,0,0).applyQuaternion(inverse),z:new THREE.Vector3(0,0,1).applyQuaternion(inverse)}];
 }));
 const q=new THREE.Quaternion();
 const rotate=(part,x=0,z=0)=>{const j=joints[part];j.bone.quaternion.copy(j.rest);if(z)j.bone.quaternion.premultiply(q.setFromAxisAngle(j.z,z));if(x)j.bone.quaternion.premultiply(q.setFromAxisAngle(j.x,x));};
 let time=phase;
 return (dt,airborne=false,recovering=false)=>{
  time+=dt*2.5;
  const stride=airborne?0:recovering?0:Math.sin(time)*.24;
  for(let side=0;side<2;side++){
   const prefix=side===0?'L':'R',s=side===0?1:-1,step=stride*s;
   const knee=airborne?.38:Math.max(0,-step)*1.3;
   rotate(`${prefix}_Thigh`,airborne?-.18:step);
   rotate(`${prefix}_Calf`,-knee);
   rotate(`${prefix}_Foot`,-step+knee);
   rotate(`${prefix}_Upperarm`,airborne?-.55:-step*.65,-s*.86);
   rotate(`${prefix}_Forearm`,airborne?-.5:-.10);
  }
  rotate('Spine02',0,airborne?0:Math.sin(time)*.016);
 };
}
