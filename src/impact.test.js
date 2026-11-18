import test from 'node:test';import assert from 'node:assert/strict';
import {impactTargets,inKickReach} from './impact.js';
test('punch only hits people; kick only hits objects and never produces speech',()=>{
 const origin={x:0,z:0},pot={type:'pot',x:-.22,z:1.2,down:false,cooldown:0};
 const npc={x:0,z:1.3,air:0,cooldown:0};
 const punch=impactTargets(origin,0,[npc],[pot],'punch');
 assert.deepEqual(punch.people,[npc]);assert.deepEqual(punch.props,[]);assert.equal(punch.speaker,npc);
 const kick=impactTargets(origin,0,[npc],[pot],'kick');
 assert.deepEqual(kick.people,[]);assert.deepEqual(kick.props,[pot]);assert.equal(kick.speaker,null);
 pot.down=true;assert.deepEqual(impactTargets(origin,0,[],[pot],'kick').props,[]);
});
test('right kick excludes the back, sides and distant targets, and follows facing',()=>{
 const origin={x:4,z:-2};
 assert.ok(inKickReach(origin,0,{x:3.78,z:-.5}));
 for(const target of [{x:4,z:-3},{x:5.5,z:-2},{x:3.78,z:.2}])assert.equal(inKickReach(origin,0,target),false);
 assert.ok(inKickReach(origin,Math.PI/2,{x:5.5,z:-1.78}));
});
