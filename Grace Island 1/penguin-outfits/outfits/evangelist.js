/* 傳福音的人 — a traveller: sage tunic, short ochre travel cloak, a leather satchel on a cross-body strap,
   an open Bible carried in both flippers, and sandals on its feet (Romans 10:15, "how beautiful are the feet"). */
registerOutfit('evangelist',{
  name:'傳福音的人',
  ref:'羅馬書 10:15',verse:'報福音、傳喜信的人，他們的腳蹤何等佳美！',
  about:'鼠尾草綠的旅行長袍和赭黃短披風，斜背皮革書包，雙翼捧著打開的聖經，腳上穿著涼鞋。',
  // hold: flippers stay forward to carry the open Bible (like the gardener carrying its pot)
  pose:{hold:{z:-.14,x:-.62}},
  /* behavior: every 10–20 s (when it is free) it looks for another penguin nearby, walks over and talks to it.
     choose(p,api) is called from the island's chooseNext(); return true when it started something. */
  behavior:{
    every:[10,20],range:12,
    choose(p,api){
      const now=api.now;
      if(p.nextPreach===undefined){p.nextPreach=now+rnd(4,9);return false}
      if(now<p.nextPreach)return false;
      p.nextPreach=now+rnd(...this.every);
      // nearest free penguin within range (not another one already being preached to)
      let best=null,bd=this.range;
      for(const q of api.landList()){if(q===p)continue;const d=q.g.position.distanceTo(p.g.position);if(d<bd){bd=d;best=q}}
      if(!best)return false;
      api.startAct(p,'preach',{partner:best,dur:99,talk:rnd(4,5.5)});
      return true;
    },
  },
  build(model,kit){
    const p=model.inner,{cloth,mesh,box,ball,garment,materials}=kit;
    const tunic=cloth('#7f9d8b'),cloak=cloth('#c99a4e'),leather=cloth('#7a5539'),page=cloth('#fbf4e2'),ribbon=cloth('#b5473f');
    garment(p,.44,1.62,tunic,.066,false,.05);
    // short cloak on the back
    const s=new THREE.Shape();s.moveTo(-.34,1.66);s.lineTo(.34,1.66);s.quadraticCurveTo(.5,1.1,.42,.78);s.lineTo(0,.7);s.lineTo(-.42,.78);s.quadraticCurveTo(-.5,1.1,-.34,1.66);
    mesh(p,new THREE.ExtrudeGeometry(s,{depth:.04,bevelEnabled:true,bevelThickness:.012,bevelSize:.012,bevelSegments:1}),cloak,0,0,-.66);
    for(const side of[-1,1])kit.button(p,side*.24,1.6,.36,materials.gold);
    // cross-body strap from the left shoulder over the chest to a satchel at the right hip
    const pts=[];for(let i=0;i<=18;i++){const t=i/18,y=1.66-t*.98,x=-.3+t*.66;
      const r=radiusAt(ADULT,y)+.088,zz=Math.sqrt(Math.max(0,r*r-x*x))+leanOf(SPECIES.adelie,y);pts.push(new THREE.Vector3(x,y,zz))}
    mesh(p,new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),30,.032,5,false),leather);
    const bag=new THREE.Group();bag.position.set(.5,.62,.25);bag.rotation.y=.75;p.add(bag);
    box(bag,.34,.28,.13,leather,0,0,0);
    const flap=box(bag,.35,.15,.14,cloth('#694630'),0,.08,.01);flap.rotation.x=.08;
    kit.button(bag,0,.02,.08,materials.gold);
    // open Bible carried in front with both flippers: two covers in a shallow V, pages, a red ribbon and a small gold cross
    const book=new THREE.Group();p.add(book);book.position.set(0,.98,.86);book.rotation.set(-.62,0,0);
    for(const side of[-1,1]){
      const half=new THREE.Group();half.rotation.y=-side*.22;book.add(half);
      box(half,.25,.34,.022,leather,side*.13,0,0);
      box(half,.235,.32,.035,page,side*.125,0,.022);
    }
    box(book,.024,.03,.05,leather,0,0,.0);
    box(book,.022,.24,.008,ribbon,.015,-.2,.045);
    kit.cross(book,materials.gold,-.13,.0,-.014,.09);
    // sandals: two leather straps over each foot (the feet are extruded flat shapes, toes toward +z)
    for(const foot of model.feet||[]){
      box(foot,.26,.024,.04,leather,0,.068,.03);
      box(foot,.2,.024,.035,leather,0,.068,.14);
      box(foot,.04,.024,.15,leather,0,.068,.085);
    }
  },
});

/* ---------- the evangelist's talking, as two island activities ---------- */
// preach: walk over to the chosen penguin, then talk — little icons pop up above its head; gives up if the other one wanders off
PENGUIN_ACTS.preach=(p,P,t,dt,api)=>{
  const A=p.act,q=A.partner,pos=p.g.position,hold=EXTRA_OUTFITS.evangelist.pose.hold;
  P.fl=[hold.z,hold.z];P.ftx=hold.x;                                   // keeps carrying the open Bible
  const lost=!q||!q.g.parent||(q.mode==='act'&&q.act&&q.act.partner!==p);
  if(lost||A.t>14){A.dur=0;return}
  if(A.stage!=='talk'){
    const d=api.face(q,5),L=d.length(),stop=p.rad+q.rad+.45;
    if(L>stop){d.normalize();pos.x+=d.x*dt*.75;pos.z+=d.z*dt*.75;P.hop=Math.abs(Math.sin(t*8))*.05;P.rz=Math.sin(t*8)*.09}
    else if(q.mode==='idle'||q.mode==='walk'){A.stage='talk';A.ts=A.t;A.next=0;api.startAct(q,'listen',{partner:p,dur:A.talk+.4})}
    else A.dur=0;
    return;
  }
  const T=A.t-A.ts;
  api.keep(q,p.rad+q.rad+.3,p.rad+q.rad+.6,.6);
  P.rx=.04+Math.max(0,Math.sin(T*3.2))*.07;                             // leaning in a little as it speaks
  P.fl=[hold.z,hold.z+Math.max(0,Math.sin(T*4.5))*.55];                // one flipper gestures, the other keeps the Bible
  if(T>=A.next){A.next=T+rnd(1.2,1.6);const icon=['✝','♥','📖'][Math.floor(Math.random()*3)];api.emote(p.g,icon,icon==='♥'?'#e8798f':'#c58a2e',1.3)}
  if(T>A.talk)A.dur=0;
};
// listen: turn to face the speaker, nod along, and answer with a heart before going back to its own business
PENGUIN_ACTS.listen=(p,P,t,dt,api)=>{
  const A=p.act,q=A.partner;
  if(q&&q.g.parent)api.face(q,4);
  P.rx=A.t>.6?Math.max(0,Math.sin(A.t*4.5))**2*.22:0;
  if(!A.said&&A.t>A.dur*.65){A.said=1;api.emote(p.g,'♥','#e8798f',1.4)}
};
