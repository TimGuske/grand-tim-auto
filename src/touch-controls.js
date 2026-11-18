// Each control owns its pointer. A second finger never steals the joystick.
export function bindActionButton(button,action){
 button.style.touchAction='none';
 button.addEventListener('pointerdown',event=>{if(event.pointerType==='mouse'&&event.button!==0)return;event.preventDefault();event.stopPropagation();button.setPointerCapture?.(event.pointerId);action();});
 button.addEventListener('click',event=>{event.preventDefault();if(event.detail===0)action();});
 button.addEventListener('dblclick',event=>event.preventDefault());
 button.addEventListener('contextmenu',event=>event.preventDefault());
}
export function bindJoystick(element,onMove,onUnlock=()=>{}){
 let pointer=null;
 function move(event){const r=element.getBoundingClientRect();let x=(event.clientX-r.left-r.width/2)/(r.width*.35),y=(event.clientY-r.top-r.height/2)/(r.height*.35);const l=Math.hypot(x,y);if(l>1){x/=l;y/=l;}onMove({x,y});}
 element.addEventListener('pointerdown',event=>{event.preventDefault();event.stopPropagation();if(pointer!==null)return;pointer=event.pointerId;onUnlock();element.setPointerCapture?.(pointer);move(event);});
 element.addEventListener('pointermove',event=>{if(event.pointerId===pointer){event.preventDefault();move(event);}});
 const reset=()=>{pointer=null;onMove({x:0,y:0});};
 for(const name of ['pointerup','pointercancel','lostpointercapture'])element.addEventListener(name,event=>{if(event.pointerId===pointer)reset();});
 return reset;
}
