/* 鬼蝠魟 Manta ray — model (shared ray template in shared/ray.js)
   Traits: huge swept-back wings, soft-black back with white shoulder patches, white belly with a dark
   trailing margin and a few spots, two curled cephalic "horn" fins beside a wide mouth, thin whip tail. */
(function(){
const {LIN,AM,smooth,toneFin,blackEye}=GC.kit;
const PAL={top:'#2b343c',patch:'#e2e9e7',belly:'#eef3f1',margin:'#5a656c',spot:'#3d474e',mouth:'#1d2429'};

const SPAN=2.2;
const zL=a=>.95-1.12*Math.pow(a,1.25);
const zT=a=>-.95+.8*Math.pow(a,.75);
const body=a=>(.045+.34*(1-smooth(0,.3,a)))*(1-a*a*a);   // clear raised body in the middle, thin wings

function makeManta(scale=1.05){
  const g=new THREE.Group(),inner=new THREE.Group();g.add(inner);
  const cT=LIN(PAL.top),cP=LIN(PAL.patch),cB=LIN(PAL.belly),cM=LIN(PAL.margin),cS=LIN(PAL.spot);
  const ray=GC.rayKit.rayBody({span:SPAN,zL,zT,bot:.55,na:72,nc:48,
    thick:(a,c)=>body(a)*GC.rayKit.rimShape(a,c,.28,.85,.35),
    paintTop:(c,{a,c:cc})=>{
      c.copy(cT);
      // white shoulder patches, one on each side of the head
      c.lerp(cP,.9*smooth(1.15,.7,Math.hypot((a-.33)/.19,(cc-.66)/.2)));
    },
    paintBot:(c,{a,c:cc,x,z})=>{
      c.copy(cB);
      c.lerp(cM,.75*Math.max(smooth(.14,0,cc)*smooth(.1,.4,a),smooth(.82,1,a)));   // dark trailing margin + wing tips
      const v=Math.sin(x*9.1+1.3)*Math.sin(z*8.3+x*2.1);                               // a few belly spots
      c.lerp(cS,.8*smooth(.82,.95,v)*(1-smooth(.12,.3,a))*smooth(.2,.35,cc)*(1-smooth(.55,.7,cc)));
    },
    // big slow flap: tips swing most, leading edge leads the trailing edge a little
    wave:(a,c,s,z,ph)=>.62*Math.pow(a,1.7)*Math.sin(ph-(1-c)*1.1),
  });
  inner.add(ray.mesh);

  // cephalic fins (the "horns"), curled in beside the mouth
  const head=new THREE.Group();inner.add(head);
  for(const s of[-1,1]){const f=toneFin(.11,.14,.46,PAL.top,PAL.margin,.3);
    f.position.set(s*.36,-.02,zL(.36/SPAN)+.09);f.rotation.set(.22,-s*.12,s*.5);head.add(f);ray.follow(f)}
  const mouth=new THREE.Mesh(new THREE.SphereGeometry(.5,24,12),AM(PAL.mouth));mouth.scale.set(.66,.07,.09);mouth.position.set(0,-.02,zL(0)-.015);head.add(mouth);ray.follow(mouth);
  // small eyes on the sides of the head, just behind the horns, half sunk into the bluff head rim
  for(const s of[-1,1]){const x=s*.44,z=zL(.44/SPAN)-.07,p=ray.surfaceXZ(x,z,true),e=blackEye(.027,true);
    e.position.set(x,p.y*.55,z);head.add(e);ray.follow(e)}

  // thin whip tail with a tiny dorsal fin at its base
  const tail=new THREE.Group();tail.position.set(0,.02,-.92);inner.add(tail);
  const tg=new THREE.CylinderGeometry(.004,.035,1.5,8,12);tg.translate(0,-.75,0);tg.rotateX(Math.PI/2);
  tail.add(new THREE.Mesh(tg,AM(PAL.top)));
  const df=toneFin(.03,.16,.22,PAL.top,PAL.top);df.position.set(0,.07,-.02);tail.add(df);

  inner.traverse(m=>{if(m.isMesh)m.castShadow=true});
  g.scale.setScalar(scale);
  return {g,inner,tail,
    animate:(ph)=>{ray.animate(ph);inner.position.y=-Math.sin(ph)*.06;tail.rotation.y=Math.sin(ph*.5)*.18;tail.rotation.x=Math.sin(ph-1)*.08}};
}

GC.register('manta',{
  name:'鬼蝠魟',en:'Manta Ray',habitat:'sea',
  blurb:'張開大翅膀在水中「飛行」，頭前兩片捲起的頭鰭像一對小角。',
  palette:PAL,make:makeManta,
});
})();
