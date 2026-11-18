import {canBump} from './gameplay.js';
import {inPunchReach} from './combat.js';
export function inKickReach(origin,heading,target,reach=1.9){
 const dx=target.x-origin.x,dz=target.z-origin.z;
 const forward=dx*Math.sin(heading)+dz*Math.cos(heading);
 const sideways=dx*Math.cos(heading)-dz*Math.sin(heading);
 // A low, forward right-foot strike, not an area attack around Tim.
 return forward>=.05&&forward<reach&&Math.abs(sideways+.22)<.68;
}
export function impactTargets(origin,heading,npcs,objects,action='punch'){
 const people=action==='punch'?npcs.filter(n=>canBump(origin,n,2)&&inPunchReach(origin,heading,n,2)):[];
 const props=action==='kick'?objects.filter(p=>!p.down&&p.cooldown<=0&&inKickReach(origin,heading,p)):[];
 return {people,props,speaker:people[0]??null};
}
