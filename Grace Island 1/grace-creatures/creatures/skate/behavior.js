/* 冬鰩 — just circles near the sea floor (shared simple fish brain); the disc margin ripples as it glides */
GC.register('skate',{
  settings:GC.fish.settings({speed:1.2,radius:7,depth:{value:7,max:8.5}}),
  brain:GC.fish.brain({beat:3,beatK:.8,bank:.2,bob:.05}),
  camera:{offset:[4,3.5,5.5]},
});
