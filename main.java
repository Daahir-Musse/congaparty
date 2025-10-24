const gate = document.getElementById('gate');
const goBtn = document.getElementById('go');
const stage = document.getElementById('stage');
const dancer = document.getElementById('dancer');
const caption = document.getElementById('caption');
const song = document.getElementById('song');

// If you have an audio file, set it here (optional):
// song.src = './conga.mp3';  // 120–124 BPM works great

let strobeTimer = null;
let beatMs = 500; // ~120 BPM; tweak to taste

function startParty() {
  // show the stage
  gate.style.display = 'none';
  stage.style.opacity = 1;

  // fun CSS animation classes
  document.body.classList.add('party-bg');
  dancer.classList.add('party-dancer');
  caption.classList.add('party-caption');

  // try to play audio (if provided)
  song?.play?.().catch(() => { /* ignore if no file or autoplay blocked */ });

  // Title gag
  let flip = false;
  setInterval(() => {
    document.title = flip ? 'Conga!' : 'Konga!';
  flip = !flip;
  }, 1000);

  // Strobe / color cycle “on the beat”
  strobeTimer = setInterval(() => {
  // flash background by toggling a class + random accent color
    const r = () => Math.floor(Math.random() * 255);
  document.documentElement.style.setProperty('--bg', `rgb(${r()},${r()},${r()})`);
  document.body.classList.toggle('strobe');
  }, beatMs);
}

// user gesture to enable audio in browsers
goBtn.addEventListener('click', startParty);

