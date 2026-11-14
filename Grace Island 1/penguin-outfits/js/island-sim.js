/* Island penguin life, copied from Grace Island index.html so the preview runs penguins exactly like the island does:
   addPenguin(), the activity system (landList … runAct) and the per-frame penguin step from tick().
   The three changes the island needs are marked [NEW]:
     1. chooseNext(): an outfit's behavior.choose() gets the first chance to start an activity
     2. runAct(): a default case runs activities registered in PENGUIN_ACTS (preach, listen)
     3. penguin step: outfits with pose.hold keep their flippers forward
   The island's terrain and obstacles are replaced by a flat round stage (H, obstacles, landPoint below). */
let worldTime=0;
const penguins=[],obstacles=[];
const SIM_RADIUS=3.6;
// land height: the island treats anything under 0.2 as sea and nudges penguins back, so the stage stands at 0.21
const SIM_LAND=.21;
function H(x,z){return Math.hypot(x,z)<SIM_RADIUS+.8?SIM_LAND:0}
function freeAt(){return true}
function landPoint(r=.6){for(let k=0;k<60;k++){const a=rnd(0,Math.PI*2),d=Math.sqrt(Math.random())*SIM_RADIUS,x=Math.cos(a)*d,z=Math.sin(a)*d;
  if(penguins.every(q=>Math.hypot(q.g.position.x-x,q.g.position.z-z)>q.rad+r))return new THREE.Vector3(x,0,z)}return new THREE.Vector3(0,0,0)}
function angLerp(a,b,t){let d=((b-a+Math.PI)%(Math.PI*2)+Math.PI*2)%(Math.PI*2)-Math.PI;return a+d*t}
function addPenguin(type,start){
  const p=buildPenguin(type);
  p.ph=rnd(0,10);p.vy=0;p.jy=0;p.rad=(type==='chick'?.78:.66)*SPECIES[type].size;p.stuck=0;
  p.mode='idle';p.timer=start?3.2:rnd(0,2);
  p.g.position.copy(start||landPoint(p.rad));p.target=landPoint(p.rad);
  p.g.position.y=H(p.g.position.x,p.g.position.z);
  p.g.rotation.y=start?.65:rnd(0,6);
  scene.add(p.g);penguins.push(p);return p;
}
/* ---------- penguin activities ---------- */
function landList(){return penguins.filter(q=>q.mode==='idle'||q.mode==='walk')}
function nearPenguin(p,maxD){let best=null,bd=maxD;landList().forEach(q=>{if(q===p)return;const d=q.g.position.distanceTo(p.g.position);if(d<bd){bd=d;best=q}});return best}
function startAct(p,kind,o={}){p.mode='act';p.act=Object.assign({kind,t:0,dur:2},o);const A=p.act;
  if(kind==='dance'){A.dur=o.dur||rnd(5,7);A.em=0;emote(p.g,'♪','#e07a3f',1.5)}
  else if(kind==='quarrel')A.dur=o.dur||rnd(3.5,5);
  else if(kind==='fall'){A.dur=rnd(2.4,3.2);A.lie=A.dur-.8}
  else if(kind==='slide'){A.dur=99;A.target=landPoint(p.rad)}
  else if(kind==='bow')A.dur=o.dur||3.3;
  else if(kind==='sleep')A.dur=rnd(5,8);
  else if(kind==='shake'){A.dur=1.1;if(p.jy===0){p.jy=.01;p.vy=2.5}}
}
function endAct(p){const A=p.act;p.act=null;p.mode='idle';p.timer=rnd(.8,2.5);
  if(A.kind==='quarrel'){if(A.loser){startAct(p,'fall');return}
    if(A.win){p.flapT=1.4;emote(p.g,'耶!','#e07a3f',1.3)}p.mode='walk';p.target=landPoint(p.rad);p.stuck=0}}
function chooseNext(p){
  // [NEW] an outfit with its own behavior (e.g. the evangelist) may start something first
  const beh=typeof EXTRA_OUTFITS!=='undefined'&&EXTRA_OUTFITS[p.outfit]?.behavior;
  if(beh&&beh.choose(p,{now:worldTime,landList,startAct,emote}))return;
  const r=Math.random();
  if(r<.4){p.mode='walk';p.target=landPoint(p.rad);p.stuck=0;return}
  if(r<.5){startAct(p,'dance');const dur=p.act.dur;landList().forEach(q=>{if(q!==p&&q.g.position.distanceTo(p.g.position)<3.5&&Math.random()<.6)startAct(q,'dance',{dur})});return}
  if(r<.61){const q=nearPenguin(p,4);if(q){const dur=rnd(3.5,5),l=Math.random()<.5;startAct(p,'quarrel',{partner:q,side:0,dur,win:l});startAct(q,'quarrel',{partner:p,side:1,dur,loser:l});emote(p.g,'嘎!','#d9534f',1.4);return}}
  if(r<.71){const q=nearPenguin(p,3.2);if(q&&p.type!=='chick'&&q.type!=='chick'){startAct(p,'bow',{partner:q});startAct(q,'bow',{partner:p});emote(p.g,'♥','#e8798f',2.2);emote(q.g,'♥','#e8798f',2.2);return}startAct(p,'bow');return}
  if(r<.78){startAct(p,'slide');return}
  if(r<.85){startAct(p,'sleep');return}
  if(r<.92){startAct(p,'shake');return}
  if(r<.96){p.waveT=rnd(1.8,2.6);p.waveSide=Math.random()<.5?0:1}else p.flapT=rnd(.8,1.4);
  p.timer=rnd(1.5,3);
}
function runAct(p,P,t,dt){const A=p.act,g=p.g,pos=g.position;A.t+=dt;const T=A.t;
  const face=(q,k=6)=>{const d=q.g.position.clone().sub(pos);d.y=0;g.rotation.y=angLerp(g.rotation.y,Math.atan2(d.x,d.z),Math.min(1,dt*k));return d};
  const keep=(q,lo,hi,sp=.8)=>{const d=face(q),L=d.length();if(L<1e-3)return;d.normalize();if(L>hi){pos.x+=d.x*dt*sp;pos.z+=d.z*dt*sp}else if(L<lo){pos.x-=d.x*dt*sp;pos.z-=d.z*dt*sp}};
  const lie=th=>{P.rx=th;const s=Math.sin(Math.min(th,1.5));P.lift=s*.5;P.lz=-s*.95};
  switch(A.kind){
    case 'dance':{const s=Math.sin(t*6.3);P.rz=s*.2;P.hop=Math.abs(s)*.09;P.fl=[1.25+s*.85,1.25-s*.85];P.ftx=-.25;P.rx=-.05;
      if(Math.sin(t*1.3)>.8)g.rotation.y+=dt*8;
      if(T-A.em>2){A.em=T;emote(g,(Math.round(T/2)%2)?'♫':'♪','#e07a3f',1.5)}break}
    case 'quarrel':{const q=A.partner;if(q)keep(q,p.rad+q.rad+.35,p.rad+q.rad+.6,1.1);
      const pk=Math.max(0,Math.sin(t*10+A.side*Math.PI));P.rx=.18+.26*pk;P.hop=Math.max(0,Math.sin(t*5.5+A.side*2))**6*.14;
      P.fl=[.95+Math.sin(t*22)*.5,.95+Math.sin(t*22+1)*.5];P.ftx=-.2;P.rz=Math.sin(t*3+A.side)*.05;
      if(A.side===1&&!A.said&&T>.8){A.said=1;emote(g,'嘎嘎!','#d9534f',1.3)}
      if(A.side===0&&!A.said&&T>2.1){A.said=1;emote(g,'哼!','#d9534f',1.2)}break}
    case 'fall':{const tr=.32;let th;
      if(T<tr){th=1.48*(T/tr)**2;pos.x+=Math.sin(g.rotation.y)*dt*1.1;pos.z+=Math.cos(g.rotation.y)*dt*1.1}
      else if(T<A.lie){const k=T-tr;th=1.48+Math.sin(k*22)*Math.exp(-k*7)*.1;P.feetX=Math.sin(T*16)*.6;P.fl=[1.1+Math.sin(T*16)*.35,1.1+Math.sin(T*16+2)*.35];P.eye=0;
        if(!A.said){A.said=1;emote(g,'哎呀','#5b8fd6',1.5)}}
      else{const u=Math.min(1,(T-A.lie)/(A.dur-A.lie));th=1.48*(1-smooth(0,1,u));P.fl=[.6,.6];if(u>.75&&!A.up){A.up=1;p.jy=.01;p.vy=2.4}}
      lie(th);break}
    case 'slide':{const tr=.35;let th=1.48;
      if(!A.go){th=1.48*smooth(0,tr,T);if(T>=tr){A.go=1;A.gt=T;p.stuck=0;emote(g,'咻~','#3f9fb5',1.2)}}
      if(A.go===1){const d=A.target.clone().sub(pos);d.y=0;const L=d.length();g.rotation.y=angLerp(g.rotation.y,Math.atan2(d.x,d.z),Math.min(1,dt*3));
        const sp=2.3*Math.min(1,(T-A.gt)*2);pos.x+=Math.sin(g.rotation.y)*sp*dt;pos.z+=Math.cos(g.rotation.y)*sp*dt;P.feetX=Math.sin(T*18)*.7;
        if(L<.5||T-A.gt>3.5||p.stuck>.8){A.go=2;A.rt=T}}
      if(A.go===2){const u=(T-A.rt)/.55;th=1.48*(1-smooth(0,1,u));if(u>=1)A.dur=0}
      lie(th);P.fl=[.35,.35];break}
    case 'bow':{const q=A.partner;if(q&&q.act&&q.act.partner===p)keep(q,1.9,2.3,.7);
      const b=Math.max(0,Math.sin(T*Math.PI/1.1))**1.4;P.rx=.72*b;P.fl=[.2+b*.5,.2+b*.5];P.ftx=.2*b;P.feetX=-.45*b;break}
    case 'sleep':{P.eye=0;P.rx=.1+Math.sin(T*.9)*.03;P.rz=Math.sin(T*.6)*.04;P.br=2.5;if(A.zz===undefined||T-A.zz>2.4){A.zz=T;emote(g,'Zz','#6f8fb5',2)}break}
    case 'shake':{const a=1-T/A.dur,s=Math.sin(T*40);P.rz=s*.15*a;P.ry=Math.sin(T*40+1)*.35*a;P.fl=[.7+s*.35*a,.7-s*.35*a];break}
    // [NEW] activities added by outfits (PENGUIN_ACTS), e.g. 'preach' and 'listen'
    default:{const act=typeof PENGUIN_ACTS!=='undefined'&&PENGUIN_ACTS[A.kind];if(act)act(p,P,t,dt,{face,keep,emote,startAct,endAct,landList})}
  }
  if(A.t>=A.dur)endAct(p);
}
/* one frame of island penguin life (the penguins part of the island's tick) */
function islandPenguinStep(t,dt){
  penguins.forEach(p=>{
    const g=p.g,ph=t*8+p.ph;
    const pos=g.position;let moving=false;const P={rx:0,rz:0,ry:0,lift:0,lz:0,hop:0,fl:null,ftx:0,eye:1,feetX:0,br:1};
    if(p.mode==='idle'){p.timer-=dt;if(p.timer<=0)chooseNext(p)}
    if(p.mode==='walk'){const d=p.target.clone().sub(pos);d.y=0;const L=d.length();
      if(L<.2){p.mode='idle';p.timer=rnd(1,3.5)}
      else{moving=true;d.normalize();const sp=(p.type==='chick'?.8:.65)*dt;pos.x+=d.x*sp;pos.z+=d.z*sp;g.rotation.y=angLerp(g.rotation.y,Math.atan2(d.x,d.z),dt*4);
        if(p.jy===0&&Math.random()<dt*.012){startAct(p,'fall');moving=false}}}
    if(p.mode==='act')runAct(p,P,t,dt);
    if(p.jy>0){p.vy-=18*dt;p.jy+=p.vy*dt;if(p.jy<=0){p.jy=0;p.vy=0}}
    p.hopY=P.hop+(moving?Math.abs(Math.sin(ph))*.05:0);
    pos.y=H(pos.x,pos.z)+p.jy+p.hopY;
    if(p.mode!=='act'){
      p.poseT-=dt;if(p.poseT<0){p.poseKind=moving?0:Math.floor(rnd(1,4));p.poseT=p.poseKind?rnd(1.2,2.2):rnd(3,7)}
      const pk=moving?0:p.poseKind;p.pose+=((pk?1:0)-p.pose)*Math.min(1,dt*5);
      const tilt=pk===1?.16*Math.sign(Math.sin(p.ph*7)||1):0,bow=pk===2?.32:pk===3?-.14:0;
      P.rz=(moving?Math.sin(ph)*.09:Math.sin(t*1.1+p.ph)*.02)+tilt*p.pose;
      P.rx=(moving?.06:0)+bow*p.pose;P.ry=moving?0:Math.sin(t*.6+p.ph)*.45;
    }
    p.inner.rotation.set(P.rx,P.ry,P.rz);p.inner.position.set(0,P.lift,P.lz);
    p.blob.visible=true;p.blob.position.y=.02-p.jy/p.g.scale.y;p.blob.scale.setScalar((p.type==='chick'?1.6:1.4)*(1-Math.min(.6,p.jy*.4))*(P.lift>.2?1.25:1));
    p.feet[0].position.z=.22+(moving?Math.sin(ph)*.1:0);p.feet[1].position.z=.22-(moving?Math.sin(ph)*.1:0);p.feet.forEach(f=>f.rotation.x=P.feetX);
    p.flapT-=dt;p.waveT-=dt;
    for(let i=0;i<2;i++){
      let tg=.12+Math.sin(t*1.7+p.ph+i)*.03,tx=0;
      if(moving){tg=.42+Math.sin(ph+i*Math.PI)*.08;tx=-.1}
      if(p.flapT>0||p.jy>0){tg=.75+Math.sin(t*24+i*.3)*.6;tx=-.15}
      if(p.waveT>0&&i===p.waveSide){tg=2.25+Math.sin(t*11)*.38;tx=-.35}
      if(P.fl){tg=P.fl[i];tx=P.ftx}
      if(p.outfit==='gardener'){tg=-.16;tx=-.65}
      // [NEW] outfits that carry something (e.g. the evangelist's Bible) keep their flippers forward
      {const hold=typeof EXTRA_OUTFITS!=='undefined'&&EXTRA_OUTFITS[p.outfit]?.pose?.hold;if(hold&&!P.fl){tg=hold.z;tx=hold.x}}
      p.fl[i]+=(tg-p.fl[i])*Math.min(1,dt*16);
      p.flips[i].rotation.z=(i?1:-1)*p.fl[i];p.flips[i].rotation.x+=(tx-p.flips[i].rotation.x)*Math.min(1,dt*8);p.flips[i].rotation.y=0;
    }
    p.blinkT-=dt;const bl=p.blinkT<0?(p.blinkT<-.13?(p.blinkT=rnd(2,5),1):.12):1;
    p.eyes.forEach(e=>e.scale.y=1.9*(P.eye?bl:.1));
    p.inner.scale.y=1+Math.sin(t*1.8/P.br+p.ph)*.012*P.br;
  });
  // keep penguins from overlapping each other and the scenery
  const land=penguins;
  for(let it=0;it<2;it++){
    for(let i=0;i<land.length;i++){const a=land[i].g.position;
      for(let j=i+1;j<land.length;j++){const b=land[j].g.position,dx=b.x-a.x,dz=b.z-a.z,d=Math.hypot(dx,dz)||1e-4,m=land[i].rad+land[j].rad;
        if(d<m){const push=(m-d)/2,nx=dx/d,nz=dz/d;a.x-=nx*push;a.z-=nz*push;b.x+=nx*push;b.z+=nz*push;land[i].stuck+=dt;land[j].stuck+=dt}}
      for(const o of obstacles){const dx=a.x-o.x,dz=a.z-o.z,d=Math.hypot(dx,dz)||1e-4,m=o.r+land[i].rad;
        if(d<m){a.x+=dx/d*(m-d);a.z+=dz/d*(m-d);land[i].stuck+=dt}}
      if(H(a.x,a.z)<.2){const k=.98;a.x*=k;a.z*=k}
    }
  }
  land.forEach(p=>{const a=p.g.position;a.y=H(a.x,a.z)+p.jy+(p.hopY||0);if(p.mode==='walk'&&p.stuck>1.2){p.target=landPoint(p.rad);p.stuck=0}p.stuck=Math.max(0,p.stuck-dt*.3)});
}
