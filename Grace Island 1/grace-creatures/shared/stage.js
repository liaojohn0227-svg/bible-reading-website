/* Preview stage: the island's sky, fog and soft lights, plus a sea (surface at y=0),
   a sea floor, splash/spout particles and a follow camera. */
(function(){
const {M,LIN,rnd}=GC.kit;

GC.createStage=function(canvas){
  const renderer=new THREE.WebGLRenderer({canvas,antialias:true});
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  renderer.outputEncoding=THREE.sRGBEncoding;
  const scene=new THREE.Scene();
  const SKY=new THREE.Color('#d3e6e6'),UW=new THREE.Color('#4f98a6');
  scene.background=SKY.clone();scene.fog=new THREE.Fog(SKY.clone(),40,120);
  const skyMat=new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,fog:false,
    uniforms:{top:{value:new THREE.Color('#6f98a4')},bot:{value:new THREE.Color('#d3e6e6')}},
    vertexShader:`varying vec3 vP;void main(){vP=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader:`uniform vec3 top;uniform vec3 bot;varying vec3 vP;void main(){float h=clamp(normalize(vP).y*1.8,0.,1.);gl_FragColor=vec4(mix(bot,top,pow(h,.75)),1.);
#include <encodings_fragment>
}`});
  const sky=new THREE.Mesh(new THREE.SphereGeometry(250,24,16),skyMat);scene.add(sky);

  const camera=new THREE.PerspectiveCamera(40,1,0.1,500);
  const controls=new THREE.OrbitControls(camera,canvas);
  controls.enableDamping=true;controls.dampingFactor=.12;controls.minDistance=4;controls.maxDistance=70;

  scene.add(new THREE.HemisphereLight('#ffffff','#9fd0d8',0.95));
  const sun=new THREE.DirectionalLight('#fffaf2',0.6);
  sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.radius=4;sun.shadow.bias=-0.0006;
  Object.assign(sun.shadow.camera,{left:-14,right:14,top:14,bottom:-14,near:1,far:90});
  scene.add(sun,sun.target);

  /* sea */
  const waterGeo=new THREE.PlaneGeometry(180,180,90,90);waterGeo.rotateX(-Math.PI/2);
  const wBase=Float32Array.from(waterGeo.attributes.position.array);
  const water=new THREE.Mesh(waterGeo,new THREE.MeshStandardMaterial({color:LIN('#6fb2bd'),roughness:.35,metalness:0,transparent:true,opacity:.55,side:THREE.DoubleSide,flatShading:true,depthWrite:false}));
  water.renderOrder=2;scene.add(water);
  const floor=new THREE.Mesh(new THREE.CircleGeometry(110,64),M(LIN('#a9cdcd'),{flatShading:false}));
  floor.rotation.x=-Math.PI/2;floor.position.y=-9;floor.receiveShadow=true;scene.add(floor);

  /* spray particles (splashes, spouts, wake) */
  const N=2400,pp=new Float32Array(N*3).fill(-1e4),vel=new Float32Array(N*3),life=new Float32Array(N),grav=new Float32Array(N);let head=0;
  const pg=new THREE.BufferGeometry();pg.setAttribute('position',new THREE.BufferAttribute(pp,3));
  const spray=new THREE.Points(pg,new THREE.PointsMaterial({color:'#ffffff',size:.24,transparent:true,opacity:.9,depthWrite:false}));
  spray.frustumCulled=false;spray.renderOrder=3;scene.add(spray);
  function emit(p,n,up,spread,lifeMax=1.4,g=-9.8){
    for(let k=0;k<n;k++){const i=head++%N;
      pp[i*3]=p.x+rnd(-.2,.2)*spread;pp[i*3+1]=p.y;pp[i*3+2]=p.z+rnd(-.2,.2)*spread;
      const a=rnd(0,Math.PI*2),s=rnd(.2,1)*spread;
      vel[i*3]=Math.cos(a)*s;vel[i*3+1]=up*rnd(.55,1);vel[i*3+2]=Math.sin(a)*s;life[i]=rnd(.5,lifeMax);grav[i]=g}
  }
  /* emote bubbles above a creature, like the island's "啪啪" / "Zz" */
  const emotes=[];
  function emote(holder,txt,col='#3f8fb0',dur=2.4,h=3){
    const c=document.createElement('canvas');c.width=256;c.height=128;const x=c.getContext('2d');
    x.fillStyle='#f8fbf5f0';x.beginPath();x.moveTo(40,10);x.arcTo(246,10,246,100,30);x.arcTo(246,100,10,100,30);x.arcTo(10,100,10,10,30);x.arcTo(10,10,246,10,30);x.fill();
    x.beginPath();x.moveTo(112,98);x.lineTo(128,124);x.lineTo(144,98);x.fill();
    x.fillStyle=col;x.font='800 58px "Noto Sans TC","Microsoft JhengHei",sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText(txt,128,56);
    const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(c),transparent:true,depthWrite:false,fog:false,opacity:0}));
    sp.scale.set(2.4,1.2,1);sp.renderOrder=4;scene.add(sp);emotes.push({sp,holder,h,dur,t:0});
  }
  const fx={
    splash:(p,n=30,up=4,spread=1.5)=>emit(p,n,up,spread),
    spout:p=>emit(p,45,6.5,.55,1.1),
    wake:p=>emit(p,2,1.3,.7,.6),
    bubbles:(p,n=3)=>emit(p,n,.5,.25,3,2.2),
    emote,
  };

  let follow=null,showWater=true;const lastFocus=new THREE.Vector3(),fogC=new THREE.Color();
  function setFocus(obj){follow=obj;if(obj){lastFocus.copy(obj.position)}}
  function setWater(v){showWater=v;water.visible=v}
  function update(t,dt){
    if(showWater){const a=waterGeo.attributes.position;
      for(let i=0;i<a.count;i++){const x=wBase[i*3],z=wBase[i*3+2];a.setY(i,Math.sin(x*.35+t*1.2)*.08+Math.cos(z*.42+t*.9)*.07)}
      a.needsUpdate=true;waterGeo.computeVertexNormals()}
    for(let i=0;i<N;i++){if(life[i]<=0)continue;life[i]-=dt;vel[i*3+1]+=grav[i]*dt;
      if(grav[i]>0){const d=1-Math.min(1,dt*1.5);vel[i*3]*=d;vel[i*3+2]*=d;vel[i*3+1]=Math.min(vel[i*3+1],1.6)}
      pp[i*3]+=vel[i*3]*dt;pp[i*3+1]+=vel[i*3+1]*dt;pp[i*3+2]+=vel[i*3+2]*dt;
      const gone=grav[i]>0?pp[i*3+1]>0:(pp[i*3+1]<-.2&&vel[i*3+1]<0);
      if(life[i]<=0||gone){life[i]=0;pp[i*3+1]=-1e4}}
    for(let i=emotes.length-1;i>=0;i--){const e=emotes[i];e.t+=dt;e.holder.getWorldPosition(e.sp.position);e.sp.position.y=Math.max(e.sp.position.y,0)+e.h+e.t*.25;
      e.sp.material.opacity=Math.min(1,e.t*5)*(1-Math.max(0,(e.t-e.dur+.4)/.4));
      if(e.t>e.dur){scene.remove(e.sp);e.sp.material.map.dispose();e.sp.material.dispose();emotes.splice(i,1)}}
    pg.attributes.position.needsUpdate=true;
    if(follow){const d=follow.position.clone().sub(lastFocus).multiplyScalar(Math.min(1,dt*3));
      controls.target.add(d);camera.position.add(d);lastFocus.add(d)}
    const focus=controls.target;sun.position.set(focus.x+14,26,focus.z+16);sun.target.position.copy(focus);
    // underwater tint when the camera dips below the surface
    const under=showWater&&camera.position.y<0;
    fogC.copy(under?UW:SKY);scene.background.lerp(fogC,Math.min(1,dt*6));scene.fog.color.copy(scene.background);
    scene.fog.near=under?1:40;scene.fog.far=under?45:120;
    controls.update();renderer.render(scene,camera);
  }
  function resize(){renderer.setSize(innerWidth,innerHeight,false);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix()}
  addEventListener('resize',resize);resize();
  return {renderer,scene,camera,controls,fx,update,setFocus,setWater,WATER_Y:0};
};
})();
