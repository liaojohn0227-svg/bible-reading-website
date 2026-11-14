/* Shared swimming brain for whales, dolphins and other sea creatures.
   Each species' behavior.js calls:
     GC.swim.settings({speed:2, depth:{value:3,max:7}})  → settings schema with per-species defaults
     GC.swim.brain(cfg)                                  → brain(rig, api) factory
     GC.swim.actions(cfg)                                → action buttons
   The rig needs: g, inner, tail, pecs[], blowhole, head, tailTip (local points on inner);
   optional headPivot (flexible neck, e.g. beluga) and bend(a) (flexible tail stock, see kit.bendable).
   cfg: surf (body-centre y when the back breaks the surface), spyY, breachH, headIdle,
        tricks: ['breach','spyhop','slap','roll', {key, label, status, len, v, y, climb, pose, onStart, onUpdate}]  */
(function(){
const {smooth,rnd,clamp,wrapAngle}=GC.kit;
const G=9.8;

const BASE_SETTINGS=[
  {key:'path',label:'移動路線',type:'select',value:'circle',options:[['circle','環游'],['figure8','8 字巡游'],['wander','自由漫遊'],['manual','手動操控'],['hold','原地漂浮']]},
  {key:'speed',label:'游速',type:'range',min:.5,max:8,step:.1,value:3,unit:' m/s'},
  {key:'radius',label:'活動範圍',type:'range',min:6,max:30,step:1,value:14,unit:' m'},
  {key:'depth',label:'下潛深度',type:'range',min:0,max:5,step:.1,value:2.2,unit:' m'},
  {key:'breathEvery',label:'換氣週期',type:'range',min:4,max:20,step:1,value:9,unit:' 秒'},
  {key:'turnRate',label:'轉向靈活度',type:'range',min:.3,max:2,step:.05,value:.9},
  {key:'autoTricks',label:'自動表演',type:'toggle',value:true},
];
function settings(over={}){
  return BASE_SETTINGS.map(s=>{const o=over[s.key];return o==null?{...s}:typeof o==='object'?{...s,...o}:{...s,value:o}});
}

/* built-in tricks; species can rename them or add their own */
const BUILTIN={
  breach:{label:'躍身',status:'躍身！',ballistic:true},
  spyhop:{label:'探頭',status:'探頭張望',len:6,v:0,y:C=>C.spyY,climb:2.2,
    pose:T=>{const u=smooth(0,1.4,T)*(1-smooth(5,6,T));return{pitch:-1.35*u,look:Math.sin(T*.8)*.45*u,scull:Math.sin(T*2.2)*.3}}},
  slap:{label:'拍尾',status:'拍尾',len:4.2,v:.6,y:C=>C.surf-.35,
    pose:T=>({pitch:.6*smooth(0,1,T)*(1-smooth(3.4,4.2,T)),slap:T>.8&&T<3.6})},
  roll:{label:'翻滾',status:'翻滾',len:3.2,pose:T=>({roll:Math.PI*2*smooth(0,3,T)})},
};
function resolve(list){const out={};
  for(const t of list){const k=typeof t==='string'?t:t.key;out[k]=Object.assign({key:k},BUILTIN[k]||{},typeof t==='string'?{}:t)}
  return out}
function actions(cfg){const tr=resolve(cfg.tricks||[]);return [...Object.values(tr).map(t=>[t.key,t.label]),['spout','噴氣']]}

function brain(cfg){
  const C=Object.assign({surf:-.55,spyY:.9,breachH:4.2,tailBase:.14,tailK:.05,tailMax:.45,pecIdle:.55,headIdle:0},cfg);
  const TR=resolve(C.tricks||[]),AUTO=C.auto||Object.keys(TR);
  return function(o,api){
    const S=api.settings,fx=api.fx,inp=api.input,pos=o.g.position;
    const tmp=new THREE.Vector3(),tgt=new THREE.Vector3();
    const st={yaw:Math.PI,v:0,vy:0,turn:0,bank:0,pitch:0,look:0,tailPh:0,trick:null,T:0,hy:0,hp:0,
      nextTrick:rnd(7,11),wp:null,wpT:0,fig:0,manualY:C.surf,wakeT:0,spoutCD:0,wasLow:false,above:false,slapLast:0,status:'悠游'};
    const ctx={o,fx,st,C,tmp};
    pos.set(S.radius,C.surf,0);

    function spout(){o.inner.localToWorld(tmp.copy(o.blowhole));if(tmp.y>-.4&&st.spoutCD<=0){fx.spout(tmp);st.spoutCD=2.5;return true}return false}

    function steerTarget(dt){
      const R=S.radius;
      if(S.path==='circle'){const a=Math.atan2(pos.x,pos.z)+Math.min(1.1,5/R);return tgt.set(Math.sin(a)*R,0,Math.cos(a)*R)}
      if(S.path==='figure8'){
        const P=(s,out)=>out.set(R*Math.sin(s),0,R*.55*Math.sin(2*s));
        const dP=Math.hypot(R*Math.cos(st.fig),R*1.1*Math.cos(2*st.fig))||1;
        P(st.fig,tmp);const lag=Math.hypot(tmp.x-pos.x,tmp.z-pos.z);
        st.fig+=dt*Math.max(st.v,.8)/dP*(lag<7?1:.3);
        return P(st.fig+5/R,tgt);
      }
      st.wpT-=dt;
      if(!st.wp||st.wpT<0||Math.hypot(st.wp.x-pos.x,st.wp.z-pos.z)<4){
        const a=rnd(0,Math.PI*2),r=Math.sqrt(Math.random())*R;st.wp=new THREE.Vector3(Math.cos(a)*r,0,Math.sin(a)*r);st.wpT=rnd(10,18)}
      return tgt.copy(st.wp);
    }

    function act(k){
      if(k==='spout')return spout();
      const tr=TR[k];if(st.trick||!tr)return false;
      if(tr.ballistic){st.vy=Math.sqrt(2*G*Math.max(1,C.breachH-pos.y));st.above=pos.y>0}
      st.trick=k;st.T=0;if(tr.onStart)tr.onStart(ctx);return true;
    }

    function update(t,dt){
      st.T+=dt;st.spoutCD-=dt;
      let tr=st.trick?TR[st.trick]:null;
      if(tr&&!tr.ballistic&&st.T>tr.len){st.trick=null;tr=null}
      const T=st.T,manual=S.path==='manual',hold=S.path==='hold',ball=tr&&tr.ballistic;

      /* ---- horizontal: speed + heading ---- */
      let vT=hold?0:S.speed,turnT=0;
      if(manual){vT=S.speed*(inp.fwd>0?1.7:inp.fwd<0?.15:1);turnT=-inp.turn*S.turnRate*1.3}
      else if(!hold){steerTarget(dt);const d=wrapAngle(Math.atan2(tgt.x-pos.x,tgt.z-pos.z)-st.yaw);turnT=clamp(d*1.8,-S.turnRate,S.turnRate)}
      if(tr&&tr.v!=null)vT=Math.min(vT,typeof tr.v==='function'?tr.v(C,st):tr.v);
      if(ball)vT=Math.max(vT,4);
      st.v+=(vT-st.v)*Math.min(1,dt*(ball?3:1.1));
      turnT*=clamp(st.v/1.2,.25,1);
      if(ball&&pos.y>0)turnT=0;
      st.turn+=(turnT-st.turn)*Math.min(1,dt*3);
      st.yaw+=st.turn*dt;
      pos.x+=Math.sin(st.yaw)*st.v*dt;pos.z+=Math.cos(st.yaw)*st.v*dt;
      if(manual){const r=Math.hypot(pos.x,pos.z),lim=45;if(r>lim){pos.x*=lim/r;pos.z*=lim/r}}

      /* ---- vertical: breathing cycle, manual depth, tricks ---- */
      let yT;
      if(manual){st.manualY=clamp(st.manualY-inp.dive*dt*1.6,C.surf-(C.manualDepth||5),C.surf);yT=st.manualY}
      else if(hold)yT=C.surf;
      else{const P=S.breathEvery,c=(t%P)/P;yT=C.surf-S.depth*smooth(.3,.45,c)*(1-smooth(.82,.97,c))}
      if(yT>C.surf-.3)yT+=Math.sin(t*1.3)*.12;
      if(tr&&tr.y)yT=tr.y(C,st);
      if(ball){
        st.vy-=G*dt;pos.y+=st.vy*dt;
        if(!st.above&&pos.y>0){st.above=true;fx.splash(pos,40,4.5,2)}
        if(st.above&&pos.y<.2&&st.vy<0){st.above=false;fx.splash(pos,120,7,3.2);o.inner.localToWorld(tmp.copy(o.tailTip));fx.splash(tmp,40,5,2)}
        if(st.vy<0&&pos.y<C.surf-1)st.trick=null;
      }else{
        const vmax=tr&&tr.climb||1.6,vyT=clamp((yT-pos.y)*1.4,-vmax,vmax);
        st.vy+=(vyT-st.vy)*Math.min(1,dt*3);pos.y+=st.vy*dt;
      }
      const low=pos.y<C.surf-.7;
      if(st.wasLow&&!low&&!tr)spout();
      st.wasLow=low;

      /* ---- pose ---- */
      const P=tr&&tr.pose?tr.pose(T,st,o,ctx):{};
      let pitchT=P.pitch!=null?P.pitch:clamp(-Math.atan2(st.vy,Math.max(st.v,1.2))*.9,-1.2,1.2),roll=P.roll||0;
      if(ball){pitchT=-Math.atan2(st.vy,Math.max(st.v,1));roll=1.2*Math.sin(Math.PI*clamp(T/1.9,0,1))}
      st.pitch+=(pitchT-st.pitch)*Math.min(1,dt*(ball?7:2.5));
      st.look+=((P.look||0)-st.look)*Math.min(1,dt*3);
      st.bank+=(-st.turn*.6-st.bank)*Math.min(1,dt*2.5);

      const slapping=!!P.slap;
      st.tailPh+=dt*(1.3+st.v*.75+(slapping?3.5:0));
      const amp=slapping?.95:P.tailAmp!=null?P.tailAmp:ball&&pos.y>0?.08:clamp(C.tailBase+C.tailK*st.v,C.tailBase,C.tailMax);
      const tb=Math.sin(st.tailPh);
      // a bendable body flexes its tail stock (lagging the fluke a little) so the stroke flows through the whole back half
      const bendA=o.bend?Math.sin(st.tailPh-.7)*amp*.6:0;
      if(o.bend)o.bend(bendA);
      o.tail.rotation.x+=(tb*amp*(o.bend?.6:1)+bendA+(slapping?-.25:0)-o.tail.rotation.x)*Math.min(1,dt*12);
      o.g.rotation.y=st.yaw;
      o.inner.rotation.set(st.pitch-Math.cos(st.tailPh)*amp*.07,st.look,st.bank+roll);
      const scull=P.scull||0;
      o.pecs.forEach((p,i)=>{const s=i?1:-1;p.rotation.z=-s*(C.pecIdle+Math.sin(t*1.1)*.08+scull)+st.turn*.25});
      if(o.headPivot){
        const hy=P.headYaw!=null?P.headYaw:Math.sin(t*.45)*C.headIdle+st.turn*C.headIdle*1.5;
        const hp=P.headPitch!=null?P.headPitch:Math.sin(t*.7+1)*C.headIdle*.4;
        st.hy+=(hy-st.hy)*Math.min(1,dt*4);st.hp+=(hp-st.hp)*Math.min(1,dt*4);
        o.headPivot.rotation.set(st.hp,st.hy,0);
      }
      o.g.updateMatrixWorld(true);               // effects below read world positions of this frame's pose
      if(slapping&&tb>.95&&t-st.slapLast>.5){st.slapLast=t;o.inner.localToWorld(tmp.copy(o.tailTip));if(tmp.y>-1)fx.splash(tmp.setY(0),45,5,2)}
      if(tr&&tr.onUpdate)tr.onUpdate(T,dt,ctx);

      st.wakeT-=dt;
      if(Math.abs(pos.y-C.surf)<.45&&st.v>.8&&st.wakeT<0&&!ball){st.wakeT=.06;o.inner.localToWorld(tmp.copy(o.head));tmp.y=0;fx.wake(tmp)}

      if(S.autoTricks&&!manual&&!hold&&!st.trick){st.nextTrick-=dt;if(st.nextTrick<0){st.nextTrick=rnd(10,18);act(AUTO[Math.floor(Math.random()*AUTO.length)])}}

      st.status=st.trick?TR[st.trick].status:hold?'漂浮休息':pos.y<C.surf-.8?'下潛中':manual?'手動操控':'水面悠游';
    }
    return {update,act,get status(){return st.status},state:st};
  };
}

GC.swim={settings,brain,actions,BUILTIN,
  controlsHelp:'W/↑ 加速　S/↓ 減速　A D/← → 轉向　Q 上浮　E 下潛　空白鍵 躍身'};
})();
