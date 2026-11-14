/* 雙髻鯊 — just circles (shared simple fish brain) */
GC.register('hammerhead',{
  settings:GC.fish.settings({speed:2.4,radius:12,depth:3}),
  brain:GC.fish.brain({beat:4,beatK:1.1,bank:.12}),
  camera:{offset:[7,4.5,9]},
});
