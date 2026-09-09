import * as THREE from 'three';
export function createSingle(){
 const root=new THREE.Group(),parts=[],targets=[];
 const material=(color,metalness=.15)=>new THREE.MeshStandardMaterial({color,metalness,roughness:.35});
 const shell=material(0xc4d8d9),cap=material(0x769ba5),steel=material(0x82969b,.8),seal=material(0x273136),air=material(0x9a87da),fiber=material(0x78dfc4);
 function part(name,note,offset){const g=new THREE.Group();root.add(g);const p={g,name,note,offset:new THREE.Vector3(...offset)};parts.push(p);return p;}
 function add(p,geometry,mat,x,y,z){const m=new THREE.Mesh(geometry,mat.clone());m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;m.userData.part=parts.indexOf(p);p.g.add(m);targets.push(m);return m;}
 function cyl(p,r,h,y,mat,x=0,z=0){return add(p,new THREE.CylinderGeometry(r,r,h,40),mat,x,y,z);}
 function ring(p,r,t,y,mat){const m=add(p,new THREE.TorusGeometry(r,t,10,48),mat,0,y,0);m.rotation.x=Math.PI/2;}
 const body=part('筒身外殼','外形與壁厚為展示重建，非製造尺寸。',[.52,0,0]);
 const shape=new THREE.Shape();shape.absarc(0,0,.1125,0,Math.PI*2,false);const hole=new THREE.Path();hole.absarc(0,0,.105,0,Math.PI*2,true);shape.holes.push(hole);
 const tube=add(body,new THREE.ExtrudeGeometry(shape,{depth:1.5,bevelEnabled:false,curveSegments:48}),shell,0,.18,0);tube.rotation.x=-Math.PI/2;
 const core=part('膜絲束｜內部示意','膜絲數量、灌封與內部構造為示意，不列為已確認的可拆零件。',[0,0,0]);
 for(let k=0;k<65;k++){const a=k*2.39996,r=.084*Math.sqrt(k/65);cyl(core,.0025,1.46,.93,fiber,Math.cos(a)*r,Math.sin(a)*r);}
 for(const y of [.205,1.655])cyl(core,.101,.035,y,cap);
 for(const [label,y,sign] of [['上',1.765,1],['下',.095,-1]]){
 const p=part(label+'端蓋組','端蓋及側口保留為一組；細部形狀待原圖逐件核對。',[0,sign*.55,0]);cyl(p,.1215,.17,y,cap);
 const port=cyl(p,.03,.18,y,cap,0,-.15);port.rotation.x=Math.PI/2;
 for(let k=0;k<16;k++){const a=k*Math.PI/8;cyl(p,.003,.14,y,cap,Math.cos(a)*.122,Math.sin(a)*.122);}
 const c=part(label+'固定環｜示意','金屬固定件造型為示意，尚未對應原圖料號。',[0,sign*.34,0]);ring(c,.127,.008,sign>0?1.68:.18,steel);
 const s=part(label+'密封環｜示意','密封圈斷面與安裝位置待核對。',[0,sign*.18,0]);ring(s,.108,.004,sign>0?1.665:.195,seal);
 }
 const top=part('頂部軸向接頭','濃水／排放口外形示意。',[0,.82,0]);cyl(top,.03,.045,1.875,cap);ring(top,.035,.004,1.9,steel);
 const bottom=part('底部進氣接頭','保留最下方進氣口；3/8 吋標示不等同於螺紋外徑。',[0,-.83,0]);cyl(bottom,.012,.045,-.012,air);cyl(bottom,.017,.015,.012,air);
 function update(t){parts.forEach(p=>p.g.position.copy(p.offset).multiplyScalar(t));}
 function select(i){parts.forEach((p,k)=>p.g.traverse(o=>{if(o.isMesh)o.material.emissive.setHex(k===i?0x245e4a:0);}));}
 return {root,parts,targets,update,select};
}
