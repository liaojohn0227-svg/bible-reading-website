/* Simple circling brain for fish, sharks and rays — no breathing, no tricks, just swim round in a circle.
     GC.fish.settings({speed:2, radius:10, depth:3})   → settings schema with per-species defaults
     GC.fish.brain({beat, beatK, bank, bob})            → brain(rig, api) factory
   The rig needs g and inner; optional animate(phase, speed, t, dt) drives the species' own motion
   (shark tail sweep, manta wing flap, skate disc ripple). Phase advances at beat + beatK·speed rad/s. */
(function(){
const {clamp,wrapAngle}=GC.kit;

function settings(over={}){
  const base=[
    {key:'speed',label:'游速',type:'range',min:.3,max:6,step:.1,value:2,unit:' m/s'},
    {key:'radius',label:'轉圈半徑',type:'range',min:3,max:25,step:.5,value:10,unit:' m'},
    {key:'depth',label:'游動深度',type:'range',min:.5,max:8,step:.1,value:2.5,unit:' m'},
    {key:'dir',label:'轉圈方向',type:'select',value:'ccw',options:[['ccw','逆時針'],['cw','順時針']]},
  ];
  return base.map(s=>{const o=over[s.key];return o==null?{...s}:typeof o==='object'?{...s,...o}:{...s,value:o}});
}

function brain(cfg){
  const C=Object.assign({beat:4,beatK:1,bank:.3,bob:.12},cfg);
  return function(o,api){
    const S=api.settings,pos=o.g.position;
    const st={a:0,R:S.radius,y:-S.depth,v:0,dir:S.dir==='cw'?-1:1,ph:0,yaw:0,bank:0,pitch:0};
    // heading along the circle (dir +1: angle grows = counter-clockwise seen from above)
    const heading=()=>st.dir>=0?Math.atan2(Math.cos(st.a),-Math.sin(st.a)):Math.atan2(-Math.cos(st.a),Math.sin(st.a));
    pos.set(Math.sin(st.a)*st.R,st.y,Math.cos(st.a)*st.R);st.yaw=heading();

    function update(t,dt){
      st.v+=(S.speed-st.v)*Math.min(1,dt*1.2);
      st.R+=(S.radius-st.R)*Math.min(1,dt*.6);
      st.dir+=((S.dir==='cw'?-1:1)-st.dir)*Math.min(1,dt*.8);   // eases through a stop when the direction flips
      const w=st.v/st.R*st.dir;st.a+=w*dt;
      const y0=st.y;st.y+=(-S.depth+Math.sin(t*.5)*C.bob-st.y)*Math.min(1,dt*.8);
      pos.set(Math.sin(st.a)*st.R,st.y,Math.cos(st.a)*st.R);
      st.yaw+=wrapAngle(heading()-st.yaw)*Math.min(1,dt*2.5);
      st.bank+=(clamp(-w*C.bank*4,-.6,.6)-st.bank)*Math.min(1,dt*2);
      st.pitch+=(clamp(-((st.y-y0)/Math.max(dt,1e-4))/Math.max(st.v,.5),-.4,.4)-st.pitch)*Math.min(1,dt*2);
      o.g.rotation.y=st.yaw;o.inner.rotation.x=st.pitch;o.inner.rotation.z=st.bank;
      st.ph+=dt*(C.beat+C.beatK*st.v);
      if(o.animate)o.animate(st.ph,st.v,t,dt);
    }
    return {update,act:()=>false,get status(){return S.dir==='cw'?'順時針繞圈':'逆時針繞圈'},state:st};
  };
}

GC.fish={settings,brain};
})();
