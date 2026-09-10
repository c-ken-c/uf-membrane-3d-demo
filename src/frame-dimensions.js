import * as THREE from 'three';

export function createFrameDimensions() {
  const root = new THREE.Group();
  root.name = 'SKID frame dimensions (mm)';
  const material = new THREE.LineBasicMaterial({ color: 0xa3e5e0 });
  function dimension(a, b, fromA, fromB, text, position) {
    const points = [a, b, fromA, a, fromB, b];
    for (const p of [a, b]) points.push([p[0]-.025,p[1]-.025,p[2]], [p[0]+.025,p[1]+.025,p[2]]);
    root.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(points.map(p=>new THREE.Vector3(...p))), material));
    const canvas = document.createElement('canvas'); canvas.width=512; canvas.height=96;
    const ctx=canvas.getContext('2d');ctx.fillStyle='#102b34';ctx.fillRect(0,0,512,96);
    ctx.fillStyle='#d9fff6';ctx.font='bold 42px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,256,48);
    const label=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(canvas),depthTest:false}));
    label.position.set(...position);label.scale.set(.49,.092,1);root.add(label);
  }
  dimension([-.592,.03,.43],[.592,.03,.43],[-.592,.03,.2],[.592,.03,.2],'W 1184 mm',[0,.03,.48]);
  dimension([.79,.03,-.528],[.79,.03,.2],[.592,.03,-.528],[.592,.03,.2],'D 728 mm',[.91,.03,-.164]);
  dimension([-.79,0,.2],[-.79,2.2,.2],[-.592,0,.2],[-.592,2.2,.2],'H 2200 mm',[-.85,1.1,.2]);
  return root;
}
