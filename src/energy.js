export const SPRITZ_STAND={x:-9,z:1,radius:3.2};
export function drainEnergy(energy,dt){return Math.max(0,Math.min(100,energy)-Math.max(0,dt)*.5);}
export function energySpeed(energy){return 3.4+2.7*Math.min(1,Math.max(0,energy)/25);}
export function canRefill(position){return Math.hypot(position.x-SPRITZ_STAND.x,position.z-SPRITZ_STAND.z)<=SPRITZ_STAND.radius;}
