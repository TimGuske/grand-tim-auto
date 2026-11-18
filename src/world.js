export const WORLD={minX:-12,maxX:12,minZ:-20,maxZ:17};
export const FOUNTAIN={x:3.8,z:-3,radius:2.4};
export const START={x:0,z:7};
export function closestOnSegment(p,a,b){const dx=b[0]-a[0],dz=b[1]-a[1],l=dx*dx+dz*dz,t=l?Math.max(0,Math.min(1,((p.x-a[0])*dx+(p.z-a[1])*dz)/l)):0;return {x:a[0]+t*dx,z:a[1]+t*dz};}
export function inPolygon(p,points){let inside=false;for(let i=0,j=points.length-1;i<points.length;j=i++){const [x,z]=points[i],[xx,zz]=points[j];if((z>p.z)!==(zz>p.z)&&p.x<(xx-x)*(p.z-z)/(zz-z)+x)inside=!inside;}return inside;}
export function onStreet(p,margin=0){return p.x>WORLD.minX+margin&&p.x<WORLD.maxX-margin&&p.z>WORLD.minZ+margin&&p.z<WORLD.maxZ-margin;}
const obstacles=[];const bins=new Map(),cell=12;
function insert(o){obstacles.push(o);for(let x=Math.floor(o.minX/cell);x<=Math.floor(o.maxX/cell);x++)for(let z=Math.floor(o.minZ/cell);z<=Math.floor(o.maxZ/cell);z++){const k=`${x},${z}`;if(!bins.has(k))bins.set(k,[]);bins.get(k).push(o);}}
export function addCircle(x,z,r,kind='solid',height=Infinity,minHeight=0,cameraOnly=false){insert({x,z,r,kind,height,minHeight,cameraOnly,minX:x-r,maxX:x+r,minZ:z-r,maxZ:z+r});}
export function addBox(x,z,w,d,kind='solid',height=Infinity,minHeight=0){insert({height,minHeight,points:[[x-w/2,z-d/2],[x+w/2,z-d/2],[x+w/2,z+d/2],[x-w/2,z+d/2]],kind,minX:x-w/2,maxX:x+w/2,minZ:z-d/2,maxZ:z+d/2});}
addCircle(FOUNTAIN.x,FOUNTAIN.z,FOUNTAIN.radius,'fountain');
for(const x of [-10,10])for(const z of [-14,9])addCircle(x,z,.38,'tree');
for(const x of [-10,10])for(const z of [-7,3])addBox(x,z,1.1,2.2,'bench');
addBox(-7,-14,3.3,2.1,'stall');addBox(-9,1,3.3,1.5,'stall');
for(const side of [-1,1]){
 for(let i=0;i<6;i++)addBox(side*16,-20+i*7.5,5.5,7,'building',11);
 addBox(side*6.7,-26.3,7.4,5.5,'building',14);addBox(side*13.7,-27,6.5,5.5,'building',15);
 addBox(side*6.8,24,7.4,5.5,'building',14);addBox(side*13.9,24,6.8,5.5,'building',15);
}
// Keep the gate opening free while blocking its piers and upper storeys.
for(const side of [-1,1])addBox(side*2,-25,1.8,5,'building',4);
addBox(0,-25,6.3,5.5,'building',18,3.4);
for(const z of [-1,10]){addCircle(9,z,1,'cafe terrace',1.6);addCircle(9,z,2,'canopy',4.7,3.8,true);}
let propObstacles=[];
export function setPropObstacles(items){propObstacles=items;refreshNavigation();}
export function collides(p,r=.55,forCamera=false,ignoreProps=false){
 if(!ignoreProps)for(const prop of propObstacles){
  if(prop.down)continue;
  if(forCamera&&p.y>(prop.type==='board'?1.5:1.4))continue;
  if(Math.hypot(p.x-prop.x,p.z-prop.z)<r+(prop.collisionRadius??.6))return true;
 }
 const nearby=new Set();for(let x=Math.floor((p.x-r)/cell);x<=Math.floor((p.x+r)/cell);x++)for(let z=Math.floor((p.z-r)/cell);z<=Math.floor((p.z+r)/cell);z++)for(const o of bins.get(`${x},${z}`)||[])nearby.add(o);
 for(const o of nearby){
  if(o.cameraOnly&&!forCamera)continue;
  if(forCamera&&(p.y<o.minHeight||p.y>Math.min(o.height??Infinity,({fountain:1.5,bench:1.7,stall:3.5}[o.kind]??Infinity))))continue;
  if(o.r){if(Math.hypot(p.x-o.x,p.z-o.z)<r+o.r)return true;}
  else {if(inPolygon(p,o.points))return true;for(let i=0;i<o.points.length;i++){const q=closestOnSegment(p,o.points[i],o.points[(i+1)%o.points.length]);if(Math.hypot(p.x-q.x,p.z-q.z)<r)return true;}}
 }
 return false;
}
export function canStand(p,r=.55,ignoreProps=false){return onStreet(p,r*.35)&&!collides(p,r,false,ignoreProps);}
export function nearestFree(p,r=.55,ignoreProps=false){if(canStand(p,r,ignoreProps))return {x:p.x,z:p.z};for(let d=.6;d<30;d+=.6)for(let a=0;a<Math.PI*2;a+=.4){const q={x:p.x+Math.cos(a)*d,z:p.z+Math.sin(a)*d};if(canStand(q,r,ignoreProps))return q;}return {...START};}
export function moveWorld(p,dx,dz,r=.55,ignoreProps=false){
 let q=canStand(p,r,ignoreProps)?{x:p.x,z:p.z}:nearestFree(p,r,ignoreProps);const steps=Math.max(1,Math.ceil(Math.hypot(dx,dz)/.35));
 for(let i=0;i<steps;i++){
  const x=dx/steps,z=dz/steps,full={x:q.x+x,z:q.z+z};
  if(canStand(full,r,ignoreProps))q=full;
  else {if(canStand({x:q.x+x,z:q.z},r,ignoreProps))q.x+=x;if(canStand({x:q.x,z:q.z+z},r,ignoreProps))q.z+=z;}
 }
 return q;
}
// Grid routes avoid the same buildings, trunks and stalls as collision movement.
const grid=2.1,free=new Map();let revision=0;
export function refreshNavigation(){free.clear();revision++;}
const key=(x,z)=>`${x},${z}`;
function available(x,z){const k=key(x,z);if(!free.has(k))free.set(k,canStand({x:x*grid,z:z*grid},.7));return free.get(k);}
export function canWalkStraight(from,to,r=.65){
 const dx=to.x-from.x,dz=to.z-from.z,steps=Math.max(1,Math.ceil(Math.hypot(dx,dz)/.25));
 for(let i=0;i<=steps;i++)if(!canStand({x:from.x+dx*i/steps,z:from.z+dz*i/steps},r))return false;
 return true;
}
export function findPath(from,to){
 const end=nearestFree(to,.7),start=nearestFree(from,.7);
 if(canWalkStraight(start,end))return [end];
 function snap(p){
  const x=Math.round(p.x/grid),z=Math.round(p.z/grid);
  for(let d=0;d<5;d++){
   const candidates=[];for(let i=-d;i<=d;i++)for(let j=-d;j<=d;j++)if(available(x+i,z+j))candidates.push([x+i,z+j]);
   candidates.sort((a,b)=>Math.hypot(a[0]*grid-p.x,a[1]*grid-p.z)-Math.hypot(b[0]*grid-p.x,b[1]*grid-p.z));
   for(const q of candidates)if(canWalkStraight(p,{x:q[0]*grid,z:q[1]*grid}))return q;
  }
  return null;
 }
 const a=snap(start),b=snap(end);if(!a||!b)return [];
 const goal=key(...b),open=[{x:a[0],z:a[1],f:0,g:0}],best=new Map([[key(...a),0]]),parents=new Map();let last;
 for(let iteration=0;open.length&&iteration<12000;iteration++){
  let at=0;for(let i=1;i<open.length;i++)if(open[i].f<open[at].f)at=i;
  const cur=open.splice(at,1)[0],k=key(cur.x,cur.z);if(cur.g!==best.get(k))continue;
  if(k===goal){last=cur;break;}
  for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]){
   const x=cur.x+dx,z=cur.z+dz;if(!available(x,z)||(dx&&dz&&(!available(cur.x+dx,cur.z)||!available(cur.x,cur.z+dz))))continue;
   const next=key(x,z),g=cur.g+Math.hypot(dx,dz);if(g>=(best.get(next)??Infinity))continue;
   best.set(next,g);parents.set(next,k);open.push({x,z,g,f:g+Math.hypot(x-b[0],z-b[1])*1.03});
  }
 }
 if(!last)return [];
 let k=goal;const result=[end];while(k!==key(...a)){const [x,z]=k.split(',').map(Number);result.push({x:x*grid,z:z*grid});k=parents.get(k);if(!k)break;}return result.reverse();
}
export function separatePeople(people,player){
 for(let pass=0;pass<3;pass++)for(let i=0;i<people.length;i++){
  const a=people[i];if(a.air>0)continue;
  for(let j=i+1;j<people.length;j++){
   const b=people[j];if(b.air>0)continue;
   let dx=a.x-b.x,dz=a.z-b.z,d=Math.hypot(dx,dz);if(d>=1.25)continue;
   if(d<.001){dx=1;dz=.1;d=Math.hypot(dx,dz);}const amount=(1.26-d)*.5;
   const aa=moveWorld(a,dx/d*amount,dz/d*amount),bb=moveWorld(b,-dx/d*amount,-dz/d*amount);a.x=aa.x;a.z=aa.z;b.x=bb.x;b.z=bb.z;
  }
  const dx=a.x-player.x,dz=a.z-player.z,d=Math.hypot(dx,dz);if(d<1.2){const n=d>.001?{x:dx/d,z:dz/d}:{x:1,z:0};const q=moveWorld(a,n.x*(1.21-d),n.z*(1.21-d));a.x=q.x;a.z=q.z;}
 }
}
export const WORLD_OBSTACLES=obstacles;
