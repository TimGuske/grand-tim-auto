export const TUTORIAL_STEPS=[
 {id:'move',title:'Erst mal loslaufen',text:'WASD / Pfeile am PC oder der Joystick am Handy bewegen Tim.',task:'Lauf ein paar Schritte.'},
 {id:'kick',title:'Gegenstände? Mit dem Fuß!',text:'X am PC oder TRITT am Handy. Die Faust wirft keine Gegenstände um.',task:'Tritt die markierte Kiste um.'},
 {id:'punch',title:'Passanten? Mit der Faust!',text:'Leertaste am PC oder SCHLAG am Handy. Die Passanten kommen nach ihrer Comic-Flugeinlage wieder.',task:'Schlag einen Passanten.'},
 {id:'stand',title:'Aperol ist deine Energie',text:'Der orange Balken leert sich langsam. Nachschub gibt es am Aperol-Spritz-Stand.',task:'Geh zum markierten Stand.'},
 {id:'empty',title:'Tank leer – Tim schleicht',text:'Wir zeigen dir kurz 0 %. Ohne Aperol bist du sehr langsam. Das kostet in Missionen wertvolle Zeit.',task:'Bewege Tim ein paar Schritte.'},
 {id:'refill',title:'Jetzt wieder auftanken',text:'Am Stand F drücken oder APEROL NACHTANKEN antippen. Dann läuft Tim wieder normal.',task:'Füll deinen Aperol-Tank auf.'},
 {id:'mission',title:'Bereit für die Kehrwoche?',text:'Im gelben Bodenmarker beim Torturm startest du Missionen mit E oder MISSION STARTEN.',task:'Geh zum Marker und öffne die Mission.'},
];
export function createTutorial(){
 let status='idle',index=0,distance=0,time=0;
 const next=()=>{distance=0;time=0;if(++index>=TUTORIAL_STEPS.length)status='complete';};
 const checkWalk=()=>{if((index===0&&distance>=2)||(index===4&&distance>=.7&&time>=1.5))next();};
 return {
  get active(){return status==='active';},get status(){return status;},get index(){return index;},get step(){return status==='active'?TUTORIAL_STEPS[index].id:null;},get content(){return TUTORIAL_STEPS[index];},
  start(){status='active';index=0;distance=0;time=0;},stop(){status='idle';index=0;distance=0;time=0;},
  tick(dt){if(status!=='active')return;time+=dt;checkWalk();},
  event(type,data={}){
   if(status!=='active')return;
   if(type==='walk'){distance+=Math.max(0,data.distance||0);checkWalk();return;}
   const id=TUTORIAL_STEPS[index].id;
   if((id==='kick'&&type==='kick'&&data.target)||(id==='punch'&&type==='punch'&&data.people>0)||(id==='stand'&&type==='nearStand')||(id==='refill'&&type==='refill')||(id==='mission'&&type==='mission'))next();
  },
 };
}
