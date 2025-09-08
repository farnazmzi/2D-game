
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
canvas.width = innerWidth;
canvas.height = innerHeight;
const hud = document.getElementById("hud");

let started = false;
let shapes = [];
let last = performance.now();
let globalSeconds = 0;
setInterval(() => globalSeconds++, 1000);

let round = 1;

let lastRoundTime = performance.now() / 1000;


let wallsActive = false;
const BORDER = 7;
let wallsStartTime = null; 
const WALL_BLOCK_DURATION = 50; 
let lastSpawnSide = null;
let hoveredShape = null;
let showColliders = false;
window.maxWallBounces = 5;



function resize() 
{ canvas.width = window.innerWidth;
   canvas.height = window.innerHeight;
      updateShapeSize();
    updateShapesOnResize();
    // updateAllShapesSize();
   }
    //    shapes.forEach(s => {
    //     if (s.buildSVG) s.buildSVG(); 
    // });

    // drawAllShapes(); 
window.addEventListener('resize', resize);
resize();



function updateAllShapesSize() {
    shapes.forEach(s => {
        if (s.buildSVG) s.buildSVG();
    });
}


function updateShapeSize() {
    // const baseSize = 100;  
    // const scale = canvas.width / 1000;  
    // shapeSize = baseSize * scale;
}

function updateShapesOnResize() {
    // const cx = canvas.width / 2;
    // const cy = canvas.height / 2;

    // for (const s of shapes) {
    //     let dx = cx - s.x;
    //     let dy = cy - s.y;
    //     const dist = Math.hypot(dx, dy) || 1;
    //     dx /= dist;
    //     dy /= dist;

    //     s.vx = dx * window.SPEED;
    //     s.vy = dy * window.SPEED;
    // }
}










//collider


const colliderBtn = document.getElementById('toggleCollider');
colliderBtn.addEventListener('click', () => {
  showColliders = !showColliders;
});


function ensureInitial() {
  generateShapesWithDelay(MAX_SHAPES, 300);
}


function getRandomSide() {
  const sides = ["left", "right", "top", "bottom"];
  return sides[Math.floor(Math.random() * sides.length)];
}



function loop(now) {
  if (!started) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;

  const currentTime = performance.now() / 1000;
  if (currentTime - lastRoundTime >= roundTime) {
    round++;
    lastRoundTime = currentTime;

    generateShapesWithDelay(MAX_SHAPES, 300);

  }
  if (hoveredShape) {
    drawDebugInfo();
  }
  //    if (shapes.length < MAX_SHAPES) {
  //   const sh = addShape();
  //   if (sh) shapes.push(sh);
  // }
  for (const s of shapes) {
    s.x += s.vx * dt;
    s.y += s.vy * dt;
    s.angle += (s.angVel || 0) * dt;
    handleWalls(s);
  }

  resolveCollisions(shapes);

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (const s of shapes) s.draw(ctx);

  for (let i = shapes.length - 1; i >= 0; i--) {
    if (shapes[i].remove) {
      removeShape(shapes[i]);
    }
  }
  if (!wallsActive && shapes.some(s => s.x > 0 && s.x < canvas.width && s.y > 0 && s.y < canvas.height)) {
    wallsActive = true;
  }
  if (wallsActive) drawWalls();
  hud.textContent = `Time: ${Math.floor(currentTime)}s · Round: ${round} · Shapes: ${totalShapes} · Remained: ${remainedShapes}`;
  requestAnimationFrame(loop);
}


//game  start
const startBtn = document.getElementById('startGameBtn');
const toggleDebug = document.getElementById('toggleDebug');
const liveBtn = document.getElementById('toggleLive');
const controlPanel = document.getElementById('controlPanel');
const closeControlPanel = document.getElementById('closeControlPanel');
const toggleCollider = document.getElementById('toggleCollider');

toggleDebug.style.display = 'none';
controlPanel.style.display = 'none';
liveBtn.style.display = 'none';
toggleCollider.style.display = 'none';

startBtn.addEventListener('click', () => {
  startBtn.style.display = 'none';
  liveBtn.style.display = 'block';
  controlPanel.style.display = 'none';
  toggleDebug.style.display = 'block';
  toggleCollider.style.display = 'block';
  startGame();
});
closeControlPanel.addEventListener('click', () => {
  controlPanel.style.display = 'none';
});



liveBtn.addEventListener('click', () => {
  if (controlPanel.style.display === 'none' || controlPanel.style.display === '') {
    controlPanel.style.display = 'block'; 
  } else {
    controlPanel.style.display = 'none';
  }
});




function startGame() {

  ensureInitial();
  shapes = [];       
  totalShapes = 0;
  remainedShapes = 0;
  SPEED = 0;

  started = true;
  last = performance.now();
  lastRoundTime = performance.now() / 1000;

  requestAnimationFrame(loop);
}


