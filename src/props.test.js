import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { createProps } from './props.js';
function setup(){
 const scene=new THREE.Scene(),material=new THREE.MeshBasicMaterial();
 const mesh=(g,c,p,x=0,y=0,z=0)=>{const m=new THREE.Mesh(g,material);m.position.set(x,y,z);p.add(m);return m;};
 const box=(p,c,x,y,z,w,h,d)=>mesh(new THREE.BoxGeometry(w,h,d),c,p,x,y,z);
 const ball=(p,c,x,y,z,r)=>mesh(new THREE.SphereGeometry(r,4,3),c,p,x,y,z);
 const cyl=(p,c,x,y,z,r1,r2,h)=>mesh(new THREE.CylinderGeometry(r1,r2,h,4),c,p,x,y,z);
 const sign=(p,t,x,y,z,w)=>mesh(new THREE.PlaneGeometry(w,w/4),'',p,x,y,z);
 return createProps({scene,mesh,box,ball,cyl,sign,random:()=>.5});
}
test('all five market object types topple and cannot score twice during recovery',()=>{
 const props=setup();assert.equal(new Set(props.items.map(p=>p.type)).size,5);
 for(const p of props.items){assert.equal(props.hit(p,{x:p.x-1,z:p.z}),true);assert.equal(p.down,true);assert.ok(p.vy>0);assert.equal(props.hit(p,{x:0,z:0}),false);}
});
test('thrown props remain in the square and return to their original locations after recovery',()=>{
 const props=setup(),p=props.items[0];props.hit(p,{x:p.x-1,z:p.z});
 let inFlight=false;for(let i=0;i<610;i++){props.update(.02,()=>{});if(p.air>0)inFlight=true;assert.ok(Number.isFinite(p.x)&&Number.isFinite(p.z));assert.ok(Math.abs(p.x)<=12&&p.z>=-20&&p.z<=17);}
 assert.equal(inFlight,true);assert.equal(p.down,false);assert.equal(p.cooldown,0);assert.equal(p.x,p.homeX);assert.equal(p.z,p.homeZ);assert.equal(p.root.scale.x,1);
});
