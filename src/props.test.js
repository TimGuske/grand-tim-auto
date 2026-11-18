import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { createProps } from './props.js';
import { createCleanup } from './cleanup.js';
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
test('mess stays visible indefinitely until a caretaker restores it',()=>{
 const props=setup(),p=props.items[0];props.hit(p,{x:p.x-1,z:p.z});
 let inFlight=false;for(let i=0;i<3000;i++){props.update(.02,()=>{});if(p.air>0)inFlight=true;assert.ok(Number.isFinite(p.x)&&Number.isFinite(p.z));assert.ok(Math.abs(p.x)<=12&&p.z>=-20&&p.z<=17);}
 assert.equal(inFlight,true);assert.equal(p.down,true);assert.equal(p.root.scale.x,1);
 assert.equal(props.hit(p,{x:0,z:0}),false,'waiting mess cannot farm score');
 props.restore(p);assert.equal(p.down,false);assert.equal(p.cooldown,0);assert.equal(p.x,p.homeX);assert.equal(p.z,p.homeZ);
});
test('caretaker reaches mess around the fountain, sweeps, carries it home and restores it; interruption leaves it down',()=>{
 const props=setup(),worker={x:10,z:-12,air:0,recovery:0,walking:false,heading:0},cleanup=createCleanup(props,worker),p=props.items[0];
 props.hit(p,{x:p.x-1,z:p.z});
 let swept=false,carried=false,interrupted=false;
 for(let i=0;i<6000&&cleanup.cleaned===0;i++){
  props.update(.04,()=>{});cleanup.update(.04);
  swept ||= cleanup.stage==='sweep';carried ||= cleanup.stage==='carry';
  if(cleanup.stage==='carry'&&!interrupted){
   worker.air=1;cleanup.update(.04);assert.equal(cleanup.stage,'idle');assert.equal(p.down,true);assert.equal(p.air,.12);worker.air=0;interrupted=true;
  }
 }
 assert.ok(swept&&carried&&interrupted);assert.equal(cleanup.cleaned,1);assert.equal(cleanup.pending,0);
 assert.equal(p.down,false);assert.equal(p.x,p.homeX);assert.equal(p.z,p.homeZ);assert.equal(p.pivot.rotation.z,0);
});

test('upright props block large walking steps, are marked nearby and release collision when kicked',async()=>{
 const {setPropObstacles,moveWorld,collides,findPath}=await import('./world.js');
 const props=setup(),p=props.items[0];
 setPropObstacles(props.items);
 try{
  assert.ok(collides({x:p.x,z:p.z}));
  let player={x:p.x,z:p.z+3};
  player=moveWorld(player,0,-6);
  assert.ok(player.z>=p.z+p.collisionRadius+.55-.01,'cannot tunnel through crate');
  const target=props.updateHints(player,Math.PI);assert.equal(target,p);assert.equal(p.marker.visible,true);
  assert.ok(p.marker.material.opacity>.5);
  const scale=p.markerPulse.scale.x;props.updateHints(player,Math.PI,.5);assert.notEqual(p.markerPulse.scale.x,scale);
  props.updateHints(player,Math.PI,.5,true);assert.equal(p.markerPulse.visible,false);
  assert.equal(p.marker.scale.x,1);
  assert.ok(findPath({x:0,z:7},{x:-7,z:5}).length,'routing still works');
  props.hit(p,player);assert.equal(p.marker.visible,false);assert.equal(collides({x:p.x,z:p.z}),false);
  props.restore(p);assert.equal(collides({x:p.x,z:p.z}),true);
 }finally{setPropObstacles([]);}
});

test('caretaker may restore individual props; mission only fails when all are upright and retry is clean',async()=>{
 const {createMission}=await import('./mission.js'),props=setup(),worker={x:10,z:-12,air:0,recovery:0,heading:0},cleanup=createCleanup(props,worker),mission=createMission();
 mission.begin(props.items,cleanup.cleaned);mission.tick(3);const prop=props.items[0];props.hit(prop,{x:prop.x-1,z:prop.z});props.hit(props.items[1],{x:props.items[1].x-1,z:props.items[1].z});mission.observe(props.items,cleanup.cleaned);
 let partialCleanup=false;
 for(let i=0;i<6000&&mission.status==='running';i++){
  mission.tick(.04);props.update(.04,()=>{});if(mission.grace<=0)cleanup.update(.04);mission.observe(props.items,cleanup.cleaned);
  if(cleanup.cleaned===1){partialCleanup=true;assert.equal(mission.status,'running');assert.equal(mission.count,1);}
 }
 assert.ok(partialCleanup);assert.equal(mission.status,'lost');assert.equal(cleanup.cleaned,2);
 cleanup.reset();for(const item of props.items)props.restore(item);mission.begin(props.items,cleanup.cleaned);
 assert.equal(cleanup.cleaned,0);assert.equal(cleanup.pending,0);assert.equal(mission.count,0);assert.equal(mission.status,'countdown');
 mission.tick(3);props.items.forEach(p=>props.hit(p,{x:p.x-1,z:p.z}));mission.observe(props.items,cleanup.cleaned);
 assert.equal(mission.status,'won');mission.free();assert.equal(mission.blocksWorld,false);
});

test('caretaker clears a full square with live item collisions and keeps moving after every restored item',async()=>{
 const {setPropObstacles,canStand}=await import('./world.js');
 const props=setup(),worker={x:10.5,z:-15,air:0,recovery:0,heading:0},cleanup=createCleanup(props,worker,()=>1.9);
 setPropObstacles(props.items);
 try{
  props.items.forEach(p=>props.hit(p,{x:p.x-.5,z:p.z-.5}));
  for(let i=0;i<15000&&cleanup.pending;i++){
   props.update(.04,()=>{});const before=cleanup.cleaned;cleanup.update(.04);
   if(cleanup.cleaned>before)assert.ok(canStand(worker,.55),'worker must stand clear of the restored object');
  }
  assert.equal(cleanup.cleaned,props.items.length,'every item must be cleared without getting stuck');
 }finally{setPropObstacles([]);}
});
