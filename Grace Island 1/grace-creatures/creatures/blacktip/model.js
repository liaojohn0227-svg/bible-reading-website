/* 黑鰭礁鯊 Blacktip reef shark — model (shared shark template in shared/shark.js)
   Traits: sleek grey-bronze back, white belly, pale band along the flank,
   crisp black tips on the dorsal, pectoral and caudal fins, short rounded snout. */
(function(){
const PAL={top:'#9aa39f',belly:'#eef4f2',tip:'#262c31',dark:'#7f8a87',slit:'#6f7a77'};
GC.register('blacktip',{
  name:'黑鰭礁鯊',en:'Blacktip Reef Shark',habitat:'sea',
  blurb:'鰭尖像沾了墨汁的小鯊魚，在珊瑚礁邊緣優雅地巡游。',
  palette:PAL,
  make:()=>GC.sharkKit.makeShark({
    ...PAL,flankBand:true,scale:1,amp:.24,
    prof:[[-1.5,.03],[-1.3,.09],[-.95,.2],[-.4,.33],[.2,.38],[.7,.35],[1.05,.28],[1.32,.17],[1.48,.07],[1.53,.01]],
    sx:.82,sy:.95,bendZ0:.25,
    dorsal:{z:.02,h:.5,base:.5},dorsal2:{z:-.85,h:.13,base:.16},anal:{z:-.92,h:.11,base:.14},
    pec:{z:.55,len:.62,chord:.36},pelvic:{z:-.55,len:.2,chord:.16},
    caudal:.62,eye:{z:1.1,angle:1.42,r:.045},gills:[.78,.98],
  }),
});
})();
