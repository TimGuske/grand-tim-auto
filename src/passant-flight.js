import {WORLD,nearestFree,WORLD_OBSTACLES} from './world.js';
function wallAlong(x,z,dx,dz){
 let result=null;
 for(const wall of WORLD_OBSTACLES.filter(o=>o.kind==='building')){
  let near=0,far=100;
  for(const [p,d,min,max] of [[x,dx,wall.minX,wall.maxX],[z,dz,wall.minZ,wall.maxZ]]){
   if(Math.abs(d)<1e-6){if(p<min||p>max){far=-1;break;}continue;}
   const a=(min-p)/d,b=(max-p)/d;near=Math.max(near,Math.min(a,b));far=Math.min(far,Math.max(a,b));
  }
  if(near<=far&&far>0&&near>0&&(!result||near<result.distance))result={x:x+dx*near,z:z+dz*near,distance:near};
 }
 return result;
}
export function launchPassant(npc,origin,random=Math.random){
 const dx=npc.x-origin.x,dz=npc.z-origin.z,length=Math.hypot(dx,dz)||1;
 npc.flightMode=random()<.5?'roof':'wall';
 npc.air=.01;npc.cooldown=10;npc.flyAway=true;npc.respawnAt=0;
 npc.flightTime=0;npc.flightStage='travel';npc.flightStart={x:npc.x,z:npc.z};npc.wallImpactPending=false;
 npc.spin=(random()<.5?-1:1)*(5+random()*3);npc.recovery=0;
 if(npc.flightMode==='roof'){
  // Cross the square before clearing a low roof, rather than shooting vertically.
  const side=Math.abs(npc.x)>2?(npc.x>0?-1:1):(dx<0?-1:1);
  npc.flightEnd={x:side*30,z:Math.max(-17,Math.min(16,npc.z+dz/length*9))};
  npc.flightDuration=3.2+random()*.5;
 }else{
  let nx=dx/length,nz=dz/length,wall=wallAlong(npc.x,npc.z,nx,nz);
  if(!wall){nx=npc.x<0?-1:1;nz=0;wall=wallAlong(npc.x,npc.z,nx,nz);}
  if(!wall){
   wall=WORLD_OBSTACLES.filter(o=>o.kind==='building').map(o=>{const x=Math.max(o.minX,Math.min(o.maxX,npc.x)),z=Math.max(o.minZ,Math.min(o.maxZ,npc.z));return {x,z,distance:Math.hypot(x-npc.x,z-npc.z)};}).sort((a,b)=>a.distance-b.distance)[0];
   nx=(wall.x-npc.x)/wall.distance;nz=(wall.z-npc.z)/wall.distance;
  }
  npc.flightEnd={x:wall.x-nx*.65,z:wall.z-nz*.65};npc.flightDirection={x:nx,z:nz};
  npc.flightDuration=Math.max(.85,Math.min(2.0,wall.distance/9));
 }
}
function spawnPoint(player,people,random){
 const clear=p=>Math.hypot(p.x-player.x,p.z-player.z)>=8&&people.every(n=>n.air>0||Math.hypot(p.x-n.x,p.z-n.z)>1.4);
 for(let i=0;i<32;i++){
  const p=nearestFree({x:WORLD.minX+1.5+random()*(WORLD.maxX-WORLD.minX-3),z:WORLD.minZ+1.5+random()*(WORLD.maxZ-WORLD.minZ-3)},.7);
  if(clear(p))return p;
 }
 return [{x:-10,z:-18},{x:10,z:-18},{x:-10,z:15},{x:10,z:15}].map(p=>nearestFree(p,.7)).sort((a,b)=>Math.hypot(b.x-player.x,b.z-player.z)-Math.hypot(a.x-player.x,a.z-player.z))[0];
}
export function stepPassantFlight(npc,dt,elapsed,player,people,random=Math.random){
 if(npc.respawnAt>0){
  if(elapsed<npc.respawnAt)return 'waiting';
  Object.assign(npc,spawnPoint(player,people,random),{air:0,vy:0,vx:0,vz:0,flyAway:false,respawnAt:0,cooldown:1.2,recovery:.3,returnPath:null});
  return 'respawned';
 }
 npc.flightTime+=dt;
 if(npc.flightStage==='travel'){
  const t=Math.min(1,npc.flightTime/npc.flightDuration),start=npc.flightStart,end=npc.flightEnd;
  npc.x=start.x+(end.x-start.x)*t;npc.z=start.z+(end.z-start.z)*t;
  if(npc.flightMode==='roof'){
   const lift=Math.min(1,t/.48);
   npc.air=12.2*lift*lift*(3-2*lift)-Math.max(0,t-.6)*.8;
   if(t>=1){npc.respawnAt=elapsed+4+random()*8;return 'waiting';}
  }else{
   npc.air=.01+2.7*Math.sin(t*Math.PI/2);
   if(t>=1){npc.flightStage='impact';npc.flightTime=0;npc.wallImpactPending=true;return 'wall-hit';}
  }
  return 'flying';
 }
 if(npc.flightStage==='impact'){
  if(npc.flightTime>=.22){npc.flightStage='fall';npc.flightTime=0;npc.vy=0;}
  return 'wall-hit';
 }
 if(npc.flightStage==='fall'){
  npc.vy-=8*dt;npc.air=Math.max(.08,npc.air+npc.vy*dt);
  npc.x-=npc.flightDirection.x*.7*dt;npc.z-=npc.flightDirection.z*.7*dt;
  if(npc.air<=.08){npc.flightStage='landed';npc.flightTime=0;return 'landed';}
  return 'falling';
 }
 if(npc.flightTime>=.55){npc.respawnAt=elapsed+4+random()*8;return 'waiting';}
 return 'landed';
}
