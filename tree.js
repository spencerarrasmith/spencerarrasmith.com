const cv   = document.getElementById('c');
const ct   = cv.getContext('2d');
const hint = document.getElementById('hint');
const nav  = document.getElementById('nav');

let W, H, tree;
let growth   = 0;   // 0 → 1, global growth driver
let px = 0, py = 0;
let hintGone = false;
let navShown = false;

// ── Resize ──────────────────────────────────────────────────────────────
function resize() {
W = cv.width  = window.innerWidth;
H = cv.height = window.innerHeight;
tree = buildTree();
}
window.addEventListener('resize', resize);

// ── Input ────────────────────────────────────────────────────────────────
function addGrowth(x, y) {
const spd = Math.hypot(x - px, y - py);
px = x; py = y;
growth = Math.min(1, growth + spd * 0.002);

if (!hintGone && growth > 0.05) {
hint.style.opacity = '0';
hintGone = true;
}
if (!navShown && growth > 0.85) {
nav.style.opacity = '1';
navShown = true;
}
}

cv.addEventListener('mousemove', e => addGrowth(e.clientX, e.clientY));
cv.addEventListener('touchmove', e => {
addGrowth(e.touches[0].clientX, e.touches[0].clientY);
e.preventDefault();
}, { passive: false });

// ── Tree data structure ──────────────────────────────────────────────────
//
// Each node is a branch segment:
//   (x1,y1) → (x2,y2)  over the global growth window [gs, ge]
//
// When growth enters [gs, ge], the segment draws itself from its
// start point up to t=(growth-gs)/(ge-gs) of its full length.
// Children are queued with gs values that open after their parent's ge,
// so the tree grows trunk → main branches → secondaries → tips.

function seg(x1, y1, x2, y2, lw, gs, ge) {
return { x1, y1, x2, y2, lw, gs, ge, ch: [] };
}

function buildTree() {
const cx     = W * 0.5;
const rootY  = H * 0.760;
const trunkH = H * 0.215;
const tipY   = rootY - trunkH;

// Attachment points: P(f) = fraction f up the trunk
const P = f => ({ x: cx, y: rootY - trunkH * f });
const low  = P(0.54);
const high = P(0.80);

// Trunk
const trunk = seg(cx, rootY, cx, tipY, 5.5, 0, 0.22);

// 4 main branches — 2 per side, at different trunk heights
const ll = seg(low.x,  low.y,  low.x  - W*0.140, low.y  - H*0.065, 3.2, 0.22, 0.46);
const lu = seg(high.x, high.y, high.x - W*0.100, high.y - H*0.108, 2.5, 0.24, 0.48);
const rl = seg(low.x,  low.y,  low.x  + W*0.140, low.y  - H*0.065, 3.2, 0.22, 0.46);
const ru = seg(high.x, high.y, high.x + W*0.100, high.y - H*0.108, 2.5, 0.24, 0.48);

// Secondaries off lower-left
ll.ch.push(seg(ll.x2, ll.y2, ll.x2 - W*0.082, ll.y2 - H*0.088, 1.8, 0.46, 0.63));
ll.ch.push(seg(ll.x2, ll.y2, ll.x2 + W*0.032, ll.y2 - H*0.092, 1.4, 0.51, 0.67));

// Secondaries off upper-left
lu.ch.push(seg(lu.x2, lu.y2, lu.x2 - W*0.072, lu.y2 - H*0.078, 1.7, 0.48, 0.65));
lu.ch.push(seg(lu.x2, lu.y2, lu.x2 - W*0.015, lu.y2 - H*0.100, 1.3, 0.53, 0.68));

// Secondaries off lower-right (mirror of ll)
rl.ch.push(seg(rl.x2, rl.y2, rl.x2 + W*0.082, rl.y2 - H*0.088, 1.8, 0.46, 0.63));
rl.ch.push(seg(rl.x2, rl.y2, rl.x2 - W*0.032, rl.y2 - H*0.092, 1.4, 0.51, 0.67));

// Secondaries off upper-right (mirror of lu)
ru.ch.push(seg(ru.x2, ru.y2, ru.x2 + W*0.072, ru.y2 - H*0.078, 1.7, 0.48, 0.65));
ru.ch.push(seg(ru.x2, ru.y2, ru.x2 + W*0.015, ru.y2 - H*0.100, 1.3, 0.53, 0.68));

// Tip twigs (tertiary) — inherit parent's ge as their gs
const twig = (parent, dx, dy, lw) => {
parent.ch.push(seg(
    parent.x2, parent.y2,
    parent.x2 + W*dx, parent.y2 - H*dy,
    lw, parent.ge, parent.ge + 0.17
));
};
twig(ll.ch[0], -0.052, 0.055, 1.0);
twig(ll.ch[0],  0.018, 0.060, 0.9);
twig(lu.ch[0], -0.044, 0.050, 1.0);
twig(lu.ch[0], -0.078, 0.022, 0.8);
twig(rl.ch[0],  0.052, 0.055, 1.0);
twig(rl.ch[0], -0.018, 0.060, 0.9);
twig(ru.ch[0],  0.044, 0.050, 1.0);
twig(ru.ch[0],  0.078, 0.022, 0.8);

trunk.ch = [ll, lu, rl, ru];
return trunk;
}

// ── Background ───────────────────────────────────────────────────────────
function drawScene() {
// Warm parchment base
ct.fillStyle = '#c4b690';
ct.fillRect(0, 0, W, H);

// Top vignette
const vg = ct.createLinearGradient(0, 0, 0, H * 0.55);
vg.addColorStop(0, 'rgba(22,14,3,.32)');
vg.addColorStop(1, 'rgba(22,14,3,0)');
ct.fillStyle = vg;
ct.fillRect(0, 0, W, H);

// Red sun
ct.beginPath();
ct.arc(W * 0.5, H * 0.26, Math.min(W, H) * 0.096, 0, Math.PI * 2);
ct.fillStyle = '#c42000';
ct.fill();

// Dark ground — sweeping concave curve
ct.beginPath();
ct.moveTo(-5, H + 5);
ct.lineTo(W + 5, H + 5);
ct.lineTo(W + 5, H * 0.70);
ct.bezierCurveTo(W * 0.78, H * 0.58, W * 0.22, H * 0.58, -5, H * 0.70);
ct.closePath();
ct.fillStyle = '#0d0b05';
ct.fill();

// Snow hill
ct.beginPath();
ct.ellipse(W * 0.5, H * 0.715, W * 0.230, H * 0.072, 0, 0, Math.PI * 2);
ct.fillStyle = '#ece2c8';
ct.fill();
}

// ── Recursive branch draw ────────────────────────────────────────────────
function drawNode(node) {
if (growth <= node.gs) return;

const t  = Math.min(1, (growth - node.gs) / (node.ge - node.gs));
const ex = node.x1 + (node.x2 - node.x1) * t;
const ey = node.y1 + (node.y2 - node.y1) * t;

ct.beginPath();
ct.moveTo(node.x1, node.y1);
ct.lineTo(ex, ey);
ct.lineWidth   = node.lw;
ct.strokeStyle = '#131008';
ct.lineCap     = 'round';
ct.stroke();

for (const child of node.ch) drawNode(child);
}

// ── Loop ─────────────────────────────────────────────────────────────────
function frame() {
drawScene();
if (tree) drawNode(tree);
requestAnimationFrame(frame);
}

resize();
frame();