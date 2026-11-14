/* Shark template shared by every shark species (blacktip, hammerhead, …).
   GC.sharkKit.makeShark(opts) builds: lathe body (counter-shaded), dorsal ×2, anal, pectoral ×2, pelvic ×2,
   heterocercal caudal fin, gill slits, mouth, eyes, optional hammer head (cephalofoil).
   The tail stock bends side to side; fins behind the bend point ride along with it.
   Returned rig: {g, inner, tail, animate(phase, speed)} — plug into GC.fish.brain. */
(function(){
const {LIN,AM,M,smooth,latheBody,blackEye,bendable,profileR}=GC.kit;

/* flat fin from an outline in "fin plane" coords (x = toward the head, y = away from the body);
   colour(c,x,y) paints each vertex. Result stands upright in the body's y-z plane, thickness along x. */
function finGeo(pts,thick,colour){
  const s=new THREE.Shape();s.moveTo(pts[0][0],pts[0][1]);
  s.splineThru(pts.slice(1).map(([x,y])=>new THREE.Vector2(x,y)));s.lineTo(pts[0][0],pts[0][1]);
  const g=new THREE.ExtrudeGeometry(s,{depth:thick,bevelEnabled:true,bevelThickness:thick*.6,bevelSize:thick*.45,bevelSegments:3,curveSegments:48});
  g.translate(0,0,-thick/2);
  const p=g.attributes.position,cols=[],c=new THREE.Color();
  for(let i=0;i<p.count;i++){colour(c,p.getX(i),p.getY(i));cols.push(c.r,c.g,c.b)}
  g.setAttribute('color',new THREE.Float32BufferAttribute(cols,3));
  g.rotateY(-Math.PI/2);g.computeVertexNormals();return g;
}
const finMat=()=>M('#fff',{vertexColors:true,flatShading:false});

function dorsalPts(h,b,sweep=.22){const ax=-b*sweep;
  return [[b*.5,0],[b*.32,h*.4],[b*.06,h*.82],[ax,h],[ax+b*.05,h*.82],[-b*.3,h*.36],[-b*.64,h*.06],[-b*.42,0]]}
function pecPts(len,ch){return [[ch*.5,0],[ch*.26,len*.45],[-ch*.12,len*.88],[-ch*.36,len],[-ch*.33,len*.8],[-ch*.3,len*.32],[-ch*.5,0]]}
function caudalPts(S){return [[.06,.07],[-.12,.25],[-.38,.55],[-.62,.82],[-.69,.8],[-.5,.45],[-.4,.18],[-.36,.02],[-.42,-.18],[-.5,-.42],[-.42,-.43],[-.2,-.2],[.06,-.06]].map(([x,y])=>[x*S,y*S])}

function cephalofoil(w,ch,t,top,belly){
  const W=w/2,C=ch,s=new THREE.Shape();
  s.moveTo(0,C*.55);
  s.bezierCurveTo(W*.35,C*.62,W*.8,C*.45,W,C*.2);
  s.quadraticCurveTo(W*1.07,-C*.05,W*.92,-C*.3);
  s.bezierCurveTo(W*.6,-C*.36,W*.3,-C*.3,W*.17,-C*.8);
  s.lineTo(-W*.17,-C*.8);
  s.bezierCurveTo(-W*.3,-C*.3,-W*.6,-C*.36,-W*.92,-C*.3);
  s.quadraticCurveTo(-W*1.07,-C*.05,-W,C*.2);
  s.bezierCurveTo(-W*.8,C*.45,-W*.35,C*.62,0,C*.55);
  const g=new THREE.ExtrudeGeometry(s,{depth:t,bevelEnabled:true,bevelThickness:t*.5,bevelSize:t*.55,bevelSegments:4,curveSegments:40});
  g.translate(0,0,-t/2);g.rotateX(Math.PI/2);   // shape y → body z (forward), thickness → body y
  const p=g.attributes.position,cols=[],cT=LIN(top),cB=LIN(belly),c=new THREE.Color();
  for(let i=0;i<p.count;i++){c.copy(cB).lerp(cT,smooth(-t*.25,t*.25,p.getY(i)));cols.push(c.r,c.g,c.b)}
  g.setAttribute('color',new THREE.Float32BufferAttribute(cols,3));g.computeVertexNormals();
  return {geo:g,W,C};
}

function makeShark(o){
  const P=o.prof,sx=o.sx||.82,sy=o.sy||.95,zFront=P[P.length-1][0],tailZ=P[0][0]+.08,z0=o.bendZ0!=null?o.bendZ0:.2;
  const cTop=LIN(o.top),cBel=LIN(o.belly),cTip=LIN(o.tip||o.top),cDark=LIN(o.dark||o.top),hasTip=!!o.tip;
  const g=new THREE.Group(),inner=new THREE.Group();g.add(inner);

  /* body: dark back, white belly, optional pale flank band (blacktip) */
  const body=latheBody(P,{sx,sy,steps:200,radial:110,
    paint:(c,{z,f})=>{
      c.copy(cTop).lerp(cBel,smooth(-.02,-.3,f));
      c.lerp(cDark,.18*smooth(.6,1,f));
      if(o.flankBand)c.lerp(cBel,.55*smooth(-1.15,-.6,z)*(1-smooth(-.15,.25,z))*smooth(.12,-.02,f)*smooth(-.38,-.18,f));
    },
    deform:(v,{z})=>{if(v.y<0)v.y*=.82;v.y-=.035*smooth(zFront-.5,zFront,z)}});
  inner.add(body);
  const flex=bendable(body,z0,tailZ,'yaw');
  const topY=z=>profileR(P,z)*sy,sideX=z=>profileR(P,z)*sx;

  /* fins: tip colour by height (dorsal/pec) or by distance from the root (caudal) */
  const tipBy=(f0)=>(c,x,y)=>{c.copy(cTop);if(hasTip)c.lerp(cTip,smooth(f0-.04,f0+.04,y))};
  const att=[];   // fins that ride on the bending tail stock
  function place(mesh,z,y){if(z<z0){const w=new THREE.Group();w.add(mesh);mesh.position.set(mesh.position.x,0,0);inner.add(w);att.push({w,z,y});w.position.set(0,y,z)}else{mesh.position.y=y;mesh.position.z=z;inner.add(mesh)}}

  const D=o.dorsal;
  place(new THREE.Mesh(finGeo(dorsalPts(D.h,D.base,D.sweep),.045,tipBy(D.h*.78)),finMat()),D.z,topY(D.z)-.03);
  if(o.dorsal2){const d=o.dorsal2;place(new THREE.Mesh(finGeo(dorsalPts(d.h,d.base),.03,tipBy(d.h*.7)),finMat()),d.z,topY(d.z)-.015)}
  if(o.anal){const d=o.anal,m=new THREE.Mesh(finGeo(dorsalPts(d.h,d.base),.03,tipBy(d.h*.7)),finMat());m.rotation.z=Math.PI;place(m,d.z,-topY(d.z)*.82+.015)}
  for(const [F,droop,dy,inset] of [[o.pec,.42,.45,.72],[o.pelvic,.75,.72,.5]]){if(!F)continue;
    for(const s of[-1,1]){const m=new THREE.Mesh(finGeo(pecPts(F.len,F.chord),.035,tipBy(F.len*.8)),finMat());
      m.rotation.set(0,s*(F.sweep||.35),-s*(Math.PI/2+droop));m.position.x=s*sideX(F.z)*inset;place(m,F.z,-topY(F.z)*dy)}}

  const tail=new THREE.Group();tail.position.set(0,0,tailZ);inner.add(tail);
  const cs=o.caudal,tipR=.55*cs;
  tail.add(new THREE.Mesh(finGeo(caudalPts(cs),.04,(c,x,y)=>{c.copy(cTop);if(hasTip)c.lerp(cTip,smooth(tipR-.05,tipR+.05,Math.hypot(x,y)))}),finMat()));

  /* face */
  const dark=AM(o.slit||'#5d6766');
  if(o.hammer){
    const H=o.hammer,cf=cephalofoil(H.w,H.chord,H.t,o.top,o.belly),head=new THREE.Mesh(cf.geo,finMat());
    head.position.set(0,H.y||0,H.z);head.castShadow=true;inner.add(head);
    // eyes sit right on the rounded tips of the hammer, just outside the bevel
    for(const s of[-1,1]){const e=blackEye(.05);e.position.set(s*(cf.W+H.t*.55+.008),(H.y||0)+.005,H.z-cf.C*.02);inner.add(e)}
    const mz=H.z-cf.C*.55,mm=new THREE.Mesh(new THREE.TorusGeometry(.14,.012,6,24,Math.PI),dark);mm.geometry.rotateX(Math.PI/2);mm.position.set(0,-topY(mz)*.82-(H.y?0:.005),mz-.1);inner.add(mm);
  }else{
    const E=o.eye;for(const s of[-1,1]){const e=blackEye(E.r);const r=profileR(P,E.z);
      e.position.set(s*(Math.sin(E.angle)*r*sx+.012),Math.cos(E.angle)*r*sy,E.z);inner.add(e)}
    const mz=o.mouthZ!=null?o.mouthZ:zFront-.38,mm=new THREE.Mesh(new THREE.TorusGeometry(.15,.012,6,24,Math.PI),dark);
    mm.geometry.rotateX(Math.PI/2);mm.position.set(0,-topY(mz)*.82+.01,mz-.1);inner.add(mm);
  }
  // five gill slits on each side
  const G=o.gills;for(const s of[-1,1])for(let k=0;k<5;k++){const z=G[0]+(G[1]-G[0])*k/4,r=profileR(P,z),a=1.72;
    const sl=new THREE.Mesh(new THREE.BoxGeometry(.012,.14-k*.01,.022),dark);sl.position.set(s*(Math.sin(a)*r*sx+.002),Math.cos(a)*r*sy*.9,z);sl.rotation.z=s*.12;inner.add(sl)}

  inner.traverse(m=>{if(m.isMesh)m.castShadow=true});
  g.scale.setScalar(o.scale||1);

  function bend(a){flex.bend(a);
    const p=flex.bendAt(a,tailZ);tail.position.set(p.x,0,p.z);
    for(const f of att){const q=flex.bendAt(a,f.z);f.w.position.set(q.x,f.y,q.z);f.w.rotation.y=q.th}}
  const amp=o.amp||.22;
  return {g,inner,tail,
    animate:(ph,v)=>{const k=amp*(.65+.35*Math.min(1,v/2.5)),a=Math.sin(ph)*k;bend(a);
      tail.rotation.y=a+Math.sin(ph-.7)*k*.7;inner.rotation.y=-a*.12}};
}

GC.sharkKit={makeShark,finGeo};
})();
