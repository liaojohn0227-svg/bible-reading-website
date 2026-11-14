/* 白鯨 Beluga — model (looks only; movement lives in behavior.js)
   Traits: all-white body, round bulging melon, short beak, flexible neck (headPivot),
   no dorsal fin (a low ridge sculpted into the back), smiling mouth line.
   The head is its own lathe whose base matches the neck radius, so body → neck → melon reads as one smooth shape. */
(function(){
const {LIN,AM,smooth,toneFin,latheBody,blackEye,surfacePoint,bendable}=GC.kit;

const PAL={top:'#f4f7f3',belly:'#e2ebe9',shade:'#c9dde0',edge:'#c6d3d5',mouth:'#a9bcc0',blowhole:'#b8c7ca'};
const BODY=[[-2.95,.04],[-2.55,.2],[-1.9,.46],[-.9,.8],[.2,.96],[1.1,.93],[1.7,.82],[2.0,.75],[2.3,.7]];
// head profile in head-pivot space (pivot sits at body z 1.95); starts inside the neck, bulges into the melon, ends at the beak
const HEAD=[[-.35,.72],[0,.73],[.3,.73],[.6,.68],[.85,.54],[1.0,.4],[1.12,.33],[1.27,.25],[1.38,.14],[1.44,.02]];
const SY=.95,PIVOT_Z=1.95,TAIL_Z=-2.9;

const bump=(z,a,b,c,d)=>smooth(a,b,z)*(1-smooth(c,d,z));

function bodyPaint(){
  const cT=LIN(PAL.top),cB=LIN(PAL.belly),cSh=LIN(PAL.shade),cE=LIN(PAL.edge);
  return (c,{z,f})=>{
    c.copy(cB).lerp(cT,smooth(-.5,.2,f));
    c.lerp(cSh,.4*smooth(-.7,-1,f));
    c.lerp(cE,.55*smooth(-2.1,-2.9,z));      // tail stock fades to a soft grey edge
  };
}
function headPaint(){
  const cT=LIN(PAL.top),cB=LIN(PAL.belly),cSh=LIN(PAL.shade),cE=LIN(PAL.edge);
  return (c,{z,f})=>{
    c.copy(cB).lerp(cT,smooth(-.5,.2,f));
    c.lerp(cSh,.4*smooth(-.7,-1,f));
    c.lerp(cE,.3*bump(z,.85,.95,.98,1.1)*smooth(-.3,.2,f));   // faint crease where melon meets beak
  };
}

function makeBeluga(scale=.85){
  const g=new THREE.Group(),inner=new THREE.Group();g.add(inner);

  // body with a soft dorsal ridge pressed out of the back (no separate beads)
  const body=latheBody(BODY,{sy:SY,steps:200,radial:120,paint:bodyPaint(),
    deform:(v,{z,f})=>{v.y+=.06*smooth(.9,.995,f)*bump(z,-2.2,-1.7,-.5,-.05)}});
  inner.add(body);
  const flex=bendable(body,-.6,TAIL_Z);

  // flexible neck → the whole head turns and nods on this pivot
  const headPivot=new THREE.Group();headPivot.position.set(0,0,PIVOT_Z);headPivot.rotation.order='YXZ';inner.add(headPivot);
  const head=latheBody(HEAD,{sy:SY,steps:120,radial:96,paint:headPaint(),
    deform:(v,{z,f})=>{
      if(v.y>0)v.y*=1+.13*bump(z,-.1,.4,.55,.95);   // round melon swells upward
      v.y-=.16*smooth(.8,1.2,z);                   // beak sits lower than the melon
    }});
  headPivot.add(head);

  // the beluga "smile": thin arc hugging the beak, corners turned up
  const sg=new THREE.TorusGeometry(.31,.015,6,32,Math.PI*1.05);sg.rotateX(Math.PI/2);sg.rotateY(-Math.PI*.025);
  const smile=new THREE.Mesh(sg,AM(PAL.mouth));smile.position.set(0,-.27,1.06);smile.rotation.x=.22;headPivot.add(smile);

  for(const s of[-1,1]){const e=blackEye(.055);e.position.copy(surfacePoint(HEAD,.74,1.78,{sy:SY,side:s,out:.02}));headPivot.add(e)}
  const bh=new THREE.Mesh(new THREE.SphereGeometry(.06,12,8),AM(PAL.blowhole));bh.scale.set(1.4,.3,.6);bh.position.set(0,.64*SY,0);headPivot.add(bh);

  // broad rounded flippers with slightly upturned tips
  const pecs=[];for(const s of[-1,1]){const pv=new THREE.Group();pv.position.set(s*.78,-.5,1.35);
    const f=toneFin(.85,.1,.5,PAL.top,PAL.edge,.35);f.position.x=s*.4;f.rotation.y=-s*.3;f.rotation.z=s*.12;pv.add(f);pv.rotation.z=-s*.5;inner.add(pv);pecs.push(pv)}

  const tail=new THREE.Group();tail.position.set(0,0,TAIL_Z);inner.add(tail);
  for(const s of[-1,1]){const l=toneFin(1.15,.1,.55,PAL.edge,PAL.belly);l.position.set(s*.5,0,-.22);l.rotation.y=s*.5;tail.add(l)}

  inner.traverse(m=>{if(m.isMesh)m.castShadow=true});
  g.scale.setScalar(scale);
  // bend(a): flex the tail stock and carry the fluke along with it (swim brain adds a to the fluke angle)
  const bend=a=>{flex.bend(a);const p=flex.bendAt(a,TAIL_Z);tail.position.set(0,p.y,p.z)};
  return {g,inner,tail,pecs,headPivot,bend,blowhole:new THREE.Vector3(0,.72,1.95),head:new THREE.Vector3(0,0,3.35),tailTip:new THREE.Vector3(0,0,-3.5)};
}

GC.register('beluga',{
  name:'白鯨',en:'Beluga',habitat:'sea',
  blurb:'圓圓的額頭、天生微笑的「海中金絲雀」，脖子可以轉頭點頭。',
  palette:PAL,make:makeBeluga,
});
})();
