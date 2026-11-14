/* Grace Island creature kit — shared helpers so every creature matches the island's style.
   Copied from the island's animal code (M / LIN / AM / smooth / black oval eyes / lathe bodies). */
(function(){
const GC=window.GC=window.GC||{};
GC.creatures=GC.creatures||{};
/* each creature file calls GC.register(id,{...}); model.js and behavior.js merge into one entry */
GC.register=(id,part)=>{GC.creatures[id]=Object.assign(GC.creatures[id]||{id},part)};

const M=(c,o={})=>new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:1,metalness:0,flatShading:true},o));
const LIN=c=>new THREE.Color(c).convertSRGBToLinear();
const AM=hex=>M(LIN(hex),{flatShading:false});
const smooth=(a,b,x)=>{const t=Math.min(1,Math.max(0,(x-a)/(b-a)));return t*t*(3-2*t)};
const rnd=(a,b)=>a+Math.random()*(b-a);
const clamp=(x,a,b)=>Math.min(b,Math.max(a,x));
const wrapAngle=a=>Math.atan2(Math.sin(a),Math.cos(a));
const A_EYE=new THREE.MeshBasicMaterial({color:'#000000'});
const GLINT=new THREE.MeshBasicMaterial({color:'#ffffff'});

/* the island's black oval eye, with an optional tiny glint like the polar bear */
function blackEye(r,glint=true){
  const e=new THREE.Mesh(new THREE.SphereGeometry(r,14,12),A_EYE);e.scale.set(.75,1.45,.8);
  if(glint){const g=new THREE.Mesh(new THREE.SphereGeometry(r*.23,8,6),GLINT);g.position.set(0,r*.4,r*.55);e.add(g)}
  return e;
}

/* two-tone ellipsoid fin: dark on top, pale underneath (like the penguin flippers) */
function toneFin(w,h,l,top,bot,split=.15){
  const g=new THREE.SphereGeometry(.5,28,18);g.scale(w,h,l);g.computeVertexNormals();
  const n=g.attributes.normal,ct=LIN(top),cb=LIN(bot),c=new THREE.Color(),cols=[];
  for(let i=0;i<n.count;i++){c.copy(cb).lerp(ct,smooth(-split,split,n.getY(i)));cols.push(c.r,c.g,c.b)}
  g.setAttribute('color',new THREE.Float32BufferAttribute(cols,3));
  const m=new THREE.Mesh(g,M('#fff',{vertexColors:true,flatShading:false}));m.castShadow=true;return m;
}

/* lathe body along z (head toward +z), like the island's tubeBody.
   prof: [[z,radius],...]; paint(color,{x,y,z,f,side}) colours each vertex
   (f = -1 belly … +1 back, side = 0 top/bottom … 1 flank) */
/* deform(v,ctx) may push the vertex v (already scaled by sx/sy) to sculpt ridges, melons, beaks… */
function latheBody(prof,{sx=1,sy=1,steps=220,radial=140,paint,deform}={}){
  const pts=new THREE.SplineCurve(prof.map(([z,r])=>new THREE.Vector2(r,z))).getPoints(steps).map(v=>new THREE.Vector2(Math.max(v.x,.001),v.y));
  const g=new THREE.LatheGeometry(pts,radial);g.rotateX(Math.PI/2);
  const p=g.attributes.position,cols=[],c=new THREE.Color(),ctx={},v=new THREE.Vector3();
  for(let i=0;i<p.count;i++){
    const x=p.getX(i),y=p.getY(i),z=p.getZ(i),r=Math.hypot(x,y)||1e-4;
    ctx.x=x;ctx.y=y;ctx.z=z;ctx.r=r;ctx.f=y/r;ctx.side=Math.abs(x)/r;
    c.setRGB(1,1,1);if(paint)paint(c,ctx);cols.push(c.r,c.g,c.b);
    v.set(x*sx,y*sy,z);if(deform)deform(v,ctx);p.setXYZ(i,v.x,v.y,v.z);
  }
  g.setAttribute('color',new THREE.Float32BufferAttribute(cols,3));g.computeVertexNormals();
  // weld the lathe seam (it runs along the belly) so no crease line shows — same trick as the island penguins
  const n=g.attributes.normal,np=pts.length;
  for(let j=0;j<np;j++){const a=j,b=radial*np+j;
    const nx=n.getX(a)+n.getX(b),ny=n.getY(a)+n.getY(b),nz=n.getZ(a)+n.getZ(b),l=Math.hypot(nx,ny,nz)||1;
    n.setXYZ(a,nx/l,ny/l,nz/l);n.setXYZ(b,nx/l,ny/l,nz/l)}
  const m=new THREE.Mesh(g,M('#fff',{vertexColors:true,flatShading:false}));m.castShadow=true;return m;
}

/* a point on the surface of a lathe body: angle from the top (0 = back, π/2 = flank, π = belly) */
function surfacePoint(prof,z,angle,{sy=1,side=1,out=.006}={}){
  const r=profileR(prof,z)+out;return new THREE.Vector3(side*Math.sin(angle)*r,Math.cos(angle)*r*sy,z);
}

/* lets the tail stock flex: every cross-section behind z0 turns by a·u² (u: 0 at z0 → 1 at zEnd).
   axis 'pitch' bends up/down (whales), 'yaw' bends side to side (sharks, fish).
   returns {bend(a), bendAt(a,z)} — bendAt gives the bent spine point {x,y,z,th} so fins and flukes can follow */
function bendable(mesh,z0,zEnd,axis='pitch'){
  const g=mesh.geometry,p=g.attributes.position,n=g.attributes.normal,bp=Float32Array.from(p.array),bn=Float32Array.from(n.array),L=z0-zEnd;
  const yaw=axis==='yaw',k=yaw?0:1;
  let last=0;
  function bend(a){
    if(Math.abs(a-last)<1e-4)return;last=a;
    const P=p.array,N=n.array;
    for(let i=0;i<p.count;i++){const z=bp[i*3+2];if(z>=z0)continue;
      const u=Math.min(1,(z0-z)/L),th=a*u*u,c=Math.cos(th),s=Math.sin(th),q=bp[i*3+k],zz=z-z0,nq=bn[i*3+k],nz=bn[i*3+2];
      if(yaw){P[i*3]=q*c+zz*s;P[i*3+2]=z0-q*s+zz*c;N[i*3]=nq*c+nz*s;N[i*3+2]=-nq*s+nz*c}
      else{P[i*3+1]=q*c-zz*s;P[i*3+2]=z0+q*s+zz*c;N[i*3+1]=nq*c-nz*s;N[i*3+2]=nq*s+nz*c}}
    p.needsUpdate=true;n.needsUpdate=true;
  }
  const bendAt=(a,z)=>{const u=Math.min(1,Math.max(0,(z0-z)/L)),th=a*u*u,zz=Math.min(0,z-z0);
    return yaw?{x:zz*Math.sin(th),y:0,z:Math.min(z,z0)+zz*(Math.cos(th)-1),th}:{x:0,y:-zz*Math.sin(th),z:Math.min(z,z0)+zz*(Math.cos(th)-1),th}};
  return {bend,bendAt};
}

/* radius of a [[z,r],...] profile at z (linear) — handy for placing bumps on a lathe body */
function profileR(prof,z){for(let i=1;i<prof.length;i++){const[a,ra]=prof[i-1],[b,rb]=prof[i];if(z<=b)return ra+(rb-ra)*Math.min(1,Math.max(0,(z-a)/(b-a)))}return prof[prof.length-1][1]}

GC.kit={profileR,surfacePoint,bendable,M,LIN,AM,smooth,rnd,clamp,wrapAngle,A_EYE,blackEye,toneFin,latheBody};
})();
