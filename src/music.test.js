import test from 'node:test';import assert from 'node:assert/strict';
import {musicLevel,LoopMusic} from './music.js';
const settle=async()=>{for(let i=0;i<20;i++)await Promise.resolve();};
function environment(delayed=false){
 let release;const gate=delayed?new Promise(r=>release=r):Promise.resolve();
 globalThis.fetch=async()=>{await gate;return {ok:true,arrayBuffer:async()=>new ArrayBuffer(4)};};
 const sources=[],gainCalls=[];
 const context={currentTime:4,destination:{},decodeAudioData:async()=>({duration:65.62}),createGain:()=>({gain:{value:0,cancelScheduledValues(){},setTargetAtTime(v){gainCalls.push(v);}},connect(){}}),createBufferSource:()=>{const s={connect(){},disconnect(){},start(){this.started=true;},stop(){this.stopped=true;}};sources.push(s);return s;}};
 return {music:new LoopMusic(context),sources,gainCalls,release};
}
test('recorded music loops once, ducks under speech, and stops on pause',async()=>{
 const {music,sources,gainCalls}=environment();
 assert.ok(20*Math.log10(musicLevel(true)/musicLevel(false))< -12);
 music.start();music.start();await settle();
 assert.equal(sources.length,1);assert.equal(sources[0].loop,true);assert.equal(sources[0].started,true);
 music.duck(true);music.duck(false);assert.deepEqual(gainCalls,[musicLevel(true),musicLevel(false)]);
 music.stop();assert.equal(sources[0].stopped,true);assert.equal(music.playing,false);
 music.start();await settle();assert.equal(sources.length,2);music.stop();
});
test('pause while loading prevents a delayed music start',async()=>{
 const {music,sources,release}=environment(true);music.start();music.stop();release();await settle();assert.equal(sources.length,0);
});
