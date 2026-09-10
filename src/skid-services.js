import { pipeSpecs, applyPipeSpec } from './pipe-specs.js';
import * as THREE from 'three';
import schedule from './skid-pipes.json';

export function createSkidServices(){
 const root=new THREE.Group(),items=[],targets=[],badges=[];
 const pvc=new THREE.MeshStandardMaterial({color:0x8bafb6,roughness:.58});
 const gas=new THREE.MeshStandardMaterial({color:0x9d8acb,roughness:.5});
 const black=new THREE.MeshStandardMaterial({color:0x203b48,roughness:.43});
 const metal=new THREE.MeshStandardMaterial({color:0xb5c7c9,metalness:.75,roughness:.3});
 const orange=new THREE.MeshStandardMaterial({color:0xe0a356,roughness:.38});
 const cyan=new THREE.MeshStandardMaterial({color:0x5ad5c7,roughness:.4});
 const v=a=>new THREE.Vector3(...a), cad=a=>[(a[0]-592)/1000,a[2]/1000,(225-a[1])/1000];
 function item(tag,type,name,position,details={}){const g=new THREE.Group();g.position.copy(v(position));g.name=tag;root.add(g);const obj={tag,type,name,g,details};items.push(obj);return obj;}
 function mesh(o,geo,position,mat=pvc){const m=new THREE.Mesh(geo,mat.clone());m.position.copy(v(position));m.castShadow=true;m.receiveShadow=true;m.userData.serviceTag=o.tag;o.g.add(m);targets.push(m);return m;}
 function pipe(o,a,b,r,mat=pvc){const start=v(a),end=v(b),delta=end.clone().sub(start);const m=mesh(o,new THREE.CylinderGeometry(r,r,delta.length(),24),start.add(end).multiplyScalar(.5).toArray(),mat);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());return m;}
 function box(o,a,size,mat){return mesh(o,new THREE.BoxGeometry(...size),a,mat);}
 function collar(o,position,r,axis='x',mat=pvc){const m=mesh(o,new THREE.TorusGeometry(r,.006,8,32),position,mat);if(axis==='x')m.rotation.y=Math.PI/2;if(axis==='y')m.rotation.x=Math.PI/2;return m;}
 function badge(o){const c=document.createElement('canvas');c.width=256;c.height=64;const ctx=c.getContext('2d');ctx.fillStyle='#0d2933';ctx.fillRect(0,0,256,64);ctx.strokeStyle='#76d9c3';ctx.lineWidth=3;ctx.strokeRect(2,2,252,60);ctx.fillStyle='#d6f8ed';ctx.font='bold 30px sans-serif';ctx.textAlign='center';ctx.fillText(o.tag,128,43);const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(c),depthTest:false}));sp.scale.set(.26,.065,1);const labelOffsets={'XV-103':[.03,.42,0],'PT-103':[-.1,.57,0],'FIT-102':[.1,.33,0],'FIT-101':[-.1,.46,0],'XV-101':[.05,.35,0],'XV-105':[-.08,.55,0],'PT-101':[.05,.3,0]};sp.position.copy(v(labelOffsets[o.tag]||[0,.26,0]));sp.visible=false;sp.renderOrder=4;o.g.add(sp);badges.push(sp);}
 for(const s of schedule.segments){const a=cad(s.startMm),b=cad(s.endMm);const o=item(s.tag,'pipe',s.service+'管段',[0,0,0],{service:s.service,material:s.materialProposed,spanMm:s.modelSpanMm,cutLengthMm:null,od:s.modelODmm,id:s.modelIDmm,note:'以1184 × 728 × 2200 mm架體及原管路座標校準比例，估長取整至10 mm。'});applyPipeSpec(o.details,s.service==='氣洗空氣'?'airMain':s.modelODmm>90?'waterMain':'waterBranch');pipe(o,a,b,o.details.od/2000,s.service==='氣洗空氣'?gas:pvc);}
 // Visible fitting envelopes at original branch junctions. No manufacturer engagement lengths assumed.
 for(const [j,x] of [-.38,0,.38].entries()){
  for(const [code,y,axis] of [['FW',.14,'y'],['PW',2.14,'y'],['CW',2.14,'y']]){const z=code==='CW'?0:-.327;const o=item(`TEE-${code}-${j+1}`,'fitting','總管異徑三通',[x,y,z],{material:'PVC-U 暫定',note:'分支三通外形示意；暫配公制d110主管／d63支管，管件承口與製品尺寸另選。'});pipe(o,[-.072,0,0],[.072,0,0],.061);pipe(o,[0,0,0],[0,code==='FW'?.07:-.07,0],.035);collar(o,[-.068,0,0],.06);collar(o,[.068,0,0],.06);}
  for(const [code,y] of [['FW',.295],['PW',1.925]]){const o=item(`ELB-${code}-${j+1}`,'fitting','90°彎頭',[x,y,-.327],{material:'PVC-U 暫定',note:'90°轉向外形示意；中心至承口尺寸待選型。原管段交接尚未轉成裁管尺寸。'});mesh(o,new THREE.SphereGeometry(.037,20,12),[0,0,0]);collar(o,[0,0,.047],.032,'z');collar(o,[0,code==='FW'?-.047:.047,0],.032,'y');}
  const a=item(`AIR-TAKE-${j+1}`,'fitting','氣洗分支取氣件',[x,.155,-.125],{material:'氣體用途材質待選',note:'取氣件形式及接管壓力等級待定，不使用一般PVC壓縮空氣配管。'});pipe(a,[0,0,0],[0,0,.031],.009,gas);
  const h=item(`AS-HOSE-${j+1}`,'pipe','氣洗軟管',[0,0,0],{material:'額定氣體軟管待選',spanMm:109.27,cutLengthMm:null,od:10,id:6,note:'依原圖彎曲路由估計109.27 mm，每條先抓110 mm，不另加裝配餘量。'});applyPipeSpec(h.details,'airHose');h.details.spanMm=Number((30*Math.PI/2+64).toFixed(3));h.details.note='按Festo最小彎曲半徑28mm，示意路由改為R30四分之一圓弧＋64mm直段，估長仍抓110mm。';class Bend extends THREE.Curve{getPoint(t,target=new THREE.Vector3()){const a=t*Math.PI/2;return target.set(x,.185-.03*Math.sin(a),-.03+.03*Math.cos(a));}}const curve=new THREE.CurvePath();curve.add(new Bend());curve.add(new THREE.LineCurve3(v([x,.155,-.03]),v([x,.155,-.094])));mesh(h,new THREE.TubeGeometry(curve,48,.005,8,false),[0,0,0],gas);
 }
 // Extensions have their own spans; never included in the original 6.282 m subtotal.
 function extension(tag,service,a,b,material='PVC-U 暫定',r=.055){const o=item(tag,'extension',service+'新增連接段',[0,0,0],{material,od:r*2000,spanMm:Math.round(v(a).distanceTo(v(b))*1000),cutLengthMm:null,note:'新增連接段依相同SKID模型比例估長，包含閥件／儀表占位。'});applyPipeSpec(o.details,material.startsWith('PVC')?'waterMain':'airMain');pipe(o,a,b,o.details.od/2000,material.startsWith('PVC')?pvc:gas);}
 extension('FW-EXT-01','原水',[-1.4,.14,-.327],[-.675,.14,-.327]);
 extension('PW-EXT-01','產水',[.675,2.14,-.327],[1.4,2.14,-.327]);
 extension('CW-EXT-01','上排放',[.675,2.14,0],[1.1,2.14,0]);
 extension('DW-EXT-01','下排放',[.52,.14,-.327],[.52,.14,-.8]);
 extension('AS-EXT-01','氣洗',[-1.1,.155,-.125],[-.675,.155,-.125],'氣體用途材質待選',.0315);
 const drain=item('TEE-DW-01','fitting','新增下排放三通',[.52,.14,-.327],{material:'PVC-U 暫定',note:'配合XV-104，未包含於原DWG 9個分支三通。'});pipe(drain,[-.06,0,0],[.06,0,0],.06);pipe(drain,[0,0,0],[0,0,-.065],.055);
 function valve(tag,name,pos,axis='x',isAir=false){const o=item(tag,'valve',name,pos,{material:isAir?'氣體用途閥；材質待選':'PVC-U 閥體暫定',actuator:'氣動；單／雙動待確認',note:'二通開關閥外形示意。DN、壓力等級、閥體長度、失氣位置、電磁閥電壓及密封材質待確認；不顯示未確認的開關狀態。'});const a=axis==='x'?[-.08,0,0]:[0,0,-.08],b=axis==='x'?[.08,0,0]:[0,0,.08];pipe(o,a,b,isAir?.045:.071,isAir?gas:pvc);collar(o,a,isAir?.045:.071,axis);collar(o,b,isAir?.045:.071,axis);pipe(o,[0,0,0],[0,.13,0],.013,metal);box(o,[0,.15,0],[.17,.075,.09],orange);box(o,[.1,.15,0],[.035,.065,.06],black);box(o,[0,.204,0],[.06,.025,.06],black);badge(o);}
 valve('XV-101','原水氣動閥',[-.89,.14,-.327]);valve('XV-102','產水氣動閥',[.88,2.14,-.327]);valve('XV-103','上排放氣動閥',[.88,2.14,0]);valve('XV-104','下排放氣動閥',[.52,.14,-.63],'z');valve('XV-105','氣洗氣動閥',[-.88,.155,-.125],'x',true);
 function pressure(tag,name,pos){const o=item(tag,'instrument',name,pos,{material:'接液材質待選',unit:'bar',reading:null,note:'壓力傳送器＋取壓支管示意。量程、接液材質、取壓隔離及訊號待確認；無即時量測。'});pipe(o,[0,0,0],[0,.14,0],.009,metal);box(o,[0,.19,0],[.075,.085,.045],cyan);box(o,[0,.192,.024],[.05,.038,.004],black);badge(o);}
 pressure('PT-101','原水壓力',[-.48,.14,-.327]);pressure('PT-102','產水壓力',[-.48,2.14,-.327]);pressure('PT-103','濃水壓力',[.45,2.14,0]);
 function flow(tag,name,pos){const o=item(tag,'instrument',name,pos,{material:'接液材質待選',unit:'m³/h',reading:null,note:'管段式流量計占位。型式、DN、量程、直管段及安裝條件待選型；無即時量測。'});pipe(o,[-.08,0,0],[.08,0,0],.068,metal);box(o,[0,.125,0],[.105,.085,.07],cyan);pipe(o,[0,.06,0],[0,.09,0],.014,metal);box(o,[0,.13,.037],[.07,.045,.004],black);badge(o);}
 flow('FIT-101','原水流量',[-1.2,.14,-.327]);flow('FIT-102','產水流量',[1.2,2.14,-.327]);
 const turb=item('AIT-101','instrument','產水濁度',[.79,1.30,.22],{material:'接液材質待選',unit:'NTU',reading:null,note:'旁流濁度計／流通池占位。取樣從產水側引出，樣品出口終點僅示意，排水或回流方案、調流與隔離閥待定；量程未定、無即時量測。'});box(turb,[0,0,0],[.16,.22,.10],black);box(turb,[0,.04,.055],[.12,.10,.008],cyan);pipe(turb,[0,-.2,0],[0,-.12,0],.025,metal);badge(turb);
 const sample=item('SAMPLE-PW-01','extension','產水濁度取樣／排樣管',[0,0,0],{material:'取樣管材待選',od:8,spanMm:Math.round((.84+Math.hypot(.15,.547)+.2)*1000),cutLengthMm:null,note:'取樣與排樣管依目前畫面路由比例估長，含0.84m取樣下降段、斜接段及0.20m排樣段。'});applyPipeSpec(sample.details,'sample');pipe(sample,[.64,2.14,-.327],[.64,1.3,-.327],.004,cyan);pipe(sample,[.64,1.3,-.327],[.79,1.3,.22],.004,cyan);pipe(sample,[.79,1.10,.22],[.79,.9,.22],.004,cyan);
 for(const o of items){if(o.type==='fitting'){o.details.connection=o.tag.startsWith('ELB')?'公制 d63 × d63 · 90°':o.tag==='TEE-DW-01'?'公制 d110 × d110 × d110':o.tag.startsWith('TEE')?'公制 d110 × d110 × d63':'OD60.5氣洗總管 → OD10氣管，轉接型式待選';}if(o.type==='valve')o.details.connection=o.tag==='XV-105'?'接OD60.5氣洗總管，閥門端接另選':'接公制d110水管，閥門端接另選';if(o.type==='instrument')o.details.connection=o.tag.startsWith('FIT')?'安裝於公制d110水管，儀表端接另選':o.tag==='AIT-101'?'取樣管OD8，儀表接頭另選':'取壓支管接頭依儀表選型';if(['pipe','extension'].includes(o.type)&&Number.isFinite(o.details.spanMm)){o.details.estimatedLengthMm=Math.round(o.details.spanMm/10)*10;o.details.estimateBasis='依SKID比例及管段路由，四捨五入至10 mm，含管件占位；未加損耗';}}
 function select(tag){items.forEach(o=>o.g.traverse(m=>{if(m.isMesh)m.material.emissive.setHex(o.tag===tag?0x245e4a:0);}));}
 function showBadges(value){badges.forEach(b=>b.visible=value);}
 return {root,items,targets,select,showBadges};
}
