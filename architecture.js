import * as THREE from 'three';
import {M} from './materials.js';
import {group, mesh, box, cylinder, ellipsoid, beam, curve, finial, plinth, steps, column, arch, windowFrame, doorway, hipRoof, struts, ring, contact, optimize, uvScale} from './geometry.js';

export const landmarks = [];
function register(scene, id, name, kind, x, z, detail, radius = 9) {
  const root = group(scene, name, x, 0, z);
  root.userData.landmark = id;
  const entry = {id, name, kind, x, z, detail, radius, root, targetY: 4}; landmarks.push(entry);
  return entry;
}
const configs = [
  {id:'bhimsen', name:'Bhimsen Temple', x:-14, z:57, w:8.4, d:6.5, plinth:1.05,
    tiers:[{body:4.1,eave:5.1,roof:[12.1,9.7],rise:1.7,top:[4.7,3.6]}, {body:2.0,eave:9,roof:[8,6.5],rise:1.3,top:[2.8,2.3]}, {body:1.3,eave:11.8,roof:[4.9,4.2],rise:1.35,top:[.45,.4]}],
    detail:'Rectangular three-tier shrine with a projecting gilded window and a gilded summit roof. Roof dimensions are visual estimates; religious carving is kept conservative.'},
  {id:'vishwanath', name:'Vishwanath Temple', x:-5, z:41, w:8.4, d:7.4, plinth:1.4,
    tiers:[{body:3.8,eave:5.45,roof:[11.4,10],rise:1.65,top:[4.4,3.8]}, {body:1.65,eave:9,roof:[7.1,6.4],rise:1.8,top:[.6,.55]}],
    detail:'Two tier Shiva temple with an open timber colonnade, angled eave struts, eastern entrance elephants and a western Nandi. Guardian forms are simplified sculptural studies.'},
  {id:'char-narayan', name:'Char Narayan Temple', x:0, z:16, w:5.4, d:4.9, plinth:1.2,
    tiers:[{body:2.8,eave:4.35,roof:[7.7,7.1],rise:1.35,top:[2.7,2.4]}, {body:1.25,eave:7.2,roof:[4.65,4.25],rise:1.45,top:[.48,.44]}],
    detail:'Compact two-tier brick and timber shrine, with its own smaller platform, closely spaced struts and deep entrance frame. Restored form; dimensions are approximate.'},
  {id:'hari-shankar', name:'Hari Shankar Temple', x:-15, z:-5, w:7.2, d:6.6, plinth:2,
    tiers:[{body:3.5,eave:5.9,roof:[10.4,9.7],rise:1.65,top:[4.3,3.9]}, {body:1.85,eave:9.6,roof:[7.3,6.8],rise:1.5,top:[2.6,2.35]}, {body:1.25,eave:12.45,roof:[4.75,4.5],rise:1.45,top:[.5,.45]}],
    detail:'Tall three-tier silhouette on a raised stepped platform. Separate upper shrine volumes and supported roof tiers replace the previous overlapping roof stack. Narrative reliefs remain undocumented here.'},
];

function timberTemple(root, c) {
  const base = group(root, 'Stepped foundation'), structure = group(root, 'Brick shrine and timber framework');
  const n = Math.round(c.plinth / .25); plinth(base, c.w + 2.6, c.d + 2.6, n, c.plinth / n);
  steps(base, 0, 0, c.d / 2 + .55, 2.2, n, c.plinth / n, .32);
  contact(root, c.w + 2.5, c.d + 2.5);
  let bodyW = c.w, bodyD = c.d, bottom = c.plinth;
  c.tiers.forEach((tier, index) => {
    const part = group(structure, `Storey ${index + 1}`), coreW = index === 0 ? bodyW * .7 : bodyW, coreD = index === 0 ? bodyD * .67 : bodyD;
    box(part, 0, bottom, 0, coreW, tier.eave - bottom, coreD, c.id === 'char-narayan' ? M.brickOld : M.brick);
    box(part, 0, bottom, 0, coreW + .13, .16, coreD + .13, M.timber);
    box(part, 0, tier.eave - .25, 0, bodyW + .2, .26, bodyD + .2, M.timber);
    if (index === 0) {
      const count = c.id === 'vishwanath' ? 6 : c.id === 'char-narayan' ? 4 : 5;
      for (let side = 0; side < 4; side++) {
        const f = group(part, 'Veranda supports'); f.rotation.y = side * Math.PI / 2;
        const width = side % 2 ? bodyD : bodyW, half = (side % 2 ? bodyW : bodyD) / 2;
        for (let i = 0; i < count; i++) {
          const x = -width * .47 + i * width * .94 / (count - 1);
          column(f, x, bottom, half * .96, tier.eave - bottom, .115, M.timber);
          beam(f, [x, tier.eave - .75, half * .96], [x + .35, tier.eave - .2, half * .96], .12, .13);
          beam(f, [x, tier.eave - .75, half * .96], [x - .35, tier.eave - .2, half * .96], .12, .13);
        }
      }
      doorway(part, 0, bottom + .03, coreD / 2 + .03, c.id === 'hari-shankar' ? 1.65 : 1.3, Math.min(2.55, tier.eave - bottom - .5));
      for (const s of [-1, 1]) windowFrame(part, s * coreW * .31, bottom + .9, coreD / 2 + .035, .78, 1.3);
    } else {
      for (let side = 0; side < 4; side++) {
        const f = group(part, 'Upper windows'); f.rotation.y = side * Math.PI / 2;
        windowFrame(f, 0, bottom + .1, (side % 2 ? coreW : coreD) / 2 + .04, Math.min(1.15, coreW * .45), Math.max(.65, tier.eave - bottom - .5));
      }
    }
    struts(part, bodyW, bodyD, tier.eave, ...tier.roof, c.id === 'char-narayan' ? 5 : 6);
    const roofMat = c.id === 'bhimsen' && index === 2 ? M.gold : M.tile;
    hipRoof(root, ...tier.roof, tier.eave, tier.rise, ...tier.top, roofMat);
    // Small bells are placed along the documented eave tradition, with restrained scale.
    if (c.id === 'bhimsen') for (let x = -tier.roof[0] * .4; x <= tier.roof[0] * .4; x += .8) {
      cylinder(root, x, tier.eave - .5, tier.roof[1] / 2, .008, .008, .3, M.bronze, 5);
      cylinder(root, x, tier.eave - .61, tier.roof[1] / 2, .068, .023, .12, M.bronze, 8);
    }
    bottom = tier.eave + tier.rise - .1; [bodyW, bodyD] = tier.top;
  });
  const last = c.tiers.at(-1); finial(root, 0, last.eave + last.rise, 0, .8);
  if (c.id === 'bhimsen') {
    box(root, 0, 3.0, c.d * .355 + .17, 3.5, 1.55, .5, M.timber);
    for (let i = -1; i <= 1; i++) windowFrame(root, i * 1.0, 3.14, c.d * .355 + .45, .72, 1.12, 0, true);
    beam(root, [0, 11.2, 1.45], [0, 6.2, 4.1], .11, .025, M.gold);
  }
  root.userData.roofCount = c.tiers.length;
}

function stoneTower(g, x, y, z, radius, height, small = false) {
  const r = group(g, 'Curvilinear ribbed shikhara', x, y, z), vertices = [], uvs = [];
  const profile = [[0,1],[.10,.98],[.23,.9],[.4,.74],[.58,.55],[.74,.35],[.88,.19],[1,.11]], sides = 32;
  function point(i, a) {
    const angle = a * Math.PI * 2 / sides + Math.PI / 4, v = profile[i];
    const square = 1 / Math.max(Math.abs(Math.cos(angle)), Math.abs(Math.sin(angle)));
    const rr = radius * v[1] * square * (.955 + .045 * Math.cos(angle * 16));
    return [Math.cos(angle) * rr, v[0] * height, Math.sin(angle) * rr];
  }
  for (let i = 0; i < profile.length - 1; i++) for (let a = 0; a < sides; a++) {
    for (const p of [point(i,a),point(i+1,a+1),point(i,a+1),point(i,a),point(i+1,a),point(i+1,a+1)]) vertices.push(...p);
    uvs.push(a/sides*3,profile[i][0]*2,(a+1)/sides*3,profile[i+1][0]*2,(a+1)/sides*3,profile[i][0]*2,a/sides*3,profile[i][0]*2,a/sides*3,profile[i+1][0]*2,(a+1)/sides*3,profile[i+1][0]*2);
  }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3)); geo.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2)); geo.computeVertexNormals();
  const towerMat = M.stone.clone(); towerMat.side = THREE.DoubleSide; mesh(r, geo, towerMat);
  for (let i = 0; i < 8; i++) {
    const a = i * Math.PI / 4 + Math.PI / 4;
    const divisor = Math.max(Math.abs(Math.cos(a)), Math.abs(Math.sin(a)));
    const pts = profile.map(([t, v]) => [Math.cos(a) * radius * v * 1.025 / divisor, t * height, Math.sin(a) * radius * v * 1.025 / divisor]);
    curve(r, pts, small ? .024 : .07, M.stoneLight, 18);
  }
  cylinder(r,0,height,0,radius*.19,radius*.19,height*.045,M.stoneLight,16);
  for(let a=0;a<12;a++) ellipsoid(r,Math.cos(a*Math.PI/6)*radius*.18,height+height*.02,Math.sin(a*Math.PI/6)*radius*.18,radius*.045,height*.045,radius*.045,M.stone,8);
  finial(r,0,height+height*.06,0,small?.32:.9);
}
function stoneGallery(root, width, depth, y, h, count) {
  box(root,0,y,0,width+.35,.18,depth+.35,M.stoneLight);
  box(root,0,y+.18,0,width,.17,depth,M.stone);
  const core = Math.min(width, depth) * .42;
  box(root,0,y+.35,0,core,h-.25,core,M.stoneDark);
  for(let side=0;side<4;side++) {
    const f=group(root,'Stone arcade'); f.rotation.y=side*Math.PI/2;
    const span=side%2?depth:width, offset=(side%2?width:depth)/2-.28;
    const spacing=(span-.6)/(count-1);
    for(let i=0;i<count;i++) column(f,-span/2+.3+i*spacing,y+.35,offset,h-.6,.14,M.stone);
    for(let i=0;i<count-1;i++) arch(f,-span/2+.3+(i+.5)*spacing,y+h-.64,offset,spacing-.22,.48,.28,M.stoneLight);
    box(f,0,y+h-.06,offset,span,.22,.5,M.stone);
    for(let i=0;i<count*3;i++) {
      const xx=-span*.47+i*span*.94/(count*3-1);
      box(f,xx,y+h+.14,offset+.04,.12,.21,.12,M.stoneLight);
    }
  }
  for(let band=0;band<3;band++) box(root,0,y+h+.08+band*.12,0,width+.3+band*.12,.1,depth+.3+band*.12,band===1?M.stone:M.stoneLight);
}
function turret(root,x,y,z,scale=.85) {
  const t=group(root,'Subsidiary stone pavilion',x,y,z);
  box(t,0,0,0,scale*1.18,.12,scale*1.18,M.stoneLight);
  for(const sx of [-1,1]) for(const sz of [-1,1]) column(t,sx*scale*.36,.12,sz*scale*.36,scale*.63,.045,M.stone);
  stoneTower(t,0,scale*.72,0,scale*.45,scale*.78,true);
}
export function buildKrishna(scene) {
  const e=register(scene,'krishna','Krishna Mandir','stone',-27,25,'Three-storey square stone temple: open colonnades, arched galleries, a ribbed central shikhara and 21 gilded pinnacles distributed over subsidiary pavilions and the central tower. Estimated geometry; no invented narrative inscriptions.',12);
  const g=e.root; contact(g,12.5,12.5); plinth(g,12.4,12.4,6,.22);
  for(let side=0;side<4;side++) steps(g,Math.sin(side*Math.PI/2)*5.4,0,Math.cos(side*Math.PI/2)*5.4,2.2,6,.22,.29,side*Math.PI/2);
  stoneGallery(g,9.8,9.8,1.32,2.5,6); stoneGallery(g,7.5,7.5,4.28,2.25,5); stoneGallery(g,5.6,5.6,6.95,2.0,4);
  for(const [y,r,size] of [[4.22,4.5,.95],[6.94,3.3,.76]]) {
    for(const [x,z] of [[-r,-r],[0,-r],[r,-r],[r,0],[r,r],[0,r],[-r,r],[-r,0]]) turret(g,x,y,z,size);
  }
  for(const sx of [-1,1]) for(const sz of [-1,1]) turret(g,sx*2.1,9.38,sz*2.1,.74);
  stoneTower(g,0,9.37,0,1.75,5.5);
  e.targetY=7; g.userData.storeys=3; g.userData.expectedPinnacles=21; optimize(g); return e;
}
export function buildOctagonal(scene) {
  const e=register(scene,'chyasin','Chyasin Dega','stone',-30,-53,'Separate octagonal Krishna temple at the southern end. Eight-sided stepped foundation and arcade, octagonal ledges and a single central stone shikhara distinguish it from Krishna Mandir.',9);
  const g=e.root; contact(g,10,10); plinth(g,10.8,10.8,5,.27,true);
  for(let level=0;level<2;level++) {
    const y=1.35+level*2.65,r=level?3.0:4.15;
    cylinder(g,0,y,0,r,r,.26,M.stoneLight,8); cylinder(g,0,y+.26,0,r*.47,r*.47,2.25,M.stoneDark,8);
    for(let i=0;i<8;i++) {
      const a=i*Math.PI/4,xx=Math.sin(a)*r*.9,zz=Math.cos(a)*r*.9;
      column(g,xx,y+.26,zz,2.15,.17,M.stone);
      const f=group(g,'Octagonal arcade'); f.rotation.y=a+Math.PI/8;
      arch(f,0,y+1.78,r*.83,r*.63,.5,.28,M.stoneLight);
    }
    for(let j=0;j<3;j++) cylinder(g,0,y+2.38+j*.11,0,r+.12+j*.08,r+.12+j*.08,.11,M.stoneLight,8);
  }
  stoneTower(g,0,6.85,0,1.62,4.65);
  steps(g,0,0,4.3,2,5,.27,.3); e.targetY=5; g.userData.footprint='octagonal'; optimize(g); return e;
}
function elephant(root,x,z) {
  const g=group(root,'Stone entrance elephant',x,1.05,z); box(g,0,-.1,0,1.55,.28,2.5,M.stoneLight);
  ellipsoid(g,0,1.15,0,.55,.68,.88,M.stone);
  for(const sx of [-1,1]) for(const zz of [-.54,.54]) cylinder(g,sx*.36,.15,zz,.16,.14,.88,M.stone,9);
  ellipsoid(g,0,1.35,.83,.39,.47,.4,M.stone); for(const sx of [-1,1]) ellipsoid(g,sx*.4,1.4,.65,.19,.36,.12,M.stone);
  curve(g,[[0,1.44,1.15],[0,.93,1.34],[0,.43,1.47],[.15,.31,1.6]],.125,M.stone);
  for(const sx of [-1,1]) curve(g,[[sx*.22,1.1,1.1],[sx*.26,.96,1.42]],.035,M.stoneLight,8);
  box(g,0,1.68,-.05,.75,.17,1.0,M.stoneLight);
  ellipsoid(g,0,2.03,-.05,.17,.3,.18,M.stone); ellipsoid(g,0,2.4,.03,.14,.17,.14,M.stone);
}
function nandi(root,x,z) {
  const g=group(root,'Western Nandi',x,.55,z); box(g,0,0,0,1.45,.3,2.1,M.stoneLight);
  ellipsoid(g,0,.8,0,.5,.44,.76,M.stone); ellipsoid(g,0,1.05,.68,.31,.36,.35,M.stone);
  ellipsoid(g,0,1.24,-.1,.34,.32,.4,M.stone); for(const s of [-1,1]) cylinder(g,s*.23,1.2,.76,.06,.012,.35,M.stone,8);
}
export function buildTemples(scene) {
  for(const c of configs) {
    const e=register(scene,c.id,c.name,'temple',c.x,c.z,c.detail,c.id==='char-narayan'?8:11);
    e.root.rotation.y=Math.PI/2; timberTemple(e.root,c);
    if(c.id==='vishwanath') { elephant(e.root,-2.5,6.0); elephant(e.root,2.5,6.0); nandi(e.root,0,-6.2); }
    e.targetY=c.id==='hari-shankar'?6:5; optimize(e.root);
  }
  for(const c of [{id:'narasimha',name:'Narasimha Shrine',x:-6,z:-31,w:3.4,d:3.2},{id:'narayan',name:'Narayan Shrine',x:-2,z:-52,w:3.3,d:3.1},{id:'ganesh',name:'Ganesh Shrine',x:8,z:-13,w:2.8,d:2.6}]) {
    const e=register(scene,c.id,c.name,'shrine',c.x,c.z,'Small subsidiary shrine. Placement retained from the previous model; ornament and dimensions remain provisional.',5);
    timberTemple(e.root,{...c,plinth:.7,tiers:[{eave:3.1,roof:[c.w+1.6,c.d+1.6],rise:1.3,top:[.5,.45]}]}); optimize(e.root);
  }
}

function palaceWing(root, name, length, depth, height, floorCount, entrance, rich) {
  const g=group(root,name), opening=2.4;
  if(entrance) {
    for(const s of [-1,1]) box(g,s*(length+opening)/4,0,0,(length-opening)/2,3.05,depth,M.brickOld);
    box(g,0,3.05,0,length,height-3.05,depth,M.brick);
    for(const s of [-1,1]) box(g,s*(opening/2+.08),0,depth/2+.08,.16,3.1,.3,M.timberEdge);
    box(g,0,3.0,depth/2+.08,opening+.5,.22,.35,M.timberEdge);
    arch(g,0,3.2,depth/2+.12,opening+.2,.62,.2,rich?M.gold:M.timberEdge);
  } else box(g,0,0,0,length,height,depth,M.brick);
  box(g,0,0,0,length+.15,.25,depth+.15,M.stone);
  for(let floor=0;floor<floorCount;floor++) {
    const y=.85+floor*3.1;
    box(g,0,y+2.3,0,length+.06,.14,depth+.1,M.timber);
    const n=Math.max(3,Math.floor(length/2.8));
    for(let i=0;i<n;i++) {
      const x=-length/2+1.25+i*(length-2.5)/(n-1);
      if(floor===0&&entrance&&Math.abs(x)<1.7)continue;
      for(const sign of [-1,1]) windowFrame(g,x,y,sign*(depth/2+.06),rich&&floor===2?1.5:1.0,floor===0?1.3:1.5,sign<0?Math.PI:0);
    }
  }
  hipRoof(g,length+1.35,depth+1.9,height,1.55,length-1.9,.23);
  for(let x=-length/2+.8;x<length/2;x+=1.6) {
    for(const sign of [-1,1]) beam(g,[x,height-1.0,sign*depth/2],[x,height-.08,sign*(depth/2+.76)],.12,.18);
  }
  return g;
}
export function buildPalace(scene) {
  const defs=[{id:'keshav',name:'Keshav Narayan Chowk',z:38,w:18,d:20,h:9.4,floors:3},{id:'mul',name:'Mul Chowk',z:4,w:23,d:30,h:7.0,floors:2},{id:'sundari',name:'Sundari Chowk',z:-34,w:20,d:20,h:10.0,floors:3}];
  for(const c of defs) {
    const e=register(scene,c.id,c.name,'palace',31,c.z,c.id==='sundari'?'Three-storey courtyard with projecting triple-bay timber windows, a screened gallery and the sunken Tusha Hiti. Museum and CyArk documentation inform its character; modeled dimensions remain estimated.':'Open royal courtyard enclosed by individually detailed palace wings. Timber windows, roof struts, galleries and an open western entrance are modeled. Court dimensions are illustrative.',c.d*.75);
    const g=e.root,depth=3.5;
    for(const [name,x,z,len,rot] of [['West entrance wing',-c.w/2,0,c.d,-Math.PI/2],['East wing',c.w/2,0,c.d,Math.PI/2],['North wing',0,c.d/2,c.w+depth,0],['South wing',0,-c.d/2,c.w+depth,Math.PI]]) {
      const wing=palaceWing(g,name,len,depth,c.h,c.floors,name.startsWith('West'),c.id==='sundari'); wing.position.set(x,0,z);wing.rotation.y=rot;
    }
    for(const sign of [-1,1]) for(let z=-c.d/2+3;z<c.d/2-2;z+=2.2) {
      column(g,sign*(c.w/2-depth/2-.5),.1,z,2.9,.09,M.timber);
      box(g,sign*(c.w/2-depth/2-.5),2.95,z,.2,.22,2.3,M.timber);
    }
    if(c.id==='sundari') {
      const f=group(g,'Projecting triple-bay window',-c.w/2-depth/2-.18,6.5,0); f.rotation.y=-Math.PI/2;
      box(f,0,-.1,0,4.7,2.05,.6,M.timber);
      for(let i=-1;i<=1;i++) windowFrame(f,i*1.38,0,.36,1.03,1.65);
      box(f,0,-.3,.07,5.2,.16,1.0,M.timberEdge);
    } else {
      const tiny=group(g,c.id==='keshav'?'Central Keshav Narayan shrine':'Yantaju shrine');
      timberTemple(tiny,{id:c.id,w:c.id==='keshav'?3.4:2.5,d:2.9,plinth:.55,tiers:[{eave:3.1,roof:[4.5,4.1],rise:1.25,top:[.4,.4]}]});
      if(c.id==='mul') doorway(g,0,.1,-c.d/2+depth/2+.04,1.55,2.8,0,true);
    }
    e.targetY=1.5;e.court=true;optimize(g);
  }
}

const rectangle=(w,d)=>[[-w/2,-d/2],[w/2,-d/2],[w/2,d/2],[-w/2,d/2]];
export const ovalPoints=(rx,rz)=>Array.from({length:64},(_,i)=>{const a=i*Math.PI/32,cusp=1+.028*Math.cos(4*a);return [Math.cos(a)*rx*cusp,Math.sin(a)*rz*cusp];});
function floorShape(root,points,y,mat) {
  const s=new THREE.Shape(points.map(p=>new THREE.Vector2(p[0],-p[1]))),geo=new THREE.ShapeGeometry(s);geo.rotateX(-Math.PI/2);uvScale(geo,3);return mesh(root,geo,mat,0,y,0);
}
function spout(g,x,y,z,gilt=false) {
  const m=gilt?M.gold:M.stone;
  box(g,x,y-.12,z,.43,.32,.32,m);ellipsoid(g,x,y+.08,z+.17,.22,.13,.22,m);
  curve(g,[[x,y+.05,z+.16],[x,y-.02,z+.37],[x,y-.11,z+.67],[x,y-.15,z+.85]],.08,m);
  for(const s of [-1,1]) ellipsoid(g,x+s*.13,y+.14,z+.27,.038,.032,.03,M.stoneDark,8);
}
export function buildWater(scene) {
  const manga=register(scene,'manga-hiti','Manga Hiti','water',-4,68,'A genuinely sunken public hiti: descending stairs, retaining masonry, a cruciform basin and three makara spouts. Small sculptural details are conservative approximations.',8);
  const g=manga.root;
  ring(g,rectangle(10.7,9.7),rectangle(9.7,8.7),0,.2,M.stoneLight);
  for(const sign of [-1,1]) {box(g,sign*4.9,-2.6,0,.4,2.6,9,M.brickOld);box(g,0,-2.6,sign*4.35,9.8,2.6,.35,M.brickOld);}
  floorShape(g,rectangle(9.5,8.4),-2.59,M.stoneDark);
  const cross=[[-1.3,-2.6],[1.3,-2.6],[1.3,-1],[3,-1],[3,1],[1.3,1],[1.3,2.6],[-1.3,2.6],[-1.3,1],[-3,1],[-3,-1],[-1.3,-1]];
  floorShape(g,cross,-2.35,M.water); const outer=cross.map(([x,z])=>[x*1.11,z*1.11]);ring(g,outer,cross,-2.58,.32,M.stone);
  for(let i=0;i<3;i++) spout(g,-2+i*2,-1.4,-4.0);
  for(let i=0;i<12;i++) box(g,3.65,-2.6+i*.215,3.9-i*.48,1.2,.215,.53,M.stoneLight);
  manga.targetY=-1;manga.court=true;optimize(g);
  const tusha=register(scene,'tusha-hiti','Tusha Hiti','water',31,-34,'Oval, slightly cusped ritual bath inside Sundari Chowk. Descending stone treads, recessed niches, serpent rim and gilt spout are distinct from the cruciform public hiti. Miniature temple sits on the main axis.',5);
  const t=tusha.root;
  ring(t,ovalPoints(3.9,2.95),ovalPoints(3.55,2.6),-.15,.22,M.stoneLight);
  for(let i=0;i<6;i++) ring(t,ovalPoints(3.58-i*.20,2.63-i*.15),ovalPoints(3.38-i*.20,2.48-i*.15),-.34-i*.23,.22,i>3?M.stoneDark:M.stone);
  floorShape(t,ovalPoints(2.3,1.65),-1.73,M.stoneDark);floorShape(t,ovalPoints(1.3,.7),-1.71,M.water);
  for(let i=0;i<18;i++) {
    const a=i*Math.PI*2/18,n=group(t,'Recessed sculptural niche',Math.sin(a)*3.5,-.68,Math.cos(a)*2.55);n.rotation.y=a+Math.PI;
    box(n,0,0,0,.35,.48,.04,M.recess);arch(n,0,.28,.055,.36,.21,.08,M.stoneLight);box(n,0,-.06,.04,.46,.09,.23,M.stoneLight);
  }
  const serpent=ovalPoints(3.76,2.81).map(([x,z])=>[x,.15,z]);serpent.push(serpent[0]);curve(t,serpent,.045,M.bronze,96);
  spout(t,0,-.55,-2.45,true);stoneTower(t,0,0,3.53,.45,1.5,true);
  tusha.targetY=-.2;tusha.court=true;optimize(t);
  const tank=register(scene,'bhandarkhal','Bhandarkhal Tank','water',46,-55,'Rear palace water tank, with stepped stone perimeter and a small pavilion. Basin and garden geometry are approximate.',13);
  const b=tank.root;
  for(let i=0;i<5;i++) ring(b,rectangle(20-i*.4,13-i*.4),rectangle(19.6-i*.4,12.6-i*.4),-.27-i*.23,.25,M.stone);
  floorShape(b,rectangle(18,11),-1.19,M.water);
  const pav=group(b,'Tank pavilion',0,0,-7.6);plinth(pav,5.4,3.4,2,.2);
  for(const x of [-2,0,2])for(const z of [-1,1])column(pav,x,.4,z,2.7,.13,M.timber);hipRoof(pav,6.0,4.2,3.2,1.3,3.2,.2);tank.targetY=0;optimize(b);
}
function statue(g,y,winged=false) {
  ellipsoid(g,0,y,0,.18,.37,.18,M.bronze);ellipsoid(g,0,y+.52,.04,.14,.18,.14,M.gold);
  for(const s of [-1,1]) {beam(g,[s*.2,y+.16,0],[s*.045,y+.27,.23],.075,.075,M.bronze);ellipsoid(g,s*.14,y-.28,.11,.18,.14,.28,M.bronze);}
  if(winged) for(const s of [-1,1]) ellipsoid(g,s*.31,y+.05,-.08,.13,.45,.18,M.bronze);
}
export function buildMonuments(scene) {
  for(const [id,name,x,z,king] of [['garuda','Garuda Column',-27,37,false],['malla','Yoganarendra Malla Column',-1,-18,true]]) {
    const e=register(scene,id,name,'monument',x,z,king?'Royal figure in prayer beneath a cobra canopy, with the small bird above. The figure is a simplified sculptural placeholder; no inscription is invented.':'Separate Garuda column facing Krishna Mandir. Plinth, stone shaft, capital and a kneeling winged figure are modeled conservatively.',4),g=e.root;
    plinth(g,1.75,1.75,3,.18);cylinder(g,0,.54,0,.29,.22,5.5,M.stone,12);cylinder(g,0,6.04,0,.44,.36,.24,M.stoneLight,12);statue(g,6.72,!king);
    if(king) {
      curve(g,[[0,6.4,-.2],[0,7.25,-.3],[0,7.7,.02]],.065,M.bronze);
      for(let i=0;i<5;i++)ellipsoid(g,(i-2)*.13,7.64-Math.abs(i-2)*.06,.02,.115,.22,.085,M.gold);
      ellipsoid(g,0,8.05,0,.1,.08,.16,M.bronze);cylinder(g,0,7.8,0,.018,.018,.2,M.bronze,6);
    }
    e.targetY=5;optimize(g);
  }
  const bell=register(scene,'bell','Taleju Bell','monument',7,34,'Bell and its timber support frame, shown separately from the temple buildings. Inscriptions and detailed metal reliefs are omitted.',4),g=bell.root;
  plinth(g,2.7,2.3,2,.23);for(const x of [-.95,.95])box(g,x,.46,0,.22,3.8,.3,M.timber);box(g,0,4.2,0,2.65,.3,.35,M.timber);
  cylinder(g,0,3.3,0,.027,.027,.8,M.bronze,8);cylinder(g,0,2.5,0,.65,.22,.85,M.bronze,24);cylinder(g,0,2.47,0,.69,.69,.12,M.bronze,24);optimize(g);
  for(const [id,name,x] of [['mandap-n','Northern Mani Mandap',-15],['mandap-s','Southern Mani Mandap',9]]) {
    const e=register(scene,id,name,'pavilion',x,68,'Open timber pavilion on a stepped platform. Slender columns, cross beams and a shallow tiled roof keep the public passage visually open.',7),p=e.root;
    plinth(p,9,7,3,.22);for(let i=0;i<4;i++)for(const z of [-2.45,2.45])column(p,-3.6+i*2.4,.66,z,2.7,.105,M.timber);
    for(const z of [-2.45,2.45])box(p,0,3.21,z,7.7,.23,.25,M.timber);struts(p,7.5,5,3.5,10,7.2,6);hipRoof(p,10,7.2,3.5,1.6,5.2,.24);e.targetY=2;optimize(p);
  }
}
