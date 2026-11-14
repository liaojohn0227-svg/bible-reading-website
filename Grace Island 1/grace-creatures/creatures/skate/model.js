/* 冬鰩 Winter skate — model (shared ray template in shared/ray.js)
   Traits: rounded rhombic disc with a pointed snout, sandy-tan back sprinkled with small dark spots and an
   eyespot (dark centre, pale ring) on each wing, white belly, raised eyes on top,
   two small pelvic lobes, thick tail with two little dorsal fins near the tip. */
(function(){
const {LIN,AM,smooth,toneFin,blackEye}=GC.kit;
const PAL={top:'#b39a74',spot:'#7d6648',rim:'#c9b38d',ocel:'#4b3a2a',ring:'#efe3c6',belly:'#f3f2ec',shade:'#dcdcd2'};

const SPAN=.85;
// outline: pointed snout, broad rear, and a round cap at the wing tips (√(1-a⁴) gives a vertical tangent there)
const mid=a=>.08-.06*a,cap=a=>Math.sqrt(Math.max(0,1-a*a*a*a));
const zL=a=>mid(a)+(.7-.62*Math.pow(a,.7))*cap(a);
const zT=a=>mid(a)-(.7-.45*Math.pow(a,1.6))*cap(a);
const body=a=>(.03+.13*(1-smooth(0,.35,a)))*(1-a*a*a);
const EYESPOT={x:.36,z:-.04};

function makeSkate(scale=1.6){
  const g=new THREE.Group(),inner=new THREE.Group();g.add(inner);
  const cT=LIN(PAL.top),cS=LIN(PAL.spot),cR=LIN(PAL.rim),cO=LIN(PAL.ocel),cG=LIN(PAL.ring),cB=LIN(PAL.belly),cSh=LIN(PAL.shade);
  const ray=GC.rayKit.rayBody({span:SPAN,zL,zT,bot:.5,na:72,nc:64,
    thick:(a,c)=>body(a)*GC.rayKit.rimShape(a,c,.35,.85,.4),
    paintTop:(c,{a,x,z})=>{
      c.copy(cT).lerp(cR,.5*smooth(.8,1,a));
      const v=Math.sin(x*23+Math.sin(z*11)*1.3)*Math.sin(z*21+Math.sin(x*9)*1.1);
      c.lerp(cS,.6*smooth(.5,.9,v));
      const d=Math.hypot(Math.abs(x)-EYESPOT.x,z-EYESPOT.z);
      c.lerp(cG,smooth(.105,.075,d));c.lerp(cO,smooth(.068,.045,d));
    },
    paintBot:(c,{a})=>{c.copy(cB).lerp(cSh,.4*(1-smooth(0,.5,a)))},
    // ripple travelling from the snout to the rear along the disc margin
    wave:(a,c,s,z,ph)=>(.05+.07*a)*smooth(.25,1,a)*Math.sin(ph+z*5.5),
  });
  inner.add(ray.mesh);

  // raised eyes on top of the head
  // small raised eyes on top of the head; dome + eye are one group that rides the disc ripple
  for(const s of[-1,1]){const p=ray.surfaceXZ(s*.1,.3,true),eg=new THREE.Group();eg.position.copy(p);
    const dome=new THREE.Mesh(new THREE.SphereGeometry(.034,16,12),AM(PAL.top));dome.scale.set(1,.6,1.25);dome.position.y=-.006;eg.add(dome);
    const e=blackEye(.016);e.position.set(s*.016,.012,.006);eg.add(e);
    inner.add(eg);ray.follow(eg)}

  // pelvic lobes behind the disc
  for(const s of[-1,1]){const f=toneFin(.2,.04,.28,PAL.top,PAL.belly);f.position.set(s*.13,-.005,-.66);f.rotation.y=s*.25;inner.add(f)}

  // thick tapering tail with two small dorsal fins and a tiny tail fin
  const tail=new THREE.Group();tail.position.set(0,.01,-.6);inner.add(tail);
  const tg=new THREE.CylinderGeometry(.018,.06,1.1,10,8);tg.translate(0,-.55,0);tg.rotateX(Math.PI/2);tg.scale(1,.7,1);
  tail.add(new THREE.Mesh(tg,AM(PAL.top)));
  for(const z of[-.78,-.92]){const f=toneFin(.02,.09,.1,PAL.top,PAL.top);f.position.set(0,.03,z);tail.add(f)}
  const cf=toneFin(.02,.07,.1,PAL.top,PAL.top);cf.position.set(0,.01,-1.08);tail.add(cf);

  inner.traverse(m=>{if(m.isMesh)m.castShadow=true});
  g.scale.setScalar(scale);
  return {g,inner,tail,animate:(ph)=>{ray.animate(ph);tail.rotation.y=Math.sin(ph*.6)*.12}};
}

GC.register('skate',{
  name:'冬鰩',en:'Winter Skate',habitat:'sea',
  blurb:'貼著海底滑行的扁平鰩魚，翅膀上各有一枚像眼睛的圓斑。',
  palette:PAL,make:makeSkate,
});
})();
