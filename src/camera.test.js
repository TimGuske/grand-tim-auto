import test from 'node:test';import assert from 'node:assert/strict';import {cameraView,cameraLineClear} from './camera.js';
test('camera keeps its normal orbit in open space and finds a visible angle at a building wall or corner',()=>{
 const focus={x:0,y:1.7,z:0},open=cameraView(focus,0,.26,10,()=>false);assert.equal(open.distance,10);assert.equal(open.turn,0);
 const wall=p=>p.z>1.8&&p.y<12;
 const view=cameraView(focus,0,.26,10,wall);assert.ok(view.distance>5,'camera changes angle instead of sitting in the wall');assert.ok(cameraLineClear(focus,view,wall));assert.equal(wall(view),false);
 const corner=p=>(p.z>1.8||p.x>1.8)&&p.y<12;
 const c=cameraView(focus,Math.PI/4,.26,10,corner);assert.ok(cameraLineClear(focus,c,corner));assert.equal(corner(c),false);
});

test('actual square houses, gate and cafe canopies never hide the camera sightline',async()=>{
 const {collides}=await import('./world.js');const blocked=p=>collides(p,.3,true);
 assert.ok(blocked({x:16,y:3,z:2.5}));assert.ok(blocked({x:0,y:7,z:-25}));
 assert.equal(blocked({x:0,y:1.7,z:-25}),false,'gate passage stays open');
 for(const focus of [{x:11,y:1.7,z:5},{x:-11,y:1.7,z:-10},{x:0,y:1.7,z:-19},{x:8,y:1.7,z:8}])for(let yaw=-Math.PI;yaw<Math.PI;yaw+=.2){
  const view=cameraView(focus,yaw,.26,10.5,blocked);
  assert.ok(cameraLineClear(focus,view,blocked));assert.ok(!blocked(view));
 }
});
