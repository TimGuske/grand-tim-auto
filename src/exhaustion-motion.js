// Shared by gameplay and the isolated pose preview.
export function applyExhaustionPose(tim,exhaustion){
 if(!tim.box||exhaustion<=0)return;
 tim.box.spine.rotation.x=exhaustion*.52;tim.box.chest.rotation.x=exhaustion*.36;
 tim.head.rotation.x=exhaustion*.32;
 // Counter the bent torso so the arms hang down instead of reaching forward.
 tim.arms[0].rotation.x-=exhaustion*.80;tim.arms[1].rotation.x-=exhaustion*.80;
 tim.arms[0].rotation.z=exhaustion*.38;tim.arms[1].rotation.z=-exhaustion*.38;
}
