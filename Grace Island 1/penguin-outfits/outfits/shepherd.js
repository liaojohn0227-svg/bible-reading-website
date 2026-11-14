/* 好牧人 — sand-coloured tunic with a rope belt, a striped head cloth held by a dark band,
   a shepherd's crook in one flipper, and a little lamb that follows the shepherd around (John 10:4, 10:11).
   companion(): builds the lamb; the game loop keeps it trotting a step behind and lets it graze when the shepherd rests. */
registerOutfit('shepherd',{
  name:'好牧人',
  ref:'約翰福音 10:11',verse:'我是好牧人，好牧人為羊捨命。',
  about:'沙色長袍配麻繩腰帶，頭上是條紋頭巾和深色頭箍，一手拿牧羊杖，身後有一隻小羊跟著走。',
  companion:makeLamb,
  build(model,kit){
    const p=model.inner,{cloth,mesh,ball,rod,garment}=kit;
    const tunic=cloth('#c4a57d'),rope=cloth('#8a6a48'),scarf=cloth('#efe6d2'),stripe=cloth('#9a5b45'),band=cloth('#2f3437');
    const wool=cloth('#f7f3ea'),face=cloth('#4a4240'),wood=cloth('#7b5a3e');
    garment(p,.42,1.66,tunic,.066,false,.06);
    garment(p,.9,.97,rope,.085);
    // head cloth: a shell open at the face, falling a little lower at the back, with two stripes and a head band
    const shell=(r,y0,len,mat)=>{const m=mesh(p,new THREE.SphereGeometry(r,28,16,Math.PI/2+1.1,Math.PI*2-2.2,y0,len),mat,0,2.07,.15);m.material=mat.clone();m.material.side=THREE.DoubleSide;m.scale.set(1.08,1.06,1.12);return m};
    // closed crown + open shell, so the face opening stops at the forehead
    {const cap=mesh(p,new THREE.SphereGeometry(.31,28,8,0,Math.PI*2,0,Math.PI*.3),scarf,0,2.07,.15);cap.material=scarf.clone();cap.material.side=THREE.DoubleSide;cap.scale.set(1.08,1.06,1.12)}
    shell(.31,Math.PI*.3,Math.PI*.44,scarf);
    shell(.314,Math.PI*.55,Math.PI*.03,stripe);shell(.314,Math.PI*.62,Math.PI*.03,stripe);
    const agal=mesh(p,new THREE.TorusGeometry(.29,.026,8,30),band,0,2.24,.16);agal.rotation.x=Math.PI/2;
    // crook held in the right flipper, standing roughly upright
    const crook=new THREE.Group();model.flips[1].add(crook);crook.position.set(.12,-.62,.16);crook.rotation.z=-.1;
    rod(crook,[0,-1.0,0],[0,1.05,0],.032,wood);
    const hook=mesh(crook,new THREE.TorusGeometry(.13,.032,8,20,Math.PI*1.25),wood,-.13,1.05,0);hook.rotation.z=-Math.PI*.05;
  },
});

/* the lamb that follows the shepherd — a fluffy "cloud" lamb: a round fleece cloud with a small dark face
   peeking out at the front, a fleecy top knot, floppy ears, and only short little feet showing under the fleece.
   animate(t,dt,moving): scurries (feet patter, cloud bobs) while moving; otherwise stands and now and then grazes */
function makeLamb(){
  const wool=M(LIN('#f8f5ee'),{flatShading:false}),woolShade=M(LIN('#ebe6da'),{flatShading:false});
  const face=M(LIN('#5a504d'),{flatShading:false}),hoof=M(LIN('#4a4240'),{flatShading:false}),ear=M(LIN('#6a5f5b'),{flatShading:false});
  const g=new THREE.Group(),body=new THREE.Group();g.add(body);body.position.y=.25;
  const ball=(parent,r,mat,x,y,z,sx=1,sy=1,sz=1)=>{const m=new THREE.Mesh(new THREE.SphereGeometry(r,20,14),mat);m.position.set(x,y,z);m.scale.set(sx,sy,sz);m.castShadow=true;parent.add(m);return m};
  // fleece cloud: a soft core with puffs spread evenly over its upper surface (golden-angle spiral)
  ball(body,.24,wool,0,0,0,1.05,.85,1.2);
  for(let i=0;i<22;i++){
    const y=1-(i+.5)/22*1.35,r=Math.sqrt(Math.max(0,1-y*y)),a=i*2.39996;
    const x=Math.cos(a)*r,z=Math.sin(a)*r;
    if(y<-.35)continue;
    ball(body,.085+((i*7)%5)*.008,i%4?wool:woolShade,x*.25,y*.2+.01,z*.29);
  }
  ball(body,.07,wool,0,.04,-.33);                                         // little tail puff
  // face peeking out of the front of the cloud
  const head=new THREE.Group();head.position.set(0,.05,.36);body.add(head);
  ball(head,.105,face,0,-.02,.06,.9,.95,1.15);
  for(let i=0;i<5;i++)ball(head,.055,wool,(i-2)*.035,.08+(i%2)*.015,.02,1,.8,1);   // fleecy fringe on top
  for(const s of[-1,1]){const e=ball(head,.05,ear,s*.1,.0,.02,1.5,.45,.8);e.rotation.z=s*.55;
    const eye=new THREE.Mesh(new THREE.CircleGeometry(.016,14),new THREE.MeshBasicMaterial({color:'#111111'}));eye.position.set(s*.045,.005,.155);eye.rotation.y=s*.35;eye.scale.y=1.4;head.add(eye);
    const glint=new THREE.Mesh(new THREE.CircleGeometry(.005,8),new THREE.MeshBasicMaterial({color:'#ffffff'}));glint.position.set(s*.045+.004,.01,.157);glint.rotation.y=s*.35;head.add(glint)}
  ball(head,.016,M(LIN('#e7a3a0'),{flatShading:false}),0,-.05,.155,1.3,.8,.6);           // pink nose
  // short feet just peeking out under the fleece
  const legs=[];
  for(const [x,z] of [[.08,.1],[-.08,.1],[.08,-.1],[-.08,-.1]]){
    const leg=new THREE.Group();leg.position.set(x,.1,z);g.add(leg);
    const m=new THREE.Mesh(new THREE.CylinderGeometry(.03,.035,.1,10),hoof);m.position.y=-.05;m.castShadow=true;leg.add(m);legs.push(leg);
  }
  let graze=0,next=2+Math.random()*4,ph=0;
  return {g,head,legs,animate(t,dt,moving){
    ph+=dt*(moving?13:0);
    legs.forEach((l,i)=>l.rotation.x+=((moving?Math.sin(ph+(i===0||i===3?0:Math.PI))*.35:0)-l.rotation.x)*Math.min(1,dt*10));
    body.position.y=.25+(moving?Math.abs(Math.sin(ph))*.03:Math.sin(t*1.6)*.006);
    body.rotation.z=moving?Math.sin(ph)*.04:0;
    next-=dt;if(!moving&&next<0&&graze<=0){graze=2.5;next=3+Math.random()*5}
    if(graze>0)graze-=dt;
    const down=moving?0:graze>0?smooth(0,.4,2.5-graze)*smooth(0,.4,graze):0;
    head.rotation.x+=((.7*down+Math.sin(t*1.3)*.04)-head.rotation.x)*Math.min(1,dt*6);
    head.position.y=.05-.08*down;
    head.rotation.y=moving?0:Math.sin(t*.7)*.3*(1-down);
  }};
}
