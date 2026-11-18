import test from 'node:test';import assert from 'node:assert/strict';
import {bindActionButton,bindJoystick} from './touch-controls.js';
class Control extends EventTarget{style={};setPointerCapture(id){this.captured=id;}getBoundingClientRect(){return {left:0,top:0,width:100,height:100};}}
function event(type,values={}){const e=new Event(type,{cancelable:true});Object.assign(e,{pointerId:1,pointerType:'touch',clientX:80,clientY:50,button:0,detail:1,...values});return e;}
test('joystick continues on the first finger while a second finger punches immediately',()=>{
 const stick=new Control(),punch=new Control();let movement,actions=0;
 bindJoystick(stick,v=>movement=v);bindActionButton(punch,()=>actions++);
 stick.dispatchEvent(event('pointerdown'));const held=movement.x;assert.ok(held>0);
 const press=event('pointerdown',{pointerId:2});punch.dispatchEvent(press);assert.equal(actions,1);assert.ok(press.defaultPrevented);assert.equal(movement.x,held);
 stick.dispatchEvent(event('pointerup',{pointerId:2}));assert.equal(movement.x,held);
 punch.dispatchEvent(event('click',{pointerId:2}));assert.equal(actions,1,'compatibility click is not a duplicate punch');
 punch.dispatchEvent(event('pointerdown',{pointerId:3}));assert.equal(actions,2,'second tap reaches the action handler');
 const double=event('dblclick');punch.dispatchEvent(double);assert.ok(double.defaultPrevented);
 stick.dispatchEvent(event('pointercancel'));assert.deepEqual(movement,{x:0,y:0});
});
