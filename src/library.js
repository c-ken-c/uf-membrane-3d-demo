import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import './library.css';

const products = [
  ['UF-0615E','6 inch',1806,160,'GS-TECH-115 / 120'],['UF-0615ET','6 inch',1806,160,'GS-TECH-115 / 120'],
  ['UF-0620E','6 inch',2276,160,'GS-TECH-115 / 120'],['UF-0620ET','6 inch',2276,160,'GS-TECH-115 / 120'],
  ['UF-0615ED','6 inch',1806,160,'GS-TECH-115 / 120'],['UF-0615EDT','6 inch',1806,160,'GS-TECH-115 / 120'],
  ['UF-0620ED','6 inch',2276,160,'GS-TECH-115 / 120'],['UF-0620EDT','6 inch',2276,160,'GS-TECH-115 / 120'],
  ['UF-0717E','7 inch',1919,180,'GS-TECH-118'],['UF-0717ET','7 inch',1919,180,'GS-TECH-118'],
  ['UF-0915E','9 inch',1860,225,'GS-TECH-119 / 122'],['UF-0915ET','9 inch',1860,225,'GS-TECH-119 / 122'],
  ['UF-0920E','9 inch',2360,225,'GS-TECH-119 / 122'],['UF-0920ET','9 inch',2360,225,'GS-TECH-119 / 122'],
  ['UF-0915E-IP','9 inch IP',1988,225,'GS-TECH-119'],['UF-0915ET-IP','9 inch IP',1988,225,'GS-TECH-119'],
  ['UF-0920E-IP','9 inch IP',2488,225,'GS-TECH-119'],['UF-0920ET-IP','9 inch IP',2488,225,'GS-TECH-119'],
  ['UF-1010E','10 inch',1195,250,'GS-TECH-116 / 121'],['UF-1010ET','10 inch',1195,250,'GS-TECH-116 / 121'],
  ['UF-1015E','10 inch',1730,250,'GS-TECH-116 / 121'],['UF-1015ET','10 inch',1730,250,'GS-TECH-116 / 121'],
  ['UF-1020E','10 inch',2230,250,'GS-TECH-116 / 121'],['UF-1020ET','10 inch',2230,250,'GS-TECH-116 / 121']
].map(([id,family,lengthMm,diameterMm,source])=>({id,family,lengthMm,diameterMm,source,type:'uf'}));
products.push(...[
  ['SMM1015T-5','D-Type MBR · 5 modules',555,640,1530,200,'1-1/2″','1-1/2″'],
  ['SMM1522T-5','D-Type MBR · 5 modules',555,640,2030,240,'1-1/2″','1-1/2″'],
  ['SMM1522T-25','D-Type MBR · 25 modules',2195,690,2030,1100,'2-1/2″','2-1/2″'],
  ['SMM1522T-50','D-Type MBR · 50 modules',2195,1280,2030,1940,'4″','4″'],
  ['SMM1522T-92','D-Type MBR · 92 modules',2175,1280,3730,3580,'5″','4″'],
  ['SMM2030T-5','D-Type MBR · 5 modules',555,640,2530,280,'2″','1-1/2″'],
  ['SMM2030T-25','D-Type MBR · 25 modules',2195,690,2530,1240,'3″','2-1/2″'],
  ['SMM2030T-50','D-Type MBR · 50 modules',2195,1280,2530,2240,'4″','4″'],
  ['SMM2030T-92','D-Type MBR · 92 modules',2175,1280,4730,4000,'5″','4″']
].map(([id,family,lengthMm,widthMm,heightMm,weightKg,waterPipe,airPipe])=>({id,family,lengthMm,widthMm,heightMm,weightKg,waterPipe,airPipe,type:'mbr',source:'GS-TECH-025-2503'})));

const select=document.querySelector('#product-select');
for(const p of products){const o=document.createElement('option');o.value=p.id;o.textContent=`${p.id} · ${p.family}`;select.append(o);}
const viewport=document.querySelector('#library-viewport');
const scene=new THREE.Scene();scene.background=new THREE.Color(0x071419);
const camera=new THREE.PerspectiveCamera(35,1,.01,40);camera.position.set(3.4,2.3,5.8);
const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.shadowMap.enabled=true;viewport.append(renderer.domElement);
const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.target.set(0,.9,0);
scene.add(new THREE.HemisphereLight(0xd5f3ff,0x132a28,2.8));const light=new THREE.DirectionalLight(0xffffff,4);light.position.set(3,5,4);light.castShadow=true;scene.add(light);
const floor=new THREE.Mesh(new THREE.PlaneGeometry(20,20),new THREE.MeshStandardMaterial({color:0x0b2026,roughness:.9}));floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;scene.add(floor);

const mats={shell:new THREE.MeshStandardMaterial({color:0xb9d4d6,roughness:.32,transparent:true}),cap:new THREE.MeshStandardMaterial({color:0x668993,roughness:.38}),seal:new THREE.MeshStandardMaterial({color:0x24383d,roughness:.8}),steel:new THREE.MeshStandardMaterial({color:0xa6b4b7,metalness:.8,roughness:.25}),fiber:new THREE.MeshStandardMaterial({color:0x62d3bc,roughness:.55})};
let assembly,parts=[],explode=0,target=0,transparent=false;
function mesh(geo,mat,parent,pos=[0,0,0]){const m=new THREE.Mesh(geo,mat);m.position.set(...pos);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
function addPart(name,origin,offset){const g=new THREE.Group();g.name=name;g.position.set(...origin);assembly.add(g);const part={g,origin:new THREE.Vector3(...origin),offset:new THREE.Vector3(...offset)};parts.push(part);return g;}
function build(product){
  if(product.type==='mbr')return buildMbr(product);
  if(assembly)scene.remove(assembly);assembly=new THREE.Group();scene.add(assembly);parts=[];
  const h=product.lengthMm/1000,r=product.diameterMm/2000,capH=Math.max(.085,r*.8),bodyH=Math.max(.55,h-capH*2);
  const core=addPart('membrane-core',[0,h/2,0],[0,0,0]);mesh(new THREE.CylinderGeometry(r,r,bodyH,48,1,true),mats.shell,core);for(let i=0;i<72;i++){const a=i*2.39996,rr=r*.78*Math.sqrt(i/72);mesh(new THREE.CylinderGeometry(.0016,.0016,bodyH*.94,5),mats.fiber,core,[Math.cos(a)*rr,0,Math.sin(a)*rr]);}
  for(const [name,y,dir] of [['bottom-cap',capH/2,-1],['top-cap',h-capH/2,1]]){const g=addPart(name,[0,y,0],[0,dir*.42,0]);mesh(new THREE.CylinderGeometry(r*1.08,r*1.08,capH,48),mats.cap,g);}
  for(const [name,y,dir] of [['bottom-clamp',capH,-1],['top-clamp',h-capH,1]]){const g=addPart(name,[0,y,0],[.34,dir*.2,0]);const ring=mesh(new THREE.TorusGeometry(r*1.11,.009,10,64),mats.steel,g);ring.rotation.x=Math.PI/2;}
  for(const [name,y,dir] of [['bottom-seal',capH*1.18,-1],['top-seal',h-capH*1.18,1]]){const g=addPart(name,[0,y,0],[-.3,dir*.16,0]);const ring=mesh(new THREE.TorusGeometry(r*1.01,.006,10,64),mats.seal,g);ring.rotation.x=Math.PI/2;}
  const side=addPart('side-port',[0,capH*.6,-r*1.35],[.48,-.3,-.18]);const p=mesh(new THREE.CylinderGeometry(r*.23,r*.23,r*.5,32,1,true),mats.cap,side);p.rotation.x=Math.PI/2;
  const air=addPart('air-port',[0,-.02,0],[0,-.62,0]);mesh(new THREE.CylinderGeometry(.008,.008,.07,20),mats.cap,air);
  assembly.position.y=.01;updateExplode();
  controls.target.set(0,h/2,0);camera.position.set(Math.max(2.2,h*1.65),h*.72,Math.max(3.2,h*2.2));controls.update();
  document.querySelector('#family-value').textContent=product.family;document.querySelector('#length-value').textContent=`${product.lengthMm.toLocaleString()} mm`;document.querySelector('#diameter-value').textContent=`${product.diameterMm} mm`;document.querySelector('#source-value').textContent=product.source;
  document.querySelector('#envelope-value').textContent='—';
  document.querySelector('#accuracy-note').textContent=product.family==='7 inch'?'目前沒有 7 吋爆炸圖；零件分層沿用共用 UF 結構，外形尺寸採 GS-TECH-118。':'第一版使用圖面 L1／外徑及共用零件結構；各系列專屬 BOM 輪廓仍在逐件精修。';
}
function buildMbr(product){
  if(assembly)scene.remove(assembly);assembly=new THREE.Group();scene.add(assembly);parts=[];
  const L=product.lengthMm/1000,W=product.widthMm/1000,H=product.heightMm/1000;
  const frame=addPart('skid-frame',[0,H/2,0],[-.45,0,0]);
  const rail=.045;for(const x of [-L/2,L/2])for(const z of [-W/2,W/2])mesh(new THREE.BoxGeometry(rail,H,rail),mats.steel,frame,[x,0,z]);
  for(const y of [-H/2,H/2]){for(const z of [-W/2,W/2])mesh(new THREE.BoxGeometry(L+rail,rail,rail),mats.steel,frame,[0,y,z]);for(const x of [-L/2,L/2])mesh(new THREE.BoxGeometry(rail,rail,W+rail),mats.steel,frame,[x,y,0]);}
  const count=Number(product.id.split('-').pop()),rows=count>=50?2:1,layers=count>=92?2:1,perLayer=Math.ceil(count/layers),perRow=Math.ceil(perLayer/rows);
  const bank=addPart('membrane-bank',[0,H*.49,0],[.55,0,0]);let made=0;
  for(let layer=0;layer<layers;layer++)for(let row=0;row<rows;row++)for(let i=0;i<perRow&&made<count;i++,made++){
    const x=count===5?(-L*.32+i*L*.16):(-L*.42+i*(L*.84/Math.max(1,perRow-1)));
    const z=(row-(rows-1)/2)*W*.48,y=(layer-(layers-1)/2)*H*.46;
    mesh(new THREE.BoxGeometry(Math.max(.025,L/Math.max(perRow,8)*.55),H/layers*.7,.035),mats.fiber,bank,[x,y,z]);
  }
  const water=addPart('water-header',[0,H*.86,-W*.38],[0,.45,-.25]);const wm=mesh(new THREE.CylinderGeometry(.045,.045,L*.78,24),mats.cap,water);wm.rotation.z=Math.PI/2;
  const air=addPart('air-header',[0,H*.78,W*.38],[0,.35,.3]);const am=mesh(new THREE.CylinderGeometry(.032,.032,L*.72,24),mats.cap,air);am.rotation.z=Math.PI/2;
  const diffuser=addPart('diffuser-bank',[0,H*.12,0],[0,-.4,0]);for(let row=0;row<rows;row++){const d=mesh(new THREE.CylinderGeometry(.018,.018,L*.78,18),mats.cap,diffuser,[0,0,(row-(rows-1)/2)*W*.45]);d.rotation.z=Math.PI/2;}
  assembly.position.y=.01;updateExplode();controls.target.set(0,H/2,0);camera.position.set(Math.max(3,L*1.8),H*.72,Math.max(3.8,W*3));controls.update();
  document.querySelector('#family-value').textContent=product.family;document.querySelector('#length-value').textContent=`L ${product.lengthMm.toLocaleString()} mm`;document.querySelector('#diameter-value').textContent=`Dw ${product.waterPipe} / Da ${product.airPipe}`;document.querySelector('#envelope-value').textContent=`${product.lengthMm} × ${product.widthMm} × ${product.heightMm} mm / ${product.weightKg} kg`;document.querySelector('#source-value').textContent=product.source;
  document.querySelector('#accuracy-note').textContent='SKID 外形、模組數、濕重及管徑取自 GS-TECH-025；架體截面、配管細節與拆解分組為第一版展示近似。';
}
function updateExplode(){for(const p of parts)p.g.position.copy(p.origin).addScaledVector(p.offset,explode);}
select.onchange=()=>build(products.find(p=>p.id===select.value));
document.querySelector('#explode-model').onclick=()=>{target=1;document.querySelector('#explode-level').value=100;document.querySelector('#explode-output').value='100%';};
document.querySelector('#assemble-model').onclick=()=>{target=0;document.querySelector('#explode-level').value=0;document.querySelector('#explode-output').value='0%';};
document.querySelector('#explode-level').oninput=e=>{target=Number(e.target.value)/100;document.querySelector('#explode-output').value=`${e.target.value}%`;};
document.querySelector('#transparent-model').onclick=e=>{transparent=!transparent;e.currentTarget.setAttribute('aria-pressed',String(transparent));mats.shell.opacity=transparent?.14:1;mats.shell.depthWrite=!transparent;};
new ResizeObserver(()=>{const {width,height}=viewport.getBoundingClientRect();renderer.setSize(width,height);camera.aspect=width/height;camera.updateProjectionMatrix();}).observe(viewport);
build(products.find(p=>p.id==='UF-0915E'));
let last=performance.now();renderer.setAnimationLoop(now=>{const dt=Math.min((now-last)/1000,.05);last=now;explode=THREE.MathUtils.damp(explode,target,7,dt);updateExplode();controls.update();renderer.render(scene,camera);});
