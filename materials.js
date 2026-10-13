import * as THREE from 'three';

// A fixed seed keeps the model and its surface wear stable between visits.
export function random(seed = 17) {
  return () => { seed = (1664525 * seed + 1013904223) >>> 0; return seed / 4294967296; };
}
const rnd = random(913);
function canvas() {
  const c = document.createElement('canvas'); c.width = c.height = 1024;
  return [c, c.getContext('2d')];
}
function maps(kind) {
  const [color, c] = canvas(), [height, h] = canvas();
  c.fillStyle = kind === 'brick' ? '#887568' : kind === 'paving' ? '#9b8b7b' : '#746b5e';
  c.fillRect(0, 0, 1024, 1024); h.fillStyle = '#626262'; h.fillRect(0, 0, 1024, 1024);
  if (kind === 'brick' || kind === 'paving' || kind === 'stone') {
    const rowH = kind === 'brick' ? 24 : kind === 'paving' ? 64 : 128;
    const brickW = kind === 'brick' ? 94 : kind === 'paving' ? 128 : 256;
    for (let row = 0; row < 1024 / rowH; row++) {
      for (let x = -brickW; x < 1024; x += brickW) {
        const px = x + (row % 2) * brickW / 2, y = row * rowH, v = rnd();
        if (kind === 'brick') c.fillStyle = `hsl(${14 + v * 6}  ${27 + v * 7}% ${31 + v * 9}%)`;
        else if (kind === 'paving') c.fillStyle = `hsl(${22 + v * 7}  ${17 + v * 8}% ${43 + v * 11}%)`;
        else c.fillStyle = `hsl(${34 + v * 7}  ${6 + v * 8}% ${45 + v * 10}%)`;
        c.fillRect(px + 1.5, y + 1.5, brickW - 3, rowH - 3);
        h.fillStyle = `rgb(${176 + v * 30},${176 + v * 30},${176 + v * 30})`;
        h.fillRect(px + 2, y + 2, brickW - 4, rowH - 4);
        c.fillStyle = 'rgba(28,20,13,.08)'; c.fillRect(px + 3, y + rowH - 5, brickW - 5, 2);
        c.fillStyle = 'rgba(236,214,190,.07)'; c.fillRect(px + 2, y + 2, brickW - 5, 1);
        for (let j = 0; j < 4; j++) {
          c.fillStyle = `rgba(24,17,13,${rnd() * .035})`;
          c.fillRect(px + rnd() * brickW, y + 4, 1 + rnd() * 4, rowH - 7);
        }
      }
    }
  } else if (kind === 'tiles') {
    c.fillStyle = '#79523c'; c.fillRect(0, 0, 1024, 1024);
    for (let y = -40; y < 1024; y += 64) for (let x = -40; x < 1024; x += 48) {
      const v = rnd(), px = x + (Math.floor(y / 64) % 2) * 24;
      const grad = c.createLinearGradient(px, 0, px + 46, 0);
      grad.addColorStop(0, '#5d4536'); grad.addColorStop(.2, `hsl(24 28% ${37 + v * 11}%)`);
      grad.addColorStop(.7, `hsl(24 26% ${42 + v * 10}%)`); grad.addColorStop(1, '#71503d');
      c.fillStyle = grad; c.fillRect(px + 1, y + 2, 46, 61);
      c.fillStyle = 'rgba(40,26,18,.38)'; c.fillRect(px + 1, y + 59, 46, 3);
      const bump = h.createLinearGradient(px, 0, px + 46, 0);
      bump.addColorStop(0, '#606060'); bump.addColorStop(.5, '#cccccc'); bump.addColorStop(1, '#777777');
      h.fillStyle = bump; h.fillRect(px + 1, y + 2, 46, 61);
    }
  } else {
    c.fillStyle = '#3d2c22'; c.fillRect(0, 0, 1024, 1024);
    h.fillStyle = '#888888'; h.fillRect(0, 0, 1024, 1024);
    for (let x = 0; x < 1024; x += 3) {
      c.strokeStyle = `rgba(${rnd() > .5 ? '173,123,79' : '18,13,9'},${.04 + rnd() * .12})`;
      c.beginPath(); c.moveTo(x, 0); c.bezierCurveTo(x + 13, 320, x - 9, 750, x + 3, 1024); c.stroke();
      h.fillStyle = x % 9 ? '#999999' : '#777777'; h.fillRect(x, 0, 1, 1024);
    }
  }
  const map = new THREE.CanvasTexture(color), bumpMap = new THREE.CanvasTexture(height);
  map.colorSpace = THREE.SRGBColorSpace;
  for (const t of [map, bumpMap]) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8; }
  return {map, bumpMap};
}
function material(name, color, roughness = .9, texture, span = 3) {
  const m = new THREE.MeshStandardMaterial({color, roughness, ...(texture ? maps(texture) : {})});
  m.name = name; m.userData.span = span; m.bumpScale = texture === 'brick' ? .018 : .025; return m;
}
export const M = {
  brick: material('Warm fired brick / narrow mortar', '#d4b6a0', .98, 'brick', 3.1),
  brickOld: material('Weathered brick', '#ad998c', .99, 'brick', 3.1),
  stone: material('Aged grey sandstone', '#ada99d', .94, 'stone', 3.8),
  stoneLight: material('Worn stone ledges', '#c9c2b3', .91, 'stone', 3.8),
  stoneDark: material('Damp recessed stone', '#6e7064', .98, 'stone', 3.8),
  timber: material('Deep carved sal timber', '#c0a990', .91, 'wood', 2.5),
  timberEdge: material('Worn timber edges', '#e0b487', .86, 'wood', 2.5),
  tile: material('Aged overlapping clay tile', '#d9b89b', .96, 'tiles', 4.5),
  paving: material('Brick and stone pedestrian paving', '#c8b4a1', .99, 'paving', 3.5),
  recess: material('Sheltered openings', '#1c1b17'),
  bronze: material('Aged bronze', '#665735', .62),
  gold: material('Worn gilded copper', '#b9964f', .48),
  plaster: material('Lime plaster', '#bdb5a0', .98),
  water: material('Hiti water', '#35524b', .26),
  drain: material('Drain iron', '#45433c'),
};
M.gold.metalness = .64; M.bronze.metalness = .56;
M.water.metalness = .18; M.water.transparent = true; M.water.opacity = .88;
