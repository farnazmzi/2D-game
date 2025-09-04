
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
canvas.width = innerWidth;
canvas.height = innerHeight;
const hud = document.getElementById("hud");

let shapes = [];
let totalShapes = 0;
 let shapeCounter = 0; 
let remainedShapes = 0;
let started = false;
let lastRegenTime = performance.now()/1000;
let globalSeconds = 0;
setInterval(() => globalSeconds++, 1000);

let round = 1;
window.roundTime =20;

let lastRoundTime = performance.now() / 1000;


let wallsActive = false;
const BORDER = 7;
let wallsStartTime = null; // زمان فعال شدن دیوارها
const WALL_BLOCK_DURATION = 50; // ثانیه
let lastSpawnSide = null;
let hoveredShape = null;
let showColliders = false;

window.maxWallBounces = 5;
window.shapeSize = 100;

window.SPEED = window.SPEED ?? 70;          // سرعت قابل تنظیم
window.REGEN_INTERVAL = window.REGEN_INTERVAL ?? 50; // ثانیه
window.MAX_SHAPES = window.MAX_SHAPES ?? 20;

let MARGIN = Math.min(canvas.width, canvas.height) * 0.15; // مقدار اولیه برای ایمن بودن هدف
const SPAWN_OFFSET = 0.5; // 50% خارج از صفحه (طبق خواست شما)

// ====================== Matter.js ======================
const { Engine, World, Bodies, Body, Runner } = Matter;
const engine = Engine.create();
const world = engine.world;
engine.world.gravity.x = 0;
engine.world.gravity.y = 0;


Matter.Common.setDecomp(window.decomp);
// Runner.run(Runner.create(), engine);
// const render = Render.create({
//   canvas: canvas,
//   engine: engine,
//   options: {
//     width: canvas.width,
//     height: canvas.height,
//     wireframes: false,
//     background: "#000000ff"
//   }
// });

// Render.run(render);
// Runner.run(Runner.create(), engine);








function resize() 
{ canvas.width = window.innerWidth;
   canvas.height = window.innerHeight;
     MARGIN = Math.min(canvas.width, canvas.height) * 0.15;
    //   updateShapeSize();
    // updateShapesOnResize();
    updateAllShapesSize();
   }
    //    shapes.forEach(s => {
    //     if (s.buildSVG) s.buildSVG();  // دوباره SVG و کالیدر ساخته می‌شود
    // });

    // drawAllShapes(); // رندر مجدد canvas
window.addEventListener('resize', resize);
resize();


// function updateShapeSize() {
//   // فرض کنیم اندازه پایه برای 1000px عرض است
//   const baseSize = 100;
//   const scale = canvas.width / 1000;  // نسبت فعلی به اندازه پایه
//   shapeSize = baseSize * scale;
// }

// function updateShapesOnResize() {
//   const cx = canvas.width / 2;
//   const cy = canvas.height / 2;

//   for (const s of shapes) {
//     // تغییر سرعت برای هماهنگی با اندازه جدید
//     let dx = cx - s.x;
//     let dy = cy - s.y;
//     const dist = Math.hypot(dx, dy) || 1;
//     dx /= dist;
//     dy /= dist;

//     s.vx = dx * window.SPEED;
//     s.vy = dy * window.SPEED;
//   }
// }

function updateAllShapesSize() {
    shapes.forEach(s => {
        if (s.buildSVG) s.buildSVG();
    });
}


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
function getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)]; // Math.random() درست
  }
  return color;
}

setInterval(() => globalSeconds++, 1000);

function generateShapesWithDelay(count, delay) {
  let i = 0;

  function generateNext() {
    if (i >= count) return;

    const outside = Math.random() < 0.2; // 20% بیرون
    const sh = addShape(outside);
    if (sh) {
      shapes.push(sh);
      totalShapes++;
      remainedShapes++;
    }

    i++;
    setTimeout(generateNext, delay);
  }

  generateNext();
}


// function tryGenerateShape() {
//   const side = getRandomSide();
//   const offset = 0.8;
//   let sx, sy;

//   if (side === "left") {
//     sx = -canvas.width * offset;
//     sy = Math.random() * canvas.height;
//   } else if (side === "right") {
//     sx = canvas.width + canvas.width * offset;
//     sy = Math.random() * canvas.height;
//   } else if (side === "top") {
//     sx = Math.random() * canvas.width;
//     sy = -canvas.height * offset;
//   } else {
//     sx = Math.random() * canvas.width;
//     sy = canvas.height + canvas.height * offset;
//   }

//   // فقط SvgStar بساز
//   let shape = new SvgStar(sx, sy, {
//     entrySide: side,
//     strokeWidth: 7,        // اختیاری
//     fillColor: 'yellow',   // اختیاری
//     borderColor: 'orange'  // اختیاری
//   });

//   shapeCounter++;
//   return shape;
// }


// spawnShape — فقط موقعیت محاسبه می‌کند و سپس addShape(x,y) را صدا می‌زند
function spawnShape() {
  const spawnType = Math.random() < 0.25 ? "corner" : "side";
  let sx, sy;

  if (spawnType === "corner") {
    const corners = [
      [0, 0],
      [canvas.width, 0],
      [0, canvas.height],
      [canvas.width, canvas.height]
    ];
    const corner = corners[Math.floor(Math.random() * corners.length)];
    sx = corner[0] < canvas.width / 2 ? -canvas.width * SPAWN_OFFSET : canvas.width + canvas.width * SPAWN_OFFSET;
    sy = corner[1] < canvas.height / 2 ? -canvas.height * SPAWN_OFFSET : canvas.height + canvas.height * SPAWN_OFFSET;
  } else {
    const side = getRandomSide();
    if (side === "left") {
      sx = -canvas.width * SPAWN_OFFSET;
      sy = Math.random() * canvas.height;
    } else if (side === "right") {
      sx = canvas.width + canvas.width * SPAWN_OFFSET;
      sy = Math.random() * canvas.height;
    } else if (side === "top") {
      sx = Math.random() * canvas.width;
      sy = -canvas.height * SPAWN_OFFSET;
    } else { // bottom
      sx = Math.random() * canvas.width;
      sy = canvas.height + canvas.height * SPAWN_OFFSET;
    }
  }

  const star = generateShape(sx, sy);

  if (star.body) {
const cx = canvas.width / 2;
const cy = canvas.height / 2;
const dx = cx - star.x;
const dy = cy - star.y;
const dist = Math.hypot(dx, dy) || 1;
const speed = window.SPEED || 2;
star.vx = (dx / dist) * speed;
star.vy = (dy / dist) * speed;
Matter.Body.setVelocity(star.body, { x: star.vx, y: star.vy });


    // ویژگی‌های فیزیک برای برخورد طبیعی
    star.body.restitution = 0.8;   // کشسانی
    star.body.frictionAir = 0;     // حفظ سرعت ثابت
    star.body.friction = 0;
    star.body.angularVelocity = (Math.random() - 0.5) * 0.1; // کمی چرخش اولیه
    star.body.inertia = Infinity;  // کنترل چرخش بیشتر توسط نیروها
  }

  return star;
}

// addShape(x,y) — ستاره می‌سازد، سرعت را تنظیم می‌کند، و آن را به آرایه اضافه می‌کند
function generateShape(x, y) {
  // (1) ساخت SvgStar
const star = new SvgStar(x, y, {
  strokeWidth: 7,
  fillColor: getRandomColor(),
  borderColor: getRandomColor()
});


  // -----------------------------
  // ← اینجا کالیدر دقیق و Body Matter.js اضافه می‌کنیم
  const verts = star.getStarColliderWorld(); // کالیدر دقیق ستاره
  star.body = Matter.Bodies.fromVertices(
    star.x,
    star.y,
    [verts],
    {
    restitution: 0.8,      // کشسانی بالا
    friction: 0,
    frictionAir: 0.0,     // کمی مقاومت هوا برای کنترل حرکت
    angularVelocity: (Math.random() - 0.5) , // چرخش اولیه تصادفی
      render: {
        fillStyle: star.fillColor,
        strokeStyle: star.borderColor
      }
    },
    true // اجازه decomposition خودکار برای شکل‌های پیچیده
  );

  Matter.World.add(world, star.body);
  // -----------------------------

  // (2) مقصد امن (مرکز ± مقداری) را انتخاب کن
  // const cx = canvas.width / 2 + (Math.random() - 0.5) * 200;
  // const cy = canvas.height / 2 + (Math.random() - 0.5) * 200;

  // (3) جهت و سرعت ثابت بر اساس window.SPEED
  // const dx = cx - x;
  // const dy = cy - y;
  // const dist = Math.hypot(dx, dy) || 1;
  // const speed = window.SPEED || 1;
  // const vx = (dx / dist) * speed;
  // const vy = (dy / dist) * speed;

  // (4) مقداردهی به ستاره
  // star.vx = vx;
  // star.vy = vy;
  // star.initialPos = { x, y };

  // if (star.body) {
  //   // اعمال سرعت اولیه به body
  //   Matter.Body.setVelocity(star.body, { x: vx, y: vy });
  // }

  // (5) اضافه کردن به آرایه
  shapes.push(star);
  totalShapes++;
  remainedShapes++;

  return star;
}

function checkShapeCollisionWithBounds(shape) {
  if (!shape.body) return;

  const verts = shape.getStarColliderWorld();

  let vx = shape.body.velocity.x;
  let vy = shape.body.velocity.y;
  let bounced = false;

  verts.forEach(v => {
    if (v.x < 0 || v.x > canvas.width) {
      vx = -vx;
      bounced = true;
    }
    if (v.y < 0 || v.y > canvas.height) {
      vy = -vy;
      bounced = true;
    }
  });

  if (bounced) {
    Matter.Body.setVelocity(shape.body, { x: vx, y: vy });
  }
}



// generateShapesWithDelay — نمونهٔ ساده‌ی درست برای فراخوانی spawnShape
function generateShapesWithDelay(count, delay) {
  let i = 0;
  function generateNext() {
    if (i >= count) return;
    spawnShape(); // spawnShape خودش addShape را صدا می‌زند
    i++;
    setTimeout(generateNext, delay);
  }
  generateNext();
}

setInterval(() => globalSeconds++, 1000);

let roundActive = true;

function addShape() {
  const newShape = spawnShape();
  if (newShape)
    return newShape;
}

function removeShape(shape) {
  const index = shapes.indexOf(shape);
  if (index !== -1) {
    shapes.splice(index, 1);
    remainedShapes--; // هر بار حذف شد
  }
}



function loop(now) {
  if (!started) return;

  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;

  const currentTime = performance.now() / 1000;

  // هر راند
  if (currentTime - lastRoundTime >= roundTime) {
    round++;
    lastRoundTime = currentTime;
    generateShapesWithDelay(MAX_SHAPES, 300);
  }

    Engine.update(engine, dt * 1000);
  // پاک کردن صفحه
  ctx.clearRect(0, 0, canvas.width, canvas.height);


for (const s of shapes) {
  if (!s.body) continue;

  const pos = s.body.position;
  const angle = s.body.angle;
const verts = s.getStarColliderWorld();
let vx = s.body.velocity.x;
let vy = s.body.velocity.y;
let bounced = false;

verts.forEach(v => {
  if (v.x > 0 && v.x < canvas.width) return;
  if (v.y > 0 && v.y < canvas.height) return;

  if (v.x < 0 || v.x > canvas.width) {
    vx = -vx;
    bounced = true;
  }
  if (v.y < 0 || v.y > canvas.height) {
    vy = -vy;
    bounced = true;
  }
});

if (bounced) {
  Matter.Body.setVelocity(s.body, { x: vx, y: vy });
}

  s.draw(ctx, pos.x, pos.y, angle);
}

  // حذف شکل‌هایی که خارج میشن
  for (let i = shapes.length - 1; i >= 0; i--) {
    if (shapes[i].remove) {
      removeShape(shapes[i]);
    }
  }

  // HUD
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
liveBtn.style.display = 'block';
toggleCollider.style.display = 'none';

startBtn.addEventListener('click', () => {
  // مخفی کردن استارت پنل
  startBtn.style.display = 'none';
  liveBtn.style.display = 'none';
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


  // --- شروع حلقه ---
  started = true;
  last = performance.now();
  lastRoundTime = performance.now() / 1000; // ریست زمان راند

  requestAnimationFrame(loop);
}


