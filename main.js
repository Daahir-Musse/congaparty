// ===== main.js (ghosts reuse main dancer's GIF) =====

// DOM refs
const gate = document.getElementById('gate');
const goBtn = document.getElementById('go');
const stage = document.getElementById('stage');
const dancer = document.getElementById('dancer');
const caption = document.getElementById('caption');
const ghosts = document.getElementById('ghosts');
const warn = document.getElementById('audio-warning');
const audioControls = document.getElementById('audio-controls');
const song = document.getElementById('song'); // inside #audio-controls

// spawn from sides only
const GHOST_SIDES = ['left', 'right'];

// Timing / FX
const BEAT_MS = 500;        // ~120 BPM for pulse/strobe
let strobeTimer = null;

// ------- Ghost settings -------
// IMPORTANT: use the SAME file as the main dancer
const GHOST_IMG = dancer.getAttribute('src'); // "./200.gif"
const GHOST_COUNT = 11;          // concurrent floaters
const GHOST_SPEED = 4.0;         // 1 = normal, 3 = 3× faster
const GHOST_OPACITY = 0.46;

// NEW: spawn height controls (top-biased)
const GHOST_START_Y_MIN = -0.10; // allow a bit above the screen (-10%)
const GHOST_START_Y_MAX =  1.00; // up to bottom edge (100%)
const GHOST_TOP_BIAS    =  2.6;  // >1 biases toward the top (0=top, 1=bottom)

// Reduced-motion preference
const rmq = window.matchMedia('(prefers-reduced-motion: reduce)');
let ghostRunning = !rmq.matches;

// Utils
function rand(min, max){ return Math.random() * (max - min) + min; }
function pick(arr){ return arr[Math.floor(Math.random() * arr.length)]; }

// Bias helper: returns a 0..1 value skewed toward 0 as bias grows (>1)
function biasedTop01(bias){ return Math.pow(Math.random(), Math.max(1, bias)); }

// Convert to a screen Y using top bias between min..max (fractions of height)
function topBiasedY(h){
  const t = biasedTop01(GHOST_TOP_BIAS); // closer to 0 => nearer the top
  const min = GHOST_START_Y_MIN * h;
  const max = GHOST_START_Y_MAX * h;
  return min + (max - min) * t;
}

// ---- ghost spawner (no wrapper; use <img> so GIF frames animate) ----
function spawnGhost(){
  if(!ghostRunning) return;

  const w = window.innerWidth;
  const h = window.innerHeight;
  const pad = Math.max(w, h) * 0.08; // start/end a bit off-screen

  // pick only from left/right
  const side = pick(GHOST_SIDES);

  // start just off-screen on chosen side
  let x0, y0, x1, y1;
  if (side === 'left') {
    x0 = -pad;
    y0 = topBiasedY(h);                      // << more ghosts from higher
    x1 = w + pad;                            // drift across to the right
    y1 = y0 + rand(-h * 0.18, h * 0.18);     // gentle up/down variation
  } else { // 'right'
    x0 = w + pad;
    y0 = topBiasedY(h);                      // << more ghosts from higher
    x1 = -pad;                               // drift across to the left
    y1 = y0 + rand(-h * 0.18, h * 0.18);
  }

  // visuals
  const s0 = rand(0.95, 1.45);
  const s1 = s0 + rand(0.02, 0.12);
  const o  = Math.max(0, Math.min(1, GHOST_OPACITY + rand(-0.04, 0.04)));
  const baseDur = rand(8, 16);
  const dur = baseDur / Math.max(0.1, GHOST_SPEED);

  const ghost = new Image();
  ghost.src = GHOST_IMG;     // SAME image as the main dancer
  ghost.alt = '';
  ghost.className = 'ghost';

  ghost.style.setProperty('--x0', `${x0}px`);
  ghost.style.setProperty('--y0', `${y0}px`);
  ghost.style.setProperty('--x1', `${x1}px`);
  ghost.style.setProperty('--y1', `${y1}px`);
  ghost.style.setProperty('--s0', s0);
  ghost.style.setProperty('--s1', s1);
  ghost.style.setProperty('--o',  o);
  ghost.style.setProperty('--dur', `${dur}s`);

  ghost.addEventListener('animationend', () => {
    ghost.remove();
    if (ghostRunning) spawnGhost();
  });

  ghosts.appendChild(ghost);
}

function seedGhosts(){
  if(!ghostRunning) return;
  const need = Math.max(0, GHOST_COUNT - ghosts.children.length);
  for(let i=0;i<need;i++){
    setTimeout(spawnGhost, rand(0, 2000 / Math.max(0.1, GHOST_SPEED)));
  }
}

// Respect reduced-motion changes on the fly
rmq.addEventListener?.('change', (e) => {
  ghostRunning = !e.matches;
  if(ghostRunning) seedGhosts();
  else ghosts.innerHTML = '';
});

// ------- Start the party -------
function startParty(){
  // user opted in to motion; override reduced motion
  document.body.classList.add('force-motion');

  // Reveal stage
  gate.style.display = 'none';
  stage.style.opacity = 1;
  stage.setAttribute('aria-hidden', 'false');

  // Anim classes
  document.body.classList.add('party-bg');
  dancer.classList.add('party-dancer');
  caption.classList.add('party-caption');

  // Audio attempt (promise handling for autoplay policies)
  if (song) {
    song.currentTime = 0;
    song.muted = false;
    song.volume = 1;

    song.play()
      .then(() => {
        if(warn) warn.hidden = true;
        if(audioControls) audioControls.hidden = true;
      })
      .catch(err => {
        console.warn('Audio play failed:', err?.name, err?.message);
        if(warn){
          warn.hidden = false;
          warn.textContent = 'Couldn’t start audio automatically. Use the controls below.';
        }
        if(audioControls) audioControls.hidden = false;
      });
  }

  // Title ping-pong
  let flip = false;
  setInterval(() => {
    document.title = flip ? 'CONGA!' : 'KONGA!';
    flip = !flip;
  }, 1000);

  // Strobe / hue cycle
  strobeTimer = setInterval(() => {
    const r = () => Math.floor(Math.random()*255);
    document.documentElement.style.setProperty('--bg', `rgb(${r()},${r()},${r()})`);
    document.body.classList.toggle('strobe');
  }, BEAT_MS);

  // Ghosts go!
  ghostRunning = true;
  seedGhosts();
}

// Diagnostics
dancer.addEventListener('error', () => {
  console.error('GIF failed to load. Ensure ./200.gif exists (case-sensitive path).');
});
dancer.addEventListener('load', () => console.log('Main GIF loaded ✅'));

// Wire up
goBtn.addEventListener('click', startParty, { once:true });
