export const PUNCH_DURATION = 1.45/1.65;
export const PUNCH_CONTACT = .64/1.65;
export function inPunchReach(origin, heading, target, reach=2.0) {
  const x=target.x-origin.x,z=target.z-origin.z,distance=Math.hypot(x,z);
  if(distance>=reach)return false;
  return distance<.4||(x*Math.sin(heading)+z*Math.cos(heading))/distance>.45;
}
const smooth=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);};
export function punchPose(remaining){
  if(remaining<=0)return {extension:0};
  const t=PUNCH_DURATION-remaining;
  const extension=t<PUNCH_CONTACT?smooth((t-.28/1.65)/(PUNCH_CONTACT-.28/1.65)):1-smooth((t-PUNCH_CONTACT)/(.91/1.65-PUNCH_CONTACT));
  return {extension};
}
