/* Copied unchanged from Grace Island index.html: emote bubbles, the original makeBear(), and bearBrain().
   Needs: THREE, M, LIN, smooth, rnd (base.js) and a splash() function (index.html supplies a no-op). */
const EMO_TEX={},emotes=[];
function emoTex(txt,col){const key=txt+col;if(EMO_TEX[key])return EMO_TEX[key];
  const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d');
  x.fillStyle='rgba(30,70,80,.16)';x.beginPath();x.arc(64,67,50,0,7);x.fill();
  x.fillStyle='#ffffff';x.beginPath();x.arc(64,62,50,0,7);x.fill();x.beginPath();x.moveTo(52,104);x.lineTo(60,122);x.lineTo(74,103);x.fill();
  x.fillStyle=col;x.font=`700 ${txt.length>2?32:txt.length>1?42:58}px "Fredoka","Noto Sans TC","PingFang TC",sans-serif`;x.textAlign='center';x.textBaseline='middle';x.fillText(txt,64,64);
  const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;return EMO_TEX[key]=t}
function emote(holder,txt,col,dur=1.6,h=2.8,sc=.75){let s=holder.userData.emo;
  if(!s){s=new THREE.Sprite(new THREE.SpriteMaterial({transparent:true,depthWrite:false}));holder.add(s);holder.userData.emo=s;emotes.push(s)}
  s.material.map=emoTex(txt,col);s.material.needsUpdate=true;const k=sc/holder.scale.x;s.scale.set(k,k,k);s.userData.e={life:dur,dur,h};s.position.set(0,h,0);s.visible=true}


// the ORIGINAL island bear, kept for side-by-side comparison (the new one is makeBear in bear.js)
function makeBearOriginal(){
  const g=new THREE.Group(),fur=AM('#f5f2e7'),part=(geo,x,y,z,sx=1,sy=1,sz=1,par=g)=>{const m=new THREE.Mesh(geo,fur);m.position.set(x,y,z);m.scale.set(sx,sy,sz);m.castShadow=true;par.add(m);return m};
  const S=(r)=>new THREE.SphereGeometry(r,24,18);
  const torso=new THREE.Group();g.add(torso);
  part(S(.62),0,1.02,0,1,.95,1.75,torso);part(S(.56),0,1.14,.58,1,1,1,torso);part(S(.6),0,1.0,-.62,1,.98,1,torso);
  part(S(.4),0,1.12,1.05,.95,.9,1.25,torso);part(S(.09),0,1.02,-1.2,1,1,1,torso);
  const head=new THREE.Group();head.position.set(0,1.1,1.42);torso.add(head);
  part(S(.33),0,0,.16,1,.9,1.08,head);part(S(.2),0,-.09,.5,.85,.68,1.1,head);
  const nose=new THREE.Mesh(S(.06),A_EYE);nose.position.set(0,-.06,.71);nose.scale.set(1.2,.8,.8);head.add(nose);
  for(const side of [-1,1]){
    part(S(.085),side*.22,.25,.06,1,1,.6,head);
    const eye=new THREE.Mesh(S(.049),A_EYE);
    eye.position.set(side*.225,.112,.395);eye.scale.set(1,1.12,.86);head.add(eye);
    const glint=new THREE.Mesh(S(.014),new THREE.MeshBasicMaterial({color:0xffffff}));
    glint.position.set(side*.011,.015,.035);eye.add(glint);
  }
  const legs=[];for(const [x,z] of[[.34,.62],[-.34,.62],[.36,-.6],[-.36,-.6]]){const lg=new THREE.Group();lg.position.set(x,.9,z);
    part(new THREE.CylinderGeometry(.22,.24,.9,14),0,-.42,0,1,1,1,lg);part(S(.27),0,-.84,.07,1,.42,1.25,lg);g.add(lg);legs.push(lg)}
  g.scale.setScalar(1.5);return {g,torso,head,legs};
}

function bearBrain(f,b,phase,index){
  const st={k:'walk',t:0,d:rnd(6,9)};let ang=phase,wph=phase;
  const radius=index%2 ? 2.15 : 1.45;
  return (t,dt)=>{st.t+=dt;
    if(st.t>st.d){const r=Math.random();st.k=st.k!=='walk'?'walk':(r<.3?'sniff':r<.6?'sit':r<.8?'shake':'stand');st.t=0;
      st.d={walk:rnd(6,10),sniff:rnd(3.5,5),sit:rnd(5,7),shake:1.8,stand:rnd(3,4)}[st.k];
      if(st.k==='sniff')emote(b.g,'?','#5d7f96',1.6,2.5,.8);if(st.k==='shake')emote(b.g,'抖抖','#5d7f96',1.6,2.5,.8);if(st.k==='sit')emote(b.g,'呼~','#5d7f96',2,2.6,.8)}
    const T=st.t,walking=st.k==='walk';if(walking){ang+=dt*.11;wph+=dt*1.7}
    b.g.position.set(Math.cos(ang)*radius,.4,Math.sin(ang)*radius);b.g.rotation.y=Math.atan2(-Math.sin(ang),Math.cos(ang));
    let tx=0,tz=0,ty=0,hx=.12+Math.sin(t*.4)*.1,hy=Math.sin(t*.4)*.45,legX=[0,0,0,0],seat=0;
    if(walking){legX=legX.map((_,i)=>Math.sin(wph+((i===0||i===3)?0:Math.PI))*.26);ty=Math.abs(Math.sin(wph))*.03;tz=Math.sin(wph)*.02}
    if(st.k==='sniff'){hx=.55+Math.sin(T*9)*.05;hy=Math.sin(T*1.3)*.5;tx=.06}
    if(st.k==='sit'){
      seat=smooth(0,.8,T)*(1-smooth(st.d-.8,st.d,T));
      tx=-.34*seat;ty=-.27*seat;hx=.1-.18*seat+Math.sin(T*.8)*.07;
      legX[2]=legX[3]=-.96*seat;
    }
    if(st.k==='shake'){const a=Math.sin(T*28)*(1-T/st.d);tz=a*.14;hy=-a*.5;if(T<dt*1.5)splash(f.position.x+b.g.position.x,1.5,f.position.z+b.g.position.z,10,2,1.5)}
    if(st.k==='stand'){hy=Math.sin(T*.9)*.8;hx=-.12}
    const k=Math.min(1,dt*8);
    b.torso.rotation.x+=(tx-b.torso.rotation.x)*k;b.torso.rotation.z=st.k==='shake'?tz:b.torso.rotation.z+(tz-b.torso.rotation.z)*k;b.torso.position.y=ty;
    b.head.rotation.x+=(hx-b.head.rotation.x)*k;b.head.rotation.y+=(hy-b.head.rotation.y)*k;
    b.legs.forEach((leg,i)=>{
      const front=i<2;
      const side=i%2===0?1:-1;
      const anchor=leg.userData.anchor||(leg.userData.anchor=new THREE.Vector3());
      anchor.set(side*(front?.34:.36),.9,front?.62:-.6).applyEuler(b.torso.rotation).add(b.torso.position);
      if(!front){anchor.y=Math.max(.38,anchor.y-.16*seat);anchor.z+=.16*seat}
      leg.position.lerp(anchor,k);
      leg.rotation.x+=(legX[i]-leg.rotation.x)*Math.min(1,dt*12);
      leg.scale.y+=(Math.max(.65,leg.position.y/.9)-leg.scale.y)*k;
    });
  };
}

/* the island's per-frame emote update (from its animals loop) */
function updateEmotes(dt){
  emotes.forEach(s=>{if(!s.visible)return;const u=s.userData.e;u.life-=dt;const a=u.dur-u.life;s.position.y=u.h+Math.min(1,a*4)*.18+Math.sin(a*5)*.04;s.material.opacity=Math.max(0,Math.min(1,a*6,u.life*3));if(u.life<=0)s.visible=false});
}
