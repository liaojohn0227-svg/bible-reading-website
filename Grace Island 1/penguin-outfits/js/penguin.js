/* Penguin model — copied unchanged from Grace Island index.html (the "penguins" section).
   Needs: THREE, M, LIN, smooth, rnd (js/base.js). */
/* ---------- penguins ---------- */
const SPECIES={
  adelie:{name:'阿德利企鵝',dot:'#3b434c',size:.648,back:'#4c5661',head:'#343b43',belly:'#f3f9f9',shade:'#b9dde3',beak:'#e98a4c',feet:'#e98a4c',bl:.17,br:.05},
  emperor:{name:'皇帝企鵝',dot:'#f0ad3a',size:.92,back:'#5b6a76',head:'#2c3238',belly:'#f2f8f7',shade:'#b9dde3',beak:'#272b32',beakLow:'#e98a4c',feet:'#2e3239',neck:'#f0a932',chest:'#f6dd98',bl:.36,br:.04},
  rockhopper:{name:'跳岩企鵝',dot:'#eacb3c',size:.558,back:'#4b535e',head:'#333941',belly:'#f3f9f9',shade:'#b9dde3',beak:'#d9603c',feet:'#e8a39c',crest:'#efcf3f',bl:.19,br:.056},
  chick:{name:'企鵝寶寶',dot:'#9ea3a1',size:.495,back:'#989d9b',belly:'#f5f8f8',shade:'#b4bab8',cap:'#282c32',beak:'#282c32',feet:'#33373d',chick:true,bl:.11,br:.038},
};
const ADULT=[[0.001,0],[.34,.03],[.5,.18],[.57,.42],[.58,.7],[.54,1.0],[.47,1.3],[.39,1.55],[.32,1.74],[.28,1.88],[.27,2.02],[.255,2.14],[.2,2.26],[.1,2.33],[.001,2.36]].map(([r,y])=>[r>.01?r*.9:r,y]);
const BABY=[[0.001,0],[.5,.05],[.68,.3],[.72,.62],[.66,.92],[.56,1.1],[.53,1.25],[.51,1.45],[.41,1.62],[.23,1.72],[.001,1.75]];
const SEG=10;
const leanOf=(S,y)=>S.chick?0.06*smooth(1.1,1.7,y):0.24*smooth(1.35,2.3,y);
function radiusAt(pts,y){for(let i=1;i<pts.length;i++){if(pts[i][1]>=y){const a=pts[i-1],b=pts[i],t=(y-a[1])/((b[1]-a[1])||1);return a[0]+(b[0]-a[0])*t}}return 0}
function onSurf(S,pts,y,a,out=0){const r=radiusAt(pts,y)+out;return new THREE.Vector3(Math.sin(a)*r,y,Math.cos(a)*r+leanOf(S,y))}
function surfNormal(S,pts,y,a){const d=.03,dr=(radiusAt(pts,y+d)-radiusAt(pts,y-d))/(2*d),dl=(leanOf(S,y+d)-leanOf(S,y-d))/(2*d);
  return new THREE.Vector3(Math.sin(a),-dr-Math.cos(a)*dl,Math.cos(a)).normalize()}
const RSEG=40;
const BODY_MATS={};
function bodyMaterial(S){
  if(BODY_MATS[S.name])return BODY_MATS[S.name];
  const col=v=>new THREE.Color(v||'#000').convertSRGBToLinear();
  const U={uBack:{value:col(S.back)},uBelly:{value:col(S.belly)},uCap:{value:col(S.cap||S.back)},uNeck:{value:col(S.neck)},uChest:{value:col(S.chest)},
    uNeckAmt:{value:S.neck?1:0},uChestAmt:{value:S.chest?1:0},uChick:{value:S.chick?1:0},uHead:{value:col(S.head||S.back)},uShade:{value:col(S.shade||S.belly)}};
  const m=new THREE.MeshStandardMaterial({color:'#ffffff',roughness:1,metalness:0});
  // colour is painted per pixel from the un-deformed body shape, so every boundary is a smooth gradient
  m.onBeforeCompile=sh=>{Object.assign(sh.uniforms,U);
    sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nattribute vec3 aOrig;\nvarying vec3 vOrig;')
      .replace('#include <begin_vertex>','#include <begin_vertex>\nvOrig=aOrig;');
    sh.fragmentShader=sh.fragmentShader.replace('#include <common>',`#include <common>
varying vec3 vOrig;uniform vec3 uBack,uBelly,uCap,uNeck,uChest,uHead,uShade;
float hsh(vec3 p){return fract(sin(dot(p,vec3(12.9898,78.233,37.719)))*43758.5453);}uniform float uNeckAmt,uChestAmt,uChick;
vec3 penguinColor(){
  float y=vOrig.y;float f=vOrig.z/max(length(vOrig.xz),1e-4);vec3 c;
  if(uChick>.5){
    c=mix(uBack,uCap,smoothstep(1.04,1.22,y));
    float face=smoothstep(-.14,.14,f-(0.2+0.6*max(0.,(1.3-y)/.16)))*smoothstep(1.08,1.22,y)*(1.-smoothstep(1.46,1.62,y));
    c=mix(c,uBelly,face);
    c=mix(c,uBelly,.3*smoothstep(.2,.75,f)*(1.-smoothstep(.7,1.1,y)));
    c=mix(c,uShade,.5*(1.-smoothstep(.0,.6,y)));
  }else{
    float w=smoothstep(-.13,.13,f-(-0.3+smoothstep(1.4,1.98,y)))*(1.-smoothstep(1.8,1.94,y));
    c=mix(uBack,uHead,smoothstep(1.6,1.86,y));
    c=mix(c,uNeck,uNeckAmt*smoothstep(1.58,1.76,y)*(1.-smoothstep(1.92,2.04,y))*smoothstep(-.6,-.2,f)*(1.-smoothstep(.5,.9,f)));
    c=mix(c,uBelly,w);
    c=mix(c,uChest,uChestAmt*w*smoothstep(1.3,1.88,y));
    c=mix(c,uShade,w*.9*(1.-smoothstep(.0,1.3,y)));
  }
  return c;
}`).replace('#include <color_fragment>','#include <color_fragment>\ndiffuseColor.rgb=penguinColor();');
  };
  return BODY_MATS[S.name]=m;
}
function makeBody(S){
  const pts=new THREE.SplineCurve((S.chick?BABY:ADULT).map(([r,y])=>new THREE.Vector2(r,y))).getPoints(80).map(v=>[Math.max(v.x,.001),v.y]);
  const np=pts.length,step=Math.PI*2/RSEG;
  const lg=new THREE.LatheGeometry(pts.map(([r,y])=>new THREE.Vector2(r,y)),RSEG,Math.PI-step/2);
  const lp=lg.attributes.position;
  lg.setAttribute('aOrig',new THREE.Float32BufferAttribute(Float32Array.from(lp.array),3));
  for(let i=0;i<lp.count;i++){const x=lp.getX(i),y=lp.getY(i),z=lp.getZ(i),f=z/(Math.hypot(x,z)||1);
    const bulge=S.chick?0:.07*Math.max(0,f)**2*smooth(.2,.6,y)*(1-smooth(.95,1.45,y));
    const fluff=1;
    const flat=1-.06*Math.abs(x)/(.6);
    lp.setX(i,x*flat*fluff);lp.setZ(i,z*fluff+bulge+leanOf(S,y))}
  lg.computeVertexNormals();
  const ln=lg.attributes.normal;
  for(let j=0;j<np;j++){const a=j,b=RSEG*np+j;const x=(ln.getX(a)+ln.getX(b))/2,y=(ln.getY(a)+ln.getY(b))/2,z=(ln.getZ(a)+ln.getZ(b))/2;ln.setXYZ(a,x,y,z);ln.setXYZ(b,x,y,z)}
  return {mesh:new THREE.Mesh(lg,bodyMaterial(S)),pts};
}
const EYE_B=new THREE.MeshBasicMaterial({color:'#000000'});
function addEye(S,pts,inner,y,a){
  const pos=onSurf(S,pts,y,a,.005),n=surfNormal(S,pts,y,a),e=new THREE.Group();
  e.position.copy(pos);e.lookAt(pos.clone().add(n));
  const dot=new THREE.Mesh(new THREE.CircleGeometry(S.chick?.017:.015,24),EYE_B);dot.scale.y=1.9;e.add(dot);
  inner.add(e);return dot;
}
function flipperGeo(len,wid,dark,light){
  const g=new THREE.SphereGeometry(.5,28,20),p=g.attributes.position,cols=[];
  for(let i=0;i<p.count;i++){
    const x=p.getX(i),y=p.getY(i),z=p.getZ(i),t=.5-y;               // t: 0 at shoulder → 1 at tip
    const w=wid*(1-.62*Math.pow(t,1.5))*(.55+.45*smooth(0,.18,t));   // broad paddle tapering to a rounded tip
    p.setXYZ(i,x*.13*(1-.55*t)+.05*t*t,-t*len,z*w*2-.16*t*t*len*.4);
  }
  g.computeVertexNormals();
  const n=g.attributes.normal,c=new THREE.Color();
  for(let i=0;i<p.count;i++){c.copy(dark).lerp(light,smooth(.05,-.45,n.getX(i)));cols.push(c.r,c.g,c.b)}
  g.setAttribute('color',new THREE.Float32BufferAttribute(cols,3));
  return g;
}
function footGeo(){
  const s=new THREE.Shape();
  s.moveTo(0,.07);s.lineTo(-.11,-.04);s.lineTo(-.16,-.2);s.lineTo(-.07,-.14);s.lineTo(0,-.25);s.lineTo(.07,-.14);s.lineTo(.16,-.2);s.lineTo(.11,-.04);s.closePath();
  const g=new THREE.ExtrudeGeometry(s,{depth:.05,bevelEnabled:false});g.rotateX(-Math.PI/2);return g;
}
const FOOT=footGeo();
const BLOB_GEO=new THREE.CircleGeometry(.6,28),BLOB_MAT=(()=>{const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d');
  const gr=x.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,'rgba(70,130,150,.42)');gr.addColorStop(1,'rgba(70,130,150,0)');x.fillStyle=gr;x.fillRect(0,0,64,64);
  return new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(c),transparent:true,depthWrite:false})})();
function buildPenguin(type){
  const S=SPECIES[type],g=new THREE.Group(),inner=new THREE.Group();g.add(inner);
  const {mesh,pts}=makeBody(S);inner.add(mesh);
  const back=M(LIN(S.back),{flatShading:false});
  const eyeY=S.chick?1.42:2.13,ea=S.chick?.42:.72;
  const eyes=[];
  for(const s of[-1,1]){
    const a=s*ea;
    eyes.push(addEye(S,pts,inner,eyeY,a));
    if(S.crest){for(let k=0;k<4;k++){const f=new THREE.Mesh(new THREE.ConeGeometry(.022,.32,8),M(LIN(S.crest),{flatShading:false}));
      f.position.copy(onSurf(S,pts,eyeY+.08,s*(.75+k*.18),.0));f.rotation.order='YXZ';f.rotation.y=s*(.75+k*.18);f.rotation.z=-s*(1.25+k*.1);inner.add(f)}}
  }
  if(S.crest){for(let k=0;k<5;k++){const sp=new THREE.Mesh(new THREE.ConeGeometry(.028,.2,8),back);sp.position.set((k-2)*.05,2.33,-.03+leanOf(S,2.33));sp.rotation.z=(k-2)*.3;inner.add(sp)}}
  // beak: upper + lower mandible, slightly down-curved
  const by=S.chick?1.32:2.05,bz=radiusAt(pts,by)+leanOf(S,by)-.02,bl=S.bl;
  const up=new THREE.Mesh(new THREE.ConeGeometry(S.br,bl,16),M(LIN(S.beak),{flatShading:false}));
  up.scale.x=.8;up.rotation.x=Math.PI/2+.2;up.position.set(0,by+.01,bz+bl*.45);inner.add(up);
  const lo=new THREE.Mesh(new THREE.ConeGeometry(S.br*.8,bl*.8,16),M(LIN(S.beakLow||S.beak),{flatShading:false}));
  lo.scale.x=.8;lo.rotation.x=Math.PI/2+.32;lo.position.set(0,by-.03,bz+bl*.35);inner.add(lo);
  // short stiff tail
  if(!S.chick){const tl=new THREE.Mesh(new THREE.ConeGeometry(.17,.42,14),M(LIN(S.back),{flatShading:false}));tl.scale.x=1.3;tl.rotation.x=-2.15;tl.position.set(0,.2,-radiusAt(pts,.2)-.08);inner.add(tl)}
  // flippers: flat paddles, dark outside / pale underside, pivot at the shoulder
  const flips=[],fy=S.chick?1.02:1.6,fr=radiusAt(pts,fy)*.97;
  const fgeo=S.chick?flipperGeo(.5,.2,LIN(S.back),LIN(S.back))
                    :flipperGeo(1.0,.22,LIN(S.back),LIN(S.belly));
  for(const s of[-1,1]){const piv=new THREE.Group();piv.position.set(s*fr,fy,-.04+leanOf(S,fy));
    const f=new THREE.Mesh(fgeo,M('#fff',{vertexColors:true,flatShading:false}));f.scale.x=s;
    piv.add(f);piv.rotation.z=s*.12;inner.add(piv);flips.push(piv)}
  const feet=[],claw=M('#2a2a30',{flatShading:false});
  for(const s of[-1,1]){const f=new THREE.Mesh(FOOT,M(LIN(S.feet),{flatShading:false}));f.scale.setScalar(S.chick?1.3:1.25);f.position.set(s*.2,0,.2);f.rotation.y=-s*.18;
    inner.add(f);feet.push(f)}
  inner.traverse(o=>{if(o.isMesh)o.castShadow=true});
  const blob=new THREE.Mesh(BLOB_GEO,BLOB_MAT);blob.rotation.x=-Math.PI/2;blob.position.y=.02;blob.scale.setScalar(S.chick?1.6:1.4);g.add(blob);
  g.scale.setScalar(S.size);
  return {g,inner,flips,feet,eyes,blob,type,pose:0,poseT:rnd(2,6),poseKind:0,fl:[.12,.12],flapT:0,waveT:0,blinkT:rnd(1,4)};
}
