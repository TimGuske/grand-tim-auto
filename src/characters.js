import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

export function makeCharacter(isTim, coat, { scene, box, ball, cyl, mesh, mat, random }) {
  const root = new THREE.Group(), body = new THREE.Group(); root.add(body);
  const skin = isTim ? '#e0aa84' : ['#e8b78b', '#c99170', '#efc5a0'][Math.floor(random()*3)];
  const dark = isTim ? '#18243a' : coat;
  const legs = [], arms = [];
  for (const side of [-1, 1]) {
    const leg = new THREE.Group(); leg.position.set(side*.22,.76,0); body.add(leg);
    cyl(leg, '#384047', 0,-.28,0,.14,.12,.64);if(isTim){box(leg,'#c9c9c4',0,-.74,.11,.36,.07,.52);for(let j=0;j<3;j++)box(leg,'#ffffff',0,-.59,.08+j*.07,.21,.025,.025);} ball(leg,isTim?'#f2e9dc':'#273039',0,-.64,.1,.21,.85,.5,1.45); legs.push(leg);
    const arm = new THREE.Group(); arm.position.set(side*.49,1.65,0); body.add(arm);
    const sleeve = ball(arm,dark,0,-.3,0,.22,.82,1.75,.85); sleeve.rotation.z=side*.13;
    cyl(arm,isTim?'#b7bfca':'#ead5ad',0,-.61,.02,.145,.14,.09);
    ball(arm,skin,0,-.73,.04,.17,.9,1.1,.85);ball(arm,skin,-side*.12,-.68,.12,.07);arms.push(arm);
  }
  ball(body,dark,0,1.26,0,.58,.86,1.24,.64);
  // Rounded coat skirts and sculpted lapels replace the old straight cylinder.
  for(const side of [-1,1]){
    ball(body,dark,side*.23,isTim?.68:.87,.05,.37,.85,isTim?1.7:1.35,.9);
    const lapel=box(body,isTim?'#34445b':coat,side*.19,1.64,.32,.23,.5,.1);lapel.rotation.z=side*.35;
  }
  box(body,'#192631',0,.92,.39,.025,.48,.025);
  for(let i=0;i<3;i++)ball(body,'#c7ad77',-.13,1.04+i*.21,.4,.035,1,1,.5);
  for(const side of [-1,1]){const pocket=box(body,'#40506a',side*.32,1.12,.35,.19,.05,.05);pocket.rotation.z=side*.2;}
  const head = new THREE.Group(); head.position.y=2.26;body.add(head);
  ball(head,skin,0,0,0,.52,1,1.12,.89);
  ball(head,skin,0,-.22,.14,.36,1,.8,.9);
  for(const side of [-1,1]){
    ball(head,skin,side*.54,-.04,-.01,.14,.8,1.2,.7);
    ball(head,'#cc8b72',side*.56,-.04,.055,.075,.65,1,.4);
    ball(head,'#edaf91',side*.32,-.16,.39,.14,1,.55,.45);
    ball(head,'#fff9df',side*.23,.04,.421,.14,.85,1,.35);
    ball(head,'#3e4b40',side*.23,.03,.467,.064,1,1,.4);
    ball(head,'#172323',side*.23,.03,.491,.032);
    ball(head,'#ffffff',side*.215,.056,.512,.013);
    const brow=ball(head,'#554333',side*.24,.23,.42,.16,1,.2,.3);brow.rotation.z=-side*.13;
  }
  ball(head,skin,0,-.03,.47,.13,.85,1.05,1.2);
  // A visible grin under the moustache gives Tim an expression at gameplay distance.
  ball(head,'#794c3e',0,-.27,.414,.16,1,.42,.4);
  ball(head,'#fff1cf',0,-.25,.445,.12,1,.18,.25);
  if(isTim){
    function glassesFrame(x){
      const shape=new THREE.Shape(); const w=.405,h=.34,r=.065;
      shape.moveTo(-w/2+r,-h/2);shape.lineTo(w/2-r,-h/2);shape.quadraticCurveTo(w/2,-h/2,w/2,-h/2+r);
      shape.lineTo(w/2,h/2-r);shape.quadraticCurveTo(w/2,h/2,w/2-r,h/2);shape.lineTo(-w/2+r,h/2);shape.quadraticCurveTo(-w/2,h/2,-w/2,h/2-r);shape.lineTo(-w/2,-h/2+r);shape.quadraticCurveTo(-w/2,-h/2,-w/2+r,-h/2);
      const hole=new THREE.Path();hole.moveTo(-.145,-.105);hole.lineTo(-.145,.105);hole.lineTo(.145,.105);hole.lineTo(.145,-.105);hole.closePath();shape.holes.push(hole);
      mesh(new THREE.ExtrudeGeometry(shape,{depth:.045,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.013,bevelThickness:.012}), '#121c28',head,x,.055,.48);
    }
    glassesFrame(-.245);glassesFrame(.245);box(head,'#121c28',0,.08,.52,.12,.055,.055);
    for(const side of [-1,1]){box(head,'#121c28',side*.45,.09,.28,.055,.055,.4);const mo=ball(head,'#6d4930',side*.105,-.18,.49,.145,1.18,.55,.5);mo.rotation.z=-side*.15;}
    ball(head,'#19283e',0,.38,-.055,.58,1,.83,.95);cyl(head,'#253750',0,.28,-.02,.56,.55,.19,24);
    for(let i=0;i<16;i++){const a=i/16*Math.PI*2;const rib=box(head,'#30415a',Math.sin(a)*.548,.29,Math.cos(a)*.52-.02,.018,.14,.02);rib.rotation.y=a;}
    box(head,'#e6d3a8',-.19,.3,.51,.12,.09,.018);
    cyl(body,'#424953',0,1.87,0,.49,.46,.26,20);
    const scarf=new THREE.Group();scarf.position.set(.2,1.72,.4);scarf.rotation.z=-.15;body.add(scarf);
    box(scarf,'#484e57',0,-.38,0,.3,.85,.09);
    for(let i=0;i<3;i++){const patch=box(scarf,'#929496',0,-.17-i*.23,.052,.1,.1,.012);patch.rotation.z=Math.PI/4;}
    for(let i=0;i<6;i++)box(scarf,'#a4a197',-.13+i*.05,-.86,0,.018,.13,.06);
  } else {
    const style=Math.floor(random()*4);
    const hair=['#73513b','#d6af5d','#c9c2b0','#59453c'][style];
    ball(head,hair,0,.34,-.11,.56,1,.68,.95);
    if(style===1){for(const side of [-1,1]){ball(head,hair,side*.42,-.12,-.12,.27,.8,1.7,1);ball(head,hair,side*.4,-.42,-.2,.22,.8,1.1,1);}for(const side of [-1,1])box(body,'#d6b7a8',side*.29,1.6,.33,.06,.38,.05);}
    else if(random()>.5){cyl(head,coat,0,.38,0,.61,.62,.13,20);ball(head,coat,0,.49,-.05,.48,1,.4,1);}
    else for(const side of [-1,1])ball(head,hair,side*.44,.13,-.1,.2,.55,1.3,1);
    if(random()>.55)for(const side of [-1,1])ball(head,'#74604e',side*.1,-.18,.47,.13,1,.45,.35);
  }
  // Batch each articulated part separately, preserving walking/head/arm animation.
  function batch(group){
    for(const child of [...group.children])if(child.isGroup)batch(child);
    const byMaterial=new Map();for(const child of group.children)if(child.isMesh){child.updateMatrix();const key=child.material.uuid;if(!byMaterial.has(key))byMaterial.set(key,[]);byMaterial.get(key).push(child);}
    for(const objects of byMaterial.values()){if(objects.length<2)continue;const geometries=objects.map(o=>{let g=o.geometry.clone().applyMatrix4(o.matrix);if(g.index){const flat=g.toNonIndexed();g.dispose();g=flat;}return g;});const merged=mergeGeometries(geometries);if(merged){const m=new THREE.Mesh(merged,objects[0].material);m.castShadow=true;m.receiveShadow=true;group.add(m);for(const o of objects){o.removeFromParent();o.geometry.dispose();}}for(const g of geometries)g.dispose();}
  }
  const ink=new THREE.MeshBasicMaterial({color:'#25302f',side:THREE.BackSide});
  body.traverse(part=>{if(!part.isGroup)return;for(const object of [...part.children])if(object.isMesh&&object.geometry.type==='SphereGeometry'&&object.geometry.parameters.radius>.35){const outline=new THREE.Mesh(object.geometry.clone(),ink);outline.position.copy(object.position);outline.rotation.copy(object.rotation);outline.scale.copy(object.scale).multiplyScalar(1.025);part.add(outline);}});
  batch(body);scene.add(root);return { root,body,legs,arms,head };
}
