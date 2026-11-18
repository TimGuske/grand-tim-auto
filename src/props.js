import * as THREE from 'three';
import {nearestFree,refreshNavigation} from './world.js';
import {inKickReach} from './impact.js';
import { moveWithinWorld } from './gameplay.js';

export function createProps({scene,box,ball,cyl,sign,mesh,mat,random}) {
 const props=[];
 function add(type,x,z){
  ({x,z}=nearestFree({x,z},.75));
  const root=new THREE.Group(),pivot=new THREE.Group();root.add(pivot);root.position.set(x,0,z);scene.add(root);
  if(type==='crate'){
   box(pivot,'#8b5939',0,.45,0,1,.9,.85);
   for(const side of [-1,1])for(let i=0;i<4;i++)box(pivot,'#c1975b',side*.51,.14+i*.21,0,.06,.16,.92);
   for(let i=0;i<4;i++)box(pivot,'#ba874c',0,.15+i*.21,.46,1,.15,.06);
   const brace=box(pivot,'#e0b97c',0,.46,.5,.09,1.13,.06);brace.rotation.z=-.8;
   for(let i=0;i<6;i++)ball(pivot,i%2?'#de9e32':'#8eaa4e',-.3+(i%3)*.3,1,-.19+Math.floor(i/3)*.36,.18);
  }else if(type==='barrel'){
   cyl(pivot,'#a67540',0,.6,0,.49,.45,1.2,16);
   for(const y of [.16,.98])cyl(pivot,'#4e5b56',0,y,0,.505,.505,.1,16);
   cyl(pivot,'#cfab70',0,1.22,0,.43,.43,.04,16);
   for(let i=0;i<12;i++){const a=i/12*Math.PI*2;box(pivot,'#81552f',Math.sin(a)*.485,.58,Math.cos(a)*.485,.025,.82,.025);}
  }else if(type==='pot'){
   cyl(pivot,'#b66648',0,.4,0,.43,.28,.8,14);cyl(pivot,'#d18b65',0,.78,0,.49,.49,.12,14);cyl(pivot,'#5a5140',0,.84,0,.4,.4,.03);
   for(let i=0;i<7;i++){const a=i*2.4;const x=Math.sin(a)*.3,z=Math.cos(a)*.3;cyl(pivot,'#668252',x,1.06,z,.025,.025,.44,6);ball(pivot,i%2?'#e9ba4e':'#d57570',x,1.3+random()*.15,z,.17);}
  }else if(type==='board'){
   for(const side of [-1,1]){const leg=box(pivot,'#a0784e',side*.43,.67,0,.1,1.4,.13);leg.rotation.x=-.18;}
   box(pivot,'#9a754d',0,.9,.1,1.06,1.08,.15);box(pivot,'#2c493c',0,.9,.19,.9,.91,.05);
   const panel=sign(pivot,'HEUT: BREZLA',0,1.07,.23,.82);panel.scale.y=2;
   box(pivot,'#e6d9b2',0,.65,.235,.46,.02,.012);
  }else if(type==='chair'){
   for(const x of [-.33,.33])for(const z of [-.3,.3])cyl(pivot,'#576b60',x,.38,z,.035,.035,.76,6);
   box(pivot,'#c99a5a',0,.79,0,.88,.12,.81);
   for(const x of [-.33,.33])box(pivot,'#576b60',x,1.08,-.32,.06,.68,.06);
   for(const y of [1.03,1.27])box(pivot,'#b88950',0,y,-.32,.85,.17,.08);
  }
  const collisionRadius=({crate:.68,pot:.50,barrel:.52,chair:.60,board:.60})[type];
  const marker=new THREE.Mesh(new THREE.RingGeometry(collisionRadius+.07,collisionRadius+.17,48),new THREE.MeshBasicMaterial({color:'#ffcd65',transparent:true,opacity:.2,depthWrite:false}));
  marker.rotation.x=-Math.PI/2;marker.position.y=.025;marker.visible=false;root.add(marker);
  const markerPulse=marker.clone();markerPulse.material=marker.material.clone();root.add(markerPulse);
  props.push({collisionRadius,marker,markerPulse,type,root,pivot,x,z,homeX:x,homeZ:z,air:0,vy:0,vx:0,vz:0,spin:0,down:false,age:0,cooldown:0,chain:false});
 }
 const layout=[['crate',-4,5],['barrel',6,7],['pot',-7,1],['chair',8,2],['board',-8,-7],['crate',-5,-11],['crate',-6.3,-10],['barrel',8,-12],['pot',-9,12],['chair',7,12],['board',-6,12],['pot',8,-18],['barrel',-8,-18],['crate',1,13],['pot',-3,-4],['chair',-8,6]];
 for(const item of layout)add(...item);
 function hit(prop,origin,strength=1){
  if(prop.down||prop.cooldown>0)return false;
  let dx=prop.x-origin.x,dz=prop.z-origin.z;const distance=Math.hypot(dx,dz)||1;
  prop.vx=(dx/distance||.6)*6*strength;prop.vz=(dz/distance||.4)*6*strength;
  prop.vy=(prop.type==='barrel'?3:5)*strength;prop.air=.01;prop.down=true;refreshNavigation();prop.marker.visible=false;prop.markerPulse.visible=false;prop.cooldown=12;prop.age=0;prop.spin=(random()>.5?1:-1)*(prop.type==='barrel'?8:4);prop.chain=false;return true;
 }
 function update(dt,onChain){
  for(const p of props){p.cooldown=Math.max(0,p.cooldown-dt);if(!p.down)continue;p.age+=dt;
   if(p.age<3){const next=moveWithinWorld(p,p.vx*dt,p.vz*dt,.55,true);if(Math.abs(next.x-p.x)<.001)p.vx*=-.3;if(Math.abs(next.z-p.z)<.001)p.vz*=-.3;p.x=next.x;p.z=next.z;
    p.vy-=18*dt;p.air+=p.vy*dt;if(p.air<.12){p.air=.12;p.vy=Math.abs(p.vy)>.8?-p.vy*.3:0;const friction=Math.exp(-dt*5);p.vx*=friction;p.vz*=friction;}
    p.pivot.rotation.z=THREE.MathUtils.damp(p.pivot.rotation.z,Math.sign(p.spin)*Math.PI*.46,5,dt);
    p.pivot.rotation.y+=p.spin*dt*Math.exp(-p.age*2);
    if(!p.chain&&Math.hypot(p.vx,p.vz)>2){onChain(p);}
   }
   p.root.position.set(p.x,p.air,p.z);
  }
 }
 function updateHints(player,heading,time=0,reducedMotion=false){
  const candidates=props.filter(p=>!p.down&&inKickReach(player,heading,p));
  const target=candidates.sort((a,b)=>Math.hypot(a.x-player.x,a.z-player.z)-Math.hypot(b.x-player.x,b.z-player.z))[0];
  for(const [i,p] of props.entries()){
   const distance=Math.hypot(p.x-player.x,p.z-player.z),visible=!p.down&&distance<6,selected=p===target;
   const wave=reducedMotion?0:(Math.sin(time*4+i*.7)+1)*.5;
   p.marker.visible=visible;p.marker.scale.setScalar(1+(reducedMotion?0:wave*.10));
   p.marker.material.opacity=selected?.80+wave*.15:Math.max(.18,(1-distance/7)*.48)+wave*.12;
   const phase=(time*.75+i*.17)%1;
   p.markerPulse.visible=visible&&!reducedMotion;
   p.markerPulse.scale.setScalar(1.05+phase*.50);
   p.markerPulse.material.opacity=(1-phase)*(selected?.50:.30);
  }
  return target;
 }
 function restore(p){
  p.x=p.homeX;p.z=p.homeZ;p.air=0;p.vx=0;p.vy=0;p.vz=0;p.down=false;p.age=0;p.cooldown=0;
  p.root.position.set(p.x,0,p.z);p.root.scale.setScalar(1);p.pivot.rotation.set(0,0,0);refreshNavigation();
 }
 return {items:props,hit,update,restore,updateHints};
}
