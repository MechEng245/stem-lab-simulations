(function () {
  const els = {
    L: document.getElementById('L'),
    E: document.getElementById('E'),
    I: document.getElementById('I'),
    k: document.getElementById('k'),
    btn: document.getElementById('compute'),
    out: document.getElementById('results'),
    canvas: document.getElementById('view')
  };
  const ctx = els.canvas.getContext('2d');

  function axes() {
    const { width:w, height:h } = els.canvas;
    ctx.clearRect(0,0,w,h);
    ctx.strokeRect(40,30,w-80,h-60);
    ctx.font = '14px system-ui';
    ctx.fillText('Buckling placeholder', 50, 50);
    // simple column
    ctx.fillRect(w/2-10, 90, 20, h-180);
  }

  function compute() {
    // TODO: refine visuals
    const L = +els.L.value;                 // m
    const E = +els.E.value * 1e9;           // Pa
    const I = +els.I.value;                 // m^4
    const k = +els.k.value;
    const Pcr = (Math.PI*Math.PI*E*I) / Math.pow(k*L,2); // N
    els.out.textContent = `P_cr ≈ ${(Pcr/1000).toFixed(1)} kN`;
    axes();
  }

  axes();
  els.btn.addEventListener('click', compute);
})();
