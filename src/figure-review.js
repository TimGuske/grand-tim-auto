import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { makeCharacter } from './characters.js';
const $=id=>document.getElementById(id);
const scene=new THREE.Scene();scene.background=new THREE.Color('#d8d5cd');
const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));renderer.setSize(innerWidth,innerHeight);renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.1;$('view').append(renderer.domElement);
const studio=new RoomEnvironment(),environment=new THREE.PMREMGenerator(renderer);
scene.environment=environment.fromScene(studio,.04).texture;
studio.dispose();environment.dispose();
const camera=new THREE.PerspectiveCamera(34,innerWidth/innerHeight,.01,50);camera.position.set(.2,1.8,7.1);
const controls=new OrbitControls(camera,renderer.domElement);controls.target.set(0,1.5,0);controls.enableDamping=true;controls.minDistance=.55;controls.maxDistance=10;controls.maxPolarAngle=Math.PI*.52;controls.enablePan=false;
scene.add(new THREE.HemisphereLight('#fff9e8','#75877a',2));const key=new THREE.DirectionalLight('#fff0d4',3);key.position.set(-3,6,5);key.castShadow=true;key.shadow.mapSize.set(2048,2048);Object.assign(key.shadow.camera,{left:-3,right:3,top:4,bottom:-2,near:.1,far:20});key.shadow.normalBias=.02;scene.add(key);
const rim=new THREE.DirectionalLight('#cfdef2',1.5);rim.position.set(3,3,-3);scene.add(rim);
const floor=new THREE.Mesh(new THREE.CircleGeometry(30,64),new THREE.MeshStandardMaterial({color:'#d4d0c4',roughness:1}));floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;floor.position.y=-.015;scene.add(floor);
const platform=new THREE.Mesh(new THREE.CylinderGeometry(1,1.04,.05,64),new THREE.MeshStandardMaterial({color:'#c0bcae',roughness:.85}));platform.position.y=-.03;platform.receiveShadow=true;scene.add(platform);
const cache=new Map();function mat(c){if(!cache.has(c))cache.set(c,new THREE.MeshStandardMaterial({color:c,roughness:.87}));return cache.get(c);}
function mesh(g,c,p,x=0,y=0,z=0){const m=new THREE.Mesh(g,mat(c));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;p.add(m);return m;}
const box=(p,c,x,y,z,w,h,d)=>mesh(new THREE.BoxGeometry(w,h,d),c,p,x,y,z);
const ball=(p,c,x,y,z,r,sx=1,sy=1,sz=1)=>{const m=mesh(new THREE.SphereGeometry(r,20,14),c,p,x,y,z);m.scale.set(sx,sy,sz);return m;};
const cyl=(p,c,x,y,z,r1,r2,h,n=12)=>mesh(new THREE.CylinderGeometry(r1,r2,h,n),c,p,x,y,z);
const old=makeCharacter(true,'#18243a',{scene,box,ball,cyl,mesh,mat,random:()=>.5}).root;old.visible=false;
let fresh=null,basis=null,selected='new';
const loader=new GLTFLoader();
function select(which){
 selected=which;old.visible=which==='old';
 if(fresh)fresh.visible=which==='new';if(basis)basis.visible=which==='basis';
 for(const id of ['old','new','basis'])$(id).setAttribute('aria-pressed',String(which===id));
 $('model-label').textContent=which==='old'?'Bisherige Spielfigur':which==='basis'?'Erster 3D-Entwurf · zum Vergleich':'Neuer Kopf nach Originalfotos · noch ohne Laufanimation';
}
function prepareModel(gltf){
 const model=gltf.scene;let bounds=new THREE.Box3().setFromObject(model),size=bounds.getSize(new THREE.Vector3());
 if(size.z>size.y*1.2)model.rotation.x=-Math.PI/2;
 bounds.setFromObject(model);size=bounds.getSize(new THREE.Vector3());model.scale.setScalar(3.15/size.y);
 bounds.setFromObject(model);const center=bounds.getCenter(new THREE.Vector3());model.position.set(-center.x,-bounds.min.y,-center.z);
 model.traverse(o=>{
  if(!o.isMesh)return;
  o.castShadow=true;o.receiveShadow=true;
  // The generated PBR map made skin look metallic. Correct only the face;
  // clothing, glasses and the rest of the supplied texture retain their finish.
  let parent=o,isNewHead=false;while(parent){isNewHead ||= !!parent.userData.timHead;parent=parent.parent;}
  const materials=Array.isArray(o.material)?o.material:[o.material];
  for(const material of materials){
   if(isNewHead){material.metalness=0;material.roughness=.85;material.roughnessMap=null;continue;}
   material.onBeforeCompile=shader=>{
    shader.vertexShader='varying vec3 vTimPosition;\n'+shader.vertexShader;
    shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvTimPosition = position;');
    shader.fragmentShader='varying vec3 vTimPosition;\n'+shader.fragmentShader;
    shader.fragmentShader=shader.fragmentShader.replace('#include <roughnessmap_fragment>',`#include <roughnessmap_fragment>
     float timSkin = smoothstep(0.315,0.335,vTimPosition.y) * (1.0-smoothstep(0.425,0.44,vTimPosition.y)) * smoothstep(-0.02,0.03,vTimPosition.z);
     roughnessFactor = mix(roughnessFactor,0.78,timSkin);`);
    shader.fragmentShader=shader.fragmentShader.replace('#include <metalnessmap_fragment>','#include <metalnessmap_fragment>\nmetalnessFactor = mix(metalnessFactor,0.0,timSkin);');
   };
   material.customProgramCacheKey=()=> 'tim-face-matte-v1';
  }
 });
 scene.add(model);return model;
}
loader.load(`${import.meta.env.BASE_URL}models/tim-v4.glb?v=no-lenses1`,gltf=>{
 fresh=prepareModel(gltf);$('new').disabled=false;$('basis').disabled=false;
 $('status').textContent='Figurenprobe geladen · frei drehbar';select(selected);
},undefined,()=>{$('status').textContent='Modell konnte nicht geladen werden · bitte neu laden';select('old');});
$('reference').onclick=()=>$('reference-dialog').showModal();
$('close-reference').onclick=()=>$('reference-dialog').close();
$('new').onclick=()=>select('new');$('old').onclick=()=>select('old');
$('basis').onclick=()=>{
 if(basis){select('basis');return;}
 $('basis').disabled=true;$('status').textContent='Vergleichsmodell wird geladen …';
 loader.load(`${import.meta.env.BASE_URL}models/tim-v3-basis.glb`,gltf=>{
  basis=prepareModel(gltf);$('basis').disabled=false;$('status').textContent='Vorher und nachher · gleiche Ansicht';select('basis');
 },undefined,()=>{$('basis').disabled=false;$('status').textContent='Vergleichsmodell konnte nicht geladen werden';});
};
function pose(target,position){
 controls.enableDamping=false;controls.update();
 controls.target.set(...target);camera.position.set(...position);controls.update();controls.enableDamping=true;
}
function angle(a){const d=camera.position.distanceTo(controls.target);pose(controls.target.toArray(),[Math.sin(a)*d,controls.target.y+.03,Math.cos(a)*d]);}
$('front').onclick=()=>angle(0);$('side').onclick=()=>angle(Math.PI/2);$('back').onclick=()=>angle(Math.PI);
$('face').onclick=()=>pose([0,2.78,0],[0,2.8,1.8]);
$('full').onclick=()=>pose([0,1.5,0],[.2,1.8,7.1]);
$('rotate').onclick=()=>{controls.autoRotate=!controls.autoRotate;$('rotate').setAttribute('aria-pressed',String(controls.autoRotate));};
function resize(){const {width,height}=$('view').getBoundingClientRect();camera.aspect=width/height;camera.updateProjectionMatrix();renderer.setSize(width,height);}
window.addEventListener('resize',resize);resize();
function animate(){requestAnimationFrame(animate);controls.update();renderer.render(scene,camera);}animate();

