/* 鬼蝠魟 — just circles (shared simple fish brain); slow wing beat, banks into the turn */
GC.register('manta',{
  settings:GC.fish.settings({speed:1.6,radius:11,depth:2.5}),
  brain:GC.fish.brain({beat:2,beatK:.35,bank:.35,bob:.2}),
  camera:{offset:[6,5,8]},
});
