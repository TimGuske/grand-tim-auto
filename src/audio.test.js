import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { GameAudio, PHRASES } from './audio.js';

const settle = async () => { for(let i=0;i<20;i++)await Promise.resolve(); };
function environment({ delayed=false }={}) {
 const sources=[], requests=[];
 let release;
 const manifest=Object.fromEntries(PHRASES.map(p=>[p.id,{male:`${p.id}-male.mp3`,female:`${p.id}-female.mp3`} ]));
 const gate=delayed?new Promise(resolve=>release=resolve):Promise.resolve();
 globalThis.fetch=async url=>{
  requests.push(url);
  if(url.endsWith('manifest.json')){await gate;return {ok:true,json:async()=>manifest};}
  return {ok:true,arrayBuffer:async()=>new ArrayBuffer(4)};
 };
 const context={state:'running',decodeAudioData:async()=>({duration:1}),createBufferSource:()=>{
  const source={connect(){},disconnect(){},start(){this.started=true;},stop(){this.stopped=true;this.onended?.();}};
  sources.push(source);return source;
 }};
 globalThis.window={speechSynthesis:{speak(){assert.fail('Browser speech must never replace approved clips');}}};
 const audio=new GameAudio();audio.enabled=true;audio.context=context;
 return {audio,sources,requests,release};
}

test('recorded male/female clip follows its speaker and the exact bubble text',async()=>{
 const {audio,sources}=environment();let visible;
 assert.equal(audio.speak(PHRASES[1],text=>visible=text,()=>{},'female'),true);
 assert.equal(audio.speak(PHRASES[0]),false);
 await settle();
 assert.equal(visible,PHRASES[1].text);assert.equal(sources.length,1);assert.equal(sources[0].started,true);
 assert.equal(audio.buffers.has(`${PHRASES[1].id}:female`),true);
 sources[0].onended();assert.equal(audio.speaking,false);
 audio.speak(PHRASES[1]);await settle();
 assert.equal(audio.buffers.has(`${PHRASES[1].id}:male`),true);audio.stop();
});

test('pause stops playback and a stale callback cannot end a newer line',async()=>{
 const {audio,sources}=environment();let ended=0;
 audio.speak(PHRASES[0],()=>{},()=>ended++);await settle();
 audio.stop();assert.equal(ended,1);assert.equal(sources[0].stopped,true);
 audio.speak(PHRASES[1]);await settle();sources[0].onended();
 assert.equal(audio.speaking,true);sources[1].onended();assert.equal(audio.speaking,false);
});

test('stopping while clips load prevents delayed unwanted speech',async()=>{
 const {audio,sources,release}=environment({delayed:true});
 audio.speak(PHRASES[0]);audio.stop();release();await settle();
 assert.equal(sources.length,0);assert.equal(audio.speaking,false);
});

test('missing clip uses text with no computer voice and releases the speech lock',async()=>{
 const {audio,sources}=environment();
 audio.speak({id:'missing',text:'Text'});await settle();
 assert.equal(sources.length,0);assert.equal(audio.speaking,false);
});

test('every playable phrase ships both approved voice files',()=>{
 const manifest=JSON.parse(readFileSync(new URL('../public/audio/manifest.json',import.meta.url)));
 assert.equal(Object.keys(manifest).length,PHRASES.length);
 for(const phrase of PHRASES)for(const voice of ['male','female']){
  const file=manifest[phrase.id][voice];assert.equal(typeof file,'string');
  assert.equal(existsSync(new URL(`../public/audio/${file}`,import.meta.url)),true);
 }
});

test('Aperol chime schedules three quiet notes, respects mute and yields to speech',()=>{
 const {audio}=environment(),notes=[];audio.context.currentTime=0;
 audio.context.createGain=()=>({gain:{setValueAtTime(){},linearRampToValueAtTime(v){assert.ok(v<=.06);},exponentialRampToValueAtTime(){}},connect(){},disconnect(){}});
 audio.context.createOscillator=()=>{const note={frequency:{},connect(g){return g;},disconnect(){},start(t){this.time=t;},stop(){this.stopped=true;}};notes.push(note);return note;};
 audio.aperolAlarm();assert.equal(notes.length,3);assert.deepEqual(notes.map(n=>n.time),[0,.18,.36]);
 audio.stopAlarm();assert.equal(audio.alarmSources.size,0);
 audio.speaking=true;audio.aperolAlarm();assert.equal(notes.length,3);
 audio.speaking=false;audio.enabled=false;audio.aperolAlarm();assert.equal(notes.length,3);
});
