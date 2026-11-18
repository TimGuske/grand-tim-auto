import {moveWithinWorld} from './gameplay.js';
import {findPath,canStand,canWalkStraight} from './world.js';
export function createCleanup(props,worker,speed=()=>1.65){
 let target=null,stage='idle',progress=0,cleaned=0,route=[],destination='',blockedFor=0;
 const clearRoute=()=>{route=[];destination='';blockedFor=0;};
 const travel=(x,z,dt,standOff=.95)=>{
  const key=`${x.toFixed(2)},${z.toFixed(2)},${standOff}`;
  if(destination!==key){
   destination=key;route=[];blockedFor=0;
   const angle=Math.atan2(worker.x-x,worker.z-z);
   for(const extra of [0,.35]){
    for(const turn of [0,.5,-.5,1,-1,1.6,-1.6,Math.PI]){
     const a=angle+turn,r=standOff+extra,goal={x:x+Math.sin(a)*r,z:z+Math.cos(a)*r};
     if(!canStand(goal,.7))continue;
     const path=findPath(worker,goal);if(path.length){route=path;break;}
    }
    if(route.length)break;
   }
  }
  if(!route.length){worker.walking=false;clearRoute();return false;}
  while(route.length>1&&Math.hypot(route[0].x-worker.x,route[0].z-worker.z)<.22)route.shift();
  while(route.length>1&&canWalkStraight(worker,route[1],.6))route.shift();
  const point=route[0],dx=point.x-worker.x,dz=point.z-worker.z,distance=Math.hypot(dx,dz);
  if(route.length===1&&distance<.14){worker.walking=false;return true;}
  worker.heading=Math.atan2(dx,dz);worker.walking=true;
  const step=Math.min(speed()*dt,distance),next=moveWithinWorld(worker,Math.sin(worker.heading)*step,Math.cos(worker.heading)*step);
  blockedFor=Math.hypot(next.x-worker.x,next.z-worker.z)<step*.15?blockedFor+dt:0;
  worker.x=next.x;worker.z=next.z;
  if(blockedFor>.6)clearRoute();
  return false;
 };
 const drop=()=>{if(target){target.air=.12;target.root.position.set(target.x,.12,target.z);}target=null;stage='idle';progress=0;clearRoute();};
 return {reset(){drop();cleaned=0;worker.walking=false;},update(dt){
  // Being launched interrupts the task; the mess remains where it was dropped.
  if(worker.air>0||worker.recovery>0){drop();worker.walking=false;return;}
  if(!target){
   target=props.items.filter(p=>p.down&&p.age>=3).sort((a,b)=>Math.hypot(a.x-worker.x,a.z-worker.z)-Math.hypot(b.x-worker.x,b.z-worker.z))[0]||null;
   stage=target?'seek':'idle';progress=0;clearRoute();
  }
  if(!target){worker.walking=false;return;}
  if(!target.down){drop();return;}
  if(stage==='seek'&&travel(target.x,target.z,dt)){stage='sweep';progress=0;worker.heading=Math.atan2(target.x-worker.x,target.z-worker.z);}
  else if(stage==='sweep'){
   worker.walking=false;progress+=dt;
   if(progress>=2){stage='carry';progress=0;}
  }else if(stage==='carry'){
   const arrived=travel(target.homeX,target.homeZ,dt,(target.collisionRadius??.6)+.9);
   target.x=worker.x+Math.sin(worker.heading)*.65;target.z=worker.z+Math.cos(worker.heading)*.65;
   target.air=.75;target.root.position.set(target.x,target.air,target.z);
   if(arrived){stage='repair';progress=0;}
  }else if(stage==='repair'){
   worker.walking=false;progress+=dt;
   // Set it down visibly instead of fading away and reappearing.
   const t=Math.min(1,progress/1.4);
   target.x+=(target.homeX-target.x)*Math.min(1,dt*5);target.z+=(target.homeZ-target.z)*Math.min(1,dt*5);
   target.air=.75*(1-t);target.pivot.rotation.z*=Math.exp(-dt*4);target.pivot.rotation.y*=Math.exp(-dt*4);
   target.root.position.set(target.x,target.air,target.z);
   if(t>=1){props.restore(target);cleaned++;target=null;stage='idle';clearRoute();}
  }
 },get speed(){return speed();},get stage(){return stage;},get target(){return target;},get cleaned(){return cleaned;},get pending(){return props.items.filter(p=>p.down).length;}};
}
