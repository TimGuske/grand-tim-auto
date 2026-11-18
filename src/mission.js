export const MISSION_START={x:0,z:-18,radius:2.7};
export const MISSION_TITLE='Kehrwoche sabotieren';
export function nearMissionStart(player){return Math.hypot(player.x-MISSION_START.x,player.z-MISSION_START.z)<=MISSION_START.radius;}
export function createMission(){
 let status='idle',countdown=3,grace=12,time=0,count=0,total=0,baseline=0,hadMess=false;
 return {
  get status(){return status;},get countdown(){return countdown;},get grace(){return grace;},get time(){return time;},get count(){return count;},get total(){return total;},
  get blocksWorld(){return ['briefing','won','lost'].includes(status);},
  get engaged(){return ['countdown','running'].includes(status);},
  offer(){if(status==='idle')status='briefing';},
  free(){status='idle';},
  begin(items,cleaned=0){status='countdown';countdown=3;grace=12;time=0;count=0;total=items.length;baseline=cleaned;hadMess=false;},
  tick(dt){
   if(status==='countdown'){countdown=Math.max(0,countdown-dt);if(countdown===0)status='running';}
   else if(status==='running'){time+=dt;grace=Math.max(0,grace-dt);}
  },
  observe(items,cleaned){
   if(status!=='running')return null;
   const previous=count;count=items.filter(p=>p.down).length;
   if(count>0)hadMess=true;
   if(total>0&&count===total)status='won';
   else if(hadMess&&count===0&&cleaned>baseline)status='lost';
   return {progress:count>previous,status,count,total};
  },
 };
}
