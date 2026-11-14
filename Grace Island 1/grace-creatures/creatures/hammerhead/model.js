/* 雙髻鯊 Hammerhead shark — model (shared shark template in shared/shark.js)
   Traits: wide flat hammer head (cephalofoil) with an eye at each end, very tall sickle dorsal fin,
   long upper tail lobe, olive-grey back, white belly. */
(function(){
const PAL={top:'#8e9a97',belly:'#eef3f0',dark:'#77837f',slit:'#68736f'};
GC.register('hammerhead',{
  name:'雙髻鯊',en:'Hammerhead Shark',habitat:'sea',
  blurb:'頭像一把錘子、眼睛長在兩端，背上豎著高高的鐮刀形背鰭。',
  palette:PAL,
  make:()=>GC.sharkKit.makeShark({
    ...PAL,scale:1.1,amp:.22,
    prof:[[-1.9,.03],[-1.65,.1],[-1.2,.24],[-.5,.4],[.2,.45],[.8,.41],[1.2,.31],[1.45,.2],[1.6,.12],[1.68,.04]],
    sx:.8,sy:.95,bendZ0:.2,
    dorsal:{z:.25,h:.88,base:.56,sweep:.34},dorsal2:{z:-1.12,h:.16,base:.18},anal:{z:-1.08,h:.15,base:.18},
    pec:{z:.72,len:.6,chord:.33},pelvic:{z:-.62,len:.22,chord:.17},
    caudal:.86,gills:[.95,1.2],
    hammer:{z:1.62,y:-.02,w:1.3,chord:.32,t:.05},
  }),
});
})();
