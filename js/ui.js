// Simple router (hash-based) and helpers
export const $ = (q, el=document) => el.querySelector(q);
export const $$ = (q, el=document) => [...el.querySelectorAll(q)];

// Theme
export function initTheme(){
  const toggle = document.getElementById('themeToggle');
  const fromPref = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const saved = localStorage.getItem('theme') || (fromPref ? 'dark' : 'dark'); // default dark
  document.documentElement.dataset.theme = saved;
  toggle.checked = saved === 'dark';
  toggle.addEventListener('change', ()=>{
    const mode = toggle.checked ? 'dark' : 'dark'; // keep dark look; switch reserved if you want light later
    document.documentElement.dataset.theme = mode;
    localStorage.setItem('theme', mode);
  });
}

// nav buttons
export function wireNav(){
  $$('.navlink').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      location.hash = btn.dataset.route;
    });
  });
}

// Mount content
export function mount(html){
  const app = document.getElementById('app');
  app.innerHTML = html;
  app.focus({preventScroll:true});
}

// Reusable UI components
export function sectionTitle(title, subtitle=''){
  return `<div class="h1">${title}</div>${subtitle?`<div class="h2">${subtitle}</div>`:''}`;
}

export function kpi(label, value, unit=''){
  return `<div class="kpi" role="group" aria-label="${label}">
    <span class="help">${label}</span>
    <b>${value}${unit?` <span class="help">${unit}</span>`:''}</b>
  </div>`;
}
