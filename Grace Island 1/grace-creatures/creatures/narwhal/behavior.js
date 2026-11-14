/* 獨角鯨 Narwhal — swimming & movement (shared swim brain + narwhal tricks)
   Deep diver, often swims belly-up, raises its tusk vertically out of the water ("tusking"). */
(function(){
const {smooth}=GC.kit;
const cfg={
  surf:-.42,spyY:.8,breachH:2.6,tailBase:.15,
  tricks:[
    {key:'spyhop',label:'舉牙探頭',status:'舉起長牙'},
    {key:'bellyUp',label:'仰泳',status:'翻身仰泳',len:8,
      pose:T=>({roll:Math.PI*smooth(0,1.2,T)*(1-smooth(6.8,8,T))})},
    {key:'deepDive',label:'深潛',status:'深潛中',len:12,climb:2,
      y:(C,st)=>st.T<7.5?-7.4:C.surf,
      onStart:c=>c.fx.emote(c.o.g,'咕嚕','#3f6f8a',1.6,2)},
    'slap','roll',
  ],
};
GC.register('narwhal',{
  settings:GC.swim.settings({speed:2.4,radius:13,depth:{value:3,max:7},breathEvery:12,turnRate:.95}),
  actions:GC.swim.actions(cfg),
  brain:GC.swim.brain(Object.assign({manualDepth:7},cfg)),
  camera:{offset:[9,4.5,11]},
  controlsHelp:GC.swim.controlsHelp.replace('　空白鍵 躍身',''),
});
})();
