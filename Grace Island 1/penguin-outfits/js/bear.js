/* 北極熊 — smooth, one-piece version of the island bear.
   Same rig as the island's makeBear() so bearBrain() drives it unchanged:
     {g, torso, head, legs}  — torso tilts/sits, head turns & nods, legs swing (pivot at the hip, paw at y ≈ -0.84).
   Body + neck are one lathe; the head is a second lathe whose base sits inside the neck, so it can turn without a seam.
   Eyes are flat black ovals laid on the head surface, built the same way as the penguin eyes (addEye in penguin.js).
   Needs: THREE, M, LIN, smooth (base.js). */
function makeBear(){
  const FUR=LIN('#f5f2e7'),BELLY=LIN('#e9e3d4'),SHADE=LIN('#dcd6c6'),PAD=LIN('#4a4a4f');
  const bump=(z,a,b,c,d)=>smooth(a,b,z)*(1-smooth(c,d,z));
  /* lathe along z with per-vertex paint and sculpting; the seam along the belly is welded so no crease shows */
  function lathe(prof,{sx=1,sy=1,steps=120,radial=72,paint,deform}){
    const pts=new THREE.SplineCurve(prof.map(([z,r])=>new THREE.Vector2(r,z))).getPoints(steps).map(v=>new THREE.Vector2(Math.max(v.x,.001),v.y));
    const g=new THREE.LatheGeometry(pts,radial);g.rotateX(Math.PI/2);
    const p=g.attributes.position,cols=[],c=new THREE.Color(),v=new THREE.Vector3(),ctx={};
    for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),r=Math.hypot(x,y)||1e-4;
      ctx.x=x;ctx.y=y;ctx.z=z;ctx.f=y/r;c.copy(FUR);if(paint)paint(c,ctx);cols.push(c.r,c.g,c.b);
      v.set(x*sx,y*sy,z);if(deform)deform(v,ctx);p.setXYZ(i,v.x,v.y,v.z)}
    g.setAttribute('color',new THREE.Float32BufferAttribute(cols,3));g.computeVertexNormals();
    const n=g.attributes.normal,np=pts.length;
    for(let j=0;j<np;j++){const a=j,b=radial*np+j,nx=n.getX(a)+n.getX(b),ny=n.getY(a)+n.getY(b),nz=n.getZ(a)+n.getZ(b),l=Math.hypot(nx,ny,nz)||1;n.setXYZ(a,nx/l,ny/l,nz/l);n.setXYZ(b,nx/l,ny/l,nz/l)}
    const m=new THREE.Mesh(g,M('#fff',{vertexColors:true,flatShading:false}));m.castShadow=true;return m;
  }
  const belly=(c,{f})=>{c.lerp(BELLY,.55*smooth(-.2,-.8,f));c.lerp(SHADE,.25*smooth(-.75,-1,f))};
  const g=new THREE.Group(),torso=new THREE.Group();g.add(torso);

  // body + neck: rounded rump, deep chest, a soft shoulder hump, neck rising toward the head
  const body=lathe([[-1.27,.02],[-1.18,.3],[-.95,.52],[-.5,.62],[.1,.63],[.6,.6],[.95,.52],[1.2,.43],[1.42,.37],[1.55,.34]],{sx:.86,sy:.92,paint:belly,
    deform:(v,{z,f})=>{
      if(f>0)v.y+=.07*bump(z,.15,.55,.85,1.2)*f;         // shoulder hump
      if(f<0)v.y*=1-.08*bump(z,-.6,-.2,.5,.9);            // tucked belly between the legs
      v.y+=.12*smooth(.9,1.55,z);                          // neck rises to meet the head
    }});
  body.position.y=1.02;torso.add(body);
  const tail=new THREE.Mesh(new THREE.SphereGeometry(.09,16,12),M(FUR,{flatShading:false}));tail.position.set(0,1.12,-1.24);tail.castShadow=true;torso.add(tail);

  // head: skull tapering into a lowered muzzle; its base sits inside the neck
  const head=new THREE.Group();head.position.set(0,1.14,1.42);torso.add(head);
  const HEAD=[[-.3,.3],[-.1,.34],[.12,.35],[.3,.31],[.45,.24],[.58,.19],[.68,.14],[.74,.07],[.76,.01]],SY=.9;
  const headDeform=(v,{z,f})=>{v.y-=.1*smooth(.28,.62,z);if(f>0)v.y*=1-.12*smooth(.3,.6,z)};
  head.add(lathe(HEAD,{sy:SY,steps:90,radial:64,paint:belly,deform:headDeform}));
  const nose=new THREE.Mesh(new THREE.SphereGeometry(.06,16,12),new THREE.MeshBasicMaterial({color:'#000000'}));
  nose.position.set(0,-.09,.75);nose.scale.set(1.25,.8,.8);head.add(nose);
  // ears: half-domes pressed into the skull, with a slightly darker inner ear
  for(const s of[-1,1]){
    const ear=new THREE.Mesh(new THREE.SphereGeometry(.1,16,10,0,Math.PI*2,0,Math.PI*.6),M(FUR,{flatShading:false}));
    ear.position.set(s*.2,.27,.02);ear.rotation.set(-.25,0,-s*.35);ear.scale.set(1,1,.6);ear.castShadow=true;head.add(ear);
    const inner=new THREE.Mesh(new THREE.CircleGeometry(.055,16),M(SHADE,{flatShading:false}));inner.position.set(s*.21,.3,.07);inner.rotation.set(-.25,0,-s*.35);head.add(inner);
  }
  // eyes: flat black ovals on the head surface, facing along the surface normal (like the penguin's addEye)
  const radiusAt=z=>{for(let i=1;i<HEAD.length;i++){const[a,ra]=HEAD[i-1],[b,rb]=HEAD[i];if(z<=b)return ra+(rb-ra)*Math.min(1,Math.max(0,(z-a)/(b-a)))}return 0};
  const surf=(z,ang)=>{const r=radiusAt(z)+.014,x=Math.sin(ang)*r,y0=Math.cos(ang)*r,v=new THREE.Vector3(x,y0*SY,z);headDeform(v,{z,f:Math.cos(ang)});return v};
  for(const s of[-1,1]){
    // outward from the head axis, tipped forward a little because the head tapers toward the muzzle
    // set on the front of the face (bears look forward), facing mostly ahead and a little outward
    const z=.42,ang=s*.62,pos=surf(z,ang),nrm=new THREE.Vector3(Math.sin(ang)*.75,Math.cos(ang)*.35,.85).normalize();
    const eye=new THREE.Group();eye.position.copy(pos);eye.lookAt(pos.clone().add(nrm));head.add(eye);
    const dot=new THREE.Mesh(new THREE.CircleGeometry(.03,24),new THREE.MeshBasicMaterial({color:'#000000'}));dot.scale.y=1.7;eye.add(dot);
  }

  // legs: one tapered lathe each (top tucked inside the body), ending in a rounded paw with a dark pad
  const legGeo=(()=>{const pr=[[.001,.18],[.2,.16],[.25,.02],[.24,-.2],[.21,-.5],[.215,-.7],[.255,-.8],[.26,-.88],[.2,-.93],[.001,-.94]]
    .map(([r,y])=>new THREE.Vector2(r,y));
    const pts=new THREE.SplineCurve(pr).getPoints(48).map(v=>new THREE.Vector2(Math.max(v.x,.001),v.y));
    const geo=new THREE.LatheGeometry(pts,28),p=geo.attributes.position;
    for(let i=0;i<p.count;i++){const y=p.getY(i),z=p.getZ(i);p.setZ(i,z*(1+.28*smooth(-.7,-.86,y))+.07*smooth(-.7,-.86,y))}   // paw reaches forward
    geo.computeVertexNormals();return geo})();
  const legs=[];
  for(const [x,z] of[[.34,.62],[-.34,.62],[.36,-.6],[-.36,-.6]]){
    const lg=new THREE.Group();lg.position.set(x,.9,z);
    const leg=new THREE.Mesh(legGeo,M(FUR,{flatShading:false}));leg.castShadow=true;lg.add(leg);
    const pad=new THREE.Mesh(new THREE.CircleGeometry(.17,20),M(PAD,{flatShading:false}));pad.rotation.x=Math.PI/2;pad.position.set(0,-.935,.07);pad.scale.set(1,1.25,1);lg.add(pad);
    g.add(lg);legs.push(lg);
  }
  g.scale.setScalar(1.5);
  return {g,torso,head,legs};
}
