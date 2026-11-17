import * as THREE from 'three';
import './style.css';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
document.body.classList.toggle('touch', matchMedia('(any-pointer: coarse)').matches || new URLSearchParams(location.search).has('touch'));
import { WORLD, FOUNTAIN, moveWithinWorld, canBump, scoreForCombo } from './gameplay.js';

const $ = id => document.getElementById(id);
const scene = new THREE.Scene();
scene.background = new THREE.Color('#c5d9d6');
scene.fog = new THREE.Fog('#c5d9d6', 45, 100);
const camera = new THREE.PerspectiveCamera(62, innerWidth / innerHeight, .1, 160);
let renderer;
try { renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' }); }
catch { $('game').innerHTML = '<p style="padding:25vh 15vw">Die 3D-Welt braucht WebGL. Bitte öffne das Spiel in einem aktuellen Browser mit aktivierter Grafikbeschleunigung.</p>'; $('intro').hidden = true; throw new Error('WebGL unavailable'); }
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.7));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.25;
$('game').appendChild(renderer.domElement);
scene.add(new THREE.HemisphereLight('#fff2d8', '#718477', 2.8));
const sun = new THREE.DirectionalLight('#ffe4b2', 3.2);
sun.position.set(-16, 30, 18); sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048); Object.assign(sun.shadow.camera, { left: -35, right: 35, top: 35, bottom: -35, near: .5, far: 90 });
sun.shadow.normalBias = .035; scene.add(sun);
const materials = new Map();
function mat(color) { if (!materials.has(color)) materials.set(color, new THREE.MeshStandardMaterial({ color, roughness: .87 })); return materials.get(color); }
function mesh(geometry, color, parent, x=0, y=0, z=0) { const m = new THREE.Mesh(geometry, mat(color)); m.position.set(x,y,z); m.castShadow = true; m.receiveShadow = true; parent.add(m); return m; }
const box = (p,c,x,y,z,w,h,d) => mesh(new THREE.BoxGeometry(w,h,d),c,p,x,y,z);
const ball = (p,c,x,y,z,r,sx=1,sy=1,sz=1) => { const m=mesh(new THREE.SphereGeometry(r,12,9),c,p,x,y,z);m.scale.set(sx,sy,sz);return m; };
const cyl = (p,c,x,y,z,r1,r2,h,n=12) => mesh(new THREE.CylinderGeometry(r1,r2,h,n),c,p,x,y,z);
function label(text, width=512, bg='#f6e9c9', color='#334137') {
  const c=document.createElement('canvas');c.width=width;c.height=128; const ctx=c.getContext('2d');
  ctx.fillStyle=bg;ctx.fillRect(0,0,width,128);ctx.strokeStyle=color;ctx.lineWidth=5;ctx.strokeRect(9,9,width-18,110);
  ctx.fillStyle=color;ctx.font='bold 48px Georgia';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,width/2,67,width-35);
  const tex=new THREE.CanvasTexture(c); tex.colorSpace=THREE.SRGBColorSpace;return new THREE.MeshBasicMaterial({map:tex});
}
function sign(parent,text,x,y,z,w=3){const m=new THREE.Mesh(new THREE.PlaneGeometry(w,w/4),label(text));m.position.set(x,y,z);parent.add(m);return m;}
// A single instanced cobblestone mesh keeps the square light enough for phones.
box(scene,'#a9a794',0,-.26,-1,70,.4,80);
const random = (() => { let seed=841;return()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};})();
const cobbles = new THREE.InstancedMesh(new THREE.BoxGeometry(.68,.06,.48),mat('#b9b6a3'), 75*110);
const dummy=new THREE.Object3D(), color=new THREE.Color();let instance=0;
for(let row=0;row<110;row++)for(let col=0;col<75;col++){
  dummy.position.set((col-37)*.72+(row%2)*.36,-.025,(row-55)*.52); dummy.rotation.y=(random()-.5)*.06;dummy.updateMatrix();
  cobbles.setMatrixAt(instance,dummy.matrix);color.setHSL(.11,.08+random()*.04,.54+random()*.13);cobbles.setColorAt(instance++,color);
}
cobbles.receiveShadow=true;scene.add(cobbles);
for(const x of [-12.8,12.8]){box(scene,'#d7ceba',x,.06,-1,1.3,.18,45);box(scene,'#8b8e7c',x+(x>0?-.8:.8),.02,-1,.13,.04,45);}
function roof(p,w,d,y,color='#9a5140'){
 const shape=new THREE.Shape();shape.moveTo(-w/2,0);shape.lineTo(w/2,0);shape.lineTo(0,w*.49);shape.closePath();
 const g=new THREE.ExtrudeGeometry(shape,{depth:d,bevelEnabled:false});const r=mesh(g,color,p,0,y,-d/2);
 box(p,'#f0dac0',0,y-.04,d/2-.01,w,.13,.15);
 // roof tile bands along both slopes
 for(let side of [-1,1])for(let i=1;i<7;i++){const xx=side*w*.5*(i/7);const yy=y+w*.49*(1-i/7);const band=box(p,'#a75b47',xx,yy+.02,0,.08,.06,d+.06);band.rotation.z=-side*.78;}
 return r;
}
function house(x,z,w,h,tone,timber=false,store=''){
 const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=x>0?-Math.PI/2:Math.PI/2;scene.add(g);
 box(g,tone,0,h/2,0,w,h,5.5);box(g,'#d9c8a6',0,.35,2.8,w,.7,.15);roof(g,w+.5,6,h);
 for(let floor=0;floor<3;floor++)for(let i=0;i<3;i++){
  const wx=(i-1)*w*.28,wy=1.65+floor*(h-1)/3;
  box(g,'#efe4c7',wx,wy,2.8,1.1,1.55,.15);box(g,'#526d6b',wx,wy,2.9,.8,1.23,.06);
  box(g,'#e9d8b5',wx,wy,2.95,.06,1.25,.04);box(g,'#e9d8b5',wx,wy,2.95,.85,.06,.04);
  for(const s of [-1,1])box(g,timber?'#677c60':'#ac7860',wx+s*.65,wy,2.86,.22,1.45,.08);
  if(floor===1){box(g,'#64755c',wx,wy-.85,3.05,1.2,.25,.32);for(let j=0;j<4;j++)ball(g,j%2?'#f1b64e':'#d96a54',wx-.4+j*.26,wy-.62,3.1,.15);}
 }
 if(timber){for(let y of [3.2,5.8,h-.1])box(g,'#55483b',0,y,2.9,w,.18,.16);for(let xx of [-w/2+.1,0,w/2-.1])box(g,'#55483b',xx,h/2,2.89,.17,h,.15);
 for(const s of [-1,1]){const beam=box(g,'#55483b',s*w*.25,4.5,2.91,.13,2.7,.12);beam.rotation.z=s*.65;}}
 box(g,'#4a5a50',0,1.05,2.86,1.2,2.1,.17);box(g,'#d6b37b',.36,1.04,2.98,.08,.1,.06);
 if(store){sign(g,store,0,2.55,3.03,w*.78);const awning=box(g,'#c06c4c',0,2.15,3.4,w*.87,.13,1.2);awning.rotation.x=.15;
 for(let i=0;i<8;i++)box(g,i%2?'#f3dfb5':'#c06c4c',-w*.39+i*w*.11,2.15,3.42,w*.105,.15,1.25);}
 box(g,'#ab674b',w*.25,h+1.25,-1,.7,2.8,.7);
}
const tones=['#eed5a2','#dbb795','#d8dabb','#f1dfb8','#c9bca1'];
for(let side of [-1,1])for(let i=0;i<6;i++)house(side*16,-20+i*7.5,7,6.2+(i%3)*.65,tones[(i+(side>0?2:0))%5],i%2===0,['BÄCKEREI','WEINSTUBE','BLUMEN','KAFFEE','LÄDLE','VESCHPER'][i]);
// Schwaikheimer Torturm: pale shaft, stone portal, half-timbered upper floor and steep tiled roof.
const tower=new THREE.Group();tower.position.set(0,0,-25);scene.add(tower);
for(const side of [-1,1])box(tower,'#ccb992',side*2,2,0,1.8,4,5);
box(tower,'#e8d4aa',0,7.2,0,5.8,7.3,5);
const arch=new THREE.Mesh(new THREE.TorusGeometry(1.1,.35,6,18,Math.PI),mat('#c5af87'));arch.position.set(0,2.65,2.57);tower.add(arch);
box(tower,'#dfc597',0,3.95,0,5.8,1.2,5);box(tower,'#9c8868',0,11,0,6.2,.35,5.4);
box(tower,'#f3e4c3',0,12.1,0,5.7,2,5);for(const x of [-2.7,0,2.7])box(tower,'#614c3c',x,12.1,2.55,.17,2.1,.12);
for(const side of [-1,1]){const b=box(tower,'#614c3c',side*1.4,12.1,2.57,.17,2.8,.13);b.rotation.z=side*.82;}
roof(tower,6.7,6.2,13.2,'#86503e');cyl(tower,'#b89857',0,16.8,0,.06,.06,.6);ball(tower,'#dab252',0,17.2,0,.16);
for(const y of [5.3,7.6,9.7])for(const x of [-1.55,1.55])box(tower,'#52635a',x,y,2.54,.65,1.1,.1);
const clockFace=cyl(tower,'#36483f',0,10,2.65,.72,.72,.12,32);clockFace.rotation.x=Math.PI/2;
const face=cyl(tower,'#e9d49c',0,10,2.73,.58,.58,.03,32);face.rotation.x=Math.PI/2;
box(tower,'#34473f',0,10.19,2.77,.045,.4,.03);const hand=box(tower,'#34473f',.19,10.03,2.78,.4,.045,.03);hand.rotation.z=.2;
sign(tower,'WINNENDEN',0,4.05,2.6,3.4);
// Baroque market fountain, octagonal basin, water and statue.
const fountain=new THREE.Group();fountain.position.set(FOUNTAIN.x,0,FOUNTAIN.z);scene.add(fountain);
cyl(fountain,'#9a9785',0,.15,0,2.5,2.7,.3,8);cyl(fountain,'#c3b392',0,.45,0,2.28,2.4,.6,8);
cyl(fountain,'#639e9b',0,.77,0,2.06,2.06,.04,32);
const rim=mesh(new THREE.TorusGeometry(2.23,.18,5,8),'#e2ccaa',fountain,0,.85,0);rim.rotation.x=Math.PI/2;
cyl(fountain,'#ae9975',0,1.8,0,.28,.42,2.4);cyl(fountain,'#d4bd91',0,2.9,0,.57,.4,.2);
ball(fountain,'#8e9a7b',0,3.9,0,.38,1,1.3,1);cyl(fountain,'#8e9a7b',0,3.35,0,.26,.4,.8);box(fountain,'#8e9a7b',.48,3.5,0,.7,.13,.13);cyl(fountain,'#a8a77c',.78,3.85,0,.035,.035,1.1);
const streams=[];
for(let i=0;i<4;i++){const a=i*Math.PI/2;const curve=new THREE.QuadraticBezierCurve3(new THREE.Vector3(Math.sin(a)*.3,2.2,Math.cos(a)*.3),new THREE.Vector3(Math.sin(a)*1.4,2.4,Math.cos(a)*1.4),new THREE.Vector3(Math.sin(a)*1.7,.8,Math.cos(a)*1.7));const stream=mesh(new THREE.TubeGeometry(curve,15,.035,5,false),'#b9e0d7',fountain);streams.push(stream);}
for(const x of [-10,10])for(const z of [-14,9]){
 const tree=new THREE.Group();tree.position.set(x,0,z);scene.add(tree);cyl(tree,'#9a7653',0,1.5,0,.16,.24,3);ball(tree,'#708b58',0,3.7,0,1.5,1,1.1,1);ball(tree,'#8c9d60',.7,4,0,1);ball(tree,'#a4ac6b',-.5,4.6,.1,.95);
 cyl(tree,'#a58e6d',0,.28,0,.8,.7,.55,8);
}
for(const x of [-10,10])for(const z of [-7,3]){
 const bench=new THREE.Group();bench.position.set(x,0,z);bench.rotation.y=x>0?-Math.PI/2:Math.PI/2;scene.add(bench);
 for(let i=0;i<3;i++)box(bench,'#9e754b',0,.55,-.25+i*.22,2,.12,.18);box(bench,'#a27c54',0,1,-.4,2,.55,.12);
 for(const xx of [-.75,.75])box(bench,'#475a4a',xx,.26,0,.12,.5,.6);
}
// A little market stall at the far end gives the square its everyday life.
const stall=new THREE.Group();stall.position.set(-7,0,-14);scene.add(stall);
box(stall,'#9b7851',0,.9,0,3,1.3,1.6);for(const x of [-1.5,1.5])box(stall,'#806a47',x,1.6,0,.1,3.2,.1);
for(let i=0;i<8;i++)box(stall,i%2?'#f5deb1':'#c96a49',-1.54+i*.44,3,0,.44,.15,2.2);
for(let i=0;i<15;i++)ball(stall,i%3?'#e7ab40':'#acba65',-1.15+(i%5)*.55,1.66,Math.floor(i/5)*.4-.4,.19);
sign(stall,'FRISCH VOM FLECK',0,.95,.82,2.5);

// Merge the static town by material: mobile GPUs draw dozens of batches instead of thousands.
scene.updateMatrixWorld(true);
const batches = new Map();
scene.traverse(object => {
  if (!object.isMesh || object.isInstancedMesh) return;
  const key = object.material.uuid;
  if (!batches.has(key)) batches.set(key, { material: object.material, objects: [] });
  batches.get(key).objects.push(object);
});
for (const { material, objects } of batches.values()) {
  const geometries = objects.map(object => object.geometry.clone().applyMatrix4(object.matrixWorld));
  const combined = mergeGeometries(geometries, false);
  if (combined) {
    const town = new THREE.Mesh(combined, material); town.castShadow = true; town.receiveShadow = true; scene.add(town);
    for (const object of objects) { object.removeFromParent(); object.geometry.dispose(); }
  }
  for (const geometry of geometries) geometry.dispose();
}

function character(isTim, coat='#bb7855'){
 const root=new THREE.Group(), body=new THREE.Group();root.add(body);
 const skin=isTim?'#e0ad85':'#e9bc8b',dark=isTim?'#243348':coat;
 const legs=[];for(const s of [-1,1]){const leg=new THREE.Group();leg.position.set(s*.19,.65,0);body.add(leg);box(leg,'#414847',0,-.27,0,.26,.6,.28);box(leg,'#2b3635',0,-.57,.09,.32,.18,.5);legs.push(leg);}
 cyl(body,dark,0,1.12,0,.4,.48,1.1);box(body,dark,0,.72,0,.8,.27,.55);
 const arms=[];for(const s of [-1,1]){const arm=new THREE.Group();arm.position.set(s*.43,1.5,0);body.add(arm);cyl(arm,dark,0,-.26,0,.15,.13,.65);ball(arm,skin,0,-.62,0,.15);arms.push(arm);}
 const head=new THREE.Group();head.position.y=1.96;body.add(head);ball(head,skin,0,0,0,.43,1,1.08,.9);ball(head,skin,0,-.02,.38,.11,1,1,1.2);
 for(const s of [-1,1]){ball(head,skin,s*.41,-.02,0,.11);ball(head,'#253330',s*.15,.03,.355,.035);}
 if(isTim){
  for(const s of [-1,1]){const frame=mesh(new THREE.TorusGeometry(.155,.035,4,4),'#151c20',head,s*.2,.04,.37);frame.rotation.z=Math.PI/4;frame.scale.set(1.18,1,1);box(head,'#1c2225',s*.37,.06,.18,.05,.05,.4);}
  box(head,'#171d21',0,.07,.4,.12,.05,.05);
  for(const s of [-1,1]){const mo=ball(head,'#69513e',s*.09,-.17,.36,.115,1,.43,.45);mo.rotation.z=s*.12;}
  ball(head,'#1f2938',0,.3,-.025,.44,1, .7,1);cyl(head,'#202b3b',0,.27,0,.435,.435,.15);
  box(head,'#d5c5a0',-.12,.31,.412,.07,.07,.015);
  cyl(body,'#484b4c',0,1.65,0,.43,.4,.23);const scarf=box(body,'#4c5050',.16,1.16,.43,.27,.85,.1);scarf.rotation.z=-.1;
  for(let i=0;i<5;i++)box(body,'#a4a095',.07+i*.045,.69,.49,.015,.13,.02);
  for(let i=0;i<3;i++)box(body,'#b5aa8b',-.18,.9+i*.21,.43,.045,.045,.03);
 }else{ball(head,['#785440','#cfb27d','#696b50'][Math.floor(random()*3)],0,.28,-.04,.43,1,.6,1);if(random()>.45)cyl(head,coat,0,.32,0,.49,.49,.13);}
 scene.add(root);return {root,body,legs,arms,head};
}
const tim=character(true);tim.root.position.set(0,0,7);
const npcColors=['#ba6447','#648b7c','#d6ac4a','#8b839f','#a88569','#697d96'];
const npcs=Array.from({length:12},(_,i)=>{
 const avatar=character(false,npcColors[i%6]);const x=-8+(i%4)*5,z=-13+Math.floor(i/4)*10;
 avatar.root.position.set(x,0,z);return {...avatar,x,z,homeX:x,homeZ:z,air:0,vy:0,vx:0,vz:0,cooldown:0,phase:random()*6,heading:random()*6};
});
const phrases=['Heidanei!','Ja sag amol!','Hanoi, doch ned so!','Des gibt’s doch net!','Du bisch mir oiner!','Sapperlot!','I glaub, i spinn!','No net hudla!'];
let started=false,paused=false,sound=false,audio,score=0,combo=0,lastHit=-10,bumpCooldown=0,bumpAnim=0,elapsed=0;
const keys=new Set();let joystick={x:0,y:0},touchSprint=false,yaw=0,pitch=.36,drag=null;
const bubbles=[],effects=[];
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
function resetInput(){keys.clear();joystick={x:0,y:0};touchSprint=false;drag=null;$('stick-knob').style.transform='';}
function setPause(value){paused=value;resetInput();$('pause-overlay').hidden=!value;if(value)window.speechSynthesis?.cancel();}
function start(){started=true;setPause(false);$('intro').hidden=true;$('start').blur();}
$('start').onclick=start;$('resume').onclick=()=>setPause(false);$('pause').onclick=()=>started&&setPause(!paused);
$('help').onclick=()=>{setPause(true);$('pause-overlay').hidden=true;$('intro').hidden=false;$('start').textContent='WEITER GEHT’S ↗';};
$('portrait-continue').onclick=()=>$('rotate').classList.add('dismissed');
$('sound').onclick=()=>{sound=!sound;$('sound').textContent=sound?'TON AN':'TON AUS';$('sound').setAttribute('aria-pressed',String(sound));if(sound){audio??=new (window.AudioContext||window.webkitAudioContext)();audio.resume();say('Grüß Gott! Auf geht’s!');}else window.speechSynthesis?.cancel();};
function say(text){if(!sound||!('speechSynthesis' in window))return;const speech=new SpeechSynthesisUtterance(text);speech.lang='de-DE';speech.rate=1.08;speech.pitch=.86;const voice=speechSynthesis.getVoices().find(v=>v.lang.startsWith('de'));if(voice)speech.voice=voice;speechSynthesis.cancel();speechSynthesis.speak(speech);}
function boing(){if(!sound||!audio)return;const osc=audio.createOscillator(),gain=audio.createGain();osc.type='triangle';osc.frequency.setValueAtTime(180,audio.currentTime);osc.frequency.exponentialRampToValueAtTime(490,audio.currentTime+.08);osc.frequency.exponentialRampToValueAtTime(85,audio.currentTime+.32);gain.gain.setValueAtTime(.12,audio.currentTime);gain.gain.exponentialRampToValueAtTime(.001,audio.currentTime+.35);osc.connect(gain).connect(audio.destination);osc.start();osc.stop(audio.currentTime+.36);}
function speechBubble(npc,text){const el=document.createElement('div');el.className='bubble';el.textContent=text;$('bubbles').appendChild(el);bubbles.push({el,npc,life:2.8});}
function popEffect(x,z){const g=new THREE.Group();g.position.set(x,1.5,z);scene.add(g);for(let i=0;i<8;i++){const a=i*Math.PI/4;const s=box(g,i%2?'#f8db69':'#fff3ce',Math.sin(a)*.7,Math.cos(a)*.7,0,.14,.4,.12);s.rotation.z=-a;}effects.push({g,life:.5});}
function bump(){if(!started||paused||bumpCooldown>0)return;bumpCooldown=.55;bumpAnim=.35;let hits=0;
 for(const npc of npcs)if(canBump(tim.root.position,npc)){
  const dx=npc.x-tim.root.position.x,dz=npc.z-tim.root.position.z,len=Math.hypot(dx,dz)||1;
  npc.vx=dx/len*7;npc.vz=dz/len*7;npc.vy=8.5;npc.air=.01;npc.cooldown=3;
  combo=elapsed-lastHit<2.5?combo+1:1;lastHit=elapsed;const points=scoreForCombo(combo);score+=points;hits++;
  speechBubble(npc,phrases[Math.floor(random()*phrases.length)]);popEffect(npc.x,npc.z);
 }
 if(hits){boing();say(phrases[Math.floor(random()*phrases.length)]);$('score').textContent=String(score).padStart(4,'0');$('score-fill').style.width=`${Math.min(score/10,100)}%`;$('score-caption').textContent=score>=500?'Du bringsch den Fleck durcheinander!':'Des war aber koi Zufall.';$('toast').textContent=combo>1?`${Math.min(combo,4)}× HEIDANEI!`:'+25 · HEIDANEI!';$('toast').classList.add('visible');toastTime=1.2;}
 else {popEffect(tim.root.position.x+Math.sin(tim.root.rotation.y),tim.root.position.z+Math.cos(tim.root.rotation.y));}
}
let toastTime=0;
window.addEventListener('keydown',e=>{if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code))e.preventDefault();if(e.code==='Escape'&&started){setPause(!paused);return;}keys.add(e.code);if(e.code==='Space'&&!e.repeat)bump();});
window.addEventListener('keyup',e=>keys.delete(e.code));window.addEventListener('blur',()=>{if(started)setPause(true);else resetInput();});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&started)setPause(true);});
renderer.domElement.addEventListener('pointerdown',e=>{drag={id:e.pointerId,x:e.clientX,y:e.clientY};renderer.domElement.setPointerCapture(e.pointerId);});
renderer.domElement.addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId)return;yaw-=(e.clientX-drag.x)*.006;pitch=THREE.MathUtils.clamp(pitch+(e.clientY-drag.y)*.004,.24,.8);drag.x=e.clientX;drag.y=e.clientY;});
renderer.domElement.addEventListener('pointerup',()=>drag=null);renderer.domElement.addEventListener('pointercancel',()=>drag=null);
let stickPointer=null;
function updateStick(e){const r=$('stick').getBoundingClientRect();let x=(e.clientX-r.left-r.width/2)/38,y=(e.clientY-r.top-r.height/2)/38;const l=Math.hypot(x,y);if(l>1){x/=l;y/=l;}joystick={x,y};$('stick-knob').style.transform=`translate(${x*30}px,${y*30}px)`;}
$('stick').onpointerdown=e=>{stickPointer=e.pointerId;$('stick').setPointerCapture(e.pointerId);updateStick(e);};
$('stick').onpointermove=e=>{if(stickPointer===e.pointerId)updateStick(e);};
for(const event of ['pointerup','pointercancel','lostpointercapture'])$('stick').addEventListener(event,()=>{stickPointer=null;joystick={x:0,y:0};$('stick-knob').style.transform='';});
$('bump').onpointerdown=e=>{e.preventDefault();bump();};$('sprint').onpointerdown=e=>{touchSprint=true;$('sprint').setPointerCapture(e.pointerId);};
for(const event of ['pointerup','pointercancel','lostpointercapture'])$('sprint').addEventListener(event,()=>touchSprint=false);
const follow=new THREE.Vector3(0,1,2),cameraGoal=new THREE.Vector3();
function resize(){camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));}window.addEventListener('resize',resize);
const map=$('map').getContext('2d');
function drawMap(){map.fillStyle='#dedcc9';map.fillRect(0,0,160,140);map.fillStyle='#b3b6a0';for(let i=0;i<6;i++){map.fillRect(5,7+i*21,28,17);map.fillRect(128,7+i*21,27,17);}map.fillStyle='#a08e70';map.fillRect(71,0,18,12);map.fillStyle='#80a7a1';map.beginPath();map.arc(80+FOUNTAIN.x*3,69+FOUNTAIN.z*2.6,7,0,Math.PI*2);map.fill();for(const n of npcs){map.fillStyle=n.air>0?'#e7653d':'#88947c';map.beginPath();map.arc(80+n.x*3,69+n.z*2.6,2.2,0,Math.PI*2);map.fill();}map.fillStyle='#e46034';map.beginPath();map.arc(80+tim.root.position.x*3,69+tim.root.position.z*2.6,4,0,Math.PI*2);map.fill();map.strokeStyle='#fff8df';map.lineWidth=2;map.stroke();}
const timer=new THREE.Clock();
function animate(){requestAnimationFrame(animate);const dt=Math.min(timer.getDelta(),.04);const active=started&&!paused;
 if(active){elapsed+=dt;bumpCooldown=Math.max(0,bumpCooldown-dt);bumpAnim=Math.max(0,bumpAnim-dt);toastTime-=dt;if(toastTime<=0)$('toast').classList.remove('visible');
 let ix=(keys.has('KeyD')||keys.has('ArrowRight')?1:0)-(keys.has('KeyA')||keys.has('ArrowLeft')?1:0)+joystick.x;
 let iz=(keys.has('KeyS')||keys.has('ArrowDown')?1:0)-(keys.has('KeyW')||keys.has('ArrowUp')?1:0)+joystick.y;
 const inputLength=Math.hypot(ix,iz);if(inputLength>1){ix/=inputLength;iz/=inputLength;}
 const speed=(keys.has('ShiftLeft')||keys.has('ShiftRight')||touchSprint)?7:4.3;
 const dx=(ix*Math.cos(yaw)+iz*Math.sin(yaw))*speed*dt,dz=(-ix*Math.sin(yaw)+iz*Math.cos(yaw))*speed*dt;
 const next=moveWithinWorld(tim.root.position,dx,dz);tim.root.position.x=next.x;tim.root.position.z=next.z;
 if(inputLength>.05){const angle=Math.atan2(dx,dz);tim.root.rotation.y+=Math.atan2(Math.sin(angle-tim.root.rotation.y),Math.cos(angle-tim.root.rotation.y))*Math.min(1,dt*14);}
 const stride=inputLength>.05?Math.sin(elapsed*speed*3)*.5:0;
 tim.legs[0].rotation.x=stride;tim.legs[1].rotation.x=-stride;tim.arms[0].rotation.x=-stride;tim.arms[1].rotation.x=bumpAnim>0?-1.6:stride;
 tim.body.position.y=reducedMotion?0:Math.abs(stride)*.09;tim.body.rotation.z=bumpAnim>0?Math.sin(bumpAnim*10)*.1:0;
 for(const n of npcs){n.cooldown=Math.max(0,n.cooldown-dt);
  if(n.air>0){n.vy-=20*dt;n.air+=n.vy*dt;const pos=moveWithinWorld(n,n.vx*dt,n.vz*dt);n.x=pos.x;n.z=pos.z;n.body.rotation.z+=dt*7;n.body.rotation.x+=dt*4;if(n.air<=0){n.air=0;n.body.rotation.set(0,0,0);n.vx=0;n.vz=0;}}
  else {n.heading+=Math.sin(elapsed*.5+n.phase)*dt*.45;const nx=Math.sin(n.heading)*.65*dt,nz=Math.cos(n.heading)*.65*dt;const pos=moveWithinWorld(n,nx,nz);if(Math.abs(pos.x-n.x)<Math.abs(nx)*.2||Math.abs(pos.z-n.z)<Math.abs(nz)*.2)n.heading+=1.5;n.x=pos.x;n.z=pos.z;n.root.rotation.y=n.heading;n.legs[0].rotation.x=Math.sin(elapsed*4+n.phase)*.25;n.legs[1].rotation.x=-n.legs[0].rotation.x;}
  n.root.position.set(n.x,n.air,n.z);
 }
 for(let i=effects.length-1;i>=0;i--){const effect=effects[i];effect.life-=dt;effect.g.scale.setScalar(1+(.5-effect.life)*3);effect.g.rotation.y+=dt*3;if(effect.life<=0){scene.remove(effect.g);effect.g.traverse(o=>o.geometry?.dispose());effects.splice(i,1);}}
 }
 for(let i=bubbles.length-1;i>=0;i--){const b=bubbles[i];if(active)b.life-=dt;const pos=b.npc.root.position.clone().add(new THREE.Vector3(0,3.1,0)).project(camera);b.el.style.left=`${(pos.x*.5+.5)*innerWidth}px`;b.el.style.top=`${(-pos.y*.5+.5)*innerHeight}px`;b.el.style.display=pos.z>1||paused?'none':'block';if(b.life<=0){b.el.remove();bubbles.splice(i,1);}}
 const target=started?tim.root.position.clone().add(new THREE.Vector3(0,1.5,-3)):new THREE.Vector3(0,1,-8);
 follow.lerp(target,1-Math.exp(-dt*5));const distance=started?21:33;
 cameraGoal.set(follow.x+Math.sin(yaw)*Math.cos(pitch)*distance,follow.y+Math.sin(pitch)*distance,follow.z+Math.cos(yaw)*Math.cos(pitch)*distance);
 camera.position.lerp(cameraGoal,1-Math.exp(-dt*5));camera.lookAt(follow);drawMap();renderer.render(scene,camera);
}
camera.position.set(16,21,30);animate();
// Read-only diagnostics for local QA; no score or preferences are stored.
window.__GTA_DEBUG__=()=>({started,paused,score,tim:{x:tim.root.position.x,z:tim.root.position.z},airborne:npcs.filter(n=>n.air>0).length,npcs:npcs.map(n=>({x:n.x,z:n.z,cooldown:n.cooldown}))});
