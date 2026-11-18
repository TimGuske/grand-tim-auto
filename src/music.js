// User-supplied memo; the asset includes its fade-in and fade-out for every loop.
const base=import.meta.env?.BASE_URL||'./';
export const musicLevel=speaking=>speaking?.045:.20;
export class LoopMusic{
 constructor(context,onError=()=>{}){
  this.context=context;this.output=context.createGain();this.output.gain.value=musicLevel(false);
  this.output.connect(context.destination);this.playing=false;this.source=null;this.generation=0;
  this.ready=fetch(`${base}audio/background-memo-v1.mp3`).then(r=>{
   if(!r.ok)throw new Error('music');return r.arrayBuffer();
  }).then(bytes=>context.decodeAudioData(bytes)).catch(()=>{onError();return null;});
 }
 duck(speaking){
  const now=this.context.currentTime,g=this.output.gain;
  g.cancelScheduledValues(now);g.setTargetAtTime(musicLevel(speaking),now,speaking?.035:.35);
 }
 start(){
  if(this.playing)return;this.playing=true;const generation=++this.generation;
  this.ready.then(buffer=>{
   if(!this.playing||generation!==this.generation)return;
   if(!buffer){this.playing=false;return;}
   const source=this.context.createBufferSource();source.buffer=buffer;source.loop=true;
   source.connect(this.output);source.onended=()=>{source.disconnect();if(this.source===source)this.source=null;};
   this.source=source;source.start();
  });
 }
 stop(){
  this.playing=false;this.generation++;
  const source=this.source;this.source=null;
  if(source){source.stop();source.disconnect();}
 }
}
