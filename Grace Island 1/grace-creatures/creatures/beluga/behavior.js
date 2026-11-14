/* 白鯨 Beluga — swimming & movement (shared swim brain + beluga tricks)
   Slower and more agile than the orca, rarely breaches, turns its head, sings and blows bubbles. */
(function(){
const {smooth}=GC.kit;
const env=(T,len,a=.5)=>smooth(0,a,T)*(1-smooth(len-a,len,T));
const cfg={
  surf:-.42,spyY:.55,headIdle:.16,tailBase:.16,
  tricks:[
    'spyhop',
    {key:'nod',label:'轉頭點頭',status:'東張西望',len:4.5,v:1,
      pose:T=>{const u=env(T,4.5);return{headYaw:Math.sin(T*1.6)*.6*u,headPitch:Math.sin(T*3.2)*.25*u}}},
    {key:'sing',label:'唱歌',status:'唱歌 ♪',len:4,v:.8,y:C=>C.surf+.12,
      onStart:c=>c.fx.emote(c.o.g,'♪ ♫','#3f8fb0',3.2,2.2),
      pose:T=>{const u=env(T,4);return{pitch:-.18*u,headPitch:(-.2+Math.sin(T*6)*.1)*u,headYaw:Math.sin(T*1.3)*.2*u}}},
    {key:'bubbles',label:'吐泡泡',status:'吐泡泡',len:4,v:.6,y:C=>C.surf-1.7,climb:1.8,
      onUpdate:(T,dt,c)=>{if(T<1.3||T>3.2)return;c.st.bubT=(c.st.bubT||0)-dt;
        if(c.st.bubT<0){c.st.bubT=.05;c.o.inner.localToWorld(c.tmp.copy(c.o.head));if(c.tmp.y<-.2)c.fx.bubbles(c.tmp,3)}},
      pose:T=>({headPitch:-.15*env(T,4)})},
    'roll',
  ],
};
GC.register('beluga',{
  settings:GC.swim.settings({speed:2,radius:12,depth:2,breathEvery:8,turnRate:1.15}),
  actions:GC.swim.actions(cfg),
  brain:GC.swim.brain(cfg),
  camera:{offset:[9,4.5,11]},
  controlsHelp:GC.swim.controlsHelp.replace('　空白鍵 躍身',''),
});
})();
