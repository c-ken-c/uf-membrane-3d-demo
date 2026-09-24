import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import './library.css';
import './library-light.css';
import { createSingle } from './single.js';

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
const scene=new THREE.Scene();scene.background=new THREE.Color(0xf0f3f5);
const camera=new THREE.PerspectiveCamera(35,1,.01,40);camera.position.set(3.4,2.3,5.8);
const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.shadowMap.enabled=true;viewport.append(renderer.domElement);
const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.target.set(0,.9,0);
scene.add(new THREE.HemisphereLight(0xd5f3ff,0xaab8c2,2.8));const light=new THREE.DirectionalLight(0xffffff,4);light.position.set(3,5,4);light.castShadow=true;scene.add(light);
// Ground omitted so exploded parts cannot be occluded.

const mats={shell:new THREE.MeshStandardMaterial({color:0xb9d4d6,roughness:.32,transparent:true}),cap:new THREE.MeshStandardMaterial({color:0x668993,roughness:.38}),seal:new THREE.MeshStandardMaterial({color:0x24383d,roughness:.8}),steel:new THREE.MeshStandardMaterial({color:0xa6b4b7,metalness:.8,roughness:.25}),fiber:new THREE.MeshStandardMaterial({color:0x62d3bc,roughness:.55})};
let assembly,parts=[],explode=0,target=0,transparent=false,single=null,detail=false;
const detailButton=document.createElement('button');detailButton.id='mbr-detail';detailButton.textContent='單片檢視';document.querySelector('#transparent-model').after(detailButton);
detailButton.onclick=()=>{detail=!detail;build(products.find(p=>p.id===select.value));};
function resetAssembly(){if(assembly){scene.remove(assembly);const gs=new Set(),ms=new Set();assembly.traverse(o=>{if(o.geometry)gs.add(o.geometry);if(o.material&&!Object.values(mats).includes(o.material))ms.add(o.material);});gs.forEach(g=>g.dispose());ms.forEach(m=>{m.map?.dispose();m.dispose();});}single=null;assembly=new THREE.Group();scene.add(assembly);parts=[];}
function fitRange(){if(!assembly)return;const saved=explode;explode=1;updateExplode();assembly.updateMatrixWorld(true);const box=new THREE.Box3().setFromObject(assembly),center=box.getCenter(new THREE.Vector3()),radius=box.getSize(new THREE.Vector3()).length()/2;const angle=Math.min(THREE.MathUtils.degToRad(camera.fov/2),Math.atan(Math.tan(THREE.MathUtils.degToRad(camera.fov/2))*camera.aspect));const distance=radius/Math.sin(angle)*1.08,direction=camera.position.clone().sub(controls.target).normalize();controls.target.copy(center);camera.position.copy(center).addScaledVector(direction,distance);camera.far=Math.max(40,distance*5);camera.updateProjectionMatrix();controls.update();explode=saved;updateExplode();}
function mesh(geo,mat,parent,pos=[0,0,0]){const m=new THREE.Mesh(geo,mat);m.position.set(...pos);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
function addPart(name,origin,offset){const g=new THREE.Group();g.name=name;g.position.set(...origin);assembly.add(g);const part={g,origin:new THREE.Vector3(...origin),offset:new THREE.Vector3(...offset)};parts.push(part);return g;}
function build(product){
  if(product.type==='mbr')return buildMbr(product);
  resetAssembly();single=createSingle();assembly.add(single.root);
  const h=product.lengthMm/1000;
  single.root.scale.set(product.diameterMm/225,product.lengthMm/1860,product.diameterMm/225);
  single.setSection(transparent);detailButton.hidden=true;document.querySelector('#transparent-model').disabled=false;
  camera.position.set(2,h*.7,-4);controls.target.set(0,h/2,0);updateExplode();fitRange();
  document.querySelector('#family-value').textContent=product.family;document.querySelector('#length-value').textContent=`${product.lengthMm.toLocaleString()} mm`;document.querySelector('#diameter-value').textContent=`${product.diameterMm} mm`;document.querySelector('#source-value').textContent=product.source;
  document.querySelector('#envelope-value').textContent='—';
  document.querySelector('#accuracy-note').textContent=product.family==='7 inch'?'目前沒有 7 吋爆炸圖；零件分層沿用共用 UF 結構，外形尺寸採 GS-TECH-118。':(product.id==='UF-0915E'?'採用 UF-0915E 的 14 項 BOM／22 件模型，含上下側水口、頂部水口、底部進氣接頭；接口用途依實際配管確認。':'接口與零件採 UF-0915E 結構作比例展示；本型號專屬接口尺寸、BOM 與 E／ET 差異待核對。');
}
function buildMbr(product){
  resetAssembly();detailButton.hidden=false;detailButton.textContent=detail?'返回整組 SKID':'單片檢視';document.querySelector('#transparent-model').disabled=true;
  const L=product.lengthMm/1000,W=product.widthMm/1000,H=product.heightMm/1000;
  const actualCount=Number(product.id.split('-').pop()),count=detail?1:actualCount,rows=count>=50?2:1,layers=count>=92?2:1,perRow=Math.ceil(count/layers/rows);
  const moduleH=H/(actualCount>=92?2:1)*.79,moduleW=W/(actualCount>=50?2:1)*.78;
  if(!detail){
    const frame=addPart('skid-frame',[0,H/2,0],[-.5,0,0]),rail=.035;
    for(const x of [-L/2,L/2])for(const z of [-W/2,W/2])mesh(new THREE.BoxGeometry(rail,H,rail),mats.steel,frame,[x,0,z]);
    for(const y of [-H/2,H/2]){for(const z of [-W/2,W/2])mesh(new THREE.BoxGeometry(L+rail,rail,rail),mats.steel,frame,[0,y,z]);for(const x of [-L/2,L/2])mesh(new THREE.BoxGeometry(rail,rail,W+rail),mats.steel,frame,[x,y,0]);}
  }
  const plastic=new THREE.MeshStandardMaterial({color:0x46505c,roughness:.55}),fiberMaterial=new THREE.MeshStandardMaterial({color:0xe8dfbf,roughness:.85});
  const fiberH=moduleH-.14;
  const path=new THREE.CatmullRomCurve3([new THREE.Vector3(-.002,fiberH/2,0),new THREE.Vector3(-.003,0,.004),new THREE.Vector3(-.002,-fiberH/2+.012,0),new THREE.Vector3(0,-fiberH/2,0),new THREE.Vector3(.002,-fiberH/2+.012,0),new THREE.Vector3(.003,0,.003),new THREE.Vector3(.002,fiberH/2,0)]);
  const fiberGeo=new THREE.TubeGeometry(path,32,.00065,4,false);
  let made=0;
  for(let layer=0;layer<layers;layer++)for(let row=0;row<rows;row++)for(let i=0;i<perRow&&made<count;i++,made++){
    const x=detail?0:(i-(perRow-1)/2)*(L*.82/Math.max(perRow-1,1)),z=detail?0:(row-(rows-1)/2)*W*.48,y=detail?moduleH/2:H*.49+(layer-(layers-1)/2)*H*.46;
    const module=addPart('hollow-fiber-module-'+made,[x,y,z],[detail?0:.6+(i/perRow)*.5,0,detail?0:(row-(rows-1)/2)*.3]);
    const support=detail?addPart('module-support',[x,y,z],[0,0,.16]):module;
    for(const zz of [-moduleW/2,moduleW/2])mesh(new THREE.CylinderGeometry(.009,.009,moduleH,12),plastic,support,[0,0,zz]);
    for(const yy of [-moduleH/2,moduleH/2]){const parent=detail?addPart(yy>0?'collection-header':'bottom-support',[x,y,z],[0,Math.sign(yy)*.15,0]):module;const header=mesh(new THREE.CylinderGeometry(.022,.022,moduleW+.06,20),plastic,parent,[0,yy,0]);header.rotation.x=Math.PI/2;}
    const loops=240,instanced=new THREE.InstancedMesh(fiberGeo,fiberMaterial,loops),matrix=new THREE.Matrix4();
    for(let k=0;k<loops;k++){const bundle=Math.floor(k/12),strand=k%12,zz=-moduleW*.46+bundle*moduleW*.92/19+(strand%6-2.5)*.0016;matrix.makeRotationY(Math.PI/2);matrix.setPosition((Math.floor(strand/6)-.5)*.003,0,zz);instanced.setMatrixAt(k,matrix);}
    instanced.userData.fiberODmm=1.3;instanced.userData.fiberIDmm=.7;module.add(instanced);
  }
  if(!detail){
  const water=addPart('water-header',[0,H*.86,-W*.38],[0,.45,-.25]);const wm=mesh(new THREE.CylinderGeometry(.045,.045,L*.78,24),mats.cap,water);wm.rotation.z=Math.PI/2;
  const air=addPart('air-header',[0,H*.78,W*.38],[0,.35,.3]);const am=mesh(new THREE.CylinderGeometry(.032,.032,L*.72,24),mats.cap,air);am.rotation.z=Math.PI/2;
  const diffuser=addPart('diffuser-bank',[0,H*.12,0],[0,-.4,0]);for(let row=0;row<rows;row++){const d=mesh(new THREE.CylinderGeometry(.018,.018,L*.78,18),mats.cap,diffuser,[0,0,(row-(rows-1)/2)*W*.45]);d.rotation.z=Math.PI/2;}
  }
  assembly.position.y=.01;updateExplode();controls.target.set(0,detail?moduleH/2:H/2,0);camera.position.set(detail?3:4,detail?moduleH*.65:H*.65,detail?1.3:4);fitRange();
  document.querySelector('#family-value').textContent=product.family;document.querySelector('#length-value').textContent=`L ${product.lengthMm.toLocaleString()} mm`;document.querySelector('#diameter-value').textContent=`Dw ${product.waterPipe} / Da ${product.airPipe}`;document.querySelector('#envelope-value').textContent=`${product.lengthMm} × ${product.widthMm} × ${product.heightMm} mm / ${product.weightKg} kg`;document.querySelector('#source-value').textContent=product.source;
  document.querySelector('#accuracy-note').textContent='膜絲 ID／OD：0.7／1.3 mm（使用者提供）；依照片呈現上端集水、细絲回彎結構。根數、單片尺寸與排列為展示近似，整組外形依 GS-TECH-025。';
}
function updateExplode(){if(single)single.update(explode);for(const p of parts)p.g.position.copy(p.origin).addScaledVector(p.offset,explode);}
select.onchange=()=>{detail=false;build(products.find(p=>p.id===select.value));};
document.querySelector('#explode-model').onclick=()=>{target=1;document.querySelector('#explode-level').value=100;document.querySelector('#explode-output').value='100%';};
document.querySelector('#assemble-model').onclick=()=>{target=0;document.querySelector('#explode-level').value=0;document.querySelector('#explode-output').value='0%';};
document.querySelector('#explode-level').oninput=e=>{target=Number(e.target.value)/100;document.querySelector('#explode-output').value=`${e.target.value}%`;};
document.querySelector('#transparent-model').onclick=e=>{transparent=!transparent;e.currentTarget.setAttribute('aria-pressed',String(transparent));single?.setSection(transparent);};
new ResizeObserver(()=>{const {width,height}=viewport.getBoundingClientRect();renderer.setSize(width,height);camera.aspect=width/height;camera.updateProjectionMatrix();fitRange();}).observe(viewport);
select.value='UF-0915E';build(products.find(p=>p.id==='UF-0915E'));
window.libraryInspect=()=>({product:select.value,detail,parts:single?single.parts.length:parts.length,ground:scene.children.some(o=>o.geometry?.type==='PlaneGeometry'),fiberMeshes:parts.reduce((n,p)=>n+p.g.children.filter(o=>o.isInstancedMesh).length,0)});
let last=performance.now();renderer.setAnimationLoop(now=>{const dt=Math.min((now-last)/1000,.05);last=now;explode=THREE.MathUtils.damp(explode,target,7,dt);updateExplode();controls.update();renderer.render(scene,camera);});
