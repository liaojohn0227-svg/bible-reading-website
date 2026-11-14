/* 祭司 (simplified) — white linen robe, a woven sash in blue / purple / scarlet, a gold breastpiece set with
   twelve stones (one for each tribe), and a wrapped white turban with a gold plate on the front (Exodus 28). */
registerOutfit('priest',{
  name:'祭司',
  ref:'彼得前書 2:9',verse:'惟有你們是被揀選的族類，是有君尊的祭司，是聖潔的國度。',
  about:'細麻白袍、藍紫朱紅三色腰帶、胸前鑲著十二顆寶石的金色胸牌，頭上是白色纏頭巾和金牌。',
  build(model,kit){
    const p=model.inner,{cloth,mesh,box,ball,garment,materials}=kit;
    const linen=cloth('#f4f1e8'),blue=cloth('#3f5f9a'),purple=cloth('#7a4f8e'),scarlet=cloth('#b5473f');
    const gold=M(LIN('#d8b368'),{roughness:.45,metalness:.35,flatShading:true});
    garment(p,.38,1.74,linen,.065,false,.04);
    garment(p,.9,.94,blue,.1);garment(p,.94,.98,purple,.1);garment(p,.98,1.02,scarlet,.1);
    // breastpiece on the chest, tilted to follow the body, with 4 rows × 3 stones
    const plate=new THREE.Group();plate.position.set(0,1.34,.51);plate.rotation.x=-.24;p.add(plate);
    box(plate,.34,.4,.035,gold,0,0,0);
    box(plate,.29,.35,.02,materials.cream,0,0,.022);
    const stones=['#c0392b','#e6b54a','#3a8d6a','#d9773b','#2f5f9e','#e8e2d0','#b3487a','#8e6bb0','#5aa3b8','#c69a3f','#2e2e38','#7fb069'];
    stones.forEach((c,i)=>{const r=Math.floor(i/3),k=i%3;
      ball(plate,.03,M(LIN(c),{roughness:.3,metalness:.1,flatShading:true}),(k-1)*.085,.12-r*.08,.04,1,1,.55)});
    // gold chains up to the shoulders, each shoulder with an onyx stone
    for(const side of[-1,1]){
      kit.rod(p,[side*.18,1.56,.47],[side*.27,1.74,.25],.015,gold);
      ball(p,.055,M(LIN('#2b3a33'),{roughness:.3,flatShading:true}),side*.29,1.77,.2,1,.8,1);
    }
    // wrapped turban: stacked linen coils and a rounded top, gold plate tied on with a blue cord
    // sits above the eyes so the face stays visible
    const turban=new THREE.Group();turban.position.set(0,2.3,.2);p.add(turban);
    [[.0,.27],[.06,.262],[.115,.24]].forEach(([y,r],i)=>{const t=mesh(turban,new THREE.TorusGeometry(r,.055,10,28),linen,0,y,0);t.rotation.x=Math.PI/2;t.rotation.z=i*.4});
    const top=mesh(turban,new THREE.SphereGeometry(.235,20,10,0,Math.PI*2,0,Math.PI/2),linen,0,.11,0);top.scale.y=.7;
    const band=mesh(turban,new THREE.TorusGeometry(.322,.014,6,30),blue,0,.0,0);band.rotation.x=Math.PI/2;
    const front=box(turban,.17,.065,.022,gold,0,.03,.32);front.rotation.x=-.15;
  },
});
