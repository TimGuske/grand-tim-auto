export const SPRITZ_STAND={x:-9,z:1,radius:3.2};
export function drainEnergy(energy,dt){return Math.max(0,Math.min(100,energy)-Math.max(0,dt)*.5);}
export function energySpeed(energy){return .85+5.25*Math.min(1,Math.max(0,energy)/25);}
export function canRefill(position){return Math.hypot(position.x-SPRITZ_STAND.x,position.z-SPRITZ_STAND.z)<=SPRITZ_STAND.radius;}
// Warn once below 25%; refill rearms it. Speech has priority over the short chime.
export function createAperolAlarm(){
 let armed=true,pending=false;
 return {update(energy,canPlay){
  if(energy>=30){armed=true;pending=false;}
  if(energy<25&&armed){armed=false;pending=true;}
  if(pending&&canPlay){pending=false;return true;}
  return false;
 }};
}
