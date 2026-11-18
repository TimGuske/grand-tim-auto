export function turnToMovement(actor,dx,dz,dt){
 if(Math.hypot(dx,dz)<1e-6)return;
 const target=Math.atan2(dx,dz),current=actor.heading??0;
 actor.heading=current+Math.atan2(Math.sin(target-current),Math.cos(target-current))*Math.min(1,dt*14);
 // Keep yaw as explicit state. Quaternion-to-Euler conversion can represent a
 // 180-degree turn as X/Z rotations, reversing subsequent Y-only turns.
 actor.root.rotation.set(0,actor.heading,0);
}
