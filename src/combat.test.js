import test from 'node:test';
import assert from 'node:assert/strict';
import { inPunchReach,punchPose,PUNCH_DURATION,PUNCH_CONTACT } from './combat.js';
test('punch hits nearby targets in front and excludes the back and sides',()=>{
 const origin={x:0,z:0};
 assert.ok(inPunchReach(origin,0,{x:0,z:1.6}));
 assert.equal(inPunchReach(origin,0,{x:0,z:-1}),false);
 assert.equal(inPunchReach(origin,0,{x:1.6,z:0}),false);
 assert.equal(inPunchReach(origin,0,{x:0,z:2}),false);
 assert.equal(inPunchReach(origin,0,{x:0,z:3}),false);
 assert.ok(inPunchReach(origin,Math.PI/2,{x:1.6,z:0}));
 assert.ok(inPunchReach(origin,0,{x:0,z:0}));
});
test('punch extends at contact then returns to the resting pose',()=>{
 assert.deepEqual(punchPose(0),{extension:0});
 assert.equal(punchPose(PUNCH_DURATION).extension,0);
 assert.equal(punchPose(PUNCH_DURATION-PUNCH_CONTACT).extension,1);
 for(let t=0;t<PUNCH_DURATION;t+=.01){const p=punchPose(t);assert.ok(p.extension>=0&&p.extension<=1);}
});
