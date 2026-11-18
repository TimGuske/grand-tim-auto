import * as THREE from 'three';import {MISSION_START} from './mission.js';import {poseBoxing} from './boxing-motion.js';
export function createMissionVisuals(scene){
 const start=new THREE.Group();start.position.set(MISSION_START.x,0,MISSION_START.z);scene.add(start);
 const ring=new THREE.Mesh(new THREE.RingGeometry(1.13,1.36,64),new THREE.MeshBasicMaterial({color:'#ffdd45',transparent:true,opacity:.8,depthWrite:false}));ring.rotation.x=-Math.PI/2;ring.position.y=.03;start.add(ring);
 const column=new THREE.Mesh(new THREE.CylinderGeometry(1.2,1.2,2.7,32,1,true),new THREE.MeshBasicMaterial({color:'#ffdf50',transparent:true,opacity:.10,side:THREE.DoubleSide,depthWrite:false}));column.position.y=1.35;start.add(column);
 const canvas=document.createElement('canvas');canvas.width=512;canvas.height=128;const ctx=canvas.getContext('2d');ctx.fillStyle='#18201ded';ctx.fillRect(0,0,512,128);ctx.strokeStyle='#ffe266';ctx.lineWidth=8;ctx.strokeRect(4,4,504,120);ctx.fillStyle='#ffe266';ctx.font='900 49px Arial';ctx.textAlign='center';ctx.fillText('KEHRWOCHE',256,81);
 const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
 const label=new THREE.Sprite(new THREE.SpriteMaterial({map:texture,depthTest:false}));label.scale.set(3.8,.95,1);label.position.y=3.1;start.add(label);
 const worker=new THREE.Group();scene.add(worker);worker.visible=false;
 const diamond=new THREE.Mesh(new THREE.OctahedronGeometry(.37),new THREE.MeshBasicMaterial({color:'#ff4eaa',depthTest:false,depthWrite:false}));diamond.renderOrder=15;worker.add(diamond);
 const workerRing=new THREE.Mesh(new THREE.RingGeometry(.8,.91,48),new THREE.MeshBasicMaterial({color:'#ff4eaa',transparent:true,opacity:.85,depthWrite:false}));workerRing.rotation.x=-Math.PI/2;scene.add(workerRing);workerRing.visible=false;
 return {update(mission,caretaker,time,started,reducedMotion){
  start.visible=started&&['idle','briefing'].includes(mission.status);
  ring.scale.setScalar(reducedMotion?1:1+Math.sin(time*3)*.06);label.position.y=3.1+(reducedMotion?0:Math.sin(time*2)*.12);
  const visible=mission.engaged&&caretaker.root.visible&&caretaker.air<5;
  worker.visible=visible;workerRing.visible=visible&&caretaker.air<=0;
  worker.position.set(caretaker.x,caretaker.air+4.1+(reducedMotion?0:Math.sin(time*4)*.13),caretaker.z);diamond.rotation.y=time*1.4;
  workerRing.position.set(caretaker.x,.035,caretaker.z);
 }};
}
export function poseMissionVictory(tim,time){
 if(!tim.box)return;poseBoxing(tim,0);const blend=Math.min(1,time/.4);
 tim.arms[0].rotation.z=-1.8*blend;tim.arms[1].rotation.z=1.8*blend;
 tim.elbows[0].rotation.x=-.35*blend;tim.elbows[1].rotation.x=-.35*blend;
 tim.head.rotation.y=Math.sin(time*3)*.10;tim.body.position.y=time<2?Math.abs(Math.sin(time*7))*.09:0;
}
