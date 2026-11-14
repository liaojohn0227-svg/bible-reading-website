/* 虎鯨 Orca — model (looks only; movement lives in behavior.js) */
(function(){
const {LIN,AM,smooth,toneFin,latheBody,blackEye,bendable}=GC.kit;

/* soft charcoal instead of pure black so it sits with the island's pastels */
const PAL={black:'#2c3943',white:'#eef6f5',saddle:'#94a5ad',shade:'#c9dde0',flipperUnder:'#3a4954',blowhole:'#1f2830'};

function orcaPaint(){
  const cB=LIN(PAL.black),cW=LIN(PAL.white),cS=LIN(PAL.saddle),cSh=LIN(PAL.shade);
  return (c,{z,f,side})=>{
    // belly line: white chin + throat, narrows under the flippers, flares up into the flank patch near the tail
    const line=-.42+.32*smooth(3.0,3.9,z)
      -.16*smooth(.4,1.2,z)*(1-smooth(2.2,3.0,z))
      +.58*smooth(-.6,-1.6,z)*(1-smooth(-2.9,-3.7,z));
    let w=smooth(line+.08,line-.08,f);
    // eye patch: tilted oval above and behind the eye
    const ez=(z-2.4)/.7,ev=(f-.32-(z-2.4)*.12)/.2;
    w=Math.max(w,smooth(1.12,.82,Math.hypot(ez,ev))*smooth(.25,.5,side));
    c.copy(cB).lerp(cW,w);
    // grey saddle behind the dorsal fin
    const sad=smooth(1.1,.7,Math.hypot((z+1.55)/.75,(f-1)/.32));
    c.lerp(cS,sad*(1-w));
    // cool shade on the very underside, like the penguins' belly shade
    c.lerp(cSh,.45*smooth(-.75,-1,f)*w);
  };
}

/* tall, rounded dorsal fin: extruded curved shape with a soft bevel */
function dorsalFin(h,base,mat){
  const s=new THREE.Shape();
  s.moveTo(-base*.55,0);
  s.bezierCurveTo(-base*.38,h*.45,base*.02,h*.85,base*.16,h);
  s.quadraticCurveTo(base*.24,h*1.02,base*.25,h*.9);
  s.bezierCurveTo(base*.2,h*.55,base*.3,h*.25,base*.55,0);
  s.lineTo(-base*.55,0);
  const g=new THREE.ExtrudeGeometry(s,{depth:.08,bevelEnabled:true,bevelThickness:.06,bevelSize:.05,bevelSegments:5,curveSegments:24});
  g.translate(0,0,-.04);g.rotateY(Math.PI/2);   // shape +x → body -z, so the tip leans toward the tail
  g.computeVertexNormals();
  const m=new THREE.Mesh(g,mat);m.castShadow=true;return m;
}

/* returns the rig the behavior drives:
   g (world position + heading), inner (pitch/roll), tail (fluke beat), pecs (flippers), blowhole (local point on inner) */
function makeOrca(scale=.9){
  const g=new THREE.Group(),inner=new THREE.Group();g.add(inner);
  const dark=AM(PAL.black);
  const body=latheBody([[-4.1,.05],[-3.6,.28],[-2.7,.66],[-1.4,1.12],[0,1.38],[1.4,1.38],[2.6,1.16],[3.35,.82],[3.8,.44],[4.0,.12],[4.03,.01]],{sy:.9,paint:orcaPaint()});
  inner.add(body);
  const flex=bendable(body,-1.3,-3.95);
  const tail=new THREE.Group();tail.position.set(0,0,-3.95);inner.add(tail);
  for(const s of[-1,1]){const l=toneFin(1.55,.13,.72,PAL.black,PAL.white);l.position.set(s*.68,0,-.3);l.rotation.y=s*.55;tail.add(l)}
  const pecs=[];for(const s of[-1,1]){const pv=new THREE.Group();pv.position.set(s*1.05,-.72,1.55);
    const f=toneFin(1.35,.14,.78,PAL.black,PAL.flipperUnder,.4);f.position.x=s*.62;f.rotation.y=-s*.45;pv.add(f);pv.rotation.z=-s*.55;inner.add(pv);pecs.push(pv)}
  const dor=dorsalFin(1.55,1.25,dark);dor.position.set(0,1.12,-.55);dor.rotation.x=.04;inner.add(dor);
  for(const s of[-1,1]){const e=blackEye(.07);e.position.set(s*.98,-.08,2.95);if(s<0)e.children[0].position.x*=-1;inner.add(e)}
  const bh=new THREE.Mesh(new THREE.SphereGeometry(.07,12,8),AM(PAL.blowhole));bh.scale.set(1.3,.3,.6);bh.position.set(0,1.18,1.9);inner.add(bh);
  g.scale.setScalar(scale);
  const bend=a=>{flex.bend(a);const p=flex.bendAt(a,-3.95);tail.position.set(0,p.y,p.z)};
  return {g,inner,tail,pecs,bend,blowhole:new THREE.Vector3(0,1.3,1.9),head:new THREE.Vector3(0,0,3.9),tailTip:new THREE.Vector3(0,0,-4.6)};
}

GC.register('orca',{
  name:'虎鯨',en:'Orca',habitat:'sea',
  blurb:'黑白分明的海洋朋友，高高的背鰭和眼後白斑是牠的招牌。',
  palette:PAL,make:makeOrca,
});
})();
