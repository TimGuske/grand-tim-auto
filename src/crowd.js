import {moveWithinWorld} from './gameplay.js';
import {findPath,nearestFree} from './world.js';
const conversations=[
 {x:-8.1,z:-11.6,partnerX:-5.8,partnerZ:-11.1},
 {x:-5.8,z:-11.1,partnerX:-8.1,partnerZ:-11.6},
 {x:-7.1,z:3.1,partnerX:-5.1,partnerZ:2.7},
 {x:-5.1,z:2.7,partnerX:-7.1,partnerZ:3.1},
 {x:7,z:9.5,partnerX:8.1,partnerZ:7.5},
 {x:8.1,z:7.5,partnerX:7,partnerZ:9.5},
];
export function crowdPlan(index){
 const pair=conversations[index];
 if(pair){const pos=nearestFree(pair);return {...pair,...pos,homeX:pos.x,homeZ:pos.z,behavior:'chat',heading:Math.atan2(pair.partnerX-pair.x,pair.partnerZ-pair.z),walkSpeed:1.2};}
 const x=-8+(index%4)*5,z=-13+Math.floor(index/4)*10;
 const pos=nearestFree({x,z});return {...pos,homeX:pos.x,homeZ:pos.z,behavior:'walk',heading:index*1.73,walkSpeed:1.6+(index%3)*.16};
}
export function stepCrowd(n,dt,elapsed){
 if(n.recovery>0)return false;
 let speed=n.walkSpeed;
 if(n.behavior==='chat'){
  const dx=n.homeX-n.x,dz=n.homeZ-n.z,distance=Math.hypot(dx,dz);
  if(distance<.18){n.heading=Math.atan2(n.partnerX-n.x,n.partnerZ-n.z);return false;}
  if(!n.returnPath?.length)n.returnPath=findPath(n,{x:n.homeX,z:n.homeZ});
  while(n.returnPath.length>1&&Math.hypot(n.returnPath[0].x-n.x,n.returnPath[0].z-n.z)<.6)n.returnPath.shift();
  const next=n.returnPath[0]||{x:n.homeX,z:n.homeZ};n.heading=Math.atan2(next.x-n.x,next.z-n.z);speed=Math.min(speed,distance/dt);
 }else n.heading+=Math.sin(elapsed*.5+n.phase)*dt*.45;
 const dx=Math.sin(n.heading)*speed*dt,dz=Math.cos(n.heading)*speed*dt;
 const pos=moveWithinWorld(n,dx,dz);
 if(n.behavior==='walk'&&(Math.abs(pos.x-n.x)<Math.abs(dx)*.2||Math.abs(pos.z-n.z)<Math.abs(dz)*.2))n.heading+=1.5;
 n.x=pos.x;n.z=pos.z;return true;
}
