import test from 'node:test';import assert from 'node:assert/strict';import {createMission,nearMissionStart} from './mission.js';
const items=()=>Array.from({length:16},()=>({down:false}));
test('mission has a briefing, countdown and twelve seconds head start',()=>{
 const m=createMission(),p=items();assert.equal(m.status,'idle');m.offer();assert.ok(m.blocksWorld);
 m.begin(p,7);assert.equal(m.count,0);assert.equal(m.total,16);assert.equal(m.status,'countdown');
 m.tick(2);assert.equal(m.status,'countdown');m.tick(1);assert.equal(m.status,'running');assert.equal(m.grace,12);
 m.tick(5);assert.equal(m.grace,7);assert.equal(m.time,5);
 assert.ok(nearMissionStart({x:0,z:-17}));assert.equal(nearMissionStart({x:0,z:7}),false);
});
test('each new downed object advances progress, chains count, all sixteen down together win',()=>{
 const m=createMission(),p=items();m.begin(p);m.tick(3);
 p[0].down=true;assert.deepEqual(m.observe(p,0),{progress:true,status:'running',count:1,total:16});
 assert.equal(m.observe(p,0).progress,false);
 p.forEach(o=>o.down=true);assert.equal(m.observe(p,0).status,'won');assert.ok(m.blocksWorld);
 assert.equal(m.observe(p,1),null,'completed victory cannot be overwritten');
});
test('only restoring the last downed object fails; retry and free play reset mission state',()=>{
 const m=createMission(),p=items();m.begin(p,5);m.tick(3);p[0].down=true;p[1].down=true;m.observe(p,5);
 p[0].down=false;assert.equal(m.observe(p,6).status,'running');assert.equal(m.count,1);
 p[1].down=false;assert.equal(m.observe(p,7).status,'lost');assert.ok(m.blocksWorld);
 m.begin(items(),0);assert.equal(m.count,0);assert.equal(m.time,0);m.tick(3);assert.equal(m.status,'running');
 m.free();assert.equal(m.status,'idle');assert.equal(m.blocksWorld,false);assert.equal(m.engaged,false);
});

test('clean start never fails, and rebuilding some props does not prevent later victory',()=>{
 const m=createMission(),p=items();m.begin(p);m.tick(3);m.tick(40);assert.equal(m.observe(p,0).status,'running');
 p[0].down=true;p[1].down=true;m.observe(p,0);p[0].down=false;assert.equal(m.observe(p,1).status,'running');
 p.forEach(o=>o.down=true);assert.equal(m.observe(p,1).status,'won');assert.equal(m.count,16);
});
