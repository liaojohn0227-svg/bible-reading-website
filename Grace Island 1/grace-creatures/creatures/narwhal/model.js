/* 獨角鯨 Narwhal — model (looks only; movement lives in behavior.js)
   Traits: mottled grey back fading into a white belly, darker blunt head, long left-hand spiral tusk
   from the upper-left jaw, low dorsal ridge, small upturned flippers, broad flukes. */
(function(){
const {LIN,AM,M,smooth,toneFin,latheBody,blackEye,profileR,surfacePoint,bendable}=GC.kit;

const PAL={back:'#55646d',head:'#414e57',belly:'#e9efed',mottle:'#8e9ba1',shade:'#c9dde0',tusk:'#efe6cf',tuskGroove:'#cbbd9c',ridge:'#4d5b64'};
const TAIL_Z=-2.6;
const PROF=[[-2.65,.04],[-2.25,.2],[-1.5,.5],[-.4,.8],[.7,.86],[1.5,.76],[2.0,.58],[2.3,.36],[2.45,.14],[2.5,.01]];

function narwhalPaint(){
  const cBk=LIN(PAL.back),cH=LIN(PAL.head),cBe=LIN(PAL.belly),cM=LIN(PAL.mottle),cSh=LIN(PAL.shade);
  return (c,{x,y,z,f})=>{
    const ang=Math.atan2(x,y);
    const w=smooth(-.05,-.5,f);                                  // 0 back … 1 belly, wide soft band
    c.copy(cBk).lerp(cBe,w);
    c.lerp(cH,.65*smooth(1.2,2.2,z)*(1-w));                       // darker head
    // mottling: blotchy spots, pale on the dark back, dark on the pale flanks, none on the deep belly
    // domain-warped sines → irregular blotches instead of an even polka-dot grid
    const wz=z+.35*Math.sin(ang*3.7+z*1.9),wa=ang+.4*Math.sin(z*2.6+ang*1.3);
    const v=Math.sin(wz*7.3+wa*3.1)*Math.sin(wa*6.1-wz*4.7)+.6*Math.sin(wz*12.7+wa*9.4+2.3)*Math.sin(wa*13.3-wz*8.9);
    const spot=smooth(.3,.9,v);
    c.lerp(cM,.45*spot*(1-w)*(1-smooth(1.6,2.2,z)));
    c.lerp(cBk,.6*spot*w*(1-smooth(-.45,-.8,f)));
    c.lerp(cSh,.35*smooth(-.75,-1,f));
  };
}

/* spiral tusk: tapered cylinder with left-hand helical grooves, base at origin pointing +z */
function tuskGeo(len=2.6,r0=.055,r1=.012){
  const g=new THREE.CylinderGeometry(r1,r0,len,16,90,false);
  const p=g.attributes.position,cols=[],cA=LIN(PAL.tusk),cG=LIN(PAL.tuskGroove),c=new THREE.Color();
  for(let i=0;i<p.count;i++){
    const x=p.getX(i),y=p.getY(i),z=p.getZ(i),h=(y+len/2)/len,a=Math.atan2(z,x);
    const groove=Math.sin(a*2+h*Math.PI*2*9);                    // ~9 turns along the tusk
    const k=1+.13*groove*(1-h*.6);
    p.setXYZ(i,x*k,y,z*k);
    c.copy(cG).lerp(cA,smooth(-.6,.6,groove));c.lerp(cA,.5*smooth(.7,1,h));cols.push(c.r,c.g,c.b);
  }
  g.setAttribute('color',new THREE.Float32BufferAttribute(cols,3));
  g.translate(0,len/2,0);g.rotateX(Math.PI/2);g.computeVertexNormals();
  return g;
}

function makeNarwhal(scale=.9){
  const g=new THREE.Group(),inner=new THREE.Group();g.add(inner);
  const sy=.92;
  // low dorsal ridge sculpted into the back
  const body=latheBody(PROF,{sy,steps:260,radial:170,paint:narwhalPaint(),
    deform:(v,{z,f})=>{v.y+=.05*smooth(.9,.995,f)*smooth(-1.75,-1.35,z)*(1-smooth(-.3,.1,z))}});
  inner.add(body);
  const flex=bendable(body,-.5,TAIL_Z);

  // tusk erupts from the upper-left jaw (animal's left = +x when facing +z)
  const tusk=new THREE.Mesh(tuskGeo(),M('#fff',{vertexColors:true,flatShading:false}));
  tusk.position.set(.09,-.02,2.36);tusk.rotation.set(-.07,.05,0);tusk.castShadow=true;inner.add(tusk);
  // eyes sit low on the head, in the paler band, so they read against the skin
  for(const s of[-1,1]){const e=blackEye(.058);e.position.copy(surfacePoint(PROF,1.95,1.95,{sy,side:s,out:.025}));inner.add(e)}
  const bh=new THREE.Mesh(new THREE.SphereGeometry(.06,12,8),AM('#2f3a41'));bh.scale.set(1.4,.3,.6);bh.position.set(0,profileR(PROF,1.55)*sy-.005,1.55);inner.add(bh);

  // small flippers with upturned tips
  const pecs=[];for(const s of[-1,1]){const pv=new THREE.Group();pv.position.set(s*.72,-.45,1.3);
    const f=toneFin(.72,.09,.38,PAL.back,PAL.mottle,.35);f.position.x=s*.33;f.rotation.y=-s*.35;f.rotation.z=s*.18;pv.add(f);pv.rotation.z=-s*.5;inner.add(pv);pecs.push(pv)}

  // broad flukes, less swept back (narwhal flukes look "backwards" with a convex trailing edge)
  const tail=new THREE.Group();tail.position.set(0,0,TAIL_Z);inner.add(tail);
  for(const s of[-1,1]){const l=toneFin(1.25,.1,.62,PAL.back,PAL.belly);l.position.set(s*.55,0,-.22);l.rotation.y=s*.32;tail.add(l)}

  inner.traverse(m=>{if(m.isMesh)m.castShadow=true});
  g.scale.setScalar(scale);
  const bend=a=>{flex.bend(a);const p=flex.bendAt(a,TAIL_Z);tail.position.set(0,p.y,p.z)};
  return {g,inner,tail,pecs,tusk,bend,blowhole:new THREE.Vector3(0,.85,1.55),head:new THREE.Vector3(0,0,2.6),tailTip:new THREE.Vector3(0,0,-3.25)};
}

GC.register('narwhal',{
  name:'獨角鯨',en:'Narwhal',habitat:'sea',
  blurb:'頭上長著一根螺旋長牙的「海中獨角獸」，喜歡深潛，也常翻身仰泳。',
  palette:PAL,make:makeNarwhal,
});
})();
