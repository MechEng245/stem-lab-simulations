(function () {
  const els = {
    L0: document.getElementById('L0'),
    d:  document.getElementById('d'),
    E:  document.getElementById('E'),
    btn: document.getElementById('compute'),
    out: document.getElementById('results'),
    canvas: document.getElementById('view')
  };
  const ctx = els.canvas.getContext('2d');

  function drawAxes() {
    const { width:w, height:h } = els.canvas;
    ctx.clearRect(0,0,w,h);
    ctx.strokeRect(60,20,w-100,h-80);
    // axes
    ctx.beginPath();
    ctx.moveTo(80,h-60); ctx.lineTo(w-40,h-60); // x
    ctx.moveTo(80,h-60); ctx.lineTo(80,40);     // y
    ctx.stroke();
    ctx.font = '12px system-ui';
    ctx.fillText('Strain ε', w-120, h-40);
    ctx.fillText('Stress σ', 20, 50);
  }

  function fakeCurve() {
    const { width:w, height:h } = els.canvas;
    ctx.beginPath();
    const x0 = 80, y0 = h-60;
    for (let i=0;i<=100;i++){
      const x = x0 + (w-120)*i/100;
      // quick shape: linear then soft peak
      const lin = i*0.012;
      const soft = Math.sin(i/100*Math.PI)*0.6;
      const y = y0 - (lin+soft)*50;
      if(i===0) ctx.moveTo(x,y);
      else ctx.lineTo(x,y);
    }
    ctx.stroke();
  }

  function compute() {
    // TODO: replace with real stress–strain from inputs or uploaded data
    const L0 = +els.L0.value; const d = +els.d.value; const E = +els.E.value;
    els.out.textContent = `Ready to plot σ–ε (E=${E} GPa, L₀=${L0} mm, d=${d} mm).`;
    drawAxes(); fakeCurve();
  }

  drawAxes(); fakeCurve();
  els.btn.addEventListener('click', compute);
})();
