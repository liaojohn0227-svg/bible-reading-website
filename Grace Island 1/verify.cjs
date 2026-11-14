// Run with node verify.cjs. No credentials or network access are needed.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const html = fs.readFileSync(__dirname + '/index.html','utf8');
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(match=>match[1]);
scripts.forEach(script=>new vm.Script(script));
const writes=[];
let fail=false;
const cloudSource=scripts[2].slice(0,scripts[2].indexOf('const GraceIsland ='))
  .replace("url: ''","url: 'https://test.supabase.co'")
  .replace("publishableKey: ''","publishableKey: 'sb_publishable_test'")
  .replace("await import('https://esm.sh/@supabase/supabase-js@2.49.1')",'mockModule');
const client={
  auth:{
    getSession:async()=>({data:{session:null}}),
    signInAnonymously:async()=>({data:{}}),
    getUser:async()=>({data:{user:{id:'owner-a'}}})
  },
  from(){
    return {
      async upsert(value){writes.push(structuredClone(value));return {error:fail?Error('offline'):null}},
      select(){return this},eq(){return this},neq(){return this},order(){return this},
      async range(){return {data:[]}}
    };
  }
};
const cloudContext=vm.createContext({
  mockModule:{createClient:()=>client},
  localStorage:{getItem:()=>null,setItem(){}},
  document:{hidden:false},setInterval:()=>1,clearInterval(){},console
});
vm.runInContext(cloudSource+'\nglobalThis.cloud=Archipelago;',cloudContext);
const decoderSource=scripts[2].slice(scripts[2].indexOf('const GraceIsland ='),scripts[2].indexOf('  function read()'));
function loadProgressRules(preview){
  return vm.runInContext(decoderSource+
  'return {decode,unlockedCards,outfitCredit,outfitsFor};})();GraceIsland;',vm.createContext({
  document:{getElementById(){}},
  GRACE_PREVIEW_UNLOCK_ALL:preview,
  PENGUIN_OUTFITS:Object.fromEntries(['','pastor','warrior','angel','gardener','dress','prayer','priest','shepherd','evangelist'].map(id=>[id,id]))
}));
}
const {decode,unlockedCards,outfitCredit,outfitsFor}=loadProgressRules(false);
(async()=>{
  const cloud=cloudContext.cloud;
  const journal={total:3,entries:[
    {id:'private-id',date:'2026-11-12',title:'secret',body:'private prayer',scripture:'private scripture',species:'penguin',variant:'adelie'},
    {species:'penguin',variant:'adelie'},{species:'seal',variant:''}
  ]};
  cloud.update(journal);
  assert.equal(writes.length,0);
  await cloud.join('晨光島');
  assert.equal(writes.length,1);
  assert.equal(writes[0].owner_id,'owner-a');
  assert.equal(writes[0].snapshot.animals[0].count,2);
  assert.equal(JSON.stringify(writes).includes('private'),false);
  const outfitIds=['pastor','warrior','angel','gardener','dress','prayer','priest','shepherd','evangelist'];
  const dressed=outfitIds.map((outfit,i)=>({id:'penguin-'+i,species:'penguin',variant:i===4?'chick':i>=5?'magellanic':'adelie',outfit}));
  assert.deepEqual(Array.from(cloud.publicSnapshot({total:5,entries:dressed}).animals,animal=>animal.outfit),outfitIds);
  fail=true;
  await assert.rejects(()=>cloud.join('晨光島'));
  assert.ok(cloud.status.error.includes('offline'));
  fail=false;
  await cloud.join('晨光島');
  assert.equal(cloud.status.error,'');

  const paint={createRadialGradient:()=>({addColorStop(){}}),createLinearGradient:()=>({addColorStop(){}})};
  for(const key of ['fillRect','beginPath','arc','fill','moveTo','lineTo','fillText'])paint[key]=()=>{};
  const events=()=>({
    handlers:new Map(),
    addEventListener(type,fn,options){
      const handlers=this.handlers.get(type)||[];
      if(options===true||options?.capture)handlers.unshift(fn);
      else handlers.push(fn);
      this.handlers.set(type,handlers);
    },
    removeEventListener(type,fn){this.handlers.set(type,(this.handlers.get(type)||[]).filter(handler=>handler!==fn))},
    fire(type,event){
      let stopped=false;
      const input={preventDefault(){},stopImmediatePropagation(){stopped=true},...event};
      for(const handler of this.handlers.get(type)||[]){
        if(stopped)break;
        handler(input);
      }
    }
  });
  const pointerDocument=events();
  const element=()=>({...events(),ownerDocument:pointerDocument,focus(){},setPointerCapture(){},setAttribute(){},getContext:()=>paint,style:{},clientHeight:800,clientWidth:1200});
  const elements=new Map();
  const getElementById=id=>{
    if(!elements.has(id))elements.set(id,element());
    return elements.get(id);
  };
  let sceneApi,neighborApi,nextFrame,sceneState;
  const windowEvents=events();
  const context=vm.createContext({
    GRACE_PREVIEW_UNLOCK_ALL:true,
    console,performance,innerWidth:1200,innerHeight:800,devicePixelRatio:1,
    matchMedia:()=>({matches:false}),window:windowEvents,addEventListener(){},
    document:{getElementById,createElement:element,querySelector:element},
    requestAnimationFrame(callback){nextFrame=callback},
    GraceIsland:{connect(api){sceneApi=api},unavailable(){throw Error('Scene startup failed')}},
    Archipelago:{bind(api){neighborApi=api}}
  });
  vm.runInContext(scripts[0],context);
  context.THREE.WebGLRenderer=class{shadowMap={};setPixelRatio(){};setSize(){};render(scene,camera){scene.updateMatrixWorld();camera.updateMatrixWorld()}};
  vm.runInContext(scripts[1],context);
  const terrainConfig=scripts[2].match(/const TERRAIN_MILESTONES = \[[\s\S]+?\];/)?.[0];
  assert.ok(terrainConfig);
  vm.runInContext(terrainConfig,context);
  context.inspectScene=(residents,sealIce,bearIce,camera,controls,SPECIES,mackerel,marine)=>{sceneState={residents,sealIce,bearIce,camera,controls,SPECIES,mackerel,marine}};
  const connect='GraceIsland.connect({sync:syncResidents,focus:focusResident,focusGratitude,celebrate});';
  vm.runInContext(scripts[3].replace(connect,
    'inspectScene(residents,sealIce,bearIce,camera,controls,SPECIES,{fishMesh,fishTails,swimMackerel,visibleIds:()=>visibleFish.map(fish=>fish.id)},{rays:GratitudeRays,sharks:AngerSharks,settleCamera,followResident,updateIslandVisits,territoryScenery,islandVisits,finishIslandVisit,landClear,advanceOnLand,updatePierPrayer,prayerState:()=>({visitor:pierPrayerVisitor,next:nextPierPrayer,ends:pierPrayerEnds,cloud:prayerCloud.visible})});'+connect),context);
  const {updatePierPrayer,prayerState}=sceneState.marine;
  const rotation=[];
  for(let index=0;index<6;index++){
    const {next}=prayerState();
    updatePierPrayer(next-.01);
    assert.equal(prayerState().visitor,null);
    updatePierPrayer(next);
    const {visitor,ends}=prayerState();
    rotation.push(visitor.type);
    assert.ok(ends-next>=15&&ends-next<=25);
    assert.equal(getElementById('pier-prayer-notice').hidden,false);
    updatePierPrayer(next+.4);
    assert.equal(prayerState().cloud,true);
    updatePierPrayer(next+3);
    assert.ok(visitor.inner.rotation.x>.3);
    updatePierPrayer(ends);
    assert.equal(visitor.g.visible,false);
    assert.equal(prayerState().cloud,true);
    assert.equal(getElementById('pier-prayer-notice').hidden,true);
    updatePierPrayer(ends+2);
    assert.equal(prayerState().cloud,false);
    assert.ok(prayerState().next-ends>=20&&prayerState().next-ends<=30);
  }
  assert.equal(new Set(rotation.slice(0,5)).size,5);
  assert.equal(rotation[0],rotation[5]);
  const initialResidents=Array.from({length:8},(_,index)=>({
    id:'initial-'+index,species:'penguin',variant:'adelie',outfit:''
  }));
  sceneApi.sync({total:30,entries:initialResidents});
  assert.equal(sceneState.marine.islandVisits.size,5);
  for(const islet of sceneState.marine.territoryScenery)assert.ok(islet.visitors.size>=1&&islet.visitors.size<=2);
  sceneApi.sync({total:30,entries:initialResidents});
  assert.equal(sceneState.marine.islandVisits.size,5);
  sceneApi.sync({total:30,entries:[]});
  assert.equal(sceneState.marine.islandVisits.size,0);
  const scoreCode=scripts[2].slice(scripts[2].indexOf('  const score=['),scripts[2].indexOf('  function tone('));
  assert.ok(vm.runInNewContext(scoreCode+'score.length*measureLength')>=40);
  const {fishMesh,fishTails,swimMackerel,visibleIds}=sceneState.mackerel;
  const {rays,sharks}=sceneState.marine;
  const registry=context.window.GC.creatures,rigs=new Map();
  for(const id of ['orca','beluga','narwhal','manta','skate','blacktip','hammerhead']){
    const make=registry[id].make;
    registry[id].make=(...args)=>{const model=make(...args);rigs.set(id,model);return model};
  }
  const modelRayNotes=[{id:'manta-test',fish:'manta'},{id:'skate-test',fish:'skate'}];
  const sharkNotes=[{id:'blacktip-test',level:'some'},{id:'hammerhead-test',level:'very'}];
  sceneApi.sync({total:0,entries:[],gratitude:modelRayNotes,anger:sharkNotes});
  rays.update(0,true);sharks.update(0,.016,true);
  const tails=new Map([...rigs].map(([id,m])=>[id,m.tail.rotation.y]));
  rays.update(1,true);sharks.update(1,.016,true);
  for(const id of ['manta','skate','blacktip','hammerhead']){
    const model=rigs.get(id);
    assert.ok(model.g.visible && Number.isFinite(model.tail.rotation.y),id);
    assert.notEqual(model.tail.rotation.y,tails.get(id),id+' tail should move');
  }
  sceneApi.sync({total:0,entries:[],anger:sharkNotes.map(n=>({...n,released:true}))});
  for(const n of sharkNotes)assert.equal(sharks.has(n.id),false);
  for(let i=0;i<6;i++)sharks.update(2+i,1,true);

  assert.equal(fishMesh.count,0);
  const gratitude=Array.from({length:80},(_,i)=>({id:'gratitude-'+i,date:'2026-11-12',body:'感恩'}));
  const island={total:0,entries:[]};
  for(const count of [1,2,80]){
    sceneApi.sync({...island,gratitude:gratitude.slice(0,count)});
    swimMackerel(0);
    assert.equal(fishMesh.count,Math.min(count,72));
  }
  const absent=gratitude.find(entry=>!visibleIds().includes(entry.id));
  sceneApi.focusGratitude(absent.id);
  swimMackerel(0);
  assert.equal(visibleIds()[0],absent.id);
  assert.equal(fishTails.count,fishMesh.count);
  swimMackerel(0);
  const initialTail=fishTails.instanceMatrix.array.slice(0,16);
  swimMackerel(.3);
  assert.notDeepEqual(fishTails.instanceMatrix.array.slice(0,16),initialTail);
  assert.ok(fishMesh.instanceMatrix.array.every(Number.isFinite));
  // skate and manta notes swim as rays, not as mackerel
  const rayNotes=gratitude.slice(0,30).map((entry,i)=>({...entry,fish:i<10?'mackerel':i<20?'skate':'manta'}));
  sceneApi.sync({...island,gratitude:rayNotes});swimMackerel(0);
  assert.equal(fishMesh.count,10);
  sceneApi.focusGratitude(rayNotes[25].id);
  for(let i=0;i<5;i++)nextFrame();
  // anger sharks swim on their own and can be followed; released ones are not on the island
  sceneApi.sync({...island,anger:[{id:'shark-a',date:'2026-11-12',body:'x',level:'some',reflection:'',reflectedAt:'',released:false},
    {id:'shark-b',date:'2026-11-12',body:'y',level:'very',reflection:'z',reflectedAt:'2026-11-12',released:true}]});
  sceneApi.focusGratitude('shark-a');
  for(let i=0;i<5;i++)nextFrame();
  sceneApi.sync(island);swimMackerel(0);
  assert.equal(fishMesh.count,0);
  const {camera,controls,SPECIES}=sceneState;
  for(const [type,scale] of Object.entries({adelie:.648,emperor:.92,rockhopper:.558,chick:.495}))assert.equal(SPECIES[type].size,scale);
  const canvas=getElementById('stage');
  const startTarget=controls.target.clone(),startOffset=camera.position.clone().sub(startTarget);
  canvas.fire('pointerdown',{pointerType:'mouse',button:0,clientX:100,clientY:100});
  pointerDocument.fire('pointermove',{pointerType:'mouse',clientX:180,clientY:100});
  pointerDocument.fire('pointerup',{pointerType:'mouse'});
  assert.ok(controls.target.distanceTo(startTarget)>.01);
  assert.ok(camera.position.clone().sub(controls.target).distanceTo(startOffset)<1e-7);
  getElementById('camera-mode').onclick();
  const orbitTarget=controls.target.clone(),orbitOffset=camera.position.clone().sub(orbitTarget);
  canvas.fire('touchstart',{touches:[{pageX:100,pageY:100,clientX:100,clientY:100}]});
  canvas.fire('touchmove',{touches:[{pageX:180,pageY:100,clientX:180,clientY:100}]});
  canvas.fire('touchend',{touches:[]});
  assert.ok(controls.target.distanceTo(orbitTarget)<1e-7);
  assert.ok(camera.position.clone().sub(orbitTarget).distanceTo(orbitOffset)>.01);
  getElementById('camera-mode').onclick();
  const pinchTarget=controls.target.clone(),pinchDistance=camera.position.distanceTo(pinchTarget);
  canvas.fire('touchstart',{touches:[{pageX:100,pageY:100},{pageX:200,pageY:100}]});
  canvas.fire('touchmove',{touches:[{pageX:110,pageY:120},{pageX:260,pageY:120}]});
  assert.ok(camera.position.distanceTo(controls.target)<pinchDistance);
  assert.ok(controls.target.distanceTo(pinchTarget)>.01);
  canvas.fire('touchend',{touches:[{pageX:110,pageY:120}]});
  const remainingTarget=controls.target.clone();
  canvas.fire('touchmove',{touches:[{pageX:140,pageY:120}]});
  canvas.fire('touchend',{touches:[]});
  assert.ok(controls.target.distanceTo(remainingTarget)>.01);
  const otherAnimals=['seal','bear','dolphin','whale','orca','beluga','narwhal'].map(species=>({id:species,species,variant:'',outfit:''}));
  const journalFields={date:'2026-11-12',title:'',scripture:'',body:'測試'};
  const oldEntry={...journalFields,id:'old',species:'penguin',variant:'adelie'};
  assert.equal(decode({version:1,total:1,entries:[oldEntry]}).entries[0].outfit,'');
  assert.equal(decode({version:1,total:1,entries:[oldEntry]}).gratitude.length,0);
  const restoredGratitude=decode(JSON.parse(JSON.stringify({version:1,total:0,entries:[],gratitude})));
  assert.equal(restoredGratitude.gratitude.length,80);
  assert.equal(restoredGratitude.total,0);
  assert.throws(()=>decode({version:1,total:0,entries:[],gratitude:[gratitude[0],gratitude[0]]}));
  // gratitude fish: old notes become mackerel, known kinds round-trip, unknown kinds are rejected
  assert.equal(restoredGratitude.gratitude[0].fish,'mackerel');
  for(const fish of ['mackerel','skate','manta'])assert.equal(decode({version:1,total:0,entries:[],gratitude:[{...gratitude[0],fish}]}).gratitude[0].fish,fish);
  assert.throws(()=>decode({version:1,total:0,entries:[],gratitude:[{...gratitude[0],fish:'shark'}]}));
  // anger notes: old saves have none, levels are checked, a shark can only be released after its reflection
  assert.equal(decode({version:1,total:0,entries:[]}).anger.length,0);
  const anger=[{id:'anger-1',date:'2026-11-12',body:'生氣',level:'some'},{id:'anger-2',date:'2026-11-12',body:'很生氣',level:'very',reflection:'現在比較平靜',reflectedAt:'2026-11-13',released:true}];
  const restoredAnger=decode({version:1,total:0,entries:[],anger}).anger;
  assert.deepEqual(restoredAnger.map(entry=>[entry.level,entry.reflection,entry.released]),[['some','',false],['very','現在比較平靜',true]]);
  assert.throws(()=>decode({version:1,total:0,entries:[],anger:[{...anger[0],level:'furious'}]}));
  assert.throws(()=>decode({version:1,total:0,entries:[],anger:[{...anger[0],released:true}]}));
  assert.throws(()=>decode({version:1,total:0,entries:[],gratitude:[{...gratitude[0],id:'anger-1'}],anger}));
  const preview=loadProgressRules(true);
  assert.deepEqual(Array.from(preview.unlockedCards(0),card=>card.id),Array.from(unlockedCards(33),card=>card.id));
  assert.deepEqual(Array.from(preview.outfitsFor({entries:[oldEntry]},oldEntry.id)),['pastor','warrior','angel','gardener','dress','prayer','priest','shepherd','evangelist']);
  assert.deepEqual(Array.from(unlockedCards(2),card=>card.id),['adelie']);
  assert.deepEqual(Array.from(unlockedCards(3),card=>card.id),['adelie','seal']);
  assert.equal(unlockedCards(20).length,7);
  assert.equal(unlockedCards(21).length,8);
  assert.deepEqual(Array.from(unlockedCards(30),card=>card.id).slice(8),['orca','beluga','narwhal']);
  assert.equal(unlockedCards(23).length,8);
  const migrated=decode({version:1,total:1,entries:[{...oldEntry,outfit:'angel'}]});
  assert.deepEqual(Array.from(outfitsFor(migrated,'old')),['angel']);
  assert.equal(outfitCredit(migrated.progress),0);
  const progress=decode({version:1,total:4,entries:[oldEntry],progress:{
    days:['2026-11-11','2026-11-11','2026-11-12','2026-11-13','2026-11-15'],
    outfits:[{target:'old',outfit:'pastor'}]
  }}).progress;
  assert.equal(progress.days.length,4);
  assert.equal(outfitCredit(progress),1);
  assert.deepEqual(Array.from(outfitsFor({progress},'other')),[]);
  assert.ok(!html.includes('id="camera-depth"'));
  const originalView=camera.position.clone(),originalTarget=controls.target.clone();
  const mouseDrag=(button,from,to)=>{
    const pointer={pointerType:'mouse',pointerId:9,button,clientX:120};
    canvas.fire('pointerdown',{...pointer,clientY:from});
    pointerDocument.fire('pointermove',{...pointer,clientY:to});
    pointerDocument.fire('pointerup',pointer);
  };
  controls.clearMomentum();
  mouseDrag(0,350,150);
  assert.ok(camera.position.clone().sub(controls.target).distanceTo(originalView.clone().sub(originalTarget))<1e-7);
  controls.clearMomentum();
  camera.position.copy(originalView);controls.target.copy(originalTarget);controls.update();
  mouseDrag(2,700,100);
  assert.ok(camera.position.y<0);
  assert.ok(controls.target.distanceTo(originalTarget)<1e-7);
  controls.clearMomentum();
  mouseDrag(2,100,700);
  assert.ok(camera.position.y>0);
  controls.clearMomentum();
  camera.position.copy(originalView);controls.target.copy(originalTarget);controls.update();
  const finger=(x,y)=>({pageX:x,pageY:y,clientX:x,clientY:y});
  canvas.fire('touchstart',{touches:[finger(100,350)]});
  canvas.fire('touchmove',{touches:[finger(100,100)]});
  canvas.fire('touchend',{touches:[]});
  assert.ok(camera.position.y < -2);
  canvas.fire('touchstart',{touches:[finger(100,100)]});
  canvas.fire('touchmove',{touches:[finger(100,350)]});
  canvas.fire('touchend',{touches:[]});
  assert.ok(camera.position.distanceTo(originalView)<1e-7);
  for(const entry of dressed)assert.equal(decode({version:1,total:1,entries:[{...journalFields,...entry}]}).entries[0].outfit,entry.outfit);
  context.PENGUIN_OUTFITS=Object.fromEntries(outfitIds.map(id=>[id,id]));
  for(const entry of otherAnimals){
    assert.equal(decode({version:1,total:1,entries:[{...journalFields,...entry}]}).entries[0].species,entry.species);
    sceneApi.sync({total:1,entries:[entry]});
    const resident=sceneState.residents.get(entry.id);
    assert.equal(resident.model.g.userData.journalId,entry.id);
    if(entry.species==='seal')assert.equal(sceneState.sealIce.visible,true);
    if(entry.species==='bear')assert.equal(sceneState.bearIce.visible,true);
    sceneApi.focus(entry.id);nextFrame();
  }
  sceneApi.sync({total:5,entries:dressed});nextFrame();
  for(const entry of dressed)assert.equal(sceneState.residents.get(entry.id).model.outfit,entry.outfit);
  const restyled={...dressed[0],outfit:'angel'};
  sceneApi.sync({total:5,entries:[restyled,...dressed.slice(1)]});
  const changed=sceneState.residents.get(restyled.id).model;
  assert.equal(changed.outfit,'angel');
  assert.equal(changed.g.userData.journalId,restyled.id);
  const rows=[{owner_id:'owner-b',name:'測試島',snapshot:{total:30,animals:[
    {species:'penguin',variant:'chick',outfit:'gardener',count:5},
    {species:'penguin',variant:'adelie',count:1},
    {species:'penguin',variant:'emperor',count:1},
    {species:'penguin',variant:'rockhopper',count:1},
    {species:'seal',variant:'',count:1},
    {species:'bear',variant:'',count:1},{species:'whale',variant:'',count:1},
    {species:'dolphin',variant:'',count:1},
    {species:'orca',variant:'',count:2},{species:'beluga',variant:'',count:1},{species:'narwhal',variant:'',count:1}
  ]}}];
  neighborApi.show(rows);neighborApi.overview();nextFrame();
  neighborApi.show(rows);nextFrame();
  neighborApi.show([]);nextFrame();
    // the new whales swim on their own: run the loop for a while and check every whale stays finite and on its ring
  sceneApi.sync({total:30,entries:otherAnimals});
  for(let i=0;i<240;i++)nextFrame();
  windowEvents.fire('blur',{});
  const stopButton=getElementById('stop-follow');
  sceneApi.focus('beluga',true);
  assert.equal(stopButton.hidden,false);
  sceneState.marine.settleCamera();
  const belugaModel=sceneState.residents.get('beluga').model.g;
  belugaModel.position.set(36,-4,0);
  sceneState.marine.followResident(2);
  assert.ok(controls.target.distanceTo(belugaModel.position)<.001);
  canvas.fire('wheel',{deltaY:-100});
  assert.equal(stopButton.hidden,false);
  const mouse={pointerId:18,pointerType:'mouse',clientX:120,clientY:180};
  canvas.fire('pointerdown',{...mouse,button:2});
  windowEvents.fire('pointermove',{...mouse,clientX:155});
  assert.equal(stopButton.hidden,false);
  windowEvents.fire('pointerup',{...mouse,clientX:155});
  canvas.fire('pointerdown',{...mouse,button:0});
  windowEvents.fire('pointermove',{...mouse,clientX:155});
  assert.equal(stopButton.hidden,true);
  windowEvents.fire('pointerup',{...mouse,clientX:155});
  sceneApi.sync({total:30,entries:otherAnimals,gratitude:modelRayNotes,anger:sharkNotes});
  for(const note of [...modelRayNotes,...sharkNotes]){
    sceneApi.focusGratitude(note.id,true);
    assert.equal(stopButton.hidden,false);
    stopButton.onclick();
    assert.equal(stopButton.hidden,true);
  }
  for(const species of ['whale','orca','beluga','narwhal']){
    const model=sceneState.residents.get(species).model;
    if(species!=='whale')assert.equal(model,rigs.get(species));
    const p=model.g.position;
    assert.ok([p.x,p.y,p.z].every(Number.isFinite));
    assert.ok(Math.hypot(p.x,p.z)>20&&Math.hypot(p.x,p.z)<49,species+' left its ring');
  }
  const {updateIslandVisits,territoryScenery,islandVisits,finishIslandVisit,landClear}=sceneState.marine;
  for(const id of islandVisits.keys())finishIslandVisit(id);
  const shoreEntries=['penguin','seal','bear'].flatMap((species)=>Array.from({length:12},(_,i)=>({
    id:species+'-visitor-'+i,species,variant:species==='penguin'?'adelie':'',outfit:''
  })));
  sceneApi.sync({total:36,entries:shoreEntries});
  const visibleLand=[...sceneState.residents.values()].map(item=>item.model).filter(model=>model.g.visible);
  assert.ok(visibleLand.length>12);
  for(const model of visibleLand){
    const pos=model.g.position;
    assert.ok(landClear(model,pos.x,pos.z));
    const other=visibleLand.find(item=>item!==model);
    assert.equal(landClear(model,other.g.position.x,other.g.position.z),false);
  }
  const walker=visibleLand[0],blocker=visibleLand[1];
  const walkerStart=walker.g.position.clone(),blockerStart=blocker.g.position.clone();
  const visibility=visibleLand.map(model=>model.g.visible);
  visibleLand.slice(2).forEach(model=>{model.g.visible=false});
  walker.g.position.set(2,0,5);
  blocker.g.position.set(2+walker.collisionRadius+blocker.collisionRadius+.005,0,5);
  assert.equal(landClear(walker,2.1,5),false);
  assert.equal(sceneState.marine.advanceOnLand(walker,walker.g.position,.1,0,.05,true),true);
  assert.ok(Math.abs(walker.g.position.z-5)>.01);
  assert.ok(landClear(walker,walker.g.position.x,walker.g.position.z));
  walker.g.position.copy(walkerStart);blocker.g.position.copy(blockerStart);
  visibleLand.forEach((model,index)=>{model.g.visible=visibility[index]});
  function startSingleVisitor(entry){
    sceneApi.sync({total:36,entries:[]});
    sceneApi.sync({total:36,entries:[entry]});
    const model=sceneState.residents.get(entry.id).model;
    const islet=territoryScenery[0];
    // Start on clear ground near the crossing to isolate the round-trip check.
    model.g.position.set(islet.direction.x*(islet.start-.4),0,islet.direction.y*(islet.start-.4));
  }
  const visitedSpecies=new Set();
  let returned=false;
  for(let time=0;time<520;time+=.1){
    if(time===60||Math.abs(time-60)<.05)startSingleVisitor(shoreEntries[0]);
    if(Math.abs(time-200)<.05)startSingleVisitor(shoreEntries[12]);
    if(Math.abs(time-350)<.05)startSingleVisitor(shoreEntries[24]);
    updateIslandVisits(time,.1);
    for(const {model} of sceneState.residents.values()){
      if(model.g.visible)assert.ok(landClear(model,model.g.position.x,model.g.position.z));
    }
    for(const islet of territoryScenery){
      assert.ok(islet.visitors.size<=6);
      const onBridge=[...islandVisits.entries()].filter(([,visit])=>visit.islet===islet&&['out','back'].includes(visit.phase));
      assert.ok(onBridge.length<=1);
      for(const [id,visit] of onBridge){
        assert.equal(id,islet.crossing);
        assert.ok(Math.abs(sceneState.residents.get(id).model.g.position.y-islet.deckHeight(visit.distance))<.15);
      }
    }
    for(const [id,visit] of islandVisits){
      if(visit.phase==='rest')visitedSpecies.add(sceneState.residents.get(id).entry.species);
      if(visit.phase==='home')returned=true;
    }
  }
  assert.deepEqual([...visitedSpecies].sort(),['bear','penguin','seal']);
  assert.ok(returned);
  sceneApi.celebrate('journal',shoreEntries[24].id);nextFrame();
  sceneApi.sync({total:36,entries:[shoreEntries[24]],gratitude:modelRayNotes});
  sceneApi.celebrate('gratitude',modelRayNotes[0].id);nextFrame();
  console.log('PASS: script parsing, public snapshot privacy, grouped counts, owner payload, offline/retry, 3D neighbor creation, all animal rigs, overview, animation and disposal. GPU rendering and live database are not covered.');
})().catch(error=>{console.error(error);process.exitCode=1});
