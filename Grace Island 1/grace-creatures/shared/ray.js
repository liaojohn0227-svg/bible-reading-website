/* Ray template shared by rays and skates (manta, winter skate, …).
   GC.rayKit.rayBody(opts) builds a flat disc from its outline, as a top + bottom surface grid that meets at the rim:
     span        half wing-span (x at the wing tip)
     zL(a),zT(a) leading / trailing edge z for a = |x|/span (they meet at a = 1, the wing tip)
     thick(a,c)  surface height (c = 0 trailing edge … 1 leading edge); bottom = -thick·bot
     paintTop / paintBot (color,{a,c,s,x,z})
     wave(a,c,s,z,phase) → vertical offset, applied every frame by animate(phase) (wing flap or disc ripple)
   returns {mesh, animate(phase), surfaceXZ(x,z,top)} — surfaceXZ gives the resting surface point for attaching eyes etc. */
(function(){
const {M}=GC.kit;

function rayBody(o){
  const na=o.na||40,nc=o.nc||30,NS=2*na+1,bot=o.bot!=null?o.bot:.55;
  const pos=[],cols=[],meta=[],idx=[],c=new THREE.Color(),ctx={};
  function surface(top){
    const base=pos.length/3;
    for(let ic=0;ic<=nc;ic++){const cc=(1-Math.cos(Math.PI*ic/nc))/2;      // denser near the rims
      for(let is=0;is<NS;is++){const s=-1+is/na,a=Math.abs(s),zl=o.zL(a),zt=o.zT(a),z=zt+(zl-zt)*cc,x=s*o.span;
        const th=o.thick(a,cc),y=top?th:-th*bot;
        pos.push(x,y,z);meta.push(a,cc,s);
        ctx.a=a;ctx.c=cc;ctx.s=s;ctx.x=x;ctx.z=z;c.setRGB(1,1,1);(top?o.paintTop:o.paintBot)(c,ctx);cols.push(c.r,c.g,c.b)}}
    for(let ic=0;ic<nc;ic++)for(let is=0;is<NS-1;is++){const i0=base+ic*NS+is,i1=i0+1,i2=i0+NS,i3=i2+1;
      if(top)idx.push(i0,i2,i1,i1,i2,i3);else idx.push(i0,i1,i2,i1,i3,i2)}
  }
  surface(true);surface(false);
  const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
  g.setAttribute('color',new THREE.Float32BufferAttribute(cols,3));
  g.setIndex(idx);g.computeVertexNormals();
  const mesh=new THREE.Mesh(g,M('#fff',{vertexColors:true,flatShading:false,side:THREE.DoubleSide}));mesh.castShadow=true;
  const base=Float32Array.from(pos),P=g.attributes.position.array,n=pos.length/3;
  const followers=[];
  const coords=(x,z)=>{const a=Math.min(1,Math.abs(x)/o.span),zl=o.zL(a),zt=o.zT(a);return{a,c:Math.min(1,Math.max(0,(z-zt)/((zl-zt)||1e-4))),s:x/o.span}};
  function animate(ph){
    if(!o.wave)return;
    for(let i=0;i<n;i++)P[i*3+1]=base[i*3+1]+o.wave(meta[i*3],meta[i*3+1],meta[i*3+2],base[i*3+2],ph);
    g.attributes.position.needsUpdate=true;g.computeVertexNormals();
    // parts stuck to the disc (eyes, horns, mouth…) ride the same wave, so the surface never cuts through them
    for(const f of followers){
      const dy=o.wave(f.a,f.c,f.s,f.z,ph),e=.03;   // slope across the span → tilt with the wing
      const dyx=o.wave(Math.min(1,f.a+e),f.c,f.s+Math.sign(f.s||1)*e,f.z,ph);
      f.obj.position.y=f.y0+dy;f.obj.rotation.z=f.rz0+Math.atan2(dyx-dy,e*o.span)*Math.sign(f.s||1);
    }
  }
  function surfaceXZ(x,z,top=true){
    const {a,c}=coords(x,z),th=o.thick(a,c);return new THREE.Vector3(x,top?th:-th*bot,z);
  }
  /* follow(obj): keep obj (already positioned in the ray's space) moving with the disc at its x,z */
  function follow(obj){const {a,c,s}=coords(obj.position.x,obj.position.z);
    followers.push({obj,a,c,s,z:obj.position.z,y0:obj.position.y,rz0:obj.rotation.z});return obj}
  return {mesh,animate,surfaceXZ,follow};
}

/* rims are sharp on the wings but bluff at the head: thickness × sin(πc)^p with p rising toward the tips */
function rimShape(a,c,bluff=.3,sharp=.8,headA=.35){
  const p=bluff+(sharp-bluff)*Math.min(1,a/headA);return Math.pow(Math.max(0,Math.sin(Math.PI*c)),p);
}

GC.rayKit={rayBody,rimShape};
})();
