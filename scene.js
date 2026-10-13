import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {SSAOPass} from 'three/addons/postprocessing/SSAOPass.js';
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';
import {M, random} from './materials.js';
import {group, mesh, box, cylinder, ellipsoid, beam, hipRoof, windowFrame, uvScale, optimize} from './geometry.js';
import {landmarks, buildTemples, buildKrishna, buildOctagonal, buildPalace, buildWater, buildMonuments, ovalPoints} from './architecture.js';

const host=document.querySelector('#scene'), scene=new THREE.Scene(), rnd=random(781);
scene.name='Patan Durbar Square / estimated metres';
const sky=document.createElement('canvas');sky.width=32;sky.height=512;const skyContext=sky.getContext('2d');
const gradient=skyContext.createLinearGradient(0,0,0,512);gradient.addColorStop(0,'#91adbf');gradient.addColorStop(.58,'#c7d0ce');gradient.addColorStop(1,'#e6e1d5');skyContext.fillStyle=gradient;skyContext.fillRect(0,0,32,512);
const skyTexture=new THREE.CanvasTexture(sky);skyTexture.colorSpace=THREE.SRGBColorSpace;scene.background=skyTexture;scene.fog=new THREE.Fog('#d7d9d0',175,340);
const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.03;renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.domElement.setAttribute('aria-label','Patan square: drag to orbit, scroll to zoom');renderer.domElement.tabIndex=0;host.prepend(renderer.domElement);
const camera=new THREE.PerspectiveCamera(48,1,.12,600);
const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.dampingFactor=.075;controls.minDistance=2.2;controls.maxDistance=240;controls.maxPolarAngle=Math.PI*.495;
const ambient=new THREE.HemisphereLight('#e1e9ee','#99836b',1.45);scene.add(ambient);
const sun=new THREE.DirectionalLight('#fff2d9',2.5);sun.position.set(-65,100,45);sun.target.position.set(0,0,0);sun.castShadow=true;
sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-90,right:90,top:105,bottom:-105,near:1,far:260});sun.shadow.normalBias=.035;sun.shadow.bias=-.00012;sun.shadow.radius=3;scene.add(sun,sun.target);
const fill=new THREE.DirectionalLight('#c7d8e2',.32);fill.position.set(65,35,-55);scene.add(fill);
const composer=new EffectComposer(renderer);composer.addPass(new RenderPass(scene,camera));
const ao=new SSAOPass(scene,camera,1,1);ao.kernelRadius=3;ao.minDistance=.001;ao.maxDistance=.07;composer.addPass(ao);composer.addPass(new OutputPass());

// The paving mesh has actual openings. Water structures extend below zero ground level.
const groundShape=new THREE.Shape([new THREE.Vector2(-125,-145),new THREE.Vector2(125,-145),new THREE.Vector2(125,145),new THREE.Vector2(-125,145)]);
function groundHole(points,x,z){groundShape.holes.push(new THREE.Path(points.map(([px,pz])=>new THREE.Vector2(x+px,-z-pz))));}
groundHole([[-5,-4.5],[5,-4.5],[5,4.5],[-5,4.5]],-4,68);
groundHole(ovalPoints(3.7,2.75),31,-34);
groundHole([[-10,-6.5],[10,-6.5],[10,6.5],[-10,6.5]],46,-55);
const groundGeo=new THREE.ShapeGeometry(groundShape);groundGeo.rotateX(-Math.PI/2);uvScale(groundGeo,3.5);
const ground=mesh(scene,groundGeo,M.paving);ground.name='Continuous brick paving with three sunken openings';ground.castShadow=false;
const infrastructure=group(scene,'Stone thresholds and drainage');
for(const x of [-43,15])for(let z=-79;z<78;z+=3){box(infrastructure,x,.012,z,.24,.035,2.94,M.stoneDark);for(let i=0;i<6;i++)box(infrastructure,x,.052,z-1.1+i*.4,.2,.02,.04,M.drain);}
for(const z of [-74,79])box(infrastructure,0,.012,z,96,.035,.35,M.stone);
optimize(infrastructure);

buildTemples(scene);buildKrishna(scene);buildOctagonal(scene);buildPalace(scene);buildWater(scene);buildMonuments(scene);

// Immediate streets are kept subordinate to the researched monuments.
const surroundings=group(scene,'Provisional surrounding streets');
const mutedPlaster=M.plaster.clone();mutedPlaster.color.set('#aa9782');
for(const side of [-1,1])for(let i=0;i<12;i++){
  const z=-78+i*14,x=side<0?-54:68,w=9+rnd()*3,d=8+rnd()*3,h=7.3+rnd()*4.1;
  const house=group(surroundings,`Street façade ${side}/${i}`,x,0,z);house.rotation.y=side<0?Math.PI/2:-Math.PI/2;
  box(house,0,0,0,w,h,d,i%4===0?mutedPlaster:M.brickOld);
  box(house,0,0,d/2+.03,w,.3,.45,M.stone);
  for(let floor=0;floor<3;floor++){
    if(floor*2.8+2>h)continue;
    box(house,0,floor*2.8+2.65,0,w+.12,.13,d+.12,M.timber);
    for(let bay=0;bay<3;bay++)windowFrame(house,(bay-1)*w*.29,floor*2.8+.55,d/2+.03,.85,floor===0?1.8:1.25);
  }
  hipRoof(house,w+1,d+1,h,1.45,w*.55,.3);
  if(side<0){box(house,0,2.9,d/2+.5,w*.85,.08,1.45,M.timber);for(const s of [-1,1])beam(house,[s*w*.35,2.1,d/2],[s*w*.35,2.86,d/2+1.1],.08,.09);}
}
optimize(surroundings);
const foliage=group(scene,'Palace garden trees / indicative planting');
const leafMats=['#566444','#63704c','#6e7750','#4b5c40','#788058'].map(color=>new THREE.MeshStandardMaterial({color,roughness:1}));
for(let i=0;i<18;i++){
  const x=52+rnd()*8,z=-78+i*8.8,h=8+rnd()*4;
  cylinder(foliage,x,0,z,.25,.14,h*.68,M.timber,7);
  for(let branch=0;branch<4;branch++){
    const a=branch*Math.PI/2+i;beam(foliage,[x,h*.37,z],[x+Math.cos(a)*1.9,h*.7,z+Math.sin(a)*1.9],.12,.13);
  }
  for(let j=0;j<16;j++){
    const a=rnd()*Math.PI*2,r=Math.sqrt(rnd())*2.8;
    ellipsoid(foliage,x+Math.cos(a)*r,h*.7+rnd()*2.4,z+Math.sin(a)*r,1.1+rnd(),.8+rnd()*.65,1+rnd(),leafMats[j%5],9);
  }
}
optimize(foliage);
const people=group(scene,'Visitors / scale 1.6–1.8 metres');
const clothes=['#75614e','#4e5c66','#894c40','#8c8170','#586753'].map(color=>new THREE.MeshStandardMaterial({color,roughness:.95}));
const skin=new THREE.MeshStandardMaterial({color:'#937057',roughness:.95});
const spots=[[8,48],[7,47],[-18,36],[-19,37],[-12,12],[6,-14],[8,-15],[-30,-20],[-4,-45],[-18,68],[12,57],[13,55],[17,-31],[15,8],[-39,20],[-39,22],[2,30],[-10,-65]];
spots.forEach(([x,z],i)=>{
  const p=group(people,'Visitor',x,0,z);p.rotation.y=i*1.77;const c=clothes[i%5];
  for(const s of [-1,1]){cylinder(p,s*.105,.08,0,.065,.064,.76,c,7);beam(p,[s*.18,1.35,0],[s*.25,.89,.08],.08,.08,c);}
  ellipsoid(p,0,1.12,0,.21,.35,.14,c);ellipsoid(p,0,1.59,0,.105,.14,.11,skin);box(p,0,1.39,0,.09,.1,.09,skin);
});optimize(people);

const places=document.querySelector('#places'),detail=document.querySelector('#selected-detail');
let selected=null,walk=false,yaw=0,pitch=0,dragging=false,lastPointer=null,transition=null,markersOn=false,warm=false;
const keys=new Set(),markers=[],projected=new THREE.Vector3();
landmarks.sort((a,b)=>b.z-a.z);
for(const [i,lm] of landmarks.entries()){
  lm.number=String(i+1).padStart(2,'0');
  const b=document.createElement('button');b.className='place';b.dataset.id=lm.id;
  b.innerHTML=`<span class="place-no">${lm.number}</span><span><strong>${lm.name}</strong><small>${({temple:'Brick & timber',stone:'Stone temple',palace:'Royal courtyard',water:'Sacred water',monument:'Column & sculpture',pavilion:'Public pavilion',shrine:'Subsidiary shrine'})[lm.kind]}</small></span><span class="place-arrow">↗</span>`;
  b.onclick=()=>focus(lm);places.append(b);
  const marker=document.createElement('button');marker.className='marker';marker.textContent=lm.number;marker.title=lm.name;marker.setAttribute('aria-label',`Focus ${lm.name}`);marker.onclick=()=>focus(lm);host.append(marker);markers.push({el:marker,lm});
}
function setView(position,target,animate=true){
  exitWalk();
  if(animate)transition={start:performance.now(),from:camera.position.clone(),to:new THREE.Vector3(...position),oldTarget:controls.target.clone(),target:new THREE.Vector3(...target)};
  else{camera.position.set(...position);controls.target.set(...target);controls.update();}
}
function overview(animate=true){
  const aspect=host.clientWidth/Math.max(1,host.clientHeight),scale=aspect<.9?1.22:1;
  setView([-88*scale,81*scale,96*scale],[4,1,2],animate);selected=null;document.querySelectorAll('.place').forEach(b=>b.classList.remove('selected'));
  detail.innerHTML='<span class="eyebrow">CONTEMPORARY INTERPRETATION</span><h3>A living Newar square</h3><p>Select a landmark for a closer view. The model uses estimated dimensions, with uncertain sculptural details kept restrained.</p>';
}
function focus(lm){
  selected=lm;const r=lm.radius;
  if(lm.court)setView([lm.x-r*.62,Math.max(8,r*.9),lm.z+r*.65],[lm.x,lm.targetY,lm.z]);
  else setView([lm.x+r*1.8,r*1.15+4,lm.z+r*1.55],[lm.x,lm.targetY,lm.z]);
  document.querySelectorAll('.place').forEach(b=>b.classList.toggle('selected',b.dataset.id===lm.id));
  detail.innerHTML=`<span class="eyebrow">${lm.number} / ${lm.kind.toUpperCase()}</span><h3>${lm.name}</h3><p>${lm.detail}</p>`;
}
function exitWalk(){walk=false;dragging=false;controls.enabled=true;document.querySelector('#walkView').classList.remove('active');document.querySelector('#hint').textContent='Drag to orbit · Scroll to zoom · Right-drag to pan';}
function enterWalk(){
  transition=null;walk=true;controls.enabled=false;document.querySelector('#walkView').classList.add('active');
  const lm=selected;
  if(lm?.court){camera.position.set(lm.x-2.2,1.68,lm.z+3.4);yaw=Math.PI-.3;pitch=-.08;}
  else if(lm){camera.position.set(lm.x+lm.radius+3,1.68,lm.z+2);yaw=-Math.PI/2;pitch=.16;}
  else{camera.position.set(9,1.68,31);yaw=-1.55;pitch=.13;}
  document.querySelector('#hint').textContent='Eye level · Drag to look · W A S D / arrows to move · Esc to return';renderer.domElement.focus();updateWalkCamera();
}
function updateWalkCamera(){const direction=new THREE.Vector3(Math.sin(yaw)*Math.cos(pitch),Math.sin(pitch),Math.cos(yaw)*Math.cos(pitch));camera.lookAt(camera.position.clone().add(direction));}
document.querySelector('#overview').onclick=()=>overview();
document.querySelector('#topView').onclick=()=>setView([0,205,.02],[0,0,0]);
document.querySelector('#walkView').onclick=()=>walk?overview():enterWalk();
document.querySelector('#light').onclick=e=>{
  warm=!warm;e.currentTarget.textContent=warm?'Late afternoon':'Neutral daylight';e.currentTarget.classList.toggle('active',warm);
  sun.color.set(warm?'#ffd29b':'#fff2d9');sun.position.set(warm?-85:-65,warm?46:100,warm?25:45);sun.intensity=warm?2.4:2.5;ambient.intensity=warm?1.15:1.45;
};
document.querySelector('#labels').onclick=e=>{markersOn=!markersOn;e.currentTarget.classList.toggle('active',markersOn);e.currentTarget.setAttribute('aria-pressed',String(markersOn));};
document.querySelector('#details').onclick=e=>{ao.enabled=!ao.enabled;e.currentTarget.classList.toggle('active',ao.enabled);e.currentTarget.textContent=ao.enabled?'Ambient shadows on':'Ambient shadows off';};
document.querySelectorAll('.tab').forEach(t=>t.onclick=()=>{document.querySelectorAll('.tab').forEach(b=>b.classList.toggle('active',b===t));document.querySelectorAll('.story').forEach(s=>s.classList.toggle('visible',s.id===t.dataset.tab));});
renderer.domElement.addEventListener('pointerdown',e=>{transition=null;if(walk){dragging=true;lastPointer=[e.clientX,e.clientY];renderer.domElement.setPointerCapture(e.pointerId);}});
renderer.domElement.addEventListener('pointermove',e=>{if(!walk||!dragging)return;yaw-=(e.clientX-lastPointer[0])*.005;pitch=THREE.MathUtils.clamp(pitch-(e.clientY-lastPointer[1])*.004,-1.15,1.15);lastPointer=[e.clientX,e.clientY];updateWalkCamera();});
renderer.domElement.addEventListener('pointerup',()=>dragging=false);
renderer.domElement.addEventListener('pointercancel',()=>dragging=false);
window.addEventListener('keydown',e=>{if(e.key==='Escape'){overview();return;}if(walk&&['w','a','s','d','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Shift'].includes(e.key)){e.preventDefault();keys.add(e.key);}});
window.addEventListener('keyup',e=>keys.delete(e.key));window.addEventListener('blur',()=>{keys.clear();dragging=false;});
function resize(){const w=host.clientWidth,h=host.clientHeight;renderer.setSize(w,h,false);composer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();}
new ResizeObserver(resize).observe(host);resize();overview(false);
let previous=performance.now(),frameCount=0,markerTime=0;
function animate(time){
  requestAnimationFrame(animate);const dt=Math.min(.05,(time-previous)/1000);previous=time;
  if(transition){const t=Math.min(1,(time-transition.start)/800),ease=t*t*(3-2*t);camera.position.lerpVectors(transition.from,transition.to,ease);controls.target.lerpVectors(transition.oldTarget,transition.target,ease);if(t===1)transition=null;}
  if(walk){
    const forward=(keys.has('w')||keys.has('ArrowUp')?1:0)-(keys.has('s')||keys.has('ArrowDown')?1:0),right=(keys.has('d')||keys.has('ArrowRight')?1:0)-(keys.has('a')||keys.has('ArrowLeft')?1:0);
    const speed=dt*(keys.has('Shift')?7:3.5)/Math.max(1,Math.hypot(forward,right));
    camera.position.x=THREE.MathUtils.clamp(camera.position.x+(Math.sin(yaw)*forward+Math.cos(yaw)*right)*speed,-90,95);
    camera.position.z=THREE.MathUtils.clamp(camera.position.z+(Math.cos(yaw)*forward-Math.sin(yaw)*right)*speed,-110,110);camera.position.y=1.68;updateWalkCamera();
  }else controls.update();
  composer.render();frameCount++;
  if(time-markerTime>120){markerTime=time;const occupied=[];
    for(const {el,lm} of markers){projected.set(lm.x+lm.radius*.55,.9,lm.z+lm.radius*.45).project(camera);const x=(projected.x*.5+.5)*host.clientWidth,y=(-projected.y*.5+.5)*host.clientHeight;
      const valid=markersOn&&!walk&&projected.z>-1&&projected.z<1&&x>20&&x<host.clientWidth-20&&y>112&&y<host.clientHeight-30&&!occupied.some(p=>Math.hypot(p[0]-x,p[1]-y)<40);
      el.hidden=!valid;if(valid){occupied.push([x,y]);el.style.left=x+'px';el.style.top=y+'px';}
    }
  }
}
const krishna=landmarks.find(l=>l.id==='krishna');let pinnacles=0;krishna.root.traverse(o=>{if(o.userData.pinnacle)pinnacles++;});
if(pinnacles!==21)throw new Error(`Krishna Mandir has ${pinnacles} pinnacles; expected 21`);
for(const lm of landmarks)lm.root.traverse(o=>{if(o.isMesh){const p=o.geometry.attributes.position;for(let i=0;i<p.array.length;i++)if(!Number.isFinite(p.array[i]))throw new Error(`Invalid geometry in ${lm.name}`);}});
document.documentElement.dataset.sceneReady='true';document.querySelector('#loading').hidden=true;
console.info('Patan scene ready',JSON.stringify({landmarks:landmarks.length,krishnaPinnacles:pinnacles,templeRoofs:landmarks.filter(l=>l.root.userData.roofCount).map(l=>[l.id,l.root.userData.roofCount]),octagonal:landmarks.find(l=>l.id==='chyasin').root.userData.footprint,groundOpenings:groundShape.holes.length}));
window.patanDiagnostics=()=>({landmarks:landmarks.length,pinnacles,frameCount,walk,drawCalls:renderer.info.render.calls,triangles:renderer.info.render.triangles,camera:camera.position.toArray(),selected:selected?.id,ambientOcclusion:ao.enabled});
requestAnimationFrame(animate);
