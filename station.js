/**
 * Station.js — Horror Subway Station (Three.js)
 * ------------------------------------------------
 * A dim, foggy, flickering subway platform inspired by old NYC stations
 * (tiled columns, yellow safety strip, steel beams, distant rumbling train).
 *
 * USAGE (plain HTML, no build step):
 * <script type="importmap">
 *   { "imports": { "three": "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js",
 *                  "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/" } }
 * </script>
 * <script type="module" src="Station.js"></script>
 *
 * Push this file to GitHub alongside an index.html that includes the
 * importmap above and a <canvas> (or let it auto-append to <body>).
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// ---------- Renderer / Scene / Camera ----------
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.9;
document.body.style.margin = '0';
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x020303);
scene.fog = new THREE.FogExp2(0x03040a, 0.045);

const camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 200);
camera.position.set(0, 1.6, 10);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 1.6, 0);
controls.enableDamping = true;
controls.maxPolarAngle = Math.PI * 0.55;
controls.minDistance = 1;
controls.maxDistance = 30;

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ---------- Procedural grime textures ----------
function makeTiledWallTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 512;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#c9c4b6';
  ctx.fillRect(0, 0, 512, 512);
  const tile = 32;
  for (let y = 0; y < 512; y += tile) {
    for (let x = 0; x < 512; x += tile) {
      const shade = 190 + Math.random() * 40;
      ctx.fillStyle = `rgb(${shade},${shade - 8},${shade - 20})`;
      ctx.fillRect(x + 1, y + 1, tile - 2, tile - 2);
      if (Math.random() < 0.08) {
        ctx.fillStyle = 'rgba(40,35,25,0.5)';
        ctx.fillRect(x + Math.random() * 10, y + Math.random() * 10, 10, 10);
      }
    }
  }
  // grime streaks
  for (let i = 0; i < 60; i++) {
    ctx.strokeStyle = `rgba(20,18,15,${Math.random() * 0.15})`;
    ctx.lineWidth = Math.random() * 3;
    ctx.beginPath();
    const x = Math.random() * 512;
    ctx.moveTo(x, 0);
    ctx.lineTo(x + (Math.random() - 0.5) * 40, 512);
    ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

function makeFloorTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#3a3a38';
  ctx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 3000; i++) {
    const shade = 40 + Math.random() * 40;
    ctx.fillStyle = `rgba(${shade},${shade},${shade - 4},0.5)`;
    ctx.fillRect(Math.random() * 256, Math.random() * 256, 2, 2);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

const wallTex = makeTiledWallTexture();
wallTex.repeat.set(4, 2);
const floorTex = makeFloorTexture();
floorTex.repeat.set(10, 40);

// ---------- Materials ----------
const wallMat = new THREE.MeshStandardMaterial({ map: wallTex, roughness: 0.95, metalness: 0.02 });
const floorMat = new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.9 });
const columnMat = new THREE.MeshStandardMaterial({ color: 0xbdb8a8, map: wallTex, roughness: 0.9 });
const metalMat = new THREE.MeshStandardMaterial({ color: 0x1c1e1f, roughness: 0.5, metalness: 0.8 });
const yellowMat = new THREE.MeshStandardMaterial({ color: 0xC9A227, roughness: 0.7, emissive: 0x332600, emissiveIntensity: 0.15 });
const trackMat = new THREE.MeshStandardMaterial({ color: 0x0d0d0d, roughness: 0.6, metalness: 0.6 });

// ---------- Geometry: station shell ----------
const STATION_LENGTH = 60;
const STATION_WIDTH = 14;

// Floor (platform)
const floor = new THREE.Mesh(new THREE.PlaneGeometry(8, STATION_LENGTH), floorMat);
floor.rotation.x = -Math.PI / 2;
floor.position.set(-1, 0, 0);
floor.receiveShadow = true;
scene.add(floor);

// Yellow safety strip
const strip = new THREE.Mesh(new THREE.PlaneGeometry(0.6, STATION_LENGTH), yellowMat);
strip.rotation.x = -Math.PI / 2;
strip.position.set(3.2, 0.001, 0);
scene.add(strip);

// Track bed (lower)
const trackBed = new THREE.Mesh(new THREE.PlaneGeometry(6, STATION_LENGTH), trackMat);
trackBed.rotation.x = -Math.PI / 2;
trackBed.position.set(6.5, -0.6, 0);
trackBed.receiveShadow = true;
scene.add(trackBed);

// Rails
for (const rx of [5.2, 7.8]) {
  const rail = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, STATION_LENGTH), metalMat);
  rail.position.set(rx, -0.5, 0);
  scene.add(rail);
}
// Rail ties
for (let z = -STATION_LENGTH / 2; z < STATION_LENGTH / 2; z += 1.2) {
  const tie = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.1, 0.25), new THREE.MeshStandardMaterial({ color: 0x1a1410, roughness: 1 }));
  tie.position.set(6.5, -0.58, z);
  scene.add(tie);
}

// Back wall (behind platform)
const backWall = new THREE.Mesh(new THREE.PlaneGeometry(STATION_LENGTH, 6), wallMat);
backWall.rotation.y = Math.PI / 2;
backWall.position.set(-5, 3, 0);
backWall.receiveShadow = true;
scene.add(backWall);

// Far wall (across tracks)
const farWall = new THREE.Mesh(new THREE.PlaneGeometry(STATION_LENGTH, 6), wallMat);
farWall.rotation.y = -Math.PI / 2;
farWall.position.set(10, 3, 0);
scene.add(farWall);

// Ceiling
const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(STATION_WIDTH, STATION_LENGTH), new THREE.MeshStandardMaterial({ color: 0x111213, roughness: 1 }));
ceiling.rotation.x = Math.PI / 2;
ceiling.position.set(2, 5.6, 0);
scene.add(ceiling);

// Ceiling pipes
for (let z = -STATION_LENGTH / 2; z < STATION_LENGTH / 2; z += 4) {
  const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, STATION_WIDTH, 8), metalMat);
  pipe.rotation.z = Math.PI / 2;
  pipe.position.set(2, 5.3, z);
  scene.add(pipe);
}

// ---------- Columns (row along platform, like reference image) ----------
const columns = [];
const colGeo = new THREE.BoxGeometry(1.1, 5.4, 1.1);
for (let z = -STATION_LENGTH / 2 + 3; z < STATION_LENGTH / 2; z += 5) {
  const col = new THREE.Mesh(colGeo, columnMat);
  col.position.set(0, 2.7, z);
  col.castShadow = true;
  col.receiveShadow = true;
  scene.add(col);
  columns.push(col);

  // rusty patch decals (simple dark planes)
  const patch = new THREE.Mesh(
    new THREE.PlaneGeometry(0.6 + Math.random() * 0.4, 0.8 + Math.random() * 0.5),
    new THREE.MeshStandardMaterial({ color: 0x2b1d14, roughness: 1, transparent: true, opacity: 0.55 })
  );
  patch.position.set(0.56, 1.5 + Math.random(), z + (Math.random() - 0.5));
  patch.rotation.y = Math.PI / 2;
  scene.add(patch);
}

// Steel support beams on far side (like second reference image)
for (let z = -STATION_LENGTH / 2 + 2; z < STATION_LENGTH / 2; z += 3) {
  const beam = new THREE.Mesh(new THREE.BoxGeometry(0.4, 5.2, 0.4), new THREE.MeshStandardMaterial({ color: 0x2e3a2e, roughness: 0.8 }));
  beam.position.set(9.5, 2.6, z);
  scene.add(beam);
}

// A bench (reference image detail)
function makeBench(z) {
  const group = new THREE.Group();
  const seatMat = new THREE.MeshStandardMaterial({ color: 0x5a3a22, roughness: 0.8 });
  for (let i = 0; i < 4; i++) {
    const slat = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.05, 0.12), seatMat);
    slat.position.set(0, 0.5, -0.3 + i * 0.15);
    group.add(slat);
  }
  const legGeo = new THREE.BoxGeometry(0.08, 0.5, 0.08);
  [[-0.7, -0.3], [0.7, -0.3], [-0.7, 0.3], [0.7, 0.3]].forEach(([x, zz]) => {
    const leg = new THREE.Mesh(legGeo, metalMat);
    leg.position.set(x, 0.25, zz);
    group.add(leg);
  });
  group.position.set(-3.6, 0, z);
  scene.add(group);
}
makeBench(-8);
makeBench(6);

// Station name sign (like "Chambers Street")
function makeSign(text, z, rotY = 0) {
  const c = document.createElement('canvas');
  c.width = 512; c.height = 128;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#0c0c0c';
  ctx.fillRect(0, 0, 512, 128);
  ctx.strokeStyle = '#e8e2c8';
  ctx.lineWidth = 4;
  ctx.strokeRect(6, 6, 500, 116);
  ctx.fillStyle = '#e8e2c8';
  ctx.font = 'bold 52px Georgia';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 256, 64);
  const tex = new THREE.CanvasTexture(c);
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 0.65), new THREE.MeshStandardMaterial({ map: tex, emissive: 0xffffff, emissiveMap: tex, emissiveIntensity: 0.25 }));
  sign.position.set(-4.85, 3.4, z);
  sign.rotation.y = rotY;
  scene.add(sign);
}
makeSign('CHAMBERS ST', -10);
makeSign('CHAMBERS ST', 8);

// ---------- Lighting: dim, flickering, horror-toned ----------
const ambient = new THREE.AmbientLight(0x1a1c22, 0.5);
scene.add(ambient);

const flickerLights = [];
for (let z = -STATION_LENGTH / 2 + 3; z < STATION_LENGTH / 2; z += 5) {
  const light = new THREE.PointLight(0xbfd9ff, 1.6, 9, 2);
  light.position.set(1, 5.2, z);
  light.castShadow = true;
  light.shadow.mapSize.set(512, 512);
  scene.add(light);
  flickerLights.push({ light, base: 1.6, seed: Math.random() * 100 });

  // small fixture mesh
  const fixture = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.12, 0.2), new THREE.MeshStandardMaterial({ color: 0x111111, emissive: 0xbfd9ff, emissiveIntensity: 1.2 }));
  fixture.position.copy(light.position);
  scene.add(fixture);
}

// Distant faint warm light (like a train headlight glow far down the tunnel)
const tunnelGlow = new THREE.PointLight(0xff8844, 0, 25, 2);
tunnelGlow.position.set(4, 2, -STATION_LENGTH / 2 - 5);
scene.add(tunnelGlow);

// ---------- Lurking figure (silhouette) ----------
const figureMat = new THREE.MeshStandardMaterial({ color: 0x000000, roughness: 1 });
const figure = new THREE.Group();
const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.28, 1.1, 4, 8), figureMat);
body.position.y = 0.95;
const head = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), figureMat);
head.position.y = 1.75;
figure.add(body, head);
figure.position.set(-4.3, 0, -STATION_LENGTH / 2 + 4);
figure.visible = false;
scene.add(figure);

// ---------- Animation loop ----------
const clock = new THREE.Clock();
let nextFigureEvent = 6 + Math.random() * 8;
let figureTimer = 0;

function animate() {
  requestAnimationFrame(animate);
  const t = clock.getElapsedTime();
  const dt = clock.getDelta();

  // Flicker fluorescent lights
  flickerLights.forEach(({ light, base, seed }) => {
    const flicker = Math.sin(t * 25 + seed) * Math.sin(t * 3.1 + seed);
    const dropout = Math.random() < 0.003 ? 0.05 : 1;
    light.intensity = Math.max(0, base * (0.85 + 0.15 * flicker)) * dropout;
  });

  // Occasional distant train rumble glow
  tunnelGlow.intensity = Math.max(0, Math.sin(t * 0.15) * 1.5);

  // Lurking figure logic: appears briefly in the distance, then vanishes
  figureTimer += dt;
  if (figureTimer > nextFigureEvent) {
    figure.visible = !figure.visible;
    figureTimer = 0;
    nextFigureEvent = figure.visible ? 1.2 + Math.random() * 1.5 : 8 + Math.random() * 10;
  }

  controls.update();
  renderer.render(scene, camera);
}

animate();
