/* 黑鰭礁鯊 — just circles (shared simple fish brain) */
GC.register('blacktip',{
  settings:GC.fish.settings({speed:2.2,radius:9,depth:2.2}),
  brain:GC.fish.brain({beat:4.5,beatK:1.2,bank:.12}),
  camera:{offset:[6,4,8]},
});
