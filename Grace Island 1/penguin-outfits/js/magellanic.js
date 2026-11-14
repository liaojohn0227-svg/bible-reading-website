/* 麥哲倫企鵝 Magellanic penguin — a fifth penguin species: real markings, drawn in the island's soft style.
   From top to bottom (as in photos of real Magellanic penguins):
     dark head and cheeks
     → a white C-stripe that starts at the base of the beak above the eye, arches back over the eye,
       curves down behind the cheek and runs under the chin (both sides meet at the throat)
     → a dark collar
     → a second white band that curves down both flanks
     → a dark horseshoe band across the chest that also runs down the flanks toward the feet
     → a white belly.
   Same dark grey as the island's other penguins, same body shape and plain eyes; pink cheeks on the dark face.
   Adds SPECIES.magellanic and wraps bodyMaterial() for its pattern; every other species stays exactly as the island
   draws it. Needs penguin.js loaded first. */
SPECIES.magellanic={name:'麥哲倫企鵝',dot:'#4c5661',size:.68,back:'#4c5661',head:'#343b43',belly:'#f3f9f9',shade:'#b9dde3',
  cheek:'#f0a6ad',beak:'#30353c',feet:'#4a4248',magellanic:true,bl:.18,br:.05};

const islandBodyMaterial=bodyMaterial;
bodyMaterial=function(S){
  if(!S.magellanic)return islandBodyMaterial(S);
  if(BODY_MATS[S.name])return BODY_MATS[S.name];
  const col=v=>new THREE.Color(v).convertSRGBToLinear();
  const U={uBack:{value:col(S.back)},uHead:{value:col(S.head)},uBelly:{value:col(S.belly)},uShade:{value:col(S.shade)},uCheek:{value:col(S.cheek)}};
  const m=new THREE.MeshStandardMaterial({color:'#ffffff',roughness:1,metalness:0});
  // same approach as the island: colour painted per pixel from the un-deformed body shape (aOrig), so edges stay soft
  m.onBeforeCompile=sh=>{Object.assign(sh.uniforms,U);
    sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nattribute vec3 aOrig;\nvarying vec3 vOrig;')
      .replace('#include <begin_vertex>','#include <begin_vertex>\nvOrig=aOrig;');
    sh.fragmentShader=sh.fragmentShader.replace('#include <common>',`#include <common>
varying vec3 vOrig;uniform vec3 uBack,uHead,uBelly,uShade,uCheek;
float band(float x,float lo,float hi,float e){return smoothstep(lo-e,lo+e,x)*(1.-smoothstep(hi-e,hi+e,x));}
vec3 magellanicColor(){
  float y=vOrig.y;float f=vOrig.z/max(length(vOrig.xz),1e-4);       // f: 1 = straight ahead, -1 = straight behind
  vec3 c=mix(uBack,uHead,smoothstep(1.6,1.86,y));
  // chest pattern: bands run across the front and bend down along the flanks.
  // u is the height measured along those bent bands (equal to y at the very front).
  float side=1.-f,u=y+1.05*pow(max(side,0.),1.3);
  float front=smoothstep(-.42,-.18,f);                                 // the back stays dark
  float white2=band(u,1.565,1.665,.02);                                // second white band below the collar
  float belly=1.-smoothstep(1.43,1.47,u);                              // white belly below the dark horseshoe
  float w=front*max(white2,belly);
  c=mix(c,uBelly,w);
  // white C-stripe on the head: an arch from the beak base over the eye, round behind the cheek, under the chin
  float e=length(vec2((f-.78)/.92,(y-2.0)/.165));
  float s=1.-smoothstep(.07,.13,abs(e-1.));
  s*=y<2.0?1.:smoothstep(.96,.86,f);                                   // the forehead between the stripes stays dark
  s*=smoothstep(-.45,-.15,f);
  c=mix(c,uBelly,s);
  // pink cheeks on the dark face, inside the C
  float ch=1.-smoothstep(.4,1.,length(vec2((f-.66)/.15,(y-1.99)/.055)));
  c=mix(c,uCheek,.7*ch);
  c=mix(c,uShade,w*.9*(1.-smoothstep(.0,1.3,y)));
  return c;
}`).replace('#include <color_fragment>','#include <color_fragment>\ndiffuseColor.rgb=magellanicColor();');
  };
  return BODY_MATS[S.name]=m;
};
