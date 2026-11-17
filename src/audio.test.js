import test from 'node:test';
import assert from 'node:assert/strict';
import { GameAudio, PHRASES } from './audio.js';
function environment(){
 const utterances=[];const synth={getVoices:()=>[{lang:'de-DE',localService:true,name:'German'}],addEventListener:()=>{},resume:()=>{},cancel:()=>{},speak:u=>utterances.push(u)};
 globalThis.window={speechSynthesis:synth};globalThis.SpeechSynthesisUtterance=class {constructor(text){this.text=text;}};
 globalThis.fetch=async()=>({ok:true,json:async()=>({})});return {synth,utterances};
}
test('one exact phrase supplies speech, and overlapping reactions do not replace it',()=>{
 const {utterances}=environment(),audio=new GameAudio();audio.enabled=true;let visible;
 assert.equal(audio.speak(PHRASES[2],text=>visible=text),true);utterances[0].onstart();
 assert.equal(visible,PHRASES[2].text);assert.equal(utterances[0].text,visible);
 assert.equal(audio.speak(PHRASES[3]),false);assert.equal(utterances.length,1);
 utterances[0].onend();assert.equal(audio.speaking,false);
});
test('pause cancels the current phrase and its old callback cannot cancel a later phrase',()=>{
 const {utterances}=environment(),audio=new GameAudio();audio.enabled=true;let ended=0;
 audio.speak(PHRASES[0],()=>{},()=>ended++);audio.stop();assert.equal(ended,1);
 audio.speak(PHRASES[1]);utterances[0].onend();assert.equal(audio.speaking,true);
 utterances[1].onend();assert.equal(audio.speaking,false);
});
test('no speech service falls back cleanly without locking further reactions',()=>{
 environment();delete window.speechSynthesis;const audio=new GameAudio();audio.enabled=true;
 assert.equal(audio.speak(PHRASES[0]),false);assert.equal(audio.speaking,false);
});
