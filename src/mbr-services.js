import * as THREE from 'three';

// Memstar GA drawings: cyan = water, yellow = air. Geometry is a reference
// reconstruction; nominal pipe sizes do not specify every fitting dimension.
export const serviceColors={water:0x149fad,air:0xe9ae16,frame:0x526888};
export function createServices({L,W,H,rows,perRow,moduleH,layers,moduleW,mode,addPart,mesh}){
  const waterMat=new THREE.MeshStandardMaterial({color:serviceColors.water,roughness:.48});
  const airMat=new THREE.MeshStandardMaterial({color:serviceColors.air,roughness:.48});
  const dark=new THREE.MeshStandardMaterial({color:0x293b43,roughness:.8});
  const sealMat=new THREE.MeshStandardMaterial({color:0xb8763f,roughness:.7});
  const water=addPart('water-network',[0,0,0],[-.3,.25,-.35]);
  const air=addPart('air-network',[0,0,0],[.25,.1,.38]);
  const diffuser=addPart('diffuser-bank',[0,0,0],[0,-.38,0]);
  function pipe(parent,a,b,r,mat){const av=new THREE.Vector3(...a),bv=new THREE.Vector3(...b),d=bv.clone().sub(av);const m=mesh(new THREE.CylinderGeometry(r,r,d.length(),16),mat,parent,av.clone().add(bv).multiplyScalar(.5).toArray());m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());return m;}
  function beam(parent,a,b,width,height,mat){const av=new THREE.Vector3(...a),bv=new THREE.Vector3(...b),d=bv.clone().sub(av);const m=mesh(new THREE.BoxGeometry(width,height,d.length()),mat,parent,av.clone().add(bv).multiplyScalar(.5).toArray());m.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),d.normalize());return m;}
  const minX=-L*.41,maxX=L*.41,waterX=minX+.12,airX=minX+.3,airZ=W*.43;
  const lowerCenter=H*.49-(layers-1)/2*H*.46;
  const moduleBottom=lowerCenter-moduleH/2,boxHeight=Math.min(.155,H*.06);
  const boxTop=Math.max(.13,moduleBottom-.045),boxY=boxTop-boxHeight/2;
  // Water collection rails at the module header elevations, with vertical riser.
  pipe(water,[waterX,moduleBottom,0],[waterX,H+.15,0],.043,waterMat);
  pipe(water,[waterX,H+.15,0],[waterX-.22,H+.15,0],.043,waterMat);
  for(let layer=0;layer<layers;layer++){
    const center=H*.49+(layer-(layers-1)/2)*H*.46;
    for(const yy of [center-moduleH/2,center+moduleH/2]){
      beam(water,[minX,yy,0],[maxX,yy,0],.075,.06,waterMat);
      for(let row=0;row<rows;row++)for(let i=0;i<perRow;i++){
        const x=(i-(perRow-1)/2)*(L*.82/Math.max(perRow-1,1)),z=(row-(rows-1)/2)*W*.48;
        const end=rows===1?moduleW/2:z-Math.sign(z)*moduleW/2;
        pipe(water,[x,yy,0],[x,yy,end],.012,waterMat);
      }
    }
  }
  // Air riser supplies a low distribution rail; air never joins water rails.
  pipe(air,[airX,boxY,airZ],[airX,H+.15,airZ],.034,airMat);
  pipe(air,[airX,H+.15,airZ],[airX-.22,H+.15,airZ],.034,airMat);
  beam(air,[minX,boxY,airZ],[maxX,boxY,airZ],.05,.07,airMat);
  const boxWidth=Math.min(.065,L*.82/Math.max(perRow-1,1)*.65);
  for(let row=0;row<rows;row++){
    const z=(row-(rows-1)/2)*W*.48,span=moduleW;
    for(let i=0;i<perRow;i++){
      const x=(i-(perRow-1)/2)*(L*.82/Math.max(perRow-1,1));
      pipe(diffuser,[x,boxY,airZ],[x,boxY,z+span/2],.009,airMat);
      if(mode==='perforated'){
        pipe(diffuser,[x,boxY,z-span/2],[x,boxY,z+span/2],.012,airMat);
        // Dark aperture markers: hole size/pitch illustrative, not drill data.
        for(let j=0;j<12;j++){const zz=z-span*.45+j*span*.9/11;const hole=mesh(new THREE.CircleGeometry(.003,10),dark,diffuser,[x,boxY+.0121,zz]);hole.rotation.x=-Math.PI/2;}
      }else{
        // A21: elongated chamber with three top outlets; side walls and end
        // walls leave the underside open. Not a circular fine-bubble disc.
        for(const xx of [-boxWidth/2,boxWidth/2])mesh(new THREE.BoxGeometry(.004,boxHeight,span),airMat,diffuser,[x+xx,boxY,z]);
        for(const zz of [-span/2,span/2])mesh(new THREE.BoxGeometry(boxWidth,boxHeight,.004),airMat,diffuser,[x,boxY,z+zz]);
        const shape=new THREE.Shape();shape.moveTo(-boxWidth/2,-span/2);shape.lineTo(boxWidth/2,-span/2);shape.lineTo(boxWidth/2,span/2);shape.lineTo(-boxWidth/2,span/2);shape.closePath();
        for(const zz of [-span*.32,0,span*.32]){const hole=new THREE.Path();hole.absarc(0,zz,.014,0,Math.PI*2,true);shape.holes.push(hole);}
        const top=mesh(new THREE.ExtrudeGeometry(shape,{depth:.004,bevelEnabled:false,curveSegments:12}),airMat,diffuser,[x,boxTop,z]);top.rotation.x=Math.PI/2;
        for(const zz of [-span*.32,0,span*.32]){
          const ring=mesh(new THREE.TorusGeometry(.016,.002,6,16),sealMat,diffuser,[x,boxTop+.002,z+zz]);ring.rotation.x=Math.PI/2;
          mesh(new THREE.CylinderGeometry(.018,.018,boxHeight*.7,16,1,true),sealMat,diffuser,[x,boxY+.005,z+zz]);
        }
        for(let j=1;j<=5;j++)mesh(new THREE.BoxGeometry(boxWidth-.006,boxHeight-.01,.003),airMat,diffuser,[x,boxY,z-span/2+j*span/6]);
      }
    }
  }
  diffuser.userData={mode,units:rows*perRow,outletsPerBox:mode==='esas'?3:0,geometryStatus:'reference'};
  return {water,air,diffuser};
}
