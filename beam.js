// beam.js — Uniformly Loaded, Simply Supported Beam
// v(x) = [ w*x*(L^3 - 2Lx^2 + x^3) ] / [ 24*E*I ]
// M(x) = (w/2)*(L*x - x^2)
// Reactions = wL/2 at each support

(function(){
  const $ = (id) => document.getElementById(id);

  const L  = $("L");
  const E  = $("E");
  const I  = $("I");
  const w  = $("w");
  const runBtn   = $("run");
  const resetBtn = $("reset");

  const beamSvg   = $("beamSvg");
  const momentSvg = $("momentSvg");
  const vmaxEl = $("vmax");
  const mmaxEl = $("mmax");

  // draw supports and baseline
  function drawBeamBase(svg){
    svg.innerHTML = ""; // clear
    const W = svg.viewBox.baseVal.width, H = svg.viewBox.baseVal.height;
    const y0 = H*0.5;

    // beam baseline
    line(svg, 40, y0, W-40, y0, "#222", 3);

    // supports (triangles)
    tri(svg, 60, y0+0, 18, 12, "#777");
    tri(svg, W-60, y0+0, 18, 12, "#777");

    // arrows down (uniform load hint)
    for(let i=0;i<12;i++){
      const x = 60 + i*((W-120)/11);
      arrowDown(svg, x, y0-40, 16, "#888", 2);
    }
  }

  function computeCurve(n, Lm, Em, Im, wm){
    const xs = [], vs = [], Ms = [];
    let vmax = 0, mmax = 0;
    for (let i=0;i<=n;i++){
      const x = (Lm*i)/n;
      const v = (wm * x * (Lm**3 - 2*Lm*x**2 + x**3)) / (24*Em*Im); // meters
      const M = 0.5*wm*(Lm*x - x**2); // N·m
      xs.push(x); vs.push(v); Ms.push(M);
      vmax = Math.max(vmax, Math.abs(v));
      mmax = Math.max(mmax, Math.abs(M));
    }
    return {xs, vs, Ms, vmax, mmax};
  }

  function plotDeflection(svg, xs, vs, Lm){
    const W = svg.viewBox.baseVal.width, H = svg.viewBox.baseVal.height;
    const y0 = H*0.5;
    const xPix = (x)=> 40 + (x/Lm)*(W-80);

    // auto exaggeration so the curve is visible
    const vAbsMax = Math.max(...vs.map(Math.abs));
    const scale = vAbsMax > 0 ? (H*0.3)/vAbsMax : 1;

    // path
    let d = "";
    for(let i=0;i<xs.length;i++){
      const xp = xPix(xs[i]);
      const yp = y0 + vs[i]*scale*80; // exaggerate more visually
      d += (i===0?`M ${xp} ${yp}`:` L ${xp} ${yp}`);
    }
    path(svg, d, "#0a7cff", 3);

    // show scaled shape over baseline again
    line(svg, 40, y0, W-40, y0, "#222", 3);
  }

  function plotMoment(svg, xs, Ms, Lm){
    const W = svg.viewBox.baseVal.width, H = svg.viewBox.baseVal.height;
    const mid = H*0.5;
    const xPix = (x)=> 40 + (x/Lm)*(W-80);

    const Mmax = Math.max(...Ms.map(Math.abs));
    const scale = Mmax>0 ? (H*0.35)/Mmax : 1;

    // axis
    line(svg, 40, mid, W-40, mid, "#444", 1.5);

    // path
    let d = `M ${xPix(0)} ${mid}`;
    for(let i=0;i<xs.length;i++){
      const xp = xPix(xs[i]);
      const yp = mid - Ms[i]*scale/1000; // compress visually
      d += ` L ${xp} ${yp}`;
    }
    d += ` L ${xPix(xs[xs.length-1])} ${mid}`;
    path(svg, d, "#888", 2, true); // filled
  }

  function update(){
    const Lm = parseFloat(L.value);
    const Em = parseFloat(E.value);
    const Im = parseFloat(I.value);
    const wm = parseFloat(w.value);

    if(!(Lm>0 && Em>0 && Im>0 && wm>=0)) return;

    drawBeamBase(beamSvg);
    momentSvg.innerHTML = "";

    const {xs, vs, Ms, vmax, mmax} = computeCurve(200, Lm, Em, Im, wm);
    plotDeflection(beamSvg, xs, vs, Lm);
    plotMoment(momentSvg, xs, Ms, Lm);

    // outputs
    vmaxEl.textContent = `${(vmax*1000).toFixed(2)} mm`;
    mmaxEl.textContent = `${(mmax/1000).toFixed(2)} kN·m`;
  }

  function reset(){
    L.value = 2.0;
    E.value = 2.0e11;
    I.value = 8.0e-6;
    w.value = 1000;
    update();
  }

  // --- tiny SVG helpers ---
  function line(svg,x1,y1,x2,y2,stroke,w){
    const el = document.createElementNS("http://www.w3.org/2000/svg","line");
    el.setAttribute("x1",x1); el.setAttribute("y1",y1);
    el.setAttribute("x2",x2); el.setAttribute("y2",y2);
    el.setAttribute("stroke",stroke); el.setAttribute("stroke-width",w);
    svg.appendChild(el);
  }
  function path(svg,d,stroke,w,fill=false){
    const el = document.createElementNS("http://www.w3.org/2000/svg","path");
    el.setAttribute("d",d);
    el.setAttribute("fill", fill ? "rgba(10,124,255,0.08)" : "none");
    el.setAttribute("stroke",stroke);
    el.setAttribute("stroke-width",w);
    svg.appendChild(el);
  }
  function tri(svg, x, y, bw, bh, color){
    const p = `${x-bw},${y} ${x+bw},${y} ${x},${y+bh}`;
    const el = document.createElementNS("http://www.w3.org/2000/svg","polygon");
    el.setAttribute("points", p);
    el.setAttribute("fill", color);
    svg.appendChild(el);
  }
  function arrowDown(svg, x, y, h, color, w){
    line(svg, x, y, x, y+h, color, w);
    const head = document.createElementNS("http://www.w3.org/2000/svg","polygon");
    head.setAttribute("points", `${x-5},${y+h-2} ${x+5},${y+h-2} ${x},${y+h+8}`);
    head.setAttribute("fill", color);
    svg.appendChild(head);
  }

  runBtn.addEventListener("click", update);
  resetBtn.addEventListener("click", reset);

  // first draw
  reset();
})();
