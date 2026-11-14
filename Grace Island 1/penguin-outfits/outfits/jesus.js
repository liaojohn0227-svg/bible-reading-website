/* 耶穌 — a simple off-white robe, a red mantle draped from the left shoulder across the body (and down the back),
   a cord belt, sandals, and a soft gold halo behind the head. Both flippers are held open and a little forward,
   as if saying "come to me" (Matthew 11:28).
   behavior: every so often it walks over to a nearby penguin and blesses it — one flipper raised over the other's head;
   the other penguin bows its head and answers with a heart. Written as island activities ('bless' / 'blessed'). */
registerOutfit('jesus',{
  name:'耶穌',
  ref:'馬太福音 11:28',verse:'凡勞苦擔重擔的人可以到我這裡來，我就使你們得安息。',
  about:'簡樸的米白長袍、從左肩斜披的紅色披巾、腰間細繩、涼鞋，頭後一圈柔和的金色光環；雙翼微微向前張開。偶爾會走到身邊的企鵝那裡為牠祝福。',
  // hold: flippers open and slightly forward (z = how far out, x = how far forward)
  pose:{hold:{z:.55,x:-.42}},
  behavior:{
    every:[12,22],range:10,
    choose(p,api){
      const now=api.now;
      if(p.nextBless===undefined){p.nextBless=now+rnd(5,10);return false}
      if(now<p.nextBless)return false;
      p.nextBless=now+rnd(...this.every);
      let best=null,bd=this.range;
      for(const q of api.landList()){if(q===p)continue;const d=q.g.position.distanceTo(p.g.position);if(d<bd){bd=d;best=q}}
      if(!best)return false;
      api.startAct(p,'bless',{partner:best,dur:99,hold:rnd(3,4)});
      return true;
    },
  },
  build(model,kit){
    const p=model.inner,{cloth,mesh,box,ball,garment,materials}=kit;
    const robe=cloth('#f5efe2'),red=cloth('#b0413e'),redDeep=cloth('#93302f'),cord=cloth('#c9a66b'),leather=cloth('#7a5539');
    garment(p,.38,1.74,robe,.065,false,.05);
    garment(p,.95,1.0,cord,.098);
    // mantle across the front: a soft roll from the left shoulder, over the chest, to the right hip
    const pts=[];for(let i=0;i<=20;i++){const t=i/20,y=1.7-t*.88,x=-.32+t*.72;
      const r=radiusAt(ADULT,y)+.098,z=Math.sqrt(Math.max(0,r*r-x*x))+leanOf(SPECIES.adelie,y);pts.push(new THREE.Vector3(x,y,z))}
    // a flat band of cloth lying on the robe: wide at the shoulder, narrowing toward the hip
    const curve=new THREE.CatmullRomCurve3(pts),N=48,pos=[],idx=[];
    for(let i=0;i<=N;i++){const t=i/N,c=curve.getPoint(t),tan=curve.getTangent(t),out=new THREE.Vector3(c.x,0,c.z-leanOf(SPECIES.adelie,c.y)).normalize();
      const across=new THREE.Vector3().crossVectors(tan,out).normalize(),w=.13-.05*t;
      pos.push(c.x+across.x*w,c.y+across.y*w,c.z+across.z*w,c.x-across.x*w,c.y-across.y*w,c.z-across.z*w);
      if(i<N){const k=i*2;idx.push(k,k+1,k+2,k+1,k+3,k+2)}}
    const band=new THREE.BufferGeometry();band.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));band.setIndex(idx);band.computeVertexNormals();
    const cloth2=red.clone();cloth2.side=THREE.DoubleSide;cloth2.flatShading=false;mesh(p,band,cloth2);
    // and its fall down the back from the left shoulder
    const s=new THREE.Shape();s.moveTo(-.42,1.72);s.lineTo(-.02,1.72);s.quadraticCurveTo(.12,1.15,.06,.62);s.lineTo(-.2,.56);s.quadraticCurveTo(-.5,1.1,-.42,1.72);
    mesh(p,new THREE.ExtrudeGeometry(s,{depth:.04,bevelEnabled:true,bevelThickness:.012,bevelSize:.012,bevelSegments:1}),redDeep,0,0,-.66);
    ball(p,.11,red,-.3,1.71,.12,1.2,.8,1.6);                              // where the mantle gathers on the shoulder
    // soft gold halo behind the head
    const glow=M(LIN('#f2d48a'),{roughness:.4,metalness:.3,emissive:LIN('#e9c26b'),emissiveIntensity:.35,flatShading:false});
    mesh(p,new THREE.TorusGeometry(.34,.022,10,48),glow,0,2.14,-.1);
    // sandals
    for(const foot of model.feet||[]){
      box(foot,.26,.024,.04,leather,0,.068,.03);
      box(foot,.2,.024,.035,leather,0,.068,.14);
      box(foot,.04,.024,.15,leather,0,.068,.085);
    }
  },
});

/* ---------- blessing, as two island activities ---------- */
// bless: walk over to the chosen penguin, then raise one flipper over its head for a few seconds
PENGUIN_ACTS.bless=(p,P,t,dt,api)=>{
  const A=p.act,q=A.partner,pos=p.g.position,open=EXTRA_OUTFITS.jesus.pose.hold;
  P.fl=[open.z,open.z];P.ftx=open.x;
  const lost=!q||!q.g.parent||(q.mode==='act'&&q.act&&q.act.partner!==p);
  if(lost||A.t>14){A.dur=0;return}
  if(A.stage!=='bless'){
    const d=api.face(q,5),L=d.length(),stop=p.rad+q.rad+.3;
    if(L>stop){d.normalize();pos.x+=d.x*dt*.7;pos.z+=d.z*dt*.7;P.hop=Math.abs(Math.sin(t*8))*.05;P.rz=Math.sin(t*8)*.08}
    else if(q.mode==='idle'||q.mode==='walk'){A.stage='bless';A.ts=A.t;api.startAct(q,'blessed',{partner:p,dur:A.hold+.3});api.emote(p.g,'✝','#c58a2e',1.4)}
    else A.dur=0;
    return;
  }
  const T=A.t-A.ts,up=smooth(0,.6,T)*(1-smooth(A.hold-.5,A.hold,T));
  api.keep(q,p.rad+q.rad+.2,p.rad+q.rad+.45,.5);
  P.fl=[open.z,open.z+1.15*up];P.ftx=open.x-.55*up;                    // one flipper lifts up and over the other's head
  P.rx=.06*up;
  if(T>A.hold)A.dur=0;
};
// blessed: turn to face, bow the head, and answer with a heart
PENGUIN_ACTS.blessed=(p,P,t,dt,api)=>{
  const A=p.act,q=A.partner;
  if(q&&q.g.parent)api.face(q,4);
  P.rx=.28*smooth(.2,.8,A.t)*(1-smooth(A.dur-.5,A.dur,A.t));
  P.eye=A.t>.6&&A.t<A.dur-.4?0:1;
  if(!A.said&&A.t>1.2){A.said=1;api.emote(p.g,'♥','#e8798f',1.6)}
};
