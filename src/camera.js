const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export function clearCameraDistance(focus,direction,distance,blocked){
 const steps=Math.max(8,Math.ceil(distance/.22));let clear=0;
 for(let i=1;i<=steps;i++){const d=distance*i/steps,p={x:focus.x+direction.x*d,y:focus.y+direction.y*d,z:focus.z+direction.z*d};if(blocked(p))return Math.max(.05,clear-.12);clear=d;}
 return distance;
}
export function cameraView(focus,yaw,pitch,distance,blocked){
 let best=null;
 for(const lift of [0,.27])for(const turn of [0,.35,-.35,.7,-.7,1.1,-1.1,1.55,-1.55,2.1,-2.1,Math.PI]){
  const p=clamp(pitch+lift,.2,1.0),a=yaw+turn,direction={x:Math.sin(a)*Math.cos(p),y:Math.sin(p),z:Math.cos(a)*Math.cos(p)};
  const available=clearCameraDistance(focus,direction,distance,blocked),score=available-Math.abs(turn)*.85-lift*1.7;
  const value={x:focus.x+direction.x*available,y:focus.y+direction.y*available,z:focus.z+direction.z*available,distance:available,turn};
  if(!best||score>best.score)best={...value,score};
  if(turn===0&&lift===0&&available>=distance-.05)return value;
 }
 return best;
}
export function cameraLineClear(focus,position,blocked){
 const dx=position.x-focus.x,dy=position.y-focus.y,dz=position.z-focus.z,d=Math.hypot(dx,dy,dz);if(d<.01)return true;
 return clearCameraDistance(focus,{x:dx/d,y:dy/d,z:dz/d},d,blocked)>=d-.05;
}
