/* Small helpers the island defines before its penguin code — same definitions as Grace Island index.html. */
const M=(c,o={})=>new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:1,metalness:0,flatShading:true},o));
const LIN=c=>new THREE.Color(c).convertSRGBToLinear();
function smooth(a,b,x){const t=Math.min(1,Math.max(0,(x-a)/(b-a)));return t*t*(3-2*t)}
function rnd(a,b){return a+Math.random()*(b-a)}
const AM=hex=>M(LIN(hex),{flatShading:false});
const A_EYE=new THREE.MeshBasicMaterial({color:'#000000'});

/* Outfit names. The first six are the island's existing ones; new outfits add their own entry. */
const PENGUIN_OUTFITS={'':'原本造型',pastor:'牧師',warrior:'戰士',angel:'天使',gardener:'園丁',dress:'花冠禮服'};
/* New outfits register here: EXTRA_OUTFITS[id]={name, verse, ref, about, build(model,kit), pose?} */
const EXTRA_OUTFITS={};
function registerOutfit(id,def){EXTRA_OUTFITS[id]=def;PENGUIN_OUTFITS[id]=def.name}
/* Extra penguin activities (same shape as the island's runAct cases): PENGUIN_ACTS[kind](p,P,t,dt,api).
   The island calls these from runAct's switch default; an outfit's behavior.choose() can start them from chooseNext. */
const PENGUIN_ACTS={};
