(function () {
  const els = {
    L0: document.getElementById('L0'),
    alpha: document.getElementById('alpha'),
    dT: document.getElementById('dT'),
    btn: document.getElementById('compute'),
    out: document.getElementById('results'),
    canvas: document.getElementById('view')
  };
  const ctx = els.canvas.getContext('2d');

  function drawBar(Lpx) {
    const { width:w, height:h } = els.canvas;
    ctx.clearRect(0,0,w,h);
    ctx.strokeRect(40,30,w-80,h-60);
    ctx.fillRect(100, h/2 - 15, Lpx, 30);
  }

  function compute() {
    const L0 = +els.L0.value;           // m
    const alpha = +els.alpha.value;     // 1/°C
    const dT = +els.dT.value;           // °C
    const dL = alpha * L0 * dT;
    const L = L0 + dL;
    els.out.textContent = `ΔL ≈ ${dL.toFixed(6)} m, L ≈ ${L.toFixed(6)} m`;
    // map meters to pixels (just for a feel)
    const scale = 400 / (Math.max(L, L0) * 1.2);
    drawBar(L * scale);
  }

  drawBar(300);
  els.btn.addEventListener('click', compute);
})();
