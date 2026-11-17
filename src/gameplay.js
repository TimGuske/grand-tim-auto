export const WORLD = { minX: -12, maxX: 12, minZ: -20, maxZ: 17 };
export const FOUNTAIN = { x: 3.8, z: -3, radius: 2.4 };
export function moveWithinWorld(position, dx, dz, radius = .48) {
  let x = Math.max(WORLD.minX + radius, Math.min(WORLD.maxX - radius, position.x + dx));
  let z = Math.max(WORLD.minZ + radius, Math.min(WORLD.maxZ - radius, position.z + dz));
  const distance = Math.hypot(x - FOUNTAIN.x, z - FOUNTAIN.z);
  const clearance = FOUNTAIN.radius + radius;
  if (distance < clearance) {
    const nx = distance > .001 ? (x - FOUNTAIN.x) / distance : 1;
    const nz = distance > .001 ? (z - FOUNTAIN.z) / distance : 0;
    x = FOUNTAIN.x + nx * clearance; z = FOUNTAIN.z + nz * clearance;
  }
  return { x, z };
}
export function canBump(player, target, radius = 2.7) { return target.air <= 0 && target.cooldown <= 0 && Math.hypot(player.x-target.x, player.z-target.z) < radius; }
export function scoreForCombo(combo, base = 25) { return base * Math.min(Math.max(combo, 1), 4); }
