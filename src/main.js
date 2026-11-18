import {createTutorial,TUTORIAL_STEPS} from './tutorial.js';
import {createTutorialGuide} from './tutorial-visuals.js';
import {createMission,nearMissionStart,MISSION_START} from './mission.js';
import {createMissionVisuals,poseMissionVictory} from './mission-visuals.js';
import {cameraView,cameraLineClear} from './camera.js';
import {applyExhaustionPose} from './exhaustion-motion.js';
import {createRefillBeacon} from './refill-beacon.js';
import {launchPassant,stepPassantFlight} from './passant-flight.js';
import {turnToMovement} from './locomotion.js';
import {impactTargets} from './impact.js';
import {poseKick,KICK_DURATION,KICK_CONTACT} from './kick-motion.js';
import {bindActionButton,bindJoystick} from './touch-controls.js';
import * as THREE from 'three';
import './style.css';
import { nearestFree, separatePeople, moveWorld, canStand, collides, setPropObstacles } from './world.js';
import { makeCharacter } from './characters.js';
import { loadTim, poseTimArms } from './tim-model.js';
import { extendRig, poseBoxing, PLAYBACK_SPEED } from './boxing-motion.js';
import { SPRITZ_STAND, drainEnergy, energySpeed, canRefill, createAperolAlarm } from './energy.js';
import { createCleanup } from './cleanup.js';
import { crowdPlan, stepCrowd } from './crowd.js';
import { loadPerson } from './people.js';
import { PUNCH_DURATION, PUNCH_CONTACT } from './combat.js';
import { createProps } from './props.js';
import { GameAudio, PHRASES } from './audio.js';
import { createPassantLines } from './passant-speech.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
document.body.classList.toggle('touch', matchMedia('(any-pointer: coarse)').matches || new URLSearchParams(location.search).has('touch'));
import { FOUNTAIN, moveWithinWorld, scoreForCombo } from './gameplay.js';

const $ = id => document.getElementById(id);
const scene = new THREE.Scene();
scene.background = new THREE.Color('#85bddc');
scene.fog = new THREE.Fog('#b1ccce',70,140);
const camera = new THREE.PerspectiveCamera(57, innerWidth / innerHeight, .1, 650);
let renderer;
try { renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' }); }
catch { $('game').innerHTML = '<p style="padding:25vh 15vw">Die 3D-Welt braucht WebGL. Bitte öffne das Spiel in einem aktuellen Browser mit aktivierter Grafikbeschleunigung.</p>'; $('intro').hidden = true; throw new Error('WebGL unavailable'); }
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.7));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.12;
$('game').appendChild(renderer.domElement);
scene.add(new THREE.HemisphereLight('#fff4d4', '#668377', 2.2));
const sun = new THREE.DirectionalLight('#ffe5ac', 3.8);
sun.position.set(-16, 30, 18); sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048); Object.assign(sun.shadow.camera, { left: -35, right: 35, top: 35, bottom: -35, near: .5, far: 90 });
sun.shadow.normalBias = .035; scene.add(sun);
const materials = new Map();
function mat(color) { if (!materials.has(color)) materials.set(color, new THREE.MeshStandardMaterial({ color, roughness: .87 })); return materials.get(color); }
function mesh(geometry, color, parent, x=0, y=0, z=0) { const m = new THREE.Mesh(geometry, mat(color)); m.position.set(x,y,z); m.castShadow = true; m.receiveShadow = true; parent.add(m); return m; }
const box = (p,c,x,y,z,w,h,d) => mesh(new THREE.BoxGeometry(w,h,d),c,p,x,y,z);
const ball = (p,c,x,y,z,r,sx=1,sy=1,sz=1) => { const m=mesh(new THREE.SphereGeometry(r,20,14),c,p,x,y,z);m.scale.set(sx,sy,sz);return m; };
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
const cobbles = new THREE.InstancedMesh(new THREE.BoxGeometry(.68,.06,.48),mat('#bfae96'), 75*110);
const dummy=new THREE.Object3D(), color=new THREE.Color();let instance=0;
for(let row=0;row<110;row++)for(let col=0;col<75;col++){
  dummy.position.set((col-37)*.72+(row%2)*.36,-.025,(row-55)*.52); dummy.rotation.y=(random()-.5)*.06;dummy.updateMatrix();
  cobbles.setMatrixAt(instance,dummy.matrix);color.setHSL(.075+random()*.035,.12+random()*.12,.49+random()*.24);cobbles.setColorAt(instance++,color);
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
function house(x,z,w,h,tone,timber=false,store='',rotation=null){
 const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=rotation ?? (x>0?-Math.PI/2:Math.PI/2);scene.add(g);
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
 // Gable beams, a dormer, shop lamps and a gutter add depth at street level.
 for(const side of [-1,1]){const beam=box(g,'#5b4938',side*w*.23,h+w*.22,2.99,.14,w*.65,.12);beam.rotation.z=side*.8;}
 box(g,'#e9dbb8',0,h+.6,3.02,1.1,1.1,.12);box(g,'#506b6d',0,h+.6,3.1,.62,.75,.06);
 box(g,'#6b6a58',-w*.48,h/2,2.94,.08,h,.1);
 for(const side of [-1,1]){box(g,'#36493f',side*w*.39,2.1,3.07,.07,.6,.07);ball(g,'#f7d393',side*w*.39,2.38,3.08,.14,1,1.4,1);}
 return g;
}
const tones=['#eed5a2','#dbb795','#d8dabb','#f1dfb8','#c9bca1'];
for(let side of [-1,1])for(let i=0;i<6;i++)house(side*16,-20+i*7.5,7,6.2+(i%3)*.65,tones[(i+(side>0?2:0))%5],i%2===0,['BÄCKEREI','WEINSTUBE','BLUMEN','KAFFEE','LÄDLE','VESCHPER'][i]);
// Close the urban fabric around the gate: the tower belongs to a street, not an isolated stage.
for(const side of [-1,1]){
 house(side*6.7,-26.3,7.4,7.4+(side>0?.9:0),side>0?'#d9b49c':'#e7d3a6',true,side>0?'ZUM TORTURM':'ALTSTADT',0);
 house(side*13.7,-27,6.5,8.7,side>0?'#c8c7af':'#d8b18f',true,'',0);
 house(side*6.8,24,7.4,7.7,side>0?'#dbc69b':'#d2b5a0',true,'',Math.PI);
 house(side*13.9,24,6.8,8.8,'#e2d4b6',false,'',Math.PI);
}
// A low distant silhouette replaces the empty blue horizon.
for(let i=0;i<9;i++)ball(scene,i%2?'#94ae92':'#a3b69c',-55+i*14,-1,-55,14,1, .65, .6);
// Poster direction: a stone gate, cream plaster, corner quoins and a steep hipped tile roof.
const tower=new THREE.Group();tower.position.set(0,0,-25);scene.add(tower);
for(const side of [-1,1])box(tower,'#b5a085',side*2,2,0,1.8,4,5);
box(tower,'#e4d4b7',0,7.5,0,5.8,7.4,5);box(tower,'#c5b08e',0,3.8,0,5.8,.8,5);
// Individual voussoirs follow a pointed Gothic arch, leaving the doorway open.
for(const side of [-1,1])for(let i=0;i<6;i++){
 const t=i/5,x=side*(1.15*(1-t)),y=2.25+t*1.45;
 const stone=box(tower,i%2?'#bda889':'#d4bd98',x,y,2.63,.5,.43,.28);stone.rotation.z=side*(.2+t*.45);
}
for(const side of [-1,1])for(let i=0;i<19;i++)box(tower,i%2?'#b6a38b':'#c5b49a',side*2.75,.3+i*.57,2.55,i%2?.5:.8,.4,.14);
for(const y of [5.4,7.6,9.8])for(const x of (y===9.8?[0]:[-1.45,1.45])){
 box(tower,'#b7a28a',x,y,2.58,.87,1.32,.15);box(tower,'#3f5157',x,y,2.69,.52,.97,.07);
 box(tower,'#bf9465',x,y,2.74,.05,1,.03);
}
box(tower,'#7d5e47',0,11.3,0,6.3,.25,5.5);
const roofGeometry=new THREE.CylinderGeometry(.8,4.65,4.4,4,1,false);roofGeometry.rotateY(Math.PI/4);
const roofMesh=mesh(roofGeometry,'#a95637',tower,0,13.6,0);roofMesh.scale.z=.87;
// Small individually shaded tiles along four roof slopes.
for(let row=0;row<13;row++){
 const t=row/13,half=3.25*(1-t)+.58*t,y=11.47+t*4.3;
 for(const side of [-1,1])for(let col=0;col<Math.max(2,Math.floor(half*4));col++){
  const x=-half+.17+col*.46;
  box(tower,(row+col)%3?'#b76540':'#d28b56',x,y,side*half*.87,.4,.09,.16);
  box(tower,(row+col)%3?'#a95637':'#ca7850',side*half,y,x*.87,.16,.09,.34);
 }
}
box(tower,'#664e3c',0,16.25,0,1.15,.65,.95);roof(tower,1.5,1.3,16.55,'#8c4e34');
// Actual Winnenden arms: white shield, green vines and three black antlers on gold.
const crestTexture=new THREE.TextureLoader().load(`${import.meta.env.BASE_URL}landmarks/winnenden-wappen.svg`);
crestTexture.colorSpace=THREE.SRGBColorSpace;
const crest=new THREE.Mesh(new THREE.PlaneGeometry(1.9*535/587,1.9),new THREE.MeshBasicMaterial({map:crestTexture,transparent:true,alphaTest:.1}));
crest.position.set(0,6,2.84);tower.add(crest);
sign(tower,'WINNENDEN',0,4.35,2.82,5.0);
// Baroque market fountain, octagonal basin, water and statue.
const fountain=new THREE.Group();fountain.position.set(FOUNTAIN.x,0,FOUNTAIN.z);scene.add(fountain);
cyl(fountain,'#9a9785',0,.15,0,2.5,2.7,.3,8);cyl(fountain,'#c3b392',0,.45,0,2.28,2.4,.6,8);
for(let i=0;i<24;i++){const a=i/24*Math.PI*2;const block=box(fountain,i%2?'#b5aa96':'#d1c3a9',Math.sin(a)*2.3,.48,Math.cos(a)*2.3,.48,.42,.2);block.rotation.y=a;}
for(let i=0;i<12;i++){const a=i*Math.PI/6;ball(fountain,i%2?'#d788a2':'#eee4ce',Math.sin(a)*2.48,1.05,Math.cos(a)*2.48,.13);}
cyl(fountain,'#639e9b',0,.77,0,2.06,2.06,.04,32);
const rim=mesh(new THREE.TorusGeometry(2.23,.18,5,8),'#e2ccaa',fountain,0,.85,0);rim.rotation.x=Math.PI/2;
cyl(fountain,'#ae9975',0,1.8,0,.28,.42,2.4);cyl(fountain,'#d4bd91',0,2.9,0,.57,.4,.2);
ball(fountain,'#8e9a7b',0,3.9,0,.38,1,1.3,1);cyl(fountain,'#8e9a7b',0,3.35,0,.26,.4,.8);box(fountain,'#8e9a7b',.48,3.5,0,.7,.13,.13);cyl(fountain,'#a8a77c',.78,3.85,0,.035,.035,1.1);
const streams=[];
for(let i=0;i<4;i++){const a=i*Math.PI/2;const curve=new THREE.QuadraticBezierCurve3(new THREE.Vector3(Math.sin(a)*.3,2.2,Math.cos(a)*.3),new THREE.Vector3(Math.sin(a)*1.4,2.4,Math.cos(a)*1.4),new THREE.Vector3(Math.sin(a)*1.7,.8,Math.cos(a)*1.7));const stream=mesh(new THREE.TubeGeometry(curve,15,.035,5,false),'#b9e0d7',fountain);streams.push(stream);}
const leafMesh=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(.38,0),mat('#88a642'),4*150);
let leafIndex=0;
for(const x of [-10,10])for(const z of [-14,9]){
 const tree=new THREE.Group();tree.position.set(x,0,z);scene.add(tree);cyl(tree,'#82613e',0,2.5,0,.16,.3,5);
 for(const side of [-1,1]){const branch=cyl(tree,'#82613e',side*.4,4.3,0,.08,.16,1.8);branch.rotation.z=-side*.6;}
 for(let i=0;i<150;i++){
  const a=random()*Math.PI*2,vertical=(random()-.5)*2,r=Math.cbrt(random())*2;
  dummy.position.set(x+Math.cos(a)*r*Math.sqrt(1-vertical*vertical),5.9+vertical*r*.9,z+Math.sin(a)*r*Math.sqrt(1-vertical*vertical));
  dummy.rotation.set(random()*3,random()*3,random()*3);dummy.scale.setScalar(.7+random()*.75);dummy.updateMatrix();leafMesh.setMatrixAt(leafIndex,dummy.matrix);
  color.setHSL(.17+random()*.065,.42+random()*.25,.28+random()*.25);leafMesh.setColorAt(leafIndex++,color);
 }
 cyl(tree,'#b1a184',0,.2,0,.9,.95,.4,8);
}
leafMesh.castShadow=true;leafMesh.receiveShadow=true;scene.add(leafMesh);
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

// Overhead festoon flags and cafe tables give the market a lived-in rhythm.
for(const z of [-17,-6]){
 const wire=new THREE.QuadraticBezierCurve3(new THREE.Vector3(-12,6.6,z),new THREE.Vector3(0,4.6,z),new THREE.Vector3(12,6.6,z));
 mesh(new THREE.TubeGeometry(wire,24,.025,4,false),'#665e49',scene);
 for(let i=1;i<16;i++){const pos=wire.getPoint(i/16),flag=new THREE.BufferGeometry();flag.setAttribute('position',new THREE.Float32BufferAttribute([-.23,0,0,.23,0,0,0,-.65,.02],3));flag.computeVertexNormals();const f=mesh(flag,['#c26543','#e7bd52','#7d9a86'][i%3],scene,pos.x,pos.y,pos.z);f.material=mat(['#c26543','#e7bd52','#7d9a86'][i%3]).clone();f.material.side=THREE.DoubleSide;}
}
for(const z of [-1,10]){cyl(scene,'#4c6054',9,.7,z,.08,.15,1.4);cyl(scene,'#bd9259',9,1.4,z,.9,.9,.12,20);cyl(scene,'#f7e5bc',9.25,1.54,z,.1,.1,.15);}

for(const z of [-1,10]){
 cyl(scene,'#8e7754',9,2.2,z,.035,.035,4.4,8);
 const canopy=cyl(scene,'#f1dfba',9,4.3,z,.08,1.9,.65,8);canopy.rotation.y=Math.PI/8;
 for(let i=0;i<8;i++){const a=i*Math.PI/4;const rib=box(scene,'#d6c099',9+Math.sin(a)*.9,4.25,z+Math.cos(a)*.9,.035,.035,1.95);rib.rotation.y=a;rib.rotation.x=.18;}
}
// Orange Spritz stand: a visible destination for the energy mechanic.
const spritz=new THREE.Group();spritz.position.set(SPRITZ_STAND.x,0,SPRITZ_STAND.z);scene.add(spritz);
box(spritz,'#ff6019',0,.65,0,3.1,1.3,1.2);box(spritz,'#fff4dc',0,1.34,0,3.3,.14,1.4);
for(const x of [-1.45,1.45])cyl(spritz,'#efe3c6',x,2.0,-.4,.045,.045,2.5);
box(spritz,'#ff6c16',0,3.16,0,3.7,.18,2.0);
sign(spritz,'APEROL SPRITZ',0,2.83,.65,3.2);sign(spritz,'NACHTANKEN',0,.78,.615,2.5);
for(const x of [-.9,-.3,.3,.9]){
 cyl(spritz,'#fff6de',x,1.43,0,.09,.09,.025);cyl(spritz,'#fff6de',x,1.55,0,.02,.02,.23);
 cyl(spritz,'#ff791c',x,1.76,0,.13,.07,.25);const orange=cyl(spritz,'#ffb230',x+.1,1.88,0,.10,.10,.035);orange.rotation.x=Math.PI/2;
}


const helpers={scene,box,ball,cyl,mesh,mat,sign,random};
const town={start:{x:0,z:7}};
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
  const geometries = objects.map(object => (object.geometry.index?object.geometry.toNonIndexed():object.geometry.clone()).applyMatrix4(object.matrixWorld));
  const combined = mergeGeometries(geometries, false);
  if (combined) {
    const town = new THREE.Mesh(combined, material); town.castShadow = true; town.receiveShadow = true; scene.add(town);
    for (const object of objects) { object.removeFromParent(); object.geometry.dispose(); }
  }
  for (const geometry of geometries) geometry.dispose();
}

const character=(isTim,coat='#bb7855')=>makeCharacter(isTim,coat,helpers);
const props=createProps(helpers);setPropObstacles(props.items);
const refillBeacon=createRefillBeacon(scene,SPRITZ_STAND);
const mission=createMission(),missionVisuals=createMissionVisuals(scene);
let missionPopupTime=0,missionResultShown=false,celebrationTime=0;
const tutorial=createTutorial(),tutorialGuide=createTutorialGuide(scene);
const tutorialCrate=props.items.find(p=>p.type==='crate');let tutorialPerson=null;

let tim=character(true);tim.root.position.set(town.start.x,0,town.start.z);tim.heading=Math.PI;tim.root.rotation.set(0,tim.heading,0);
// Keep the game responsive while the detailed model is transferred and decoded.
loadTim().then(extendRig).then(avatar=>{
 avatar.root.position.copy(tim.root.position);avatar.heading=tim.heading;avatar.root.rotation.set(0,avatar.heading,0);
 for(const bubble of bubbles)if(bubble.npc===tim)bubble.npc=avatar;
 scene.remove(tim.root);tim.root.traverse(o=>o.geometry?.dispose());scene.add(avatar.root);tim=avatar;
 $('figure-status').textContent='Tim ist bereit.';
}).catch(error=>{
 console.warn('Tim model unavailable',error);
 $('figure-status').textContent='Einfache Figur aktiv · für den neuen Tim bitte neu laden.';
});
const npcColors=['#ba6447','#648b7c','#d6ac4a','#8b839f','#a88569','#697d96'];
const npcs=Array.from({length:12},(_,i)=>{
 const avatar=character(false,npcColors[i%6]),plan=crowdPlan(i);
 avatar.root.position.set(plan.x,0,plan.z);avatar.root.rotation.y=plan.heading;
 return {...avatar,...plan,air:0,vy:0,vx:0,vz:0,cooldown:0,phase:random()*6,walking:plan.behavior==='walk'};
});
const caretaker=npcs[10];caretaker.behavior='cleanup';caretaker.x=10.5;caretaker.z=-15;caretaker.walking=false;caretaker.root.position.set(caretaker.x,0,caretaker.z);
const cleanup=createCleanup(props,caretaker,()=>mission.engaged?1.9:1.65);
const broom=new THREE.Group();
cyl(broom,'#c5a46e',0,1,0,.035,.035,1.9,8);box(broom,'#d6a142',0,.1,0,.55,.18,.18);
for(let i=0;i<8;i++)box(broom,'#785b37',-.24+i*.068,.025,0,.03,.15,.17);
function equipCaretaker(avatar){
 avatar.body.add(broom);broom.position.set(-.65,.12,.34);broom.rotation.z=-.12;
 const badge=sign(avatar.root,'KEHRWOCHE',0,3.35,0,2.1);badge.material.depthTest=false;badge.renderOrder=5;
}
equipCaretaker(caretaker);
// Replace each placeholder in place so active dialogue and physics retain their target.
for(let i=0;i<npcs.length;i++)loadPerson(i).then(avatar=>{
 const npc=npcs[i];avatar.root.position.copy(npc.root.position);avatar.root.rotation.set(0,npc.heading,0);
 avatar.body.rotation.copy(npc.body.rotation);if(npc===caretaker)broom.removeFromParent();scene.remove(npc.root);npc.root.traverse(o=>o.geometry?.dispose());
 delete npc.legs;delete npc.arms;delete npc.head;scene.add(avatar.root);Object.assign(npc,avatar);if(npc===caretaker)equipCaretaker(npc);
}).catch(error=>console.warn('Passant konnte nicht geladen werden',error));
const aperolAlarm=createAperolAlarm();
// Local preview can start with an empty tank; production always starts full.
const previewEnergy=import.meta.env.DEV?Number(new URLSearchParams(location.search).get('energy-start')??100):100;
let energy=Number.isFinite(previewEnergy)?THREE.MathUtils.clamp(previewEnergy,0,100):100,refillCooldown=0,walkPhase=0;
let started=false,paused=false,score=0,combo=0,lastHit=-10,punchCooldown=0,punchAnim=0,elapsed=0;
let punchQueued=false;
let kickCooldown=0,kickAnim=0,kickPending=false,punchPending=false,toastTime=0;
const keys=new Set();let joystick={x:0,y:0},yaw=0,pitch=.26,drag=null;
const bubbles=[],effects=[];
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
const audio=new GameAudio(message=>{ $('audio-status').textContent=message; });
function resetInput(){keys.clear();joystick={x:0,y:0};drag=null;resetStick?.();$('stick-knob').style.transform='';}
function setPause(value){paused=value;audio.setPlaying(started&&!value);resetInput();$('pause-overlay').hidden=!value;if(value){punchQueued=false;audio.stop();for(const b of bubbles){b.pinned=false;b.life=.1;}}}
function updateSoundButton(){$('sound').textContent=audio.enabled?'TON AN':'TON AUS';$('sound').setAttribute('aria-pressed',String(audio.enabled));}
function start(){
 const first=!started;started=true;setPause(false);$('intro').hidden=true;$('start').blur();
 if(first){audio.setEnabled($('start-sound').checked);updateSoundButton();if(audio.enabled){audio.effect();}}
 else audio.unlock();
}
$('start').onclick=start;$('resume').onclick=()=>{setPause(false);audio.unlock();};$('pause').onclick=()=>started&&setPause(!paused);
$('help').onclick=()=>{$('tutorial-start').hidden=mission.engaged||mission.blocksWorld;setPause(true);$('pause-overlay').hidden=true;$('intro').hidden=false;$('start').textContent='WEITER GEHT’S ↗';};
$('portrait-continue').onclick=()=>$('rotate').classList.add('dismissed');
$('music').onclick=()=>{audio.unlock();audio.setMusicEnabled(!audio.musicEnabled);$('music').textContent=audio.musicEnabled?'♫ MUSIK AN':'♫ MUSIK AUS';$('music').setAttribute('aria-pressed',String(audio.musicEnabled));};
$('sound').onclick=()=>{audio.setEnabled(!audio.enabled);updateSoundButton();if(audio.enabled){audio.effect('bump');}else $('audio-status').textContent='Ton aus';};
function canAct(){return started&&!paused&&['idle','running'].includes(mission.status);}
function resetPlayerStart(){
 tim.root.position.set(town.start.x,0,town.start.z);tim.heading=Math.PI;tim.root.rotation.set(0,Math.PI,0);yaw=0;pitch=.26;
 follow.set(town.start.x,1.7,town.start.z);camera.position.set(town.start.x,1.7+Math.sin(pitch)*10.5,town.start.z+Math.cos(pitch)*10.5);camera.lookAt(follow);cameraGoal.copy(camera.position);
 tim.body.position.set(0,0,0);tim.body.rotation.set(0,0,0);if(tim.box)poseBoxing(tim,0);
 energy=100;refillCooldown=0;punchAnim=0;punchCooldown=0;punchQueued=false;punchPending=false;kickAnim=0;kickCooldown=0;kickPending=false;resetInput();
}
function finishTutorial(complete=false){
 if(!complete)tutorial.stop();tutorialPerson=null;energy=100;$('tutorial-panel').hidden=true;
 tutorialGuide.update(null,elapsed,reducedMotion);
 if(complete){$('toast').textContent='TUTORIAL GESCHAFFT!';$('toast').classList.add('visible');toastTime=2.5;}
}
function tutorialTransition(before){
 if(tutorial.status==='complete'){finishTutorial(true);return;}
 if(tutorial.step===before)return;
 if(tutorial.step==='punch'){
  tutorialPerson=npcs.filter(n=>n!==caretaker&&n.air<=0).sort((a,b)=>Math.hypot(a.x-tim.root.position.x,a.z-tim.root.position.z)-Math.hypot(b.x-tim.root.position.x,b.z-tim.root.position.z))[0]||null;
  if(tutorialPerson)tutorialPerson.walking=false;
 }
 if(tutorial.step==='empty'){energy=0;resetInput();}
}
function tutorialEvent(type,data){if(!tutorial.active)return;const before=tutorial.step;tutorial.event(type,data);tutorialTransition(before);}
function startTutorial(){
 if(mission.status!=='idle')return;start();cleanup.reset();if(tutorialCrate)props.restore(tutorialCrate);resetPlayerStart();audio.stop();
 tutorial.start();tutorialPerson=null;$('tutorial-start').blur();$('tutorial-panel').hidden=false;
}
function updateTutorialUI(){
 $('tutorial-panel').hidden=!tutorial.active||paused||mission.blocksWorld;
 if(tutorial.active){
  const content=tutorial.content;$('tutorial-step').textContent=`TUTORIAL · ${tutorial.index+1} / ${TUTORIAL_STEPS.length}`;
  $('tutorial-title').textContent=content.title;$('tutorial-text').textContent=content.text;$('tutorial-task').textContent=content.task;
 }
 let point=null;
 if(tutorial.active&&!paused){
  if(tutorial.step==='move')point={x:0,z:4,y:1.1};
  if(tutorial.step==='kick'&&tutorialCrate)point={x:tutorialCrate.x,z:tutorialCrate.z,y:2.1};
  if(tutorial.step==='punch'&&tutorialPerson)point={x:tutorialPerson.x,z:tutorialPerson.z,y:3.9};
  if(tutorial.step==='stand')point={x:SPRITZ_STAND.x,z:SPRITZ_STAND.z,y:4.3};
  if(tutorial.step==='mission')point={x:MISSION_START.x,z:MISSION_START.z,y:4.3};
 }
 tutorialGuide.update(point,elapsed,reducedMotion);
}
$('tutorial-start').onclick=startTutorial;$('tutorial-skip').onclick=()=>finishTutorial(false);
function offerMission(){
 if(!started||paused||mission.status!=='idle'||!nearMissionStart(tim.root.position)||(tutorial.active&&tutorial.step!=='mission'))return;
 if(tutorial.active)tutorialEvent('mission');
 resetInput();audio.stop();mission.offer();$('mission-total').textContent=props.items.length;$('mission-briefing').hidden=false;
}
function closeMissionBriefing(){mission.free();$('mission-briefing').hidden=true;setPause(false);}
function beginMission(){
 cleanup.reset();for(const prop of props.items)props.restore(prop);
 if(caretaker.flightPivot){caretaker.root.attach(caretaker.body);caretaker.flightPivot.removeFromParent();caretaker.flightPivot=null;}
 Object.assign(caretaker,{x:10.5,z:-15,air:0,vy:0,vx:0,vz:0,flyAway:false,respawnAt:0,cooldown:0,recovery:0,walking:false,heading:0});
 caretaker.body.position.set(0,0,0);caretaker.body.rotation.set(0,0,0);caretaker.body.scale.y=1;caretaker.root.position.set(10.5,0,-15);caretaker.root.visible=true;
 resetPlayerStart();
 audio.stop();for(const b of bubbles)b.el.remove();bubbles.length=0;
 mission.begin(props.items,cleanup.cleaned);missionResultShown=false;missionPopupTime=0;celebrationTime=0;
 $('mission-briefing').hidden=true;$('mission-result').hidden=true;$('mission-pop').hidden=true;$('toast').classList.remove('visible');$('mission-confetti').replaceChildren();
 setPause(false);audio.unlock();
}
function freeAfterMission(){
 mission.free();missionResultShown=false;$('mission-result').hidden=true;$('mission-confetti').replaceChildren();
 if(tim.box)poseBoxing(tim,0);tim.body.position.set(0,0,0);tim.body.rotation.set(0,0,0);setPause(false);audio.unlock();
}
function finishMission(){
 if(missionResultShown||!['won','lost'].includes(mission.status))return;
 missionResultShown=true;celebrationTime=0;resetInput();audio.stop();punchAnim=0;kickAnim=0;punchPending=false;kickPending=false;punchQueued=false;
 $('mission-pop').hidden=true;$('toast').classList.remove('visible');const won=mission.status==='won';
 $('mission-result').classList.toggle('won',won);$('mission-result-title').textContent=won?'MISSION GESCHAFFT':'MISSION GESCHEITERT';
 $('mission-result-reason').textContent=won?`Alle ${mission.total} Gegenstände umgeworfen · ${mission.time.toFixed(1).replace('.',',')} Sekunden`:'Der Hausmeister hat alles wieder aufgestellt. Die Altstadt ist sauber.';
 $('mission-retry').textContent=won?'NOCHMAL SPIELEN':'NOCHMAL VERSUCHEN';$('mission-result').hidden=false;
 if(won&&!reducedMotion)for(let i=0;i<32;i++){const piece=document.createElement('i');piece.style.left=`${5+random()*90}%`;piece.style.background=['#ffe05c','#ff4eaa','#fff7db'][i%3];piece.style.animationDelay=`${random()*.4}s`;$('mission-confetti').append(piece);}
}
function observeMission(){
 const event=mission.observe(props.items,cleanup.cleaned);if(!event)return;
 if(event.progress){$('mission-pop').textContent=`${event.count} von ${event.total} erledigt`;$('mission-pop').hidden=false;missionPopupTime=1.3;}
 finishMission();
}
function updateMissionUI(){
 const engaged=mission.engaged;
 $('mission-offer').hidden=!started||paused||mission.status!=='idle'||!nearMissionStart(tim.root.position)||(tutorial.active&&tutorial.step!=='mission');
 $('mission-hud').hidden=!engaged;$('mission-countdown').hidden=mission.status!=='countdown';
 $('mission-countdown').textContent=Math.ceil(mission.countdown);
 if(engaged){
  $('mission-count').textContent=`${mission.count} / ${mission.total}`;
  $('mission-worker-status').textContent=mission.status==='countdown'?'Mach dich bereit!':mission.grace>0?`Hausmeister startet in ${Math.ceil(mission.grace)} s`:caretaker.air>0?'Hausmeister außer Gefecht':cleanup.pending?'Hausmeister räumt auf!':'Hausmeister wartet auf Unordnung';
 }
}
$('mission-offer').onclick=offerMission;$('mission-begin').onclick=beginMission;$('mission-cancel').onclick=closeMissionBriefing;$('mission-retry').onclick=beginMission;$('mission-free').onclick=freeAfterMission;
function speechBubble(npc,text){
 for(let i=bubbles.length-1;i>=0;i--)if(bubbles[i].npc===npc){bubbles[i].el.remove();bubbles.splice(i,1);}
 const el=document.createElement('div');el.className='bubble';el.textContent=text;$('bubbles').appendChild(el);
 const bubble={el,npc,life:2.8,pinned:false};bubbles.push(bubble);return bubble;
}
const nextPassantLine=createPassantLines(npcs,PHRASES,random);
function feedback(npc){
 // A single speaking character at a time. The exact phrase object drives text AND audio.
 if(audio.enabled&&audio.speaking)return;
 const phrase=nextPassantLine(npc);if(!phrase)return;
 const bubble=speechBubble(npc,phrase.text);
 if(audio.enabled){bubble.pinned=true;const accepted=audio.speak(phrase,()=>{bubble.life=2.8;},()=>{bubble.pinned=false;bubble.life=.45;},npc.voice);if(!accepted)bubble.pinned=false;}
}
function popEffect(x,z,type='bump',height=null){
 const g=new THREE.Group();g.position.set(x,height??(type==='dust'?.12:type==='kick'?.55:1.5),z);scene.add(g);
 if(type==='dust'){
  const ring=mesh(new THREE.TorusGeometry(.75,.035,4,32),'#f8dd8a',g);ring.rotation.x=Math.PI/2;
 }else for(let i=0;i<8;i++){const a=i*Math.PI/4;const s=box(g,i%2?'#f8db69':'#fff3ce',Math.sin(a)*.7,Math.cos(a)*.7,0,.1,.32,.1);s.rotation.z=-a;}
 effects.push({g,life:type==='dust'?.7:.45,max:type==='dust'?.7:.45});
}
function award(base){combo=elapsed-lastHit<2.5?combo+1:1;lastHit=elapsed;const points=scoreForCombo(combo,base);score+=points;return points;}
function showScore(points,title){
 $('score').textContent=String(score).padStart(4,'0');$('score-fill').style.width=`${Math.min(score/10,100)}%`;
 $('score-caption').textContent=score>=500?'Du bringsch den Fleck durcheinander!':'Des war aber koi Zufall.';
 $('toast').textContent=`+${points} · ${title}`;$('toast').classList.add('visible');toastTime=1.3;
}
function launchNPC(npc,origin){
 launchPassant(npc,origin,random);
 const pivot=new THREE.Group();pivot.position.y=1.4;npc.root.add(pivot);npc.root.updateMatrixWorld(true);pivot.attach(npc.body);npc.flightPivot=pivot;
}
function impact(action){
 let points=0;const targets=impactTargets(tim.root.position,tim.heading,npcs,props.items,action);
 for(const npc of targets.people){
  launchNPC(npc,tim.root.position);points+=award(25);popEffect(npc.x,npc.z);
 }
 for(const prop of targets.props)if(props.hit(prop,tim.root.position,.9)){
  points+=award(10);popEffect(prop.x,prop.z,'kick');tutorialEvent('kick',{target:prop===tutorialCrate});
 }
 if(targets.people.length)tutorialEvent('punch',{people:targets.people.length});
 if(points){showScore(points,action==='kick'?'ZACK! FUSSTRITT':'POW! FAUSTSCHLAG');if(targets.speaker)feedback(targets.speaker);}
 audio.effect(action==='kick'?(points?'wood':'kick'):'bump');observeMission();
}
function refill(){
 if(!canAct()||kickAnim>0||punchAnim>0||refillCooldown>0||!canRefill(tim.root.position))return;
 if(tutorial.active&&tutorial.step!=='refill')return;
 audio.unlock();energy=100;refillCooldown=1.5;audio.effect('wood');
 $('toast').textContent='HA, JETZT LÄUFT’S! + ENERGIE';$('toast').classList.add('visible');toastTime=2;tutorialEvent('refill');
}
function updateEnergy(){
 const value=Math.ceil(energy),near=canRefill(tim.root.position);
 const warning=started&&!paused&&!mission.blocksWorld&&energy<25,empty=energy<=0;
 $('aperol-warning').hidden=!warning||(near&&(!tutorial.active||tutorial.step==='refill'));
 $('aperol-warning-title').textContent=empty?'APEROL LEER!':'APEROL-ALARM!';
 $('aperol-warning-action').textContent=tutorial.active&&tutorial.step==='empty'?'Lauf kurz los – gleich darfst du nachtanken.':near?'JETZT NACHTANKEN · F / TIPPEN':empty?'Tim schleicht! Zum Stand und nachtanken.':'Zum orangefarbenen Pfeil – jetzt nachtanken!';
 $('aperol-warning').classList.toggle('empty',empty);
 $('energy-card').classList.toggle('empty',empty);
 $('energy-value').textContent=`${value}%`;$('energy-fill').style.width=`${energy}%`;
 $('energy-meter').setAttribute('aria-valuenow',String(value));$('energy-card').classList.toggle('low',energy<25);
 $('energy-mode').textContent=energy<25?'ALARM':'ENERGIE';
 $('energy-hint').textContent=tutorial.active&&tutorial.step==='empty'?'Kurzer Leertank-Test: bewege Tim.':near?'Spritz-Stand erreicht · F oder Tippen':energy<25?'APEROL-ALARM! Nachschub am Spritz-Stand!':'Nachtanken am orangefarbenen Spritz-Stand';
 $('refill').hidden=!near||!started||paused||mission.blocksWorld||mission.status==='countdown'||(tutorial.active&&tutorial.step!=='refill');$('refill').disabled=energy>=99||refillCooldown>0||kickAnim>0||punchAnim>0||(tutorial.active&&tutorial.step!=='refill');
}
function punch(){
 audio.unlock();if(!canAct()||kickAnim>0||refillCooldown>0)return;if(punchCooldown>0){punchQueued=true;return;}punchQueued=false;
 punchCooldown=PUNCH_DURATION+.06;punchAnim=PUNCH_DURATION;punchPending=true;
}
function kick(){
 audio.unlock();if(!canAct()||kickCooldown>0||kickAnim>0||punchAnim>0||refillCooldown>0)return;
 punchQueued=false;kickCooldown=KICK_DURATION+.12;kickAnim=KICK_DURATION;kickPending=true;
}
function handleChains(projectile){
 for(const target of props.items)if(target!==projectile&&!target.down&&Math.hypot(target.x-projectile.x,target.z-projectile.z)<1.1&&props.hit(target,projectile,.7)){
  projectile.chain=true;showScore(award(15),'DOMINO!');tutorialEvent('kick',{target:target===tutorialCrate});observeMission();break;
 }
}
window.addEventListener('keydown',e=>{
 if(['Space','KeyX','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code))e.preventDefault();
 if(mission.blocksWorld){
  if(['Enter','KeyE','Escape','Space'].includes(e.code))e.preventDefault();
  if(mission.status==='briefing'){if(e.code==='Escape')closeMissionBriefing();else if(!e.repeat&&['Enter','KeyE'].includes(e.code))beginMission();}
  else if(!e.repeat){if(e.code==='Enter')beginMission();if(e.code==='Escape')freeAfterMission();}
  return;
 }
 if(e.code==='KeyE'&&!e.repeat&&nearMissionStart(tim.root.position)&&mission.status==='idle'){e.preventDefault();offerMission();return;}
 if(e.code==='Escape'&&started){setPause(!paused);return;}keys.add(e.code);
 if(e.code==='KeyF'&&!e.repeat)refill();if(e.code==='Space'&&!e.repeat)punch();if(e.code==='KeyX'&&!e.repeat)kick();
});
window.addEventListener('keyup',e=>keys.delete(e.code));
window.addEventListener('blur',()=>{if(started)setPause(true);else resetInput();});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&started)setPause(true);});
renderer.domElement.addEventListener('pointerdown',e=>{audio.unlock();drag={id:e.pointerId,x:e.clientX,y:e.clientY};renderer.domElement.setPointerCapture(e.pointerId);});
renderer.domElement.addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId)return;yaw-=(e.clientX-drag.x)*.006;pitch=THREE.MathUtils.clamp(pitch+(e.clientY-drag.y)*.004,.24,.8);drag.x=e.clientX;drag.y=e.clientY;});
renderer.domElement.addEventListener('pointerup',()=>drag=null);renderer.domElement.addEventListener('pointercancel',()=>drag=null);
const resetStick=bindJoystick($('stick'),value=>{joystick=value;$('stick-knob').style.transform=`translate(${value.x*30}px,${value.y*30}px)`;},()=>audio.unlock());
bindActionButton($('refill'),refill);bindActionButton($('punch'),punch);bindActionButton($('kick'),kick);
$('fullscreen').onclick=()=>{
 if(document.fullscreenElement)document.exitFullscreen?.();
 else if(document.documentElement.requestFullscreen)document.documentElement.requestFullscreen().catch(()=>{$('audio-status').textContent='Vollbild hier nicht verfügbar';});
 else {$('audio-status').textContent='iPhone: Teilen → Zum Home-Bildschirm → Als Web-App öffnen';}
};
const follow=new THREE.Vector3(town.start.x,1,town.start.z),cameraGoal=new THREE.Vector3();
function resize(){camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));}
window.addEventListener('resize',resize);
const map=$('map').getContext('2d');
function drawMap(){
 map.fillStyle='#dedcc9';map.fillRect(0,0,160,140);map.fillStyle='#b3b6a0';
 for(let i=0;i<6;i++){map.fillRect(5,7+i*21,28,17);map.fillRect(128,7+i*21,27,17);}map.fillRect(35,0,90,10);
 map.fillStyle='#80a7a1';map.beginPath();map.arc(80+FOUNTAIN.x*3,69+FOUNTAIN.z*2.6,7,0,Math.PI*2);map.fill();
 for(const p of props.items){map.fillStyle=p.down?'#f2d482':'#ba8c54';map.fillRect(79+p.x*3,68+p.z*2.6,3,3);}
 for(const n of npcs){map.fillStyle=n.air>0?'#e7653d':'#88947c';map.beginPath();map.arc(80+n.x*3,69+n.z*2.6,2.2,0,Math.PI*2);map.fill();}
 map.fillStyle='#ff6814';map.fillRect(76+SPRITZ_STAND.x*3,65+SPRITZ_STAND.z*2.6,8,8);map.strokeStyle='#fff';map.strokeRect(76+SPRITZ_STAND.x*3,65+SPRITZ_STAND.z*2.6,8,8);
 map.fillStyle='#e46034';map.beginPath();map.arc(80+tim.root.position.x*3,69+tim.root.position.z*2.6,4,0,Math.PI*2);map.fill();map.strokeStyle='#fff8df';map.lineWidth=2;map.stroke();
}
const timer=new THREE.Clock();
function animate(){
 requestAnimationFrame(animate);const dt=Math.min(timer.getDelta(),.04);const ticking=started&&!paused;if(ticking){mission.tick(dt);if(tutorial.active){const before=tutorial.step;tutorial.tick(dt);tutorialTransition(before);}}const active=ticking&&!mission.blocksWorld;
 if(active){
  if(tutorial.active&&['move','kick','punch','stand'].includes(tutorial.step))energy=100;else if(mission.status!=='countdown')energy=drainEnergy(energy,dt);refillCooldown=Math.max(0,refillCooldown-dt);
  elapsed+=dt;punchCooldown=Math.max(0,punchCooldown-dt);punchAnim=Math.max(0,punchAnim-dt);
  if(punchPending&&punchAnim<=PUNCH_DURATION-PUNCH_CONTACT){punchPending=false;impact('punch');}
  kickCooldown=Math.max(0,kickCooldown-dt);kickAnim=Math.max(0,kickAnim-dt);
  if(kickPending&&kickAnim<=KICK_DURATION-KICK_CONTACT){kickPending=false;impact('kick');}
  if(punchQueued&&punchCooldown<=0&&kickAnim<=0)punch();
  $('punch').disabled=kickAnim>0;$('punch').classList.toggle('cooling',punchCooldown>0);
  $('kick').disabled=kickCooldown>0||punchAnim>0;$('kick').style.setProperty('--ready',`${(1-kickCooldown/(KICK_DURATION+.12))*100}%`);
  missionPopupTime-=dt;if(missionPopupTime<=0)$('mission-pop').hidden=true;
  toastTime-=dt;if(toastTime<=0)$('toast').classList.remove('visible');
  let ix=(keys.has('KeyD')||keys.has('ArrowRight')?1:0)-(keys.has('KeyA')||keys.has('ArrowLeft')?1:0)+joystick.x;
  let iz=(keys.has('KeyS')||keys.has('ArrowDown')?1:0)-(keys.has('KeyW')||keys.has('ArrowUp')?1:0)+joystick.y;
  if(mission.status==='countdown'){ix=0;iz=0;}
  const inputLength=Math.hypot(ix,iz);if(inputLength>1){ix/=inputLength;iz/=inputLength;}
  const speed=kickAnim>0?0:punchAnim>0?Math.min(1.2,energySpeed(energy)):energySpeed(energy);
  const dx=(ix*Math.cos(yaw)+iz*Math.sin(yaw))*speed*dt,dz=(-ix*Math.sin(yaw)+iz*Math.cos(yaw))*speed*dt;
  const next=moveWithinWorld(tim.root.position,dx,dz);
  for(const n of npcs){if(n.air>0)continue;const nx=next.x-n.x,nz=next.z-n.z,d=Math.hypot(nx,nz);if(d<1.2){const length=d||1,q=moveWorld(next,nx/length*(1.2-d),nz/length*(1.2-d));next.x=q.x;next.z=q.z;}}
  const walked=Math.hypot(next.x-tim.root.position.x,next.z-tim.root.position.z);
  tim.root.position.x=next.x;tim.root.position.z=next.z;
  if(inputLength>.05)tutorialEvent('walk',{distance:walked});
  if(canRefill(tim.root.position))tutorialEvent('nearStand');
  if(inputLength>.05&&punchAnim<=0&&kickAnim<=0)turnToMovement(tim,dx,dz,dt);
  tim.root.position.y=0;
  const moving=inputLength>.05&&kickAnim<=0;
  const exhaustion=THREE.MathUtils.clamp(1-energy/10,0,1);
  if(moving)walkPhase+=dt*(speed*1.9+exhaustion*2.5);
  const phase=walkPhase;
  const stride=moving?Math.sin(phase)*(tim.detailed?.42:.6)*(1-exhaustion*.52):0;
  if(tim.box)poseBoxing(tim,0);
  tim.legs[0].rotation.x=stride;tim.legs[1].rotation.x=-stride;
  poseTimArms(tim,stride,punchAnim,0);
  if(tim.knees){tim.knees[0].rotation.x=moving?Math.max(0,-Math.sin(phase))*.55:0;tim.knees[1].rotation.x=moving?Math.max(0,Math.sin(phase))*.55:0;}
  tim.body.position.y=reducedMotion?0:Math.abs(stride)*.07;
  tim.body.rotation.z=Math.sin(elapsed*2)*.012;
  tim.body.rotation.y=0;
  tim.head.rotation.y=Math.sin(elapsed*.6)*.035;
  applyExhaustionPose(tim,exhaustion);
  if(tim.box&&punchAnim>0){
   tim.body.position.y=0;tim.body.rotation.set(0,0,0);
   poseBoxing(tim,(PUNCH_DURATION-punchAnim)*PLAYBACK_SPEED);
  }
  if(tim.box&&kickAnim>0){
   tim.body.position.y=0;tim.body.rotation.set(0,0,0);poseKick(tim,KICK_DURATION-kickAnim);
  }else if(kickAnim>0){tim.legs[0].rotation.x=-Math.sin((KICK_DURATION-kickAnim)/KICK_DURATION*Math.PI)*1.1;}
  separatePeople(npcs,tim.root.position);
  for(const n of npcs){
   n.cooldown=Math.max(0,n.cooldown-dt);
   if(n.flyAway||n.respawnAt>0){
    const state=stepPassantFlight(n,dt,elapsed,tim.root.position,npcs,random);
    if(state==='waiting'){n.root.visible=false;continue;}
    const pivot=n.flightPivot;
    if(state==='flying'||state==='falling'){
     const rate=state==='falling'?.28:1;
     pivot.rotation.x+=dt*n.spin*.7*rate;pivot.rotation.y+=dt*n.spin*rate;pivot.rotation.z+=dt*n.spin*.5*rate;
    }else if(state==='landed'){pivot.rotation.set(0,0,Math.PI/2);}
    else if(state==='respawned'){
     n.root.updateMatrixWorld(true);n.root.attach(n.body);pivot.removeFromParent();n.flightPivot=null;
     n.body.position.set(0,0,0);n.body.rotation.set(0,0,0);n.body.scale.y=1;
    }
    if(n.wallImpactPending){n.wallImpactPending=false;popEffect(n.x,n.z,'bump',n.air+1.4);audio.effect('wood');}
   }else{
    n.recovery=Math.max(0,(n.recovery||0)-dt);n.body.scale.y=n.recovery>0?1-Math.sin(n.recovery/.45*Math.PI)*.24:1;
    if(!n.animate){n.arms[0].rotation.z=0;n.arms[1].rotation.z=0;}
    if(n!==caretaker)n.walking=tutorial.active&&tutorial.step==='punch'&&n===tutorialPerson?false:stepCrowd(n,dt,elapsed);n.root.rotation.set(0,n.heading,0);
    if(!n.animate){const stride=n.walking?Math.sin(elapsed*4+n.phase)*.3:0;n.legs[0].rotation.x=stride;n.legs[1].rotation.x=-stride;}
   }
   n.root.visible=Math.hypot(n.x-tim.root.position.x,n.z-tim.root.position.z)<155;
   if(n.root.visible)n.animate?.(dt,n.air>0,n.recovery>0,n.walking?'walk':n===caretaker&&['sweep','repair'].includes(cleanup.stage)?'clean':'chat',n===caretaker?cleanup.speed:n.walkSpeed);
   n.root.position.set(n.x,n.air,n.z);
  }
  if(aperolAlarm.update(energy,audio.enabled&&!audio.speaking&&audio.context?.state==='running'))audio.aperolAlarm();
  props.update(dt,handleChains);
  if(!tutorial.active&&!mission.blocksWorld&&(!mission.engaged||(mission.status==='running'&&mission.grace<=0)))cleanup.update(dt);
  observeMission();
  $('kick').classList.toggle('target-ready',!!props.updateHints(tim.root.position,tim.heading,elapsed,reducedMotion));
  caretaker.root.position.set(caretaker.x,caretaker.air,caretaker.z);caretaker.root.rotation.set(0,caretaker.heading,0);
  broom.rotation.x=cleanup.stage==='sweep'?Math.sin(elapsed*10)*.3:0;
  const cleanupText=cleanup.pending?`KEHRWOCHE · ${cleanup.pending} zum Aufräumen`:'KEHRWOCHE · Alles wieder sauber';
  if($('cleanup-status').textContent!==cleanupText)$('cleanup-status').textContent=cleanupText;
  for(let i=effects.length-1;i>=0;i--){const effect=effects[i];effect.life-=dt;effect.g.scale.setScalar(1+(effect.max-effect.life)*5);if(effect.life<=0){scene.remove(effect.g);effect.g.traverse(o=>o.geometry?.dispose());effects.splice(i,1);}}
 }
 if(ticking&&mission.status==='won'){celebrationTime+=dt;poseMissionVictory(tim,celebrationTime);}
 const target=tim.root.position.clone().add(new THREE.Vector3(0,1.7,0));
 target.y=started?1.7:1;follow.lerp(target,1-Math.exp(-dt*5));const distance=started?10.5:25;
 const blocked=p=>collides(p,.3,true),view=cameraView(follow,yaw,pitch,distance,blocked);
 cameraGoal.set(view.x,view.y,view.z);
 camera.position.lerp(cameraGoal,1-Math.exp(-dt*5));if(!cameraLineClear(follow,camera.position,blocked))camera.position.copy(cameraGoal);camera.lookAt(follow);camera.updateMatrixWorld();
 for(let i=bubbles.length-1;i>=0;i--){const b=bubbles[i];if(active&&!b.pinned)b.life-=dt;
  const pos=b.npc.root.position.clone().add(new THREE.Vector3(0,3.5,0)).project(camera);
  const x=THREE.MathUtils.clamp((pos.x*.5+.5)*innerWidth,95,innerWidth-95),y=THREE.MathUtils.clamp((-pos.y*.5+.5)*innerHeight,105,innerHeight-65);
  b.el.style.left=`${x}px`;b.el.style.top=`${y}px`;b.el.style.display=pos.z>1||paused||!b.npc.root.visible?'none':'block';
  if(b.life<=0){b.el.remove();bubbles.splice(i,1);}
 }
 missionVisuals.update(mission,caretaker,elapsed,started,reducedMotion);updateMissionUI();updateTutorialUI();
 refillBeacon.update(energy,elapsed,camera,started,reducedMotion);
 updateEnergy();drawMap();
 sun.position.set(tim.root.position.x-35,55,tim.root.position.z+25);sun.target.position.set(tim.root.position.x,0,tim.root.position.z);sun.target.updateMatrixWorld();
 document.querySelector('.location').textContent='WINNENDEN / MARKTPLATZ';
 renderer.render(scene,camera);
}
camera.position.set(town.start.x+8,12,town.start.z-15);animate();
window.__GTA_DEBUG__=()=>({started,paused,mission:{status:mission.status,count:mission.count,total:mission.total,grace:mission.grace},score,energy,nearSpritz:canRefill(tim.root.position),speed:energySpeed(energy),kickAnim,punchAnim,detailedTim:!!tim.detailed,animatedNPCs:npcs.filter(n=>n.animate).length,sound:audio.enabled,speaking:audio.speaking,tim:{x:tim.root.position.x,z:tim.root.position.z},props:props.items.map(p=>({type:p.type,x:p.x,z:p.z,down:p.down})),airborne:npcs.filter(n=>n.air>0).length,drawCalls:renderer.info.render.calls});
