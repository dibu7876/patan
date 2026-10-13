import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {M} from './materials.js';

export function group(parent, name, x = 0, y = 0, z = 0) {
  const g = new THREE.Group(); g.name = name; g.position.set(x, y, z); parent.add(g); return g;
}
export function uvScale(geo, span = 3) {
  const p = geo.attributes.position, n = geo.attributes.normal, uv = [];
  for (let i = 0; i < p.count; i++) {
    const ax = Math.abs(n.getX(i)), ay = Math.abs(n.getY(i));
    uv.push((ax > .6 ? p.getZ(i) : p.getX(i)) / span, (ay > .6 ? p.getZ(i) : p.getY(i)) / span);
  }
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); return geo;
}
export function mesh(parent, geo, mat, x = 0, y = 0, z = 0) {
  const o = new THREE.Mesh(geo, mat); o.position.set(x, y, z); o.castShadow = true; o.receiveShadow = true;
  parent.add(o); return o;
}
// y consistently means the bottom of an element, never its center.
export function box(g, x, y, z, w, h, d, mat = M.stone) {
  return mesh(g, uvScale(new THREE.BoxGeometry(w, h, d), mat.userData.span), mat, x, y + h / 2, z);
}
export function cylinder(g, x, y, z, bottom, top, h, mat = M.stone, sides = 12) {
  return mesh(g, uvScale(new THREE.CylinderGeometry(top, bottom, h, sides), mat.userData.span), mat, x, y + h / 2, z);
}
export function ellipsoid(g, x, y, z, rx, ry, rz, mat = M.stone, segments = 12) {
  const geo = new THREE.SphereGeometry(1, segments, 8); geo.scale(rx, ry, rz); return mesh(g, geo, mat, x, y, z);
}
export function beam(g, a, b, width, depth, mat = M.timber) {
  const pa = new THREE.Vector3(...a), pb = new THREE.Vector3(...b), delta = pb.clone().sub(pa);
  const o = box(g, 0, -delta.length() / 2, 0, width, delta.length(), depth, mat);
  o.position.copy(pa.add(pb).multiplyScalar(.5)); o.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), delta.normalize()); return o;
}
export function curve(g, points, radius, mat = M.stone, segments = 20) {
  const path = new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p)));
  return mesh(g, new THREE.TubeGeometry(path, segments, radius, 6, false), mat);
}
export function finial(g, x, y, z, size = 1) {
  const f = group(g, 'Gilded pinnacle', x, y, z); f.userData.pinnacle = true;
  cylinder(f, 0, 0, 0, .26 * size, .22 * size, .13 * size, M.gold, 12);
  ellipsoid(f, 0, .24 * size, 0, .18 * size, .2 * size, .18 * size, M.gold);
  cylinder(f, 0, .37 * size, 0, .13 * size, .045 * size, .44 * size, M.gold);
  ellipsoid(f, 0, .83 * size, 0, .072 * size, .075 * size, .072 * size, M.gold);
  cylinder(f, 0, .86 * size, 0, .035 * size, .002, .26 * size, M.gold, 8); return f;
}
export function plinth(g, w, d, count = 4, stepH = .25, polygon = false) {
  for (let i = 0; i < count; i++) {
    const ww = w - i * .43, dd = d - i * .43;
    if (polygon) cylinder(g, 0, i * stepH, 0, ww / 2, ww / 2, stepH, i % 2 ? M.stone : M.stoneLight, 8);
    else box(g, 0, i * stepH, 0, ww, stepH, dd, i % 2 ? M.stone : M.stoneLight);
  }
  return count * stepH;
}
export function steps(g, x, y, z, width, count, rise = .2, tread = .32, rotation = 0) {
  const s = group(g, 'Entrance stair', x, y, z); s.rotation.y = rotation;
  for (let i = 0; i < count; i++) box(s, 0, 0, i * tread, width, (count - i) * rise, tread + .035, M.stoneLight);
}
export function column(g, x, y, z, h, radius = .16, mat = M.stone) {
  box(g, x, y, z, radius * 3, .16, radius * 3, mat);
  cylinder(g, x, y + .16, z, radius * 1.15, radius * .9, h - .4, mat, 8);
  box(g, x, y + h - .24, z, radius * 2.9, .14, radius * 2.9, mat);
  box(g, x, y + h - .1, z, radius * 3.5, .1, radius * 3.5, mat);
}
export function arch(g, x, y, z, width, rise, depth, mat = M.stone) {
  const s = new THREE.Shape(), r = width / 2, thick = .16;
  s.moveTo(-r - thick, 0); s.quadraticCurveTo(-r - thick, rise * .85, 0, rise + thick);
  s.quadraticCurveTo(r + thick, rise * .85, r + thick, 0); s.lineTo(r, 0);
  s.quadraticCurveTo(r, rise * .75, 0, rise); s.quadraticCurveTo(-r, rise * .75, -r, 0); s.closePath();
  const geo = new THREE.ExtrudeGeometry(s, {depth, bevelEnabled: false, curveSegments: 8});
  return mesh(g, uvScale(geo, 3), mat, x, y, z - depth / 2);
}
export function windowFrame(g, x, y, z, w = 1.05, h = 1.45, angle = 0, gilded = false) {
  const f = group(g, gilded ? 'Gilded bay lattice' : 'Carved timber lattice', x, y, z); f.rotation.y = angle;
  const mat = gilded ? M.gold : M.timberEdge;
  box(f, 0, 0, 0, w, h, .16, M.recess);
  for (let j = 0; j < 3; j++) {
    const pad = .07 * j;
    for (const s of [-1, 1]) box(f, s * (w / 2 + pad), -.06 - pad, .07 + j * .02, .08, h + .12 + pad * 2, .12, mat);
    for (const yy of [-.06 - pad, h + pad]) box(f, 0, yy, .07 + j * .02, w + pad * 2, .07, .13, mat);
  }
  for (let i = 1; i < 7; i++) box(f, -w / 2 + i * w / 7, .06, .13, .026, h - .12, .033, M.timber);
  for (let i = 1; i < 9; i++) box(f, 0, i * h / 9, .13, w - .08, .024, .033, M.timber);
  box(f, 0, -.15, .04, w + .34, .09, .38, mat);
  box(f, 0, h + .11, .04, w + .44, .11, .32, mat);
  // Small geometric rosettes suggest carving depth without invented religious imagery.
  for (const sx of [-1, 1]) for (const yy of [.16, h - .16]) ellipsoid(f, sx * (w / 2 + .1), yy, .17, .055, .055, .027, mat, 8);
  return f;
}
export function doorway(g, x, y, z, w = 1.25, h = 2.3, angle = 0, gilt = false) {
  const f = group(g, 'Recessed doorway and torana', x, y, z); f.rotation.y = angle;
  const mat = gilt ? M.gold : M.timberEdge;
  box(f, 0, 0, -.04, w, h, .15, M.recess);
  for (let layer = 0; layer < 3; layer++) {
    const t = .085 * layer;
    for (const sign of [-1, 1]) box(f, sign * (w / 2 + t), 0, .06 + t, .085, h + .08, .13, mat);
    box(f, 0, h + t, .06 + t, w + t * 2 + .12, .08, .13, mat);
  }
  arch(f, 0, h + .26, .14, w + .22, .55, .14, mat);
  box(f, 0, -.09, .13, w + .5, .11, .48, M.stoneLight);
  return f;
}
export function hipRoof(g, w, d, y, rise, topW, topD, mat = M.tile) {
  const root = group(g, 'Hipped roof / eaves / exposed rafters');
  const verts = [], uvs = [], spans = [0, .1, .36, .68, 1];
  const corners = (t, level) => {
    const ww = THREE.MathUtils.lerp(w, topW, t), dd = THREE.MathUtils.lerp(d, topD, t);
    const yy = y + rise * Math.pow(t, 1.28) + (level === 0 ? .07 : 0);
    return [[-ww / 2, yy, -dd / 2], [ww / 2, yy, -dd / 2], [ww / 2, yy, dd / 2], [-ww / 2, yy, dd / 2]];
  };
  for (let ring = 0; ring < spans.length - 1; ring++) {
    const a = corners(spans[ring], ring), b = corners(spans[ring + 1], ring + 1);
    for (let side = 0; side < 4; side++) {
      const n = (side + 1) % 4, length = side % 2 ? d : w;
      for (const p of [a[side], b[n], a[n], a[side], b[side], b[n]]) verts.push(...p);
      const v0 = spans[ring] * Math.hypot(w / 2, rise) / 4.5, v1 = spans[ring + 1] * Math.hypot(w / 2, rise) / 4.5;
      uvs.push(0, v0, length / 4.5, v1, length / 4.5, v0, 0, v0, 0, v1, length / 4.5, v1);
    }
  }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2)); geo.computeVertexNormals(); mesh(root, geo, mat);
  box(root, 0, y + rise - .06, 0, topW, .12, topD, mat);
  for (const sign of [-1, 1]) {
    box(root, 0, y - .18, sign * d / 2, w, .22, .13, M.timber);
    box(root, sign * w / 2, y - .18, 0, .13, .22, d, M.timber);
  }
  const underside = (x, z, t) => [x * THREE.MathUtils.lerp(1, topW / w, t), y + rise * Math.pow(t, 1.28) - .17, z * THREE.MathUtils.lerp(1, topD / d, t)];
  for (let x = -w / 2 + .2; x < w / 2; x += .32) for (const sign of [-1, 1])
    for (let t = 0; t < .44; t += .15) beam(root, underside(x, sign * d / 2, t), underside(x, sign * d / 2, t + .15), .055, .08);
  for (let z = -d / 2 + .2; z < d / 2; z += .32) for (const sign of [-1, 1])
    for (let t = 0; t < .44; t += .15) beam(root, underside(sign * w / 2, z, t), underside(sign * w / 2, z, t + .15), .055, .08);
  return root;
}
export function struts(g, w, d, y, roofW, roofD, count = 5) {
  for (let side = 0; side < 4; side++) {
    const f = group(g, 'Angled roof struts'); f.rotation.y = side * Math.PI / 2;
    const span = side % 2 ? d : w, half = (side % 2 ? w : d) / 2, outer = (side % 2 ? roofW : roofD) / 2;
    box(f, 0, y - .18, half, span, .24, .27, M.timber);
    for (let i = 0; i < count; i++) {
      const x = -span * .44 + i * span * .88 / (count - 1);
      beam(f, [x, y - 1.1, half], [x, y - .08, outer - .16], .13, .19, M.timberEdge);
      box(f, x, y - .33, outer - .16, .3, .18, .27, M.timber);
    }
  }
}
export function ring(g, outerPoints, innerPoints, y, depth, mat) {
  const shape = new THREE.Shape(outerPoints.map(p => new THREE.Vector2(p[0], -p[1])));
  shape.holes.push(new THREE.Path(innerPoints.map(p => new THREE.Vector2(p[0], -p[1]))));
  const geo = new THREE.ExtrudeGeometry(shape, {depth, bevelEnabled: false});
  geo.rotateX(-Math.PI / 2); uvScale(geo, mat.userData.span); return mesh(g, geo, mat, 0, y, 0);
}
export function contact(g, w, d) {
  const c = document.createElement('canvas'); c.width = c.height = 64; const ctx = c.getContext('2d');
  const grad = ctx.createRadialGradient(32, 32, 7, 32, 32, 32); grad.addColorStop(0, 'rgba(26,20,13,.38)'); grad.addColorStop(1, 'rgba(26,20,13,0)'); ctx.fillStyle = grad; ctx.fillRect(0, 0, 64, 64);
  const m = new THREE.MeshBasicMaterial({map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false});
  const p = mesh(g, new THREE.PlaneGeometry(w * 1.55, d * 1.55), m, 0, .012, 0); p.rotation.x = -Math.PI / 2; p.castShadow = false;
}
// Merge static details per material within each named landmark, reducing draw calls.
export function optimize(root) {
  root.updateWorldMatrix(true, true); const inverse = root.matrixWorld.clone().invert(), buckets = new Map(), remove = [];
  root.traverse(o => {
    if (!o.isMesh || o.material.transparent) return;
    const geo = o.geometry.clone().applyMatrix4(inverse.clone().multiply(o.matrixWorld));
    if (geo.index) { const flat = geo.toNonIndexed(); geo.dispose(); buckets.set(o.material, [...(buckets.get(o.material) || []), flat]); }
    else buckets.set(o.material, [...(buckets.get(o.material) || []), geo]);
    remove.push(o);
  });
  for (const o of remove) { o.removeFromParent(); o.geometry.dispose(); }
  for (const [mat, geos] of buckets) {
    const geo = mergeGeometries(geos, false); geos.forEach(g => g.dispose());
    if (!geo) throw new Error(`Could not batch ${root.name}: ${mat.name}`);
    const o = mesh(root, geo, mat); o.name = mat.name;
  }
}
