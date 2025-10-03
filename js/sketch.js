// Minimal 2D polygon sketcher: draw lines/rectangles, snap, export as [{x,y}...]

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const btnLine = document.getElementById('btn-line');
const btnRect = document.getElementById('btn-rect');
const btnClose = document.getElementById('btn-close');
const btnClear = document.getElementById('btn-clear');
const btnExport = document.getElementById('btn-export');
const snapInput = document.getElementById('snap');

let tool = 'line';
let points = [];       // working polyline points [{x,y},...]
let tempRect = null;   // {x0,y0,x1,y1} while drawing
let isDown = false;

btnLine.onclick = () => { tool = 'line'; tempRect = null; redraw(); };
btnRect.onclick = () => { tool = 'rect'; tempRect = null; redraw(); };
btnClose.onclick = () => closeLoop();
btnClear.onclick = () => { points = []; tempRect = null; redraw(); };
btnExport.onclick = () => exportJSON();

canvas.addEventListener('pointerdown', (e) => { isDown = true; handleDown(e); });
canvas.addEventListener('pointermove', (e) => { if (isDown) handleMove(e); });
canvas.addEventListener('pointerup',   (e) => { isDown = false; handleUp(e); });

function toLocal(e) {
  const rect = canvas.getBoundingClientRect();
  let x = e.clientX - rect.left, y = e.clientY - rect.top;
  const snap = Math.max(1, Number(snapInput.value || 1));
  x = Math.round(x / snap) * snap;
  y = Math.round(y / snap) * snap;
  return { x, y };
}

function handleDown(e) {
  const p = toLocal(e);
  if (tool === 'line') {
    points.push(p);
  } else if (tool === 'rect') {
    tempRect = { x0: p.x, y0: p.y, x1: p.x, y1: p.y };
  }
  redraw();
}

function handleMove(e) {
  const p = toLocal(e);
  if (tool === 'line') {
    redraw(p);
  } else if (tool === 'rect' && tempRect) {
    tempRect.x1 = p.x; tempRect.y1 = p.y;
    redraw();
  }
}

function handleUp(e) {
  const p = toLocal(e);
  if (tool === 'rect' && tempRect) {
    const r = tempRect;
    points.push({ x: r.x0, y: r.y0 });
    points.push({ x: r.x1, y: r.y0 });
    points.push({ x: r.x1, y: r.y1 });
    points.push({ x: r.x0, y: r.y1 });
    tempRect = null;
    redraw();
  }
}

function closeLoop() {
  if (points.length < 3) { alert('Need at least 3 points.'); return; }
  const first = points[0], last = points[points.length - 1];
  if (first.x !== last.x || first.y !== last.y) points.push({ x: first.x, y: first.y });
  redraw();
}

function exportJSON() {
  if (points.length < 3) { alert('Draw a closed loop first.'); return; }
  const first = points[0], last = points[points.length - 1];
  if (first.x !== last.x || first.y !== last.y) points.push({ x: first.x, y: first.y });

  const centered = centerPoints(points);
  const data = JSON.stringify(centered, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'sketch.json';
  a.click();
  URL.revokeObjectURL(a.href);
}

function centerPoints(pts) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const p of pts) { if (p.x < minX) minX = p.x; if (p.y < minY) minY = p.y; if (p.x > maxX) maxX = p.x; if (p.y > maxY) maxY = p.y; }
  const cx = (minX + maxX) / 2, cy = (minY + maxY) / 2;
  return pts.map(p => ({ x: p.x - cx, y: p.y - cy }));
}

function redraw(previewPoint) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // grid
  ctx.strokeStyle = '#f0f0f0';
  ctx.lineWidth = 1;
  for (let x = 0; x <= canvas.width; x += 20) { drawLine(x, 0, x, canvas.height); }
  for (let y = 0; y <= canvas.height; y += 20) { drawLine(0, y, canvas.width, y); }

  // axes
  ctx.strokeStyle = '#e0e0e0';
  drawLine(canvas.width / 2, 0, canvas.width / 2, canvas.height);
  drawLine(0, canvas.height / 2, canvas.width, canvas.height / 2);

  // polyline
  if (points.length > 0) {
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y);
    ctx.stroke();
  }

  // preview
  if (previewPoint && points.length > 0 && tool === 'line') {
    ctx.strokeStyle = '#888';
    ctx.setLineDash([6, 6]);
    drawLine(points[points.length - 1].x, points[points.length - 1].y, previewPoint.x, previewPoint.y);
    ctx.setLineDash([]);
  }

  if (tempRect) {
    ctx.strokeStyle = '#666';
    ctx.setLineDash([6, 6]);
    drawRect(tempRect.x0, tempRect.y0, tempRect.x1, tempRect.y1);
    ctx.setLineDash([]);
  }
}

function drawLine(x0, y0, x1, y1) {
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
}
function drawRect(x0, y0, x1, y1) {
  drawLine(x0, y0, x1, y0);
  drawLine(x1, y0, x1, y1);
  drawLine(x1, y1, x0, y1);
  drawLine(x0, y1, x0, y0);
}

redraw();
