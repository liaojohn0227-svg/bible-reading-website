/* 禱告者 — prayer shawl (white with two blue bands and fringe tassels, Numbers 15:38) drawn up over the head.
   pose.pray: every so often the penguin stops, kneels on a small cushion, folds both flippers in front, bows and closes its eyes.
   build() returns {cushion}: hidden until the penguin kneels, then it grows in under its knees. */
registerOutfit('prayer',{
  name:'禱告者',
  ref:'腓立比書 4:6',verse:'應當一無掛慮，只要凡事藉著禱告、祈求和感謝，將你們所要的告訴神。',
  about:'白底藍條紋的禱告披巾從頭披到肩上，前方垂著繸子。偶爾會停下來，跪在小跪墊上合起雙翼、低頭禱告。',
  // pray: how often / how long it stops to pray; fold: flipper pose while praying (z = spread, x = forward, y = toward the middle)
  // kneel: how far the body sinks / leans while kneeling, and where the feet tuck (behind, soles up)
  pose:{pray:{every:[8,15],length:5,fold:{z:.02,x:-1.05,y:.45},bow:.36,kneel:{drop:.27,back:.06,feetZ:-.34,feetTilt:-.9}}},
  build(model,kit){
    const p=model.inner,{cloth,mesh,ball,rod,garment}=kit;
    const linen=cloth('#f6f3ea'),blue=cloth('#3f6aa3'),thread=cloth('#e9e3d2');
    // shawl around the shoulders, with two blue bands near its lower edge
    garment(p,1.12,1.9,linen,.078,false,.02);
    garment(p,1.2,1.26,blue,.1);
    garment(p,1.31,1.35,blue,.1);
    // the shawl pulled up as a hood: a sphere shell open at the face
    // a soft hood that hugs the head and leaves the whole face open
    // (the crown is a closed cap, so the face opening stops at the forehead instead of running up to the top)
    const hm=linen.clone();hm.side=THREE.DoubleSide;
    for(const geo of[new THREE.SphereGeometry(.31,28,8,0,Math.PI*2,0,Math.PI*.3),
                     new THREE.SphereGeometry(.31,28,14,Math.PI/2+1.15,Math.PI*2-2.3,Math.PI*.3,Math.PI*.38)]){
      const h=mesh(p,geo,hm,0,2.07,.15);h.scale.set(1.08,1.06,1.12)}
    // fringe tassels (tzitzit) hanging from the front corners, each with a blue thread
    for(const side of[-1,1]){
      const x=side*.3,top=1.14,z=.56;
      for(let k=0;k<3;k++)rod(p,[x+k*.025*side,top,z],[x+k*.03*side,top-.3-k*.03,z+.04],.011,thread);
      rod(p,[x+side*.03,top,z+.005],[x+side*.035,top-.27,z+.045],.012,blue);
      ball(p,.03,thread,x+side*.02,top,z,1,1,1);
    }
    // kneeling cushion: a plump rounded pad with gold tassels, on the ground under the penguin (not on the body)
    const cushion=new THREE.Group();(model.root||p).add(cushion);cushion.visible=false;cushion.position.set(0,0,.06);
    const pad=new THREE.Mesh(new THREE.CylinderGeometry(.5,.54,.16,28),M(LIN('#8e3b46'),{flatShading:false}));pad.scale.set(1,1,.82);pad.position.y=.08;pad.castShadow=pad.receiveShadow=true;cushion.add(pad);
    const top=new THREE.Mesh(new THREE.SphereGeometry(.5,28,10,0,Math.PI*2,0,Math.PI/2),M(LIN('#a24a55'),{flatShading:false}));top.scale.set(1,.16,.82);top.position.y=.16;cushion.add(top);
    const piping=new THREE.Mesh(new THREE.TorusGeometry(.52,.018,6,40),M(LIN('#d8b368'),{flatShading:false}));piping.rotation.x=Math.PI/2;piping.scale.set(1,.82,1);piping.position.y=.16;cushion.add(piping);
    for(const [x,z] of [[.42,.33],[-.42,.33],[.42,-.33],[-.42,-.33]]){const t=new THREE.Mesh(new THREE.ConeGeometry(.035,.12,8),M(LIN('#d8b368'),{flatShading:false}));t.position.set(x,.07,z);cushion.add(t)}
    return {cushion};
  },
});
