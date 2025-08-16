import { mount, initTheme, wireNav, sectionTitle, kpi } from './ui.js';
import { BeamBending } from './beamBending.js';
import { TensileTest } from './tensileTest.js';
import { HeatConduction } from './heatConduction.js';
import { BernoulliVenturi } from './bernoulliVenturi.js';
import { WindTurbine } from './windTurbine.js';

const routes = {
  home(){
    mount(`
      <div class="card">
        ${sectionTitle('STEM Lab Simulations', 'High-tech, mobile-friendly labs for schools without physical lab access.')}
        <p class="help">No accounts. Runs on phones and Chromebooks. Built with p5.js.</p>
        <div class="row" style="margin-top:8px;">
          <span class="badge">Mechanical Engineering</span>
          <span class="badge">Open Educational Resource</span>
          <span class="badge">Accessibility-first</span>
        </div>
      </div>
      <div class="grid grid-2" style="margin-top:16px;">
        <div class="card">
          ${sectionTitle('Simulations')}
          <ul>
            <li><a href="#simulations?beam">Beam Bending & Material Choice</a></li>
            <li><a href="#simulations?tensile">Tensile Test: Stress-Strain</a></li>
            <li><a href="#simulations?heat">Heat Conduction Sandbox</a></li>
            <li><a href="#simulations?fluids">Bernoulli & Venturi</a></li>
            <li><a href="#simulations?wind">Wind Turbine Power Curve</a></li>
          </ul>
        </div>
        <div class="card">
          ${sectionTitle('Teacher Kits')}
          <p class="help">Printable 1–2 page guides with objectives, quick activities, and worksheets.</p>
          <ul>
            <li><a href="lessons/beam-bending.html">Beam Bending Kit (PDF coming soon)</a></li>
            <li><a href="lessons/tensile-test.html">Tensile Test Kit</a></li>
            <li><a href="lessons/heat-conduction.html">Heat Conduction Kit</a></li>
            <li><a href="lessons/bernoulli-venturi.html">Bernoulli & Venturi Kit</a></li>
            <li><a href="lessons/wind-turbine.html">Wind Turbine Kit</a></li>
          </ul>
        </div>
      </div>
    `);
  },

  simulations(){
    // Which sim?
    const q = (location.hash.split('?')[1] || '').toLowerCase();
    if(q.includes('beam')) return BeamBending();
    if(q.includes('tensile')) return TensileTest();
    if(q.includes('heat')) return HeatConduction();
    if(q.includes('fluids')) return BernoulliVenturi();
    if(q.includes('wind')) return WindTurbine();

    // Default list
    mount(`
      <div class="card">${sectionTitle('Simulations')}</div>
      <div class="grid">
        <a class="card" href="#simulations?beam"><b>Beam Bending & Material Choice</b><div class="help">Deflection, stress, safety factor</div></a>
        <a class="card" href="#simulations?tensile"><b>Tensile Test: Stress-Strain Explorer</b><div class="help">Yield, UTS, ductile vs brittle</div></a>
        <a class="card" href="#simulations?heat"><b>Heat Conduction Sandbox</b><div class="help">Thermal conductivity & insulation</div></a>
        <a class="card" href="#simulations?fluids"><b>Bernoulli & Venturi</b><div class="help">Continuity & pressure changes</div></a>
        <a class="card" href="#simulations?wind"><b>Wind Turbine Power Curve</b><div class="help">Power ~ v³, Cp, cut-in/out</div></a>
      </div>
    `);
  },

  lessons(){
    mount(`
      <div class="card">${sectionTitle('Teacher Kits', 'Quick guides you can print or share.')}</div>
      <div class="grid">
        <a class="card" href="lessons/beam-bending.html"><b>Beam Bending</b><div class="help">Objectives, worksheet, exit ticket</div></a>
        <a class="card" href="lessons/tensile-test.html"><b>Tensile Test</b></a>
        <a class="card" href="lessons/heat-conduction.html"><b>Heat Conduction</b></a>
        <a class="card" href="lessons/bernoulli-venturi.html"><b>Bernoulli & Venturi</b></a>
        <a class="card" href="lessons/wind-turbine.html"><b>Wind Turbine</b></a>
      </div>
    `);
  },

  about(){
    mount(`
      <div class="card">
        ${sectionTitle('About')}
        <p class="help">I built these free simulations so students without access to physical labs can still do hands-on engineering. All simulations run on phones, Chromebooks, or iPads.</p>
        <p class="help">Accessibility: keyboard-friendly controls, high contrast, no flashing, works offline in Low-Bandwidth mode (coming soon).</p>
      </div>
    `);
  }
};

function router(){
  const hash = (location.hash.replace('#','') || 'home').split('?')[0];
  (routes[hash] || routes.home)();
}

window.addEventListener('hashchange', router);
window.addEventListener('DOMContentLoaded', ()=>{
  document.getElementById('year').textContent = new Date().getFullYear();
  initTheme();
  wireNav();
  router();
});
