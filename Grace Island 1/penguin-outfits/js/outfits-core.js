/* Outfit builder — copied from Grace Island index.html (dressPenguin) with ONE change:
   the makers list also picks up EXTRA_OUTFITS (outfits/*.js), which receive the same helper kit,
   plus the penguin's feet and whether it is a chick. Needs: penguin.js, base.js. */
function dressPenguin(penguin,outfit){
  if(!outfit||!Object.hasOwn(PENGUIN_OUTFITS,outfit))return;
  const outfitRoot=new THREE.Group();
  penguin.inner.add(outfitRoot);
  // The four adult patterns use the same body profile. Fit the shorter, wider chick separately.
  if(penguin.type==='chick')outfitRoot.scale.set(1.36,.75,1.36);
  const cloth=color=>M(LIN(color),{flatShading:true});
  const materials={
    orange:cloth('#d88b45'),mustard:cloth('#edb865'),olive:cloth('#6b7c61'),
    leather:cloth('#79563e'),gold:cloth('#d8b368'),navy:cloth('#33475f'),
    shirt:cloth('#d9ece5'),green:cloth('#598a73'),cream:cloth('#faf0d6'),
    rose:cloth('#d1a393'),petal:cloth('#f5ce67'),soil:cloth('#5e493d'),
    pot:cloth('#c98b66'),leaf:cloth('#638f51'),black:cloth('#263944')
  };
  function mesh(parent,geometry,material,x=0,y=0,z=0){
    const object=new THREE.Mesh(geometry,material);
    object.position.set(x,y,z);object.castShadow=true;object.receiveShadow=true;parent.add(object);return object;
  }
  function box(parent,w,h,d,material,x,y,z){
    return mesh(parent,new THREE.BoxGeometry(w,h,d),material,x,y,z);
  }
  function ball(parent,r,material,x,y,z,sx=1,sy=1,sz=1){
    const object=mesh(parent,new THREE.SphereGeometry(r,16,10),material,x,y,z);
    object.scale.set(sx,sy,sz);return object;
  }
  function rod(parent,from,to,r,material){
    const start=new THREE.Vector3(...from),end=new THREE.Vector3(...to),vector=end.clone().sub(start);
    const object=mesh(parent,new THREE.CylinderGeometry(r,r,vector.length(),8),material);
    object.position.copy(start.add(end).multiplyScalar(.5));
    object.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),vector.normalize());return object;
  }
  // Garments follow the template's actual body profile, with clearance outside its surface.
  function garment(parent,low,high,material,clearance=.055,frontOnly=false,flare=0){
    const positions=[],indices=[],rings=14,segments=40;
    const angleStart=frontOnly?-1.06:0,angleLength=frontOnly?2.12:Math.PI*2;
    for(let j=0;j<=rings;j++){
      const y=low+(high-low)*j/rings;
      const radius=radiusAt(ADULT,y)+clearance+flare*(1-j/rings)**2;
      for(let i=0;i<=segments;i++){
        const angle=angleStart+angleLength*i/segments;
        positions.push(Math.sin(angle)*radius,y,Math.cos(angle)*radius+leanOf(SPECIES.adelie,y));
      }
    }
    for(let j=0;j<rings;j++)for(let i=0;i<segments;i++){
      const a=j*(segments+1)+i,b=a+segments+1;
      indices.push(a,a+1,b,b,a+1,b+1);
    }
    const geometry=new THREE.BufferGeometry();
    geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setIndex(indices);geometry.computeVertexNormals();
    const double=material.clone();double.side=THREE.DoubleSide;
    return mesh(parent,geometry,double);
  }
  function button(parent,x,y,z,material=materials.gold){
    const object=mesh(parent,new THREE.CylinderGeometry(.026,.026,.025,10),material,x,y,z);
    object.rotation.x=Math.PI/2;return object;
  }
  function flower(parent,x,y,z,size,petalMaterial=materials.petal){
    const group=new THREE.Group();group.position.set(x,y,z);group.scale.setScalar(size);parent.add(group);
    for(let i=0;i<8;i++){
      const angle=i*Math.PI/4;
      const petal=ball(group,.11,petalMaterial,Math.sin(angle)*.16,Math.cos(angle)*.16,0,.6,1,.35);
      petal.rotation.z=-angle;
    }
    ball(group,.105,materials.leather,0,0,.035,1,1,.4);return group;
  }
  function hat(parent,material){
    const group=new THREE.Group();group.position.set(0,2.26,.22);parent.add(group);
    const brim=mesh(group,new THREE.CylinderGeometry(.43,.43,.045,24),material);
    brim.scale.z=.9;
    const crown=mesh(group,new THREE.SphereGeometry(.32,20,12,0,Math.PI*2,0,Math.PI/2),material,0,.025,0);
    crown.scale.set(1,.65,1);
    return group;
  }
  function cross(parent,material,x,y,z,size=.16){
    box(parent,size*.25,size,.025,material,x,y,z);
    box(parent,size*.8,size*.22,.027,material,x,y+size*.16,z);
  }
  function pastor(model){
    const p=model.inner;
    const robe=cloth('#343747'),stole=cloth('#9276ac');
    garment(p,.4,1.72,robe,.065,false,.04);
    garment(p,1.57,1.72,materials.cream,.076);
    box(p,.15,.095,.055,materials.cream,0,1.66,.37);
    for(const side of[-1,1]){
      // Stole follows the curved front of the robe from shoulder to hem.
      const points=[];
      for(let i=0;i<=16;i++){
        const y=.56+i/16*1.06,x=side*.18;
        const radius=radiusAt(ADULT,y)+.095;
        const z=Math.sqrt(Math.max(0,radius*radius-x*x))+leanOf(SPECIES.adelie,y);
        points.push(new THREE.Vector3(x,y,z));
      }
      const path=new THREE.CatmullRomCurve3(points);
      const ribbon=mesh(p,new THREE.TubeGeometry(path,24,.065,4,false),stole);
      cross(p,materials.gold,side*.18,.7,.59,.14);
    }
    for(let i=0;i<4;i++)button(p,0,.86+i*.14,.57-i*.026,materials.black);
    const book=new THREE.Group();p.add(book);book.position.set(.52,.87,.41);book.rotation.set(-.12,-.3,-.23);
    box(book,.29,.38,.10,materials.leather,0,0,0);
    box(book,.25,.33,.075,materials.cream,.01,0,0);
    box(book,.29,.38,.025,materials.leather,0,0,.055);
    cross(book,materials.gold,0,.015,.073,.17);
  }
  function warrior(model){
    const p=model.inner;
    const steel=cloth('#a9bbc2'),edge=cloth('#617d8c'),cape=cloth('#a76357');
    garment(p,.5,1.64,materials.navy,.055);
    garment(p,.86,1.64,steel,.085);
    garment(p,.68,.82,materials.leather,.085);
    box(p,.17,.13,.045,materials.gold,0,.75,.62);
    box(p,.1,.07,.05,materials.leather,0,.75,.645);
    // A short back cape clears both feet and the moving flippers.
    const capeShape=new THREE.Shape();
    capeShape.moveTo(-.3,1.6);capeShape.lineTo(.3,1.6);capeShape.lineTo(.48,.48);
    capeShape.lineTo(0,.38);capeShape.lineTo(-.48,.48);capeShape.closePath();
    mesh(p,new THREE.ExtrudeGeometry(capeShape,{depth:.045,bevelEnabled:false}),cape,0,0,-.67);
    for(const side of[-1,1]){
      const shoulder=ball(model.flips[side<0?0:1],.19,steel,side*.015,-.02,0,1.1,.6,1.5);
      button(p,side*.25,1.44,.42);
    }
    const helmet=hat(p,steel);
    helmet.children[0].scale.set(.86,1,.84);
    const crest=mesh(helmet,new THREE.BoxGeometry(.045,.13,.42),materials.gold,0,.2,0);
    // Shield and sheathed sword attach to their flipper rigs.
    const shieldRoot=new THREE.Group();model.flips[0].add(shieldRoot);
    shieldRoot.position.set(-.13,-.59,.23);shieldRoot.rotation.y=-.28;
    const shieldShape=new THREE.Shape();
    shieldShape.moveTo(-.25,.32);shieldShape.lineTo(.25,.32);shieldShape.lineTo(.24,-.1);
    shieldShape.quadraticCurveTo(.18,-.29,0,-.4);
    shieldShape.quadraticCurveTo(-.18,-.29,-.24,-.1);shieldShape.closePath();
    mesh(shieldRoot,new THREE.ExtrudeGeometry(shieldShape,{depth:.07,bevelEnabled:true,bevelThickness:.015,bevelSize:.018,bevelSegments:1}),edge);
    cross(shieldRoot,materials.gold,0,.01,.095,.31);
    const sword=new THREE.Group();model.flips[1].add(sword);
    sword.position.set(.14,-.48,.13);sword.rotation.z=-.12;
    box(sword,.085,.6,.075,materials.leather,0,-.31,0);
    box(sword,.24,.055,.09,materials.gold,0,.015,0);
    box(sword,.065,.18,.07,materials.navy,0,.13,0);
    ball(sword,.045,materials.gold,0,.25,0);
  }
  function angel(model){
    const p=model.inner;
    const feather=cloth('#edf4f1'),wingShade=cloth('#d6e4e0');
    garment(p,.4,1.62,materials.cream,.067,false,.08);
    garment(p,.95,1.04,materials.gold,.085);
    for(const side of[-1,1]){
      const wing=new THREE.Group();wing.position.set(side*.27,1.4,-.4);
      wing.rotation.y=side*.18;p.add(wing);
      const core=ball(wing,.32,wingShade,side*.24,.13,-.1,.9,1.4,.35);
      core.rotation.z=-side*.5;
      for(let i=0;i<7;i++){
        const t=i/6;
        const plume=ball(wing,1,feather,side*(.23+t*.38),.46-t*.64,-.13-i*.009,.105,.48-t*.16,.065);
        plume.rotation.z=-side*(.35+t*.6);
      }
      for(let i=0;i<4;i++){
        const plume=ball(wing,1,materials.cream,side*(.15+i*.085),.12-i*.1,.005,.085,.24,.065);
        plume.rotation.z=-side*.65;
      }
      cross(p,materials.gold,side*.16,1.36,.49,.12);
    }
    const haloMaterial=M(LIN('#f4d17a'),{roughness:.38,metalness:.35,emissive:LIN('#e9c26b'),emissiveIntensity:.25});
    const halo=mesh(p,new THREE.TorusGeometry(.36,.036,10,36),haloMaterial,0,2.63,.2);
    halo.rotation.x=Math.PI/2;
  }
  function gardener(model){
    const p=model.inner;
    garment(p,.48,1.36,materials.green,.07,true,.05);
    for(const side of[-1,1]){
      rod(p,[side*.3,1.31,.37],[side*.26,1.62,.24],.033,materials.cream);
      rod(p,[side*.26,1.62,.24],[side*.3,.9,-.47],.024,materials.cream);
      button(p,side*.27,1.3,.43);
    }
    const potGroup=new THREE.Group();potGroup.position.set(0,.67,.79);p.add(potGroup);
    mesh(potGroup,new THREE.CylinderGeometry(.22,.16,.32,12),materials.pot,0,.16,0);
    mesh(potGroup,new THREE.CylinderGeometry(.245,.245,.065,12),materials.cream,0,.32,0);
    mesh(potGroup,new THREE.CylinderGeometry(.21,.21,.01,12),materials.soil,0,.36,0);
    rod(potGroup,[0,.35,0],[.045,.91,0],.025,materials.leaf);
    const leaf=ball(potGroup,.12,materials.leaf,-.08,.59,0,1.4,.45,.3);leaf.rotation.z=.45;
    flower(potGroup,.045,1.01,.02,.95);
    for(const side of[-1,1]){
      const gloves=ball(p,.1,materials.cream,side*.25,.87,.8,.8,1,1.1);
      model.flips[side<0?0:1].rotation.x=-.65;
      model.flips[side<0?0:1].rotation.z=-side*.16;
    }
    const sunhat=hat(p,materials.mustard);sunhat.scale.set(1.13,.7,1.13);
    flower(sunhat,-.24,.1,.2,.3,materials.cream);
  }
  function dress(model){
    const p=model.inner;
    garment(p,.42,1.55,materials.cream,.07,false,.19);
    garment(p,.38,.62,materials.cream,.09,false,.2);
    garment(p,1.05,1.15,materials.rose,.075);
    for(const side of[-1,1]){
      rod(p,[side*.28,1.5,.29],[side*.29,1.67,.13],.035,materials.cream);
      rod(p,[side*.29,1.67,.13],[side*.29,1.5,-.2],.035,materials.cream);
      flower(p,side*.15,1.12,-.54,.5,materials.rose);
    }
    flower(p,0,1.37,.47,.42,materials.gold);
    const crown=new THREE.Group();crown.position.set(0,2.26,.2);p.add(crown);
    const ring=mesh(crown,new THREE.TorusGeometry(.29,.018,6,24),materials.gold);ring.rotation.x=Math.PI/2;
    for(let i=0;i<7;i++){
      const angle=(i-3)*.38;
      const bloom=flower(crown,Math.sin(angle)*.3,.055,Math.cos(angle)*.3,.36,i%2?materials.rose:materials.cream);
      bloom.rotation.y=angle;
      const leaf=ball(crown,.045,materials.olive,Math.sin(angle+.15)*.31,.035,Math.cos(angle+.15)*.31,.5,1.5,.3);
      leaf.rotation.z=-angle;
    }
    // A tapered, faceted bow sits on the back of the dress.
    for(const side of[-1,1]){
      const ribbon=box(p,.09,.37,.045,materials.rose,side*.07,.87,-.58);
      ribbon.rotation.z=side*.22;
    }
  }
  // New outfits live in their own files (outfits/*.js) and register in EXTRA_OUTFITS; they get the same helpers.
  const kit={materials,cloth,mesh,box,ball,rod,garment,button,flower,hat,cross};
  const makers={pastor,warrior,angel,gardener,dress};
  // a new outfit may return extra parts (e.g. the prayer cushion) — kept on penguin.outfitParts for the game loop
  for(const [id,extra] of Object.entries(typeof EXTRA_OUTFITS==='undefined'?{}:EXTRA_OUTFITS))makers[id]=model=>{penguin.outfitParts=extra.build(model,kit)||{}};
  makers[outfit]({inner:outfitRoot,flips:penguin.flips,feet:penguin.feet,root:penguin.g,chick:penguin.type==='chick'});
  penguin.outfit=outfit;
}
