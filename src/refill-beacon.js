import * as THREE from 'three';
export function createRefillBeacon(scene,stand){
 const root=new THREE.Group();root.visible=false;scene.add(root);
 const shape=new THREE.Shape();
 for(const [i,[x,y]] of [[-.30,1.5],[.30,1.5],[.30,.45],[.80,.45],[0,-.4],[-.80,.45],[-.30,.45]].entries())i?shape.lineTo(x,y):shape.moveTo(x,y);
 shape.closePath();const geometry=new THREE.ShapeGeometry(shape);
 const outline=new THREE.Mesh(geometry,new THREE.MeshBasicMaterial({color:'#fff5df',depthTest:false,depthWrite:false}));
 outline.scale.setScalar(1.15);outline.position.z=-.01;outline.renderOrder=20;
 const arrow=new THREE.Mesh(geometry,new THREE.MeshBasicMaterial({color:'#ff711c',depthTest:false,depthWrite:false}));arrow.renderOrder=21;
 root.add(outline,arrow);
 return {root,update(energy,time,camera,started=true,reducedMotion=false){
  root.visible=started&&energy<25;
  root.position.set(stand.x,4.2+(reducedMotion?0:Math.sin(time*4)*.18),stand.z);
  root.scale.setScalar(reducedMotion?1:1+Math.sin(time*4)*.045);
  root.quaternion.copy(camera.quaternion);
 }};
}
