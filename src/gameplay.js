import { WORLD, FOUNTAIN, moveWorld } from './world.js';
export {WORLD,FOUNTAIN};
export const moveWithinWorld=moveWorld;
export function canBump(player, target, radius = 2.7) { return target.air <= 0 && target.cooldown <= 0 && Math.hypot(player.x-target.x, player.z-target.z) < radius; }
export function scoreForCombo(combo, base = 25) { return base * Math.min(Math.max(combo, 1), 4); }
