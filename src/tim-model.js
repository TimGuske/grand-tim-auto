import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { punchPose } from './combat.js';

const smooth = THREE.MathUtils.smoothstep;
// Continuous weights keep the coat attached at the hips and shoulders.
export function timWeights(x, y, isHead = false) {
  if (isHead) return [[7, 1]];
  const side = x < 0 ? 0 : 1;
  const shoulderBlend = smooth(y,1.6,1.95);
  const arm = smooth(Math.abs(x), .48-shoulderBlend*.12, .73-shoulderBlend*.18) * smooth(y, .88, 1.28);
  const leg = (1 - smooth(y, .82, 1.32)) * (1 - arm);
  const knee = 1 - smooth(y, .44, .69);
  const elbow = 1 - smooth(y, 1.55, 1.85);
  const hand = 1 - smooth(y, 1.38, 1.45);
  const values = [[0,1-arm-leg],[5+side,arm*(1-elbow)],
    [8+side,arm*elbow*(1-hand)],[10+side,arm*elbow*hand],
    [1+side*2,leg*(1-knee)],[2+side*2,leg*knee]].filter(([,w])=>w>0);
  values.sort((a,b)=>b[1]-a[1]);const selected=values.slice(0,4);
  const total=selected.reduce((sum,[,w])=>sum+w,0);
  return selected.map(([bone,w])=>[bone,w/total]);
}

export function rigTim(model, height = 3.05) {
  model.updateMatrixWorld(true);
  const bounds = new THREE.Box3().setFromObject(model);
  const center = bounds.getCenter(new THREE.Vector3());
  const scale = height / (bounds.max.y - bounds.min.y);
  const normalize = new THREE.Matrix4().makeScale(scale, scale, scale)
    .multiply(new THREE.Matrix4().makeTranslation(-center.x, -bounds.min.y, -center.z));
  const root = new THREE.Group(), body = new THREE.Group(); root.add(body);
  const base = new THREE.Bone(); body.add(base);
  const bones = [base], legs = [], knees = [], arms = [], elbows = [], hands = [];
  for (const side of [-1, 1]) {
    const hip = new THREE.Bone(), knee = new THREE.Bone();
    hip.position.set(side * .22, 1.06, 0); knee.position.y = -.55;
    base.add(hip); hip.add(knee); bones.push(hip, knee); legs.push(hip); knees.push(knee);
  }
  for (const side of [-1, 1]) {
    const arm = new THREE.Bone(); arm.position.set(side * .53, 2.13, 0);
    base.add(arm); bones.push(arm); arms.push(arm);
  }
  const head = new THREE.Bone(); head.position.y = 2.52; base.add(head); bones.push(head);
  for(let i=0;i<2;i++){
    const side=i===0?-1:1, elbow=new THREE.Bone();
    elbow.position.set(side*.20,-.46,.09);arms[i].add(elbow);bones.push(elbow);elbows.push(elbow);
  }
  for(let i=0;i<2;i++){
    const side=i===0?-1:1, hand=new THREE.Bone();
    hand.position.set(side*.09,-.28,.04);elbows[i].add(hand);bones.push(hand);hands.push(hand);

  }
  body.updateMatrixWorld(true);
  const skeleton = new THREE.Skeleton(bones);
  model.traverse(object => {
    if (!object.isMesh) return;
    let parent = object, isHead = false;
    while (parent) { isHead ||= !!parent.userData.timHead; parent = parent.parent; }
    const geometry = object.geometry.clone().applyMatrix4(normalize.clone().multiply(object.matrixWorld));
    const position = geometry.attributes.position;
    const indices = new Uint16Array(position.count * 4), weights = new Float32Array(position.count * 4);
    for (let i = 0; i < position.count; i++) {
      const values = timWeights(position.getX(i), position.getY(i), isHead);
      values.forEach(([bone, weight], j) => { indices[i * 4 + j] = bone; weights[i * 4 + j] = weight; });
    }
    geometry.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(indices, 4));
    geometry.setAttribute('skinWeight', new THREE.Float32BufferAttribute(weights, 4));
    const materials = (Array.isArray(object.material) ? object.material : [object.material]).map(source => {
      const material = source.clone();
      if (isHead) { material.metalness = 0; material.roughness = .85; material.roughnessMap = null; }
      return material;
    });
    const mesh = new THREE.SkinnedMesh(geometry, Array.isArray(object.material) ? materials : materials[0]);
    mesh.castShadow = true; mesh.receiveShadow = true;
    // Animation changes bounds; avoid using the static generated mesh bounds.
    mesh.frustumCulled = false;
    body.add(mesh); mesh.bind(skeleton, new THREE.Matrix4());
  });
  return { root, body, legs, knees, arms, elbows, hands, head, voice: 'male', detailed: true };
}

export async function loadTim() {
  const gltf = await new GLTFLoader().loadAsync(`${import.meta.env.BASE_URL}models/tim-v4.glb?v=no-lenses1`);
  return rigTim(gltf.scene);
}

export function poseTimArms(tim,stride,remaining,jump=0){
 const {extension}=punchPose(remaining);
 // Preserve the original hands. Only the anatomical right arm performs the strike.
 for(let side=0;side<2;side++){
  tim.arms[side].rotation.set((side===0?-stride:stride)*.8,0,(side===0?1:-1)*(jump>0?.85:0));
  if(tim.elbows){tim.elbows[side].quaternion.identity();}
 }
 // The character faces +Z: anatomical right is local -X (index 0).
 const shoulder=tim.arms[0];
 if(tim.elbows){
  const elbow=tim.elbows[0],hand=tim.hands[0];
  const forward=new THREE.Vector3(0,.32,1).normalize();
  const shoulderTarget=new THREE.Quaternion().setFromUnitVectors(elbow.position.clone().normalize(),forward);
  const forearmTarget=new THREE.Quaternion().setFromUnitVectors(hand.position.clone().normalize(),forward);
  const elbowTarget=shoulderTarget.clone().invert().multiply(forearmTarget);
  // Extend both segments in one straight line, rising to upper-shoulder height.
  shoulder.quaternion.slerp(shoulderTarget,extension);
  elbow.quaternion.slerp(elbowTarget,extension);
 }else{
  shoulder.rotation.x=THREE.MathUtils.lerp(shoulder.rotation.x,-Math.PI/2,extension);
 }
}
