/* 小魟寶寶 — a cute, chubby ray (replaces the winter skate), coloured like the island's sea animals.
   Back: the island's soft grey-blue (same family as its whale and dolphin) with a few faint pale spots. Belly: soft white.
   Eyes: a pair of small round black dots on the upper front edges of the head.
   On the belly, the "face" real rays have: two little nostril dots, a gentle smile, and two rows of gill slits.
   Rounded head and wing tips, a plump body, and a short tail with a little fin.
   makeRayBaby(scale) → {g, inner, animate(phase)}; animate flaps the wings (tips move most, a wave runs front to back).
   The disc is a top + bottom surface grid meeting at the rim (same technique as the island's gratitude rays);
   face parts ride the wing wave so the surface never cuts through them. Needs THREE, M, LIN, smooth (base.js). */
function makeRayBaby(scale=1){
  const BLUE=LIN('#6f8fa6'),RIM=LIN('#5b7d95'),SPOT=LIN('#c9dbe4'),BELLY=LIN('#eef4f5'),BELLY_EDGE=LIN('#d6e5ea');
  const SPAN=.92,na=72,nc=64,NS=2*na+1;
  // outline: a big rounded head, wings sweeping back to ROUNDED tips (√(1-a⁴) closes them with a soft curve)
  const cap=a=>Math.sqrt(Math.max(0,1-a*a*a*a)),mid=a=>-.03-.3*Math.pow(a,1.3);
  const zL=a=>mid(a)+(.6-.48*a)*cap(a)+.13*(1-smooth(0,.36,a));
  const zT=a=>mid(a)-(.55-.42*Math.pow(a,.8))*cap(a);
  // plump: a thick rounded body in the middle, thinning out to the wings
  const thick=(a,c)=>(.04+.2*(1-smooth(0,.34,a)))*(1-a*a*a)*Math.pow(Math.max(0,Math.sin(Math.PI*c)),.3+.5*Math.min(1,a/.3));
  const wave=(a,c,s,z,ph)=>.26*Math.pow(a,1.6)*Math.sin(ph-(1-c)*1.1);
  // white spots on the back: fixed, evenly scattered (golden-angle spiral), smaller toward the wing tips
  const spots=[];for(let i=0;i<24;i++){const r=Math.sqrt((i+.5)/24),ang=i*2.39996,x=Math.cos(ang)*r*.95,z=Math.sin(ang)*r*.48-.05;
    const a=Math.abs(x)/SPAN;if(a>.9)continue;if(z>zL(a)-.05||z<zT(a)+.05)continue;if(Math.abs(x)<.12&&z>.15)continue;spots.push([x,z,.03*(1-.45*a)+.01*((i*7)%3)])}
  const pos=[],cols=[],meta=[],idx=[],c=new THREE.Color();
  function surface(top){
    const base=pos.length/3;
    for(let ic=0;ic<=nc;ic++){const cc=(1-Math.cos(Math.PI*ic/nc))/2;
      for(let is=0;is<NS;is++){const s=-1+is/na,a=Math.abs(s),zl=zL(a),zt=zT(a),z=zt+(zl-zt)*cc,x=s*SPAN,th=thick(a,cc);
        pos.push(x,top?th:-th*.55,z);meta.push(a,cc,s);
        if(top){c.copy(BLUE).lerp(RIM,smooth(.7,1,a)*.7+smooth(.12,0,cc)*.25+smooth(.9,1,cc)*.2*a);
          let sp=0;for(const [sx,sz,sr] of spots)sp=Math.max(sp,1-smooth(sr*.55,sr*1.05,Math.hypot(x-sx,z-sz)));c.lerp(SPOT,.7*sp)}
        else c.copy(BELLY).lerp(BELLY_EDGE,smooth(.65,1,a));
        cols.push(c.r,c.g,c.b)}}
    for(let ic=0;ic<nc;ic++)for(let is=0;is<NS-1;is++){const i0=base+ic*NS+is,i1=i0+1,i2=i0+NS,i3=i2+1;
      if(top)idx.push(i0,i2,i1,i1,i2,i3);else idx.push(i0,i1,i2,i1,i3,i2)}
  }
  surface(true);surface(false);
  const geo=new THREE.BufferGeometry();
  geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setAttribute('color',new THREE.Float32BufferAttribute(cols,3));
  geo.setIndex(idx);geo.computeVertexNormals();
  const disc=new THREE.Mesh(geo,M('#fff',{vertexColors:true,flatShading:false,side:THREE.DoubleSide}));disc.castShadow=true;

  const g=new THREE.Group(),inner=new THREE.Group();g.add(inner);inner.add(disc);
  const base=Float32Array.from(pos),P=geo.attributes.position.array,n=pos.length/3,followers=[];
  const coords=(x,z)=>{const a=Math.min(1,Math.abs(x)/SPAN),zl=zL(a),zt=zT(a);return{a,c:Math.min(1,Math.max(0,(z-zt)/((zl-zt)||1e-4))),s:x/SPAN}};
  const surfY=(x,z,top)=>{const {a,c}=coords(x,z),th=thick(a,c);return top?th:-th*.55};
  const follow=obj=>{const {a,c,s}=coords(obj.position.x,obj.position.z);followers.push({obj,a,c,s,z:obj.position.z,y0:obj.position.y});return obj};

  // belly face (seen from below): nostrils, a gentle smile, gill slits — all small dark marks just under the surface
  const mark=M(LIN('#3b4b5c'),{flatShading:false}),gill=M(LIN('#8a9db0'),{flatShading:false});
  const under=(obj,x,z,lift=.004)=>{obj.position.set(x,surfY(x,z,false)-lift,z);inner.add(obj);follow(obj);return obj};
  for(const s of[-1,1]){const d=new THREE.Mesh(new THREE.SphereGeometry(.018,12,8),mark);d.scale.set(1,.35,1.3);under(d,s*.075,.5)}
  // smile: a flat arc whose middle dips toward the tail and whose corners turn up toward the head
  {const sg=new THREE.TorusGeometry(.085,.008,6,24,Math.PI*.8);sg.rotateZ(Math.PI*.1);sg.rotateX(-Math.PI/2);
   const smile=new THREE.Mesh(sg,mark);under(smile,0,.47,.002)}
  for(const s of[-1,1])for(let k=0;k<5;k++){
    const x=s*(.13+k*.012),z=.32-k*.05,slit=new THREE.Mesh(new THREE.BoxGeometry(.04,.004,.007),gill);
    slit.rotation.y=s*(.25+k*.05);under(slit,x,z)}
  // eyes: a pair of small round black dots on the upper front edges of the head, sitting fully on top of the
  // surface (a little sphere whose centre is lifted by its own radius) so the wing wave never cuts into them
  const eyeMat=new THREE.MeshBasicMaterial({color:'#000000'}),R_EYE=.017;
  for(const sd of[-1,1]){const x=sd*.17,z=.47;
    const e=new THREE.Mesh(new THREE.SphereGeometry(R_EYE,16,12),eyeMat);e.position.set(x,surfY(x,z,true)+R_EYE*.85,z);
    inner.add(e);follow(e)}
  // long thin tail with a little fin
  const tail=new THREE.Group();tail.position.set(0,0,-.55);inner.add(tail);
  const tg=new THREE.CylinderGeometry(.006,.032,.72,10,10);tg.translate(0,-.36,0);tg.rotateX(Math.PI/2);
  const tc=new THREE.Mesh(tg,M(BLUE,{flatShading:false}));tc.castShadow=true;tail.add(tc);
  const fin=new THREE.Mesh(new THREE.SphereGeometry(.5,14,10),M(BLUE,{flatShading:false}));fin.scale.set(.02,.07,.12);fin.position.set(0,.04,-.08);tail.add(fin);

  g.scale.setScalar(scale);
  return {g,inner,tail,animate(ph){
    for(let i=0;i<n;i++)P[i*3+1]=base[i*3+1]+wave(meta[i*3],meta[i*3+1],meta[i*3+2],base[i*3+2],ph);
    geo.attributes.position.needsUpdate=true;geo.computeVertexNormals();
    for(const f of followers)f.obj.position.y=f.y0+wave(f.a,f.c,f.s,f.z,ph);
    inner.position.y=-Math.sin(ph)*.03;tail.rotation.y=Math.sin(ph*.5)*.2;tail.rotation.x=Math.sin(ph-1)*.08;
  }};
}
