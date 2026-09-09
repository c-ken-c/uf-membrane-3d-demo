import * as THREE from 'three';
import bom from './bom.json';

// Meters. BOM identity and O-ring dimensions follow GS-TECH-122.
// Unspecified shapes and assembled offsets are reference reconstruction, not OEM CAD.
export function createSingle() {
 const root=new THREE.Group(),parts=[],targets=[],labels=[],shells=[];
 const materials={UPVC:new THREE.MeshStandardMaterial({color:0xbcd4d7,roughness:.34}),ABS:new THREE.MeshStandardMaterial({color:0x7b8d99,roughness:.4}),EPDM:new THREE.MeshStandardMaterial({color:0x35444c,roughness:.75}),SUS304:new THREE.MeshStandardMaterial({color:0x91a5aa,metalness:.85,roughness:.28}),PE:new THREE.MeshStandardMaterial({color:0x506674,roughness:.65})};
 const airMat=new THREE.MeshStandardMaterial({color:0xa498da,roughness:.35});
 const fiberMat=new THREE.MeshStandardMaterial({color:0x75d6c4,roughness:.55});
 const locationNames={bottom_air:'底部進氣',bottom:'下端',top:'上端',core:'核心',top_center:'上端中心',bottom_side:'下側水口',top_side:'上側水口',top_axial:'頂部水口',body_lower:'筒身下段',body_upper:'筒身上段'};
 function part(item,instance,position,offset) {
  const row=bom[item-1],g=new THREE.Group();g.position.set(...position);root.add(g);
  const p={g,item,instance,id:`UF0915E_${row.item}_${String(instance).padStart(2,'0')}`,name:`${row.item} · ${row.nameZh}`,note:row.note,row,location:locationNames[row.locations[instance-1]],origin:g.position.clone(),offset:new THREE.Vector3(...offset)};
  parts.push(p);g.name=p.id;return p;
 }
 function add(p,geo,pos=[0,0,0],material=materials[p.row.material]) {const m=new THREE.Mesh(geo,material.clone());m.position.set(...pos);m.castShadow=true;m.receiveShadow=true;m.userData.part=parts.indexOf(p);p.g.add(m);targets.push(m);return m;}
 function tube(p,outer,inner,h,y=0,mat,segments=48) {
  const s=new THREE.Shape();s.absarc(0,0,outer,0,Math.PI*2,false);const hole=new THREE.Path();hole.absarc(0,0,inner,0,Math.PI*2,true);s.holes.push(hole);
  const m=add(p,new THREE.ExtrudeGeometry(s,{depth:h,bevelEnabled:false,curveSegments:segments}),[0,y-h/2,0],mat);m.rotation.x=-Math.PI/2;return m;
 }
 function cyl(p,r,h,y=0,mat,sides=40){return add(p,new THREE.CylinderGeometry(r,r,h,sides),[0,y,0],mat);}
 function box(p,w,h,d,pos,mat){return add(p,new THREE.BoxGeometry(w,h,d),pos,mat);}
 function ring(p,outer,section,y=0){const m=add(p,new THREE.TorusGeometry((outer-section)/2,section/2,12,64),[0,y,0]);m.rotation.x=Math.PI/2;return m;}
 function ribs(p,r,h,y,count=16){for(let j=0;j<count;j++){const a=j*Math.PI*2/count;const m=box(p,.007,h,.012,[r*Math.cos(a),y,r*Math.sin(a)]);m.rotation.y=-a;}}
 function port(p,y){const m=tube(p,.03175,.025,.065,0);m.rotation.x=Math.PI/2;m.position.set(0,y,-.12);}
 function cap(p,isTop){tube(p,.1215,.105,.13);tube(p,.1215,isTop?.026:.008,.012,isTop?.071:-.071);ribs(p,.122,.114,0);port(p,isTop?-.015:.015);if(isTop)tube(p,.03175,.025,.04,.095);else tube(p,.012,.005,.025,-.09,airMat);}
 function bolt(p,x,y,z,diameter,length){const m=add(p,new THREE.CylinderGeometry(diameter/2,diameter/2,length,12),[x,y,z],materials.SUS304);m.rotation.x=Math.PI/2;for(const a of [-1,1]){const n=add(p,new THREE.CylinderGeometry(diameter*.85,diameter*.85,.01,6),[x,y,z+a*length/2],materials.SUS304);n.rotation.x=Math.PI/2;}}
 // 07 remains one BOM assembly: barrel, bonded end collars, potting and illustrative fibers.
 const core=part(7,1,[0,.91,0],[0,0,0]);shells.push(tube(core,.1125,.105,1.43));
 for(const y of [-.674,.674]){tube(core,.1215,.102,.092,y);ribs(core,.122,.082,y);}
 const fibers=new THREE.Group();core.g.add(fibers);fibers.visible=false;
 for(let k=0;k<65;k++){const a=k*2.39996,r=.088*Math.sqrt(k/65),m=add(core,new THREE.CylinderGeometry(.002, .002,1.36,6),[Math.cos(a)*r,0,Math.sin(a)*r],fiberMat);fibers.attach(m);}
 for(const y of [-.67,.67])cyl(core,.103,.03,y);
 // 04 / 12 bonded end-cap assemblies are moved as single objects.
 cap(part(4,1,[0,.0675,0],[0,-.52,0]),false);
 cap(part(12,1,[0,1.7525,0],[0,.64,0]),true);
 // 05 clamp sets, including M12 x 70 bolt representations.
 for(const [j,y,offset] of [[1,.165,-.32],[2,1.655,.37]]){const p=part(5,j,[0,y,0],[0,offset,0]);tube(p,.137,.124,.022);for(const x of [-.145,.145]){box(p,.036,.019,.047,[x,0,0]);bolt(p,x,0,0,.012,.070);}}
 // 06 outer diameter 243 / section 7; 08 outer diameter 60 / section 4.2.
 ring(part(6,1,[0,.192,0],[0,-.15,0]),.243,.007);
 ring(part(6,2,[0,1.628,0],[0,.16,0]),.243,.007);
 ring(part(8,1,[0,1.668,0],[0,.46,0]),.060,.0042);
 const center=part(9,1,[0,1.705,0],[0,.53,0]);tube(center,.03,.022,.064);for(const y of [-.025,0,.025])tube(center,.034,.022,.007,y);
 // Bottom inlet accessories: preserve ambiguous source designation for item 02.
 const gasket=part(3,1,[0,-.014,0],[0,-.69,0]);tube(gasket,.014,.005,.004);
 const plug=part(2,1,[0,-.026,0],[0,-.84,0]);cyl(plug,.011,.012,0,undefined,6);tube(plug,.0083,.005,.012,.009);
 const inlet=part(1,1,[0,-.048,0],[0,-1.01,0]);tube(inlet,.0083,.003,.013,.014,airMat);cyl(inlet,.01,.008,.004,airMat,6);tube(inlet,.007,.003,.022,-.011,airMat);for(const y of [-.009,-.015,-.021])tube(inlet,.008,.003,.003,y,airMat);
 // Three DN50 unions and end caps. Nominal DN is not an outside diameter.
 const ports=[{pos:[0,.0825,-.185],off:[.48,-.52,-.23],axis:'side'},{pos:[0,1.7375,-.185],off:[.48,.64,-.23],axis:'side'},{pos:[0,1.86,0],off:[0,.88,0],axis:'top'}];
 ports.forEach((q,i)=>{
  const p=part(10,i+1,q.pos,q.off);tube(p,.042,.03,.034);ribs(p,.042,.027,0,12);if(q.axis==='side')p.g.rotation.x=-Math.PI/2;
  const pos=q.pos.slice(),off=q.off.slice();if(q.axis==='side'){pos[2]-=.035;off[2]-=.10;off[0]+=.28;}else{pos[1]+=.035;off[1]+=.19;}
  const end=part(11,i+1,pos,off);tube(end,.033,.026,.02);cyl(end,.033,.004,.012);if(q.axis==='side')end.g.rotation.x=-Math.PI/2;
 });
 // Body tie bands 13 differ from end clamps 05. Hardware is subordinate geometry.
 for(const [j,y] of [[1,.52],[2,1.3]]){
  const p=part(13,j,[0,y,0],[.5,0,0]);tube(p,.117,.114,.027);for(const x of [-.133,.133]){box(p,.04,.026,.023,[x,0,-.06]);bolt(p,x,0,-.07,.008,.090);}tube(p,.114,.1125,.025,0,materials.EPDM);
  const spacer=part(14,j,[0,y,-.136],[-.42,0,-.12]);box(spacer,.13,.055,.045,[0,0,0]);box(spacer,.17,.014,.06,[0,-.033,0]);
 }
 // Number badges appear only when spread. Mesh membership remains 22 BOM instances.
 for(const p of parts){const c=document.createElement('canvas');c.width=128;c.height=64;const ctx=c.getContext('2d');ctx.fillStyle='#102a32';ctx.fillRect(0,0,128,64);ctx.strokeStyle='#75dac4';ctx.lineWidth=3;ctx.strokeRect(2,2,124,60);ctx.fillStyle='#d6f8ed';ctx.font='bold 30px sans-serif';ctx.textAlign='center';ctx.fillText(p.row.item+(p.row.quantity>1?'.'+p.instance:''),64,43);const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(c),depthTest:false}));sp.scale.set(.18,.09,1);sp.renderOrder=5;root.add(sp);labels.push({p,sp});}
 function update(t){parts.forEach(p=>p.g.position.copy(p.origin).addScaledVector(p.offset,t));root.updateMatrixWorld(true);labels.forEach(({p,sp})=>{sp.visible=t>.15;sp.position.copy(p.g.position);sp.position.x+=p.item===14?-.19:.2;});}
 function select(i){parts.forEach((p,k)=>p.g.traverse(o=>{if(o.isMesh)o.material.emissive.setHex(k===i?0x245e4a:0);}));}
 function setSection(value){fibers.visible=value;shells.forEach(m=>{m.material.transparent=value;m.material.opacity=value?.14:1;m.material.depthWrite=!value;m.material.needsUpdate=true;});}
 function inspect(){return {bomItems:bom.length,instances:parts.map(p=>({id:p.id,item:p.item,position:p.g.position.toArray(),origin:p.origin.toArray(),offset:p.offset.toArray(),meshes:p.g.children.filter(o=>o.isMesh).length})),labels:labels.length};}
 update(0);return {root,parts,targets,update,select,setSection,inspect,bom};
}
