/* 虎鯨 Orca — swimming & movement (uses the shared swim brain in shared/swim.js) */
(function(){
const cfg={
  surf:-.55,          // body-centre height where the back breaks the surface
  spyY:.9,            // how high it rises when spy-hopping
  breachH:4.2,        // apex height of a breach
  tricks:['breach','spyhop','slap','roll'],
};
GC.register('orca',{
  settings:GC.swim.settings({speed:3,radius:14,depth:2.2,breathEvery:9,turnRate:.9}),
  actions:GC.swim.actions(cfg),
  brain:GC.swim.brain(cfg),
  camera:{offset:[13,6,15]},
  controlsHelp:GC.swim.controlsHelp,
});
})();
