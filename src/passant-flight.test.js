import test from 'node:test';import assert from 'node:assert/strict';
import {launchPassant,stepPassantFlight} from './passant-flight.js';import {canStand} from './world.js';
function scenario(roll){
 const npc={x:0,z:4,air:0,behavior:'chat',homeX:0,homeZ:4},player={x:0,z:7},random=()=>roll;
 launchPassant(npc,player,random);return {npc,player,random};
}
test('roof flight travels across the square near roof height for over three seconds, then returns safely',()=>{
 const {npc,player,random}=scenario(.1);assert.equal(npc.flightMode,'roof');
 let elapsed=0,state='flying',maxHeight=0,horizontalAtOneSecond;
 while(state!=='waiting'){
  elapsed+=.04;state=stepPassantFlight(npc,.04,elapsed,player,[npc],random);maxHeight=Math.max(maxHeight,npc.air);
  if(elapsed<.5)assert.ok(npc.air<4,'launch stays low enough to watch');
  if(elapsed>.96&&elapsed<1.04)horizontalAtOneSecond=Math.abs(npc.x);
  assert.ok(elapsed<4);
 }
 assert.ok(horizontalAtOneSecond>8,'substantial sideways travel, not a vertical launch');
 assert.ok(elapsed>3);assert.ok(maxHeight<12.3&&maxHeight>11.5);assert.equal(Math.abs(npc.x),30);
 assert.equal(stepPassantFlight(npc,.04,npc.respawnAt-.01,player,[npc],random),'waiting');
 assert.equal(stepPassantFlight(npc,.04,npc.respawnAt+.01,player,[npc],random),'respawned');
 assert.equal(npc.air,0);assert.equal(npc.flyAway,false);assert.equal(npc.behavior,'chat');
 assert.ok(canStand(npc,.7));assert.ok(Math.hypot(npc.x-player.x,npc.z-player.z)>=8);
});
test('wall reaction visibly hits a facade, falls to the ground, pauses and only then disappears',()=>{
 const {npc,player,random}=scenario(.9);assert.equal(npc.flightMode,'wall');
 let elapsed=0,state='flying',hit=false,fell=false,landedAt;
 while(state!=='waiting'){
  elapsed+=.04;state=stepPassantFlight(npc,.04,elapsed,player,[npc],random);
  if(state==='wall-hit'){hit=true;assert.ok(npc.air>2.6&&npc.air<2.8);}
  if(state==='falling'){assert.ok(hit);fell=true;}
  if(state==='landed'){assert.ok(fell);landedAt??=elapsed;assert.equal(npc.air,.08);}
  assert.ok(elapsed<5);
 }
 assert.ok(hit&&fell&&landedAt);assert.ok(elapsed-landedAt>=.5);
 assert.ok(npc.respawnAt-elapsed>=4&&npc.respawnAt-elapsed<=12);
});
test('flight near gaps between facades still finds a real wall',()=>{
 const npc={x:10,z:-16.25};launchPassant(npc,{x:9,z:-16.25},()=>.9);
 assert.ok(Object.values(npc.flightEnd).every(Number.isFinite));
});
