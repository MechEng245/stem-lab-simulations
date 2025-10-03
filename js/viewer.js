// Minimal web CAD viewer: orbit/pan/zoom, grid, axes, load STL, extrude 2D sketch to mesh, export STL.

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/controls/OrbitControls.js';
import { STLLoader } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/loaders/STLLoader.js';
import { STLExporter } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/exporters/STLExporter.js';

const canvas = document.getElementById('three-canvas');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 2000);
camera.position.set(120, 120, 120);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
resize();
window.addEventListener('resize', resize);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

const grid = new THREE.GridHelper(400, 40, 0x888888, 0xdddddd);
scene.add(grid);

const axes = new THREE.AxesHelper(60);
scene.add(axes);

// Lighting
const dir = new THREE.DirectionalLight(0xffffff, 0.8);
dir.position.set(1, 1, 1);
scene.add(dir);
scene.add(new THREE.AmbientLight(0xffffff, 0.6));

let currentMesh = null;
const loader = new STLLoader();
const exporter = new STLExporter();

// --- UI elements
const fileSTL = document.getElementById('file-stl');
const fileSketch = document.getElementById('file-sketch');
const btnLoadSample = document.getElementById('btn-load-sample');
const btnExportSTL = document.getElementById('btn-export-stl');
const btnExtrude = document.getElementById('btn-extrude');
const depthInput = document.getElementById('extrude-depth');
const dropzone = document.getElementById('dropzone');
const featureBox = document.getElementById('feature-json');

// Minimal "feature history"
let featureHistory = [];

function setFeatureHistoryDisplay() {
  featureBox.textContent = 'Features: ' + JSON.stringify(featureHistory, null, 0);
}

// --- Actions
btnLoadSample.addEventListener('click', async () => {
  const res = await fetch('./assets/models/cube_ascii.stl');
  const txt = await res.text();
  const arrayBuffer = new TextEncoder().encode(txt).buffer;
  loadSTLFromArrayBuffer(arrayBuffer, 'cube_ascii.stl');
  featureHistory.push({ type: 'load-sample', name: 'cube_ascii.stl' });
  setFeatureHistoryDisplay();
});

fileSTL.addEventListener('change', (e) => {
  const f = e.target.files[0];
  if (!f) return;
  f.arrayBuffer().then((ab) => {
    loadSTLFromArrayBuffer(ab, f.name);
    featureHistory.push({ type: 'import-stl', name: f.name });
    setFeatureHistoryDisplay();
  });
});

fileSketch.addEventListener('change', (e) => {
  const f = e.target.files[0];
  if (!f) return;
  f.text().then((txt) => {
    const profile = JSON.parse(txt); // [{x,y}, ...]
    extrudeProfile(profile, Number(depthInput.value || 20));
  });
});

btnExtrude.addEventListener('click', () => {
  alert('To extrude: Import a Sketch JSON first (from sketch.html).');
});

btnExportSTL.addEventListener('click', () => {
  if (!currentMesh) {
    alert('Nothing to export yet.');
    return;
  }
  const geom = currentMesh.geometry;
  const stl = exporter.parse(geom);
  downloadText(stl, 'model.stl');
});

// Drag & drop
['dragenter', 'dragover'].forEach(type =>
  dropzone.addEventListener(type, (e) => { e.preventDefault(); dropzone.style.background = '#fff'; })
);
dropzone.addEventListener('dragleave', () => { dropzone.style.background = ''; });
dropzone.addEventListener('drop', (e) => {
  e.preventDefault(); dropzone.style.background = '';
  const f = e.dataTransfer.files[0];
  if (!f) return;
  if (f.name.toLowerCase().endsWith('.stl')) {
    f.arrayBuffer().then(ab => {
      loadSTLFromArrayBuffer(ab, f.name);
      featureHistory.push({ type: 'import-stl', name: f.name });
      setFeatureHistoryDisplay();
    });
  } else if (f.name.toLowerCase().endsWith('.json')) {
    f.text().then(txt => {
      const profile = JSON.parse(txt);
      extrudeProfile(profile, Number(depthInput.value || 20));
    });
  } else {
    alert('Drop an .stl or a Sketch .json file.');
  }
});

// --- Core funcs
function loadSTLFromArrayBuffer(arrayBuffer, label = 'model.stl') {
  const geometry = loader.parse(arrayBuffer);
  geometry.computeVertexNormals();
  addMesh(geometry, label);
}

function extrudeProfile(profilePoints, depth = 20) {
  if (!Array.isArray(profilePoints) || profilePoints.length < 3) {
    alert('Sketch must be a closed polygon with at least 3 points.');
    return;
  }
  const first = profilePoints[0];
  const last = profilePoints[profilePoints.length - 1];
  if (first.x !== last.x || first.y !== last.y) profilePoints.push({ x: first.x, y: first.y });

  const shape = new THREE.Shape(profilePoints.map(p => new THREE.Vector2(p.x, p.y)));
  const extrudeSettings = { depth: depth, bevelEnabled: false };
  const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  geometry.rotateX(-Math.PI / 2);
  geometry.computeVertexNormals();

  addMesh(geometry, `Extrude(${depth}mm)`);
  featureHistory.push({ type: 'extrude', depth, profile: profilePoints.slice(0, 4).concat('…') });
  setFeatureHistoryDisplay();
}

function addMesh(geometry, label) {
  if (currentMesh) {
    scene.remove(currentMesh);
    currentMesh.geometry.dispose();
    if (currentMesh.material && currentMesh.material.dispose) currentMesh.material.dispose();
  }
  const mat = new THREE.MeshStandardMaterial({ metalness: 0.2, roughness: 0.6 });
  currentMesh = new THREE.Mesh(geometry, mat);
  scene.add(currentMesh);
  zoomToObject(currentMesh);
  console.log(`Loaded: ${label}`);
}

function zoomToObject(obj) {
  const box = new THREE.Box3().setFromObject(obj);
  const size = new THREE.Vector3();
  const center = new THREE.Vector3();
  box.getSize(size);
  box.getCenter(center);
  const maxDim = Math.max(size.x, size.y, size.z);
  const fitDist = maxDim * 2.2;
  const dir = new THREE.Vector3(1, 1, 1).normalize();
  camera.position.copy(center.clone().add(dir.multiplyScalar(fitDist)));
  camera.near = maxDim / 100;
  camera.far = maxDim * 100;
  camera.updateProjectionMatrix();
  controls.target.copy(center);
  controls.update();
}

function downloadText(text, filename) {
  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

animate();
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

function resize() {
  const wrap = document.getElementById('canvas-wrap');
  const w = wrap.clientWidth || window.innerWidth;
  const h = window.innerHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
}
