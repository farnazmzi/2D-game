
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
let wallsStartTime = null; // زمان فعال شدن دیوارها
const WALL_BLOCK_DURATION = 50; // ثانیه
let lastSpawnSide = null;
let hoveredShape = null;
let showColliders = false;

window.MAX_SHAPES = 50;
window.SPEED = 5; // ثابت، می‌تونی تغییرش بدی



const { Engine, Render, Runner, World, Bodies, Body } = Matter;

const engine = Engine.create();
const world = engine.world;

const render = Render.create({
  canvas: canvas,
  engine: engine,
  options: {
    width: canvas.width,
    height: canvas.height,
    wireframes: false,
    background: "#000000ff"
  }
});

Render.run(render);
Runner.run(Runner.create(), engine);


function resize() 
{ canvas.width = window.innerWidth;
   canvas.height = window.innerHeight;
    //   updateShapeSize();
    // updateShapesOnResize();
    // updateAllShapesSize();
   }
    //    shapes.forEach(s => {
    //     if (s.buildSVG) s.buildSVG();  // دوباره SVG و کالیدر ساخته می‌شود
    // });

    // drawAllShapes(); // رندر مجدد canvas
window.addEventListener('resize', resize);
resize();



function updateAllShapesSize() {
    shapes.forEach(s => {
        if (s.buildSVG) s.buildSVG();
    });
}


function updateShapeSize() {
    // فرض کنیم اندازه پایه برای 1000px عرض است
    // const baseSize = 100;  
    // const scale = canvas.width / 1000;  // نسبت فعلی به اندازه پایه
    // shapeSize = baseSize * scale;
}

function updateShapesOnResize() {
    // const cx = canvas.width / 2;
    // const cy = canvas.height / 2;

    // for (const s of shapes) {
    //     // تغییر سرعت برای هماهنگی با اندازه جدید
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

// ===================== کلاس‌ها =====================


// ===================== توابع کمکی =====================
function getRandomSide() {
  const sides = ["left", "right", "top", "bottom"];
  return sides[Math.floor(Math.random() * sides.length)];
}


setInterval(() => globalSeconds++, 1000);



function spawnShape() {
  const offset = 0.8; // فاصله از canvas
  let sx, sy, spawnSide;

  // انتخاب تصادفی اسپاون: گوشه‌ها یا چهار جهت
  const spawnType = Math.random() < 0.25 ? "corner" : "side";

  if (spawnType === "corner") {
    const corners = [
      [0, 0],
      [canvas.width, 0],
      [0, canvas.height],
      [canvas.width, canvas.height],
    ];
    const corner = corners[Math.floor(Math.random() * corners.length)];
    sx = corner[0];
    sy = corner[1];
    spawnSide = "corner";
  } else { // چهار جهت اصلی
    spawnSide = getRandomSide();
    if (spawnSide === "left") {
      sx = -canvas.width * offset;
      sy = Math.random() * canvas.height;
    } else if (spawnSide === "right") {
      sx = canvas.width + canvas.width * offset;
      sy = Math.random() * canvas.height;
    } else if (spawnSide === "top") {
      sx = Math.random() * canvas.width;
      sy = -canvas.height * offset;
    } else { // bottom
      sx = Math.random() * canvas.width;
      sy = canvas.height + canvas.height * offset;
    }
  }

  const shape = addShape(sx, sy);

  // مقصد تصادفی: مرکز ± 100px
  const cx = canvas.width / 2 + (Math.random() - 0.5) * 200;
  const cy = canvas.height / 2 + (Math.random() - 0.5) * 200;

  let dx = cx - shape.body.position.x;
  let dy = cy - shape.body.position.y;
  const dist = Math.hypot(dx, dy) || 1;

  dx /= dist;
  dy /= dist;

  // سرعت ثابت
  shape.vx = dx * window.SPEED;
  shape.vy = dy * window.SPEED;

  Matter.Body.setVelocity(shape.body, { x: shape.vx, y: shape.vy });

  // ذخیره موقعیت اولیه برای محاسبه فاصله خروج
  shape.initialPos = { x: sx, y: sy };

  shapes.push(shape);
}

function tryGenerateShape() {
  const offset = 0.8; // فاصله از canvas
  let sx, sy;

  // انتخاب تصادفی اسپاون: گوشه‌ها یا چهار جهت
  const spawnType = Math.random() < 0.25 ? "corner" : "side";

  if (spawnType === "corner") {
    const corners = [
      [0, 0], // بالا-چپ
      [canvas.width, 0], // بالا-راست
      [0, canvas.height], // پایین-چپ
      [canvas.width, canvas.height], // پایین-راست
    ];
    const corner = corners[Math.floor(Math.random() * corners.length)];
    sx = corner[0];
    sy = corner[1];
  } else { // چهار جهت اصلی
    const side = getRandomSide(); // left, right, top, bottom
    if (side === "left") {
      sx = -canvas.width * offset;
      sy = Math.random() * canvas.height;
    } else if (side === "right") {
      sx = canvas.width + canvas.width * offset;
      sy = Math.random() * canvas.height;
    } else if (side === "top") {
      sx = Math.random() * canvas.width;
      sy = -canvas.height * offset;
    } else { // bottom
      sx = Math.random() * canvas.width;
      sy = canvas.height + canvas.height * offset;
    }
  }

  const shape = addShape(sx, sy);

  // مقصد تصادفی: مرکز ± 100px افقی و عمودی
  const cx = canvas.width / 2 + (Math.random() - 0.5) * 200;
  const cy = canvas.height / 2 + (Math.random() - 0.5) * 200;

  let dx = cx - shape.body.position.x;
  let dy = cy - shape.body.position.y;
  const dist = Math.hypot(dx, dy) || 1;

  dx /= dist;
  dy /= dist;

  shape.vx = dx * window.SPEED;
  shape.vy = dy * window.SPEED;

  Matter.Body.setVelocity(shape.body, { x: shape.vx, y: shape.vy });

  shapeCounter++;
  return shape;
}

// حذف اشکال پس از خروج 20% از صفحه
function removeShapesOutOfRange() {
  for (let i = shapes.length - 1; i >= 0; i--) {
    const s = shapes[i];

    // فاصله طی شده از موقعیت اولیه
    const dx = s.body.position.x - s.initialPos.x;
    const dy = s.body.position.y - s.initialPos.y;
    const traveled = Math.hypot(dx, dy);

    // 20 درصد قطر صفحه به عنوان حد
    const maxDistance = Math.hypot(canvas.width, canvas.height) * 0.2;

    if (traveled > maxDistance) {
      // حذف از آرایه و از Matter.js
      World.remove(world, s.body);
      shapes.splice(i, 1);
      remainedShapes--;

      // جایگزینی شکل جدید
      spawnShape();
    }
  }
}

function addShape(x, y) {
  const star = new SvgStar(x, y, {
    strokeWidth: 7,
    fillColor: 'yellow',
    borderColor: 'orange'
  });

  star.initialPos = { x, y };
  shapes.push(star);
  totalShapes++;
  remainedShapes++;
  return star;
}

// اطمینان از اینکه همیشه 20 شکل روی صفحه باشد
function ensureShapes() {
  while (shapes.length < MAX_SHAPES) {
    spawnShape();
  }
}

function generateShapesWithDelay(count, delay) {
  let i = 0;

  function generateNext() {
    if (i >= count) return;

    const sh = tryGenerateShape(); // ← درست شد
    if (sh) {
      totalShapes++;
      remainedShapes++;
    }

    i++;
    setTimeout(generateNext, delay);
  }

  generateNext();
}

function loop() {
  if (!started) return;

  Engine.update(engine, 1000 / 60);

  // پاک کردن canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // به‌روزرسانی و رندر
  for (const s of shapes) {
    s.x = s.body.position.x;
    s.y = s.body.position.y;
    s.draw(ctx);
  }

  // حذف و جایگزینی شکل‌ها
  removeShapesOutOfRange();
  ensureInitial();

  // فعال کردن دیوارها اگر لازم باشد
  // if (!wallsActive && shapes.some(s => s.x > 0 && s.x < canvas.width && s.y > 0 && s.y < canvas.height)) {
  //   wallsActive = true;
  // }
  // if (wallsActive) drawWalls();

  const currentTime = performance.now() / 1000;
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
  // مخفی کردن استارت پنل
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
    controlPanel.style.display = 'block'; // یا grid یا هرچی استایل اصلیته
  } else {
    controlPanel.style.display = 'none';
  }
});




function startGame() {

  ensureInitial();
  shapes = [];       // ← همه شکل‌های قدیمی پاک بشن
  totalShapes = 0;
  remainedShapes = 0;
  window.SPEED = 5;

  // --- شروع حلقه ---
  started = true;
  last = performance.now();
  lastRoundTime = performance.now() / 1000; // ریست زمان راند

  requestAnimationFrame(loop);
}


