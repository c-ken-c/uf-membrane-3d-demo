import { createSkidServices } from './skid-services.js';
import { createSingle } from './single.js';
import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const $ = (id) => document.getElementById(id);
const container = $('viewport');
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x0a171d, 0.075);
const camera = new THREE.PerspectiveCamera(35, 1, 0.01, 60);
const initialPosition = new THREE.Vector3(3.6, 2.5, 5.4);
camera.position.copy(initialPosition);
let renderer;
try {
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
} catch {
  $('loading').textContent = '無法啟用 3D：請使用支援 WebGL 的瀏覽器，並開啟硬體加速。';
  throw new Error('WebGL unavailable');
}
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.25;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
container.appendChild(renderer.domElement);
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 1.1, 0);
controls.enableDamping = true;
controls.minDistance = 1.6;
controls.maxDistance = 9;
controls.maxPolarAngle = Math.PI * 0.62;
controls.autoRotateSpeed = 0.6;
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

scene.add(new THREE.HemisphereLight(0xc9e9ff, 0x18302b, 2.5));
const key = new THREE.DirectionalLight(0xe1f5ff, 4);
key.position.set(3, 5, 4); key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
Object.assign(key.shadow.camera, { left: -3, right: 3, top: 4, bottom: -3, near: 0.1, far: 15 });
key.shadow.bias = -0.0004; scene.add(key);
const rim = new THREE.DirectionalLight(0x69e3cb, 2.7); rim.position.set(-3, 2, -3); scene.add(rim);
const ground = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), new THREE.ShadowMaterial({ opacity: 0.28 }));
ground.rotation.x = -Math.PI / 2; ground.position.y = -0.005; ground.receiveShadow = true; scene.add(ground);
const grid = new THREE.GridHelper(7, 35, 0x2a4e54, 0x173038); grid.position.y = -0.002;
grid.material.transparent = true; grid.material.opacity = 0.38; scene.add(grid);

const single=createSingle();scene.add(single.root);single.root.visible=false;let singleView=false,explodeCurrent=0,explodeTarget=0;
const equipment = new THREE.Group(); scene.add(equipment);
const mat = (color, metalness = 0, roughness = 0.5) => new THREE.MeshStandardMaterial({ color, metalness, roughness });
const steel = mat(0x6b8790, 0.78, 0.3);
const dark = mat(0x28434b, 0.25, 0.46);
const capMat = mat(0x769ba5, 0.2, 0.46);
const waterMat = mat(0x317c92, 0.5, 0.25);
const wasteMat = mat(0xa87b48, 0.45, 0.28);
const airMat = mat(0x8276c1, 0.4, 0.26);
function mesh(geo, material, parent = equipment) {
  const m = new THREE.Mesh(geo, material); m.castShadow = true; m.receiveShadow = true; parent.add(m); return m;
}
function box(x,y,z,w,h,d, material=steel, parent=equipment) {
  const m=mesh(new THREE.BoxGeometry(w,h,d),material,parent);m.position.set(x,y,z);return m;
}
function cylinder(radius,height,x,y,z,material,parent=equipment) {
  const m=mesh(new THREE.CylinderGeometry(radius,radius,height,40),material,parent);m.position.set(x,y,z);return m;
}
function ring(radius,tube,x,y,z,material,parent=equipment,axis='y') {
  const m=mesh(new THREE.TorusGeometry(radius,tube,8,40),material,parent);m.position.set(x,y,z);
  if(axis==='y')m.rotation.x=Math.PI/2;else if(axis==='x')m.rotation.y=Math.PI/2;return m;
}
const v = (p) => new THREE.Vector3(...p);
function curve(points) { return points.length === 2 ? new THREE.LineCurve3(v(points[0]),v(points[1])) : new THREE.CatmullRomCurve3(points.map(v),false,'centripetal'); }
function pipe(points, radius, material, parent=equipment) {
  const c=curve(points); const m=mesh(new THREE.TubeGeometry(c,Math.max(12,points.length*12),radius,12,false),material,parent);return m;
}
// Meter-scale, simplified general-series arrangement. No manufacturer CAD files are distributed.
for(const z of [-0.503,0.175]) box(0,.05,z,1.184,.1,.05);
for(const x of [-.567,.567,0])box(x,.05,-.164,.05,.1,.628);
for(const x of [-.567,.567]) for(const z of [-.503,.175])box(x,1.15,z,.05,2.1,.05);
for(const z of [-.503,.175])box(0,2.175,z,1.184,.05,.05);
for(const x of [-.567,.567]) for(const y of [.6,1.6,2.075])box(x,y,-.164,.05,.05,.628);
for(const y of [.6,1.6])box(0,y,-.165,1.084,.05,.05);

const modules=[], pickTargets=[];
for(const [index,x] of [-.38,0,.38].entries()) {
  const group=new THREE.Group(); group.position.set(x,.2,0);equipment.add(group);
  const shellMat=mat(0xc4d8d9,0.15,.35);
  const body=cylinder(.1125,1.5,0,.91,0,shellMat,group);
  body.userData.module=index;pickTargets.push(body);
  for(const [y,h,r] of [[.0675,.135,.1215],[.165,.06,.122],[.241,.092,.1215],[1.579,.092,.1215],[1.655,.06,.122],[1.7525,.135,.1215]]) {
    const cap=cylinder(r,h,0,y,0,capMat,group);cap.userData.module=index;pickTargets.push(cap);
    for(let k=0;k<16;k++){
      const a=k*Math.PI/8;cylinder(.0027,h*.88,Math.cos(a)*r,y,Math.sin(a)*r,capMat,group);
    }
  }
  for(const y of [.1575,1.6625]){cylinder(.138,.029,0,y,0,steel,group);box(0,y,0,.34,.018,.032,steel,group);}
  for(const y of [.4,1.4])ring(.116,.008,0,y,0,steel,group);
  for(const y of [.095,1.725])pipe([[0,y,0],[0,y,-.18]],.030,capMat,group);
  cylinder(.030,.04,0,1.84,0,capMat,group);
  cylinder(.010,.020,0,-.010,0,airMat,group);
  const fibers=new THREE.Group();group.add(fibers);fibers.visible=false;
  for(let k=0;k<45;k++){const a=k*2.39996,r=.088*Math.sqrt(k/45);cylinder(.002,1.47,Math.cos(a)*r,.91,Math.sin(a)*r,mat(0x67e6d3,.1,.4),fibers);}
  const canvas=document.createElement('canvas');canvas.width=256;canvas.height=128;
  const ctx=canvas.getContext('2d');ctx.fillStyle='#e6f2f2';ctx.fillRect(0,0,256,128);ctx.fillStyle='#28454e';ctx.font='bold 37px sans-serif';ctx.textAlign='center';ctx.fillText(`UF · 0${index+1}`,128,59);ctx.font='18px sans-serif';ctx.fillText('0915E / MODULE',128,93);
  const label=mesh(new THREE.PlaneGeometry(.135,.0675),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(canvas)}),group);label.position.set(0,.95,.1135);
  const halo=ring(.148,.003,0,.4,0,new THREE.MeshBasicMaterial({color:0x7ff4d5}),group);halo.visible=false;
  modules.push({group,body,shellMat,fibers,label,halo});
}
const services=createSkidServices();equipment.add(services.root);

let flowGroup=new THREE.Group();scene.add(flowGroup);
let flows=[],mode='filter',selected=null,section=false;
function addFlow(points,color,count=10,speed=.12,size=.008){
  const c=curve(points), material=new THREE.MeshBasicMaterial({color});
  const geometry=new THREE.SphereGeometry(size,6,5);
  const dots=[];for(let i=0;i<count;i++){const dot=new THREE.Mesh(geometry,material);flowGroup.add(dot);dots.push(dot);}
  const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints(c.getPoints(64)),new THREE.LineBasicMaterial({color,transparent:true,opacity:.20}));flowGroup.add(line);
  flows.push({c,dots,speed});
}
function rebuildFlows(){
  const geos=new Set(),mats=new Set();flowGroup.traverse(o=>{if(o.geometry)geos.add(o.geometry);if(o.material)mats.add(o.material);});geos.forEach(g=>g.dispose());mats.forEach(m=>m.dispose());scene.remove(flowGroup);flowGroup=new THREE.Group();scene.add(flowGroup);flows=[];
  const xs=selected===null?[-.38,0,.38]:[[-.38,0,.38][selected]];
  if(mode==='filter'){
    addFlow([[-.75,.14,-.327],[.62,.14,-.327]],0x4bd3ff,24);
    addFlow([[-.55,2.14,-.327],[.75,2.14,-.327]],0x73f3d4,24);
    for(const x of xs){
      addFlow([[x,.14,-.327],[x,.25,-.327],[x,.295,-.18],[x,.295,0],[x,.53,.14],[x,1.45,.14],[x,1.925,0],[x,1.925,-.25],[x,2.14,-.327]],0x54d6ff,27,.105);
      addFlow([[x,1.67,.03],[x,2.14,0],[.75,2.14,0]],0xf4b66a,11,.09,.006);
    }
  }else if(mode==='air'){
    addFlow([[-.75,.155,-.125],[.62,.155,-.125]],0xb7a8ff,24,.16);
    for(const x of xs){
      addFlow([[x,.155,-.125],[x,.155,-.04],[x,.2,0],[x,.38,0],[x,.6,.135],[x,1.67,.135],[x,2.14,0],[.75,2.14,0]],0xb7a8ff,32,.16,.009);
    }
  }else{
    addFlow([[.75,2.14,-.327],[-.6,2.14,-.327]],0x79f4d5,24,.12);
    for(const x of xs){addFlow([[x,2.14,-.327],[x,1.95,-.28],[x,1.925,0],[x,1.63,.14],[x,.48,.14],[x,.295,0],[x,.295,-.25],[x,.14,-.327],[-.75,.14,-.327]],0x79f4d5,30,.11);}
  }
}
const modeText={
  filter:['過濾模式','FILTRATION','由外而內，留下潔淨。','原水由下方側口進入，通過膜壁後，產水由上方側口流出。頂部軸向口用於濃水／排放。','產水流量','9.0','m³/h · 三支合計','跨膜壓差','0.35','bar'],
  air:['氣洗模式','AIR SCOUR','讓氣泡，帶走附著。','空氣經下方紫色總管，沿三條細管进入各支膜底的 3/8 吋氣口。上升氣泡擾動膜絲，示意清洗附著物。','進氣量','24.0','m³/h · 三支合計','模式示意時間','30','s · 非操作設定'],
  backwash:['反洗示意','BACKWASH CONCEPT','反向流動，理解清洗。','示意潔淨水從產水側反向通過膜壁，再由下側排放。此為通用 UF 教學動畫；TIPS 是否採用反洗須依實際產品程序。','示意反洗流量','12.0','m³/h · 非設計值','模式示意時間','40','s · 非操作設定']
};
function setMode(next){mode=next;const t=modeText[mode];['mode-caption','mode-label','mode-title','mode-description','metric-1-label','metric-1','unit-1','metric-2-label','metric-2','unit-2'].forEach((id,i)=>$(id).textContent=t[i]);document.querySelectorAll('[data-mode]').forEach(b=>{const yes=b.dataset.mode===mode;b.classList.toggle('active',yes);b.setAttribute('aria-pressed',String(yes));});document.documentElement.style.setProperty('--accent',mode==='air'?'#b7a8ff':'#78e3c5');rebuildFlows();}
function selectModule(i){selected=i;$('selected-id').textContent=i===null?'全部 × 3':`UF-0${i+1}`;modules.forEach((m,k)=>{m.halo.visible=k===i;m.shellMat.emissive.setHex(k===i?0x133f35:0);});rebuildFlows();}
document.querySelectorAll('[data-mode]').forEach(b=>b.addEventListener('click',()=>setMode(b.dataset.mode)));
$('section').addEventListener('click',()=>{section=!section;$('section').setAttribute('aria-pressed',String(section));modules.forEach(m=>{m.shellMat.transparent=section;m.shellMat.opacity=section?.15:1;m.shellMat.depthWrite=!section;m.shellMat.needsUpdate=true;m.fibers.visible=section;m.label.visible=!section;});});
$('rotate').addEventListener('click',()=>{controls.autoRotate=!controls.autoRotate;$('rotate').setAttribute('aria-pressed',String(controls.autoRotate));});
$('reset').addEventListener('click',()=>{camera.position.copy(initialPosition);controls.target.set(0,1.1,0);controls.autoRotate=false;$('rotate').setAttribute('aria-pressed','false');selectModule(null);controls.update();});
$('clear-selection').addEventListener('click',()=>selectModule(null));
const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();let down=[0,0];
renderer.domElement.addEventListener('pointerdown',e=>down=[e.clientX,e.clientY]);
renderer.domElement.addEventListener('pointerup',e=>{if(Math.hypot(e.clientX-down[0],e.clientY-down[1])>6)return;const r=renderer.domElement.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);raycaster.setFromCamera(pointer,camera);const hit=raycaster.intersectObjects(pickTargets)[0];if(singleView){const p=raycaster.intersectObjects(single.targets)[0];if(p)selectPart(p.object.userData.part);}else {const hits=raycaster.intersectObjects([...pickTargets,...services.targets]);const first=hits[0];if(first?.object.userData.serviceTag)selectService(first.object.userData.serviceTag);else if(first)selectModule(first.object.userData.module);}});
let selectedService=null;
const types={pipe:'原圖管段／軟管',extension:'新增連接段',fitting:'管件',valve:'氣動閥',instrument:'儀表'};
function spanLabel(o){return o.details.spanMm===undefined?'待確認':`${o.details.spanMm} mm（跨度）`;}
function selectService(tag){const o=services.items.find(x=>x.tag===tag);if(!o)return;selectedService=o;services.select(tag);$('service-name').textContent=`${tag} · ${o.name}`;$('service-material').textContent=o.details.material;$('service-span').textContent=spanLabel(o);$('service-cut').textContent='待確認';$('service-spec').textContent=o.details.od?`模型 OD ${o.details.od} / ID ${o.details.id} mm；DN及管制待定`:o.details.unit?`單位 ${o.details.unit}；量程待確認；讀值 —（未連線）`:'DN、壓力等級及安裝尺寸待確認';$('service-note').textContent=o.details.note;$('service-focus').hidden=false;document.querySelectorAll('[data-service]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.service===tag)));}
function renderServiceList(){const filter=$('service-filter').value;const list=$('service-list');list.replaceChildren();services.items.filter(o=>filter==='all'||o.type===filter).forEach(o=>{const b=document.createElement('button');b.dataset.service=o.tag;b.setAttribute('aria-pressed',String(selectedService?.tag===o.tag));const tag=document.createElement('b');tag.textContent=o.tag;const label=document.createElement('span');label.textContent=o.name;const note=document.createElement('small');note.textContent=o.details.spanMm!==undefined?spanLabel(o):types[o.type];b.append(tag,label,note);b.onclick=()=>selectService(o.tag);list.appendChild(b);});$('service-count').textContent=`${list.childElementCount} 個項目`;}
$('service-filter').onchange=renderServiceList;renderServiceList();
$('service-focus').onclick=()=>{if(!selectedService)return;const bounds=new THREE.Box3().setFromObject(selectedService.g),center=bounds.getCenter(new THREE.Vector3());const distance=Math.max(.5,bounds.getSize(new THREE.Vector3()).length()*2.4);const direction=camera.position.clone().sub(controls.target).normalize();controls.minDistance=.15;controls.target.copy(center);camera.position.copy(center).addScaledVector(direction,distance);controls.autoRotate=false;$('rotate').setAttribute('aria-pressed','false');controls.update();};
$('service-tags').onclick=()=>{const on=$('service-tags').getAttribute('aria-pressed')!=='true';$('service-tags').setAttribute('aria-pressed',String(on));services.showBadges(on);};
$('download-materials').onclick=()=>{const rows=[['編號','分類','名稱','數量','材質（暫定）','模型跨度mm','裁管長度mm','模型ODmm','模型IDmm','儀表單位','讀值','規格狀態'],...services.items.map(o=>[o.tag,types[o.type],o.name,1,o.details.material,o.details.spanMm??'待確認','待確認',o.details.od??'待確認',o.details.id??'待確認',o.details.unit??'',o.type==='instrument'?'未連線':'',o.details.note])];const csv='\ufeff'+rows.map(row=>row.map(cell=>'"'+String(cell).replaceAll('"','""')+'"').join(',')).join('\r\n');const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='UF0915E_SKID_materials_PROVISIONAL.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
if(import.meta.env.DEV)window.__ufServices=()=>services.items.map(o=>({tag:o.tag,type:o.type,details:o.details,meshes:o.g.children.filter(x=>x.isMesh).length}));
const observer=new ResizeObserver(()=>{const {width,height}=container.getBoundingClientRect();if(!width||!height)return;renderer.setSize(width,height);camera.aspect=width/height;camera.fov=width<650&&!singleView?48:35;camera.updateProjectionMatrix();});observer.observe(container);
setMode('filter');$('loading').hidden=true;
let selectedPartIndex=0;
function selectPart(i){selectedPartIndex=i;$('focus-part').hidden=false;const p=single.parts[i];single.select(i);$('part-name').textContent=p.name;$('part-note').textContent=`${p.location} · ${p.instance} / ${p.row.quantity} 件／組。${p.note}`;$('part-code').textContent=`料號 ${p.row.partNumber||'原表空白'} · ${p.row.drawingCode}`;$('part-material').textContent=`材質 ${p.row.material} · 實例 ${p.id}`;document.querySelectorAll('[data-part]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.part)===i)));}
single.bom.forEach(row=>{const group=document.createElement('div');group.className='bom-row';const name=document.createElement('div');name.className='bom-row-title';name.textContent=`${row.item} ${row.nameZh} × ${row.quantity}`;group.appendChild(name);single.parts.forEach((p,i)=>{if(p.item!==Number(row.item))return;const b=document.createElement('button');b.textContent=p.location;b.dataset.part=i;b.dataset.item=row.item;b.setAttribute('aria-pressed','false');b.onclick=()=>selectPart(i);group.appendChild(b);});$('part-list').appendChild(group);});
$('focus-part').onclick=()=>{const bounds=new THREE.Box3().setFromObject(single.parts[selectedPartIndex].g);const center=bounds.getCenter(new THREE.Vector3());const size=bounds.getSize(new THREE.Vector3()).length();const direction=camera.position.clone().sub(controls.target).normalize();controls.target.copy(center);camera.position.copy(center).addScaledVector(direction,Math.max(.32,size*2.8));controls.autoRotate=false;$('rotate').setAttribute('aria-pressed','false');controls.update();};
$('single-section').onclick=()=>{const on=$('single-section').getAttribute('aria-pressed')!=='true';$('single-section').setAttribute('aria-pressed',String(on));single.setSection(on);};
// Local-only geometry diagnostics used to verify part identity and reversible transforms.
if(import.meta.env.DEV){
 window.__ufSingle=single.inspect;
 window.__ufExportBOM=async()=>{
  const {GLTFExporter}=await import('three/addons/exporters/GLTFExporter.js');
  const model=single.root.clone(true);model.visible=true;model.name='UF0915E_14_BOM_22_INSTANCES_REFERENCE';
  for(const child of [...model.children]){if(child.isSprite){model.remove(child);continue;}const p=single.parts.find(p=>p.id===child.name);if(p){child.position.copy(p.origin);child.userData={bomItem:p.row.item,partNumber:p.row.partNumber,quantity:p.row.quantity,instance:p.instance,nameZh:p.row.nameZh,geometry:'approximate reconstruction',explodedOffset:p.offset.toArray()};}}
  model.traverse(o=>{if(o.isMesh){o.material=o.material.clone();o.material.emissive.setHex(0);o.material.wireframe=false;}});
  const data=await new GLTFExporter().parseAsync(model,{binary:true});const a=document.createElement('a');const url=URL.createObjectURL(new Blob([data],{type:'model/gltf-binary'}));a.href=url;a.download='UF0915E_14items_reference.glb';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
 };
}
const stageHeading=document.querySelector('.stage-heading'),originalHeading=stageHeading.innerHTML;
function setView(value){singleView=value;camera.fov=container.clientWidth<650&&!value?48:35;camera.updateProjectionMatrix();document.body.classList.toggle('single-display',value);controls.minDistance=value?.12:1.6;ground.position.y=value?-1.18:-.005;grid.position.y=value?-1.178:-.002;equipment.visible=!value;single.root.visible=value;flowGroup.visible=!value;$('skid-panel').hidden=value;$('single-panel').hidden=!value;$('section').hidden=value;$('show-single').setAttribute('aria-pressed',String(value));$('show-skid').setAttribute('aria-pressed',String(!value));stageHeading.innerHTML=value?'<span class="eyebrow">SINGLE MODULE / EXPLODED VIEW</span><h1>拆解，看見構造。</h1><p>單支 UF-0915E · 14 項 BOM 對照</p>':originalHeading;$('viewport').setAttribute('aria-label',value?'可拆解組合的單支 UF 模型':'可旋轉縮放的三支 UF 與 SKID 模型');$('mode-caption').textContent=value?'14 項 · 22 件／組':modeText[mode][0];document.querySelector('.stage-footer small').textContent=value?'拆解位移為展示安排，非維修步驟':'粒子表示流向，非流速比例';camera.position.copy(value?new THREE.Vector3(3.3,2.3,8.1):initialPosition);controls.target.set(0,value?.95:1.1,0);controls.autoRotate=false;$('rotate').setAttribute('aria-pressed','false');controls.update();}
$('show-single').onclick=()=>setView(true);$('show-skid').onclick=()=>setView(false);
if(location.hash==='#single')setView(true);
function setExplode(value){explodeTarget=value;$('explode-range').value=String(Math.round(value*100));$('explode-value').textContent=Math.round(value*100)+'%';}
$('explode').onclick=()=>setExplode(1);$('assemble').onclick=()=>setExplode(0);$('explode-range').oninput=e=>setExplode(Number(e.target.value)/100);
$('wireframe').onclick=()=>{const value=$('wireframe').getAttribute('aria-pressed')!=='true';$('wireframe').setAttribute('aria-pressed',String(value));single.root.traverse(o=>{if(o.isMesh)o.material.wireframe=value;});};
$('reset').addEventListener('click',()=>{if(singleView)setView(true);else{controls.minDistance=1.6;services.select(null);}});
let activeTime=0,last=performance.now();
renderer.setAnimationLoop(now=>{const dt=Math.max(0,Math.min((now-last)/1000,.05));last=now;explodeCurrent=reducedMotion?explodeTarget:THREE.MathUtils.damp(explodeCurrent,explodeTarget,7,dt);single.update(explodeCurrent);flowGroup.visible=!singleView;if(!document.hidden&&!reducedMotion)activeTime+=dt;for(const f of flows)f.dots.forEach((dot,i)=>dot.position.copy(f.c.getPointAt((activeTime*f.speed+i/f.dots.length)%1)));controls.update();renderer.render(scene,camera);});

