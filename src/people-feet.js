import * as THREE from 'three';
// The source shoes mix calf/foot influences. Keep each shoe rigid while preserving
// its exact imported rest shape, including the source inverse-bind transforms.
export function stabilizeShoes(model){
 model.updateMatrixWorld(true);
 model.traverse(mesh=>{
  if(!mesh.isSkinnedMesh||!mesh.userData.isShoe)return;
  mesh.skeleton.update();mesh.geometry=mesh.geometry.clone();
  const g=mesh.geometry,p=g.attributes.position,si=g.attributes.skinIndex,sw=g.attributes.skinWeight;
  const feet=mesh.skeleton.bones.map((bone,index)=>({bone,index})).filter(({bone})=>/^CC_Base_[LR]_Foot_\d+$/.test(bone.name)||/^pied[GD]_\d+$/.test(bone.name));
  if(feet.length!==2)throw new Error('Character feet missing');
  const transforms=feet.map(({bone,index})=>({index,point:bone.getWorldPosition(new THREE.Vector3()),inverse:new THREE.Matrix4().copy(mesh.bindMatrixInverse).multiply(bone.matrixWorld).multiply(mesh.skeleton.boneInverses[index]).multiply(mesh.bindMatrix).invert()}));
  const v=new THREE.Vector3(),world=new THREE.Vector3();
  for(let i=0;i<p.count;i++){
   mesh.getVertexPosition(i,v);world.copy(v).applyMatrix4(mesh.matrixWorld);
   const foot=world.distanceToSquared(transforms[0].point)<world.distanceToSquared(transforms[1].point)?transforms[0]:transforms[1];
   v.applyMatrix4(foot.inverse);p.setXYZ(i,v.x,v.y,v.z);si.setXYZW(i,foot.index,0,0,0);sw.setXYZW(i,1,0,0,0);
  }
  p.needsUpdate=true;si.needsUpdate=true;sw.needsUpdate=true;
 });
}
