import * as THREE from 'three';
export function createTutorialGuide(scene){
 const root=new THREE.Group();root.visible=false;scene.add(root);
 const arrow=new THREE.Mesh(new THREE.ConeGeometry(.30,.70,4),new THREE.MeshBasicMaterial({color:'#ffe05c',depthTest:false,depthWrite:false}));arrow.rotation.z=Math.PI;arrow.renderOrder=18;
 const stem=new THREE.Mesh(new THREE.BoxGeometry(.18,.42,.18),arrow.material);stem.position.y=.5;stem.renderOrder=18;root.add(arrow,stem);
 return {update(point,time,reducedMotion=false){root.visible=!!point;if(point){root.position.set(point.x,point.y+(reducedMotion?0:Math.sin(time*4)*.12),point.z);root.rotation.y=time*.7;}}};
}
