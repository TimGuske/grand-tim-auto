import test from 'node:test';import assert from 'node:assert/strict';
import {crowdPlan,stepCrowd} from './crowd.js';
test('three conversational pairs stay at their stalls; walkers move faster and displaced partners return naturally',()=>{
 for(let i=0;i<12;i++){
  const n={...crowdPlan(i),phase:0,recovery:0},start={x:n.x,z:n.z};
  const walking=stepCrowd(n,.1,0);
  if(i<6){assert.equal(walking,false);assert.deepEqual({x:n.x,z:n.z},start);
   n.x+=2;assert.ok(stepCrowd(n,.1,0));assert.ok(n.x<start.x+2&&n.x>start.x);
  }else{assert.ok(walking);assert.ok(Math.hypot(n.x-start.x,n.z-start.z)>=.109);}
 }
});
