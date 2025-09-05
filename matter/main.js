
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
let startTime = null;  
let currentTime = 0;
let globalSeconds = 0;
setInterval(() => globalSeconds++, 1000);

let round = 1;
window.roundTime =20;

let lastRoundTime = performance.now() / 1000;

let wallActive = false; 
const BORDER = 7;
let wallsStartTime = null; 
const WALL_BLOCK_DURATION = 50;
let lastSpawnSide = null;
let hoveredShape = null;
let showColliders = false;

window.maxWallBounces = 3;
window.shapeSize = 100;

window.SPEED = window.SPEED ?? 1;        
window.REGEN_INTERVAL = window.REGEN_INTERVAL ?? 50; 
window.MAX_SHAPES = window.MAX_SHAPES ?? 20;

let MARGIN = Math.min(canvas.width, canvas.height) * 0.15; 
const SPAWN_OFFSET = 0.5; 
let bounced = false;
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


    let GLYPH5x7 = {
        "0": ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
        "1": ["00100", "01100", "00100", "00100", "00100", "00100", "01110"],
        "2": ["01110", "10001", "00001", "00010", "00100", "01000", "11111"],
        "3": ["01110", "10001", "00001", "00110", "00001", "10001", "01110"],
        "4": ["00010", "00110", "01010", "10010", "11111", "00010", "00010"],
        "5": ["11111", "10000", "11110", "00001", "00001", "10001", "01110"],
        "6": ["00110", "01000", "10000", "11110", "10001", "10001", "01110"],
        "7": ["11111", "00001", "00010", "00100", "01000", "01000", "01000"],
        "8": ["01110", "10001", "10001", "01110", "10001", "10001", "01110"],
        "9": ["01110", "10001", "10001", "01111", "00001", "00010", "01100"],
        "A": ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
        "B": ["11110", "10001", "10001", "11110", "10001", "10001", "11110"],
        "C": ["01110", "10001", "10000", "10000", "10000", "10001", "01110"],
        "D": ["11100", "10010", "10001", "10001", "10001", "10010", "11100"],
        "E": ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
        "F": ["11111", "10000", "10000", "11110", "10000", "10000", "10000"],
        "G": ["01110", "10001", "10000", "10111", "10001", "10001", "01110"],
        "H": ["10001", "10001", "10001", "11111", "10001", "10001", "10001"],
        "I": ["01110", "00100", "00100", "00100", "00100", "00100", "01110"],
        "J": ["00111", "00010", "00010", "00010", "10010", "10010", "01100"],
        "K": ["10001", "10010", "10100", "11000", "10100", "10010", "10001"],
        "L": ["10000", "10000", "10000", "10000", "10000", "10000", "11111"],
        "M": ["10001", "11011", "10101", "10101", "10001", "10001", "10001"],
        "N": ["10001", "11001", "10101", "10011", "10001", "10001", "10001"],
        "O": ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
        "P": ["11110", "10001", "10001", "11110", "10000", "10000", "10000"],
        "Q": ["01110", "10001", "10001", "10001", "10101", "10010", "01101"],
        "R": ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
        "S": ["01111", "10000", "10000", "01110", "00001", "00001", "11110"],
        "T": ["11111", "00100", "00100", "00100", "00100", "00100", "00100"],
        "U": ["10001", "10001", "10001", "10001", "10001", "10001", "01110"],
        "V": ["10001", "10001", "10001", "10001", "01010", "01010", "00100"],
        "W": ["10001", "10001", "10001", "10101", "10101", "11011", "10001"],
        "X": ["10001", "01010", "00100", "00100", "00100", "01010", "10001"],
        "Y": ["10001", "01010", "00100", "00100", "00100", "00100", "00100"],
        "Z": ["11111", "00001", "00010", "00100", "01000", "10000", "11111"]
    };






function resize() 
{ canvas.width = window.innerWidth;
   canvas.height = window.innerHeight;
     MARGIN = Math.min(canvas.width, canvas.height) * 0.15;
    //   updateShapeSize();
    // updateShapesOnResize();
    updateAllShapesSize();
   }
    //    shapes.forEach(s => {
    //     if (s.buildSVG) s.buildSVG(); 
    // });

    // drawAllShapes(); 
window.addEventListener('resize', resize);
resize();


// function updateShapeSize() {
//   const baseSize = 100;
//   const scale = canvas.width / 1000; 
//   shapeSize = baseSize * scale;
// }

// function updateShapesOnResize() {
//   const cx = canvas.width / 2;
//   const cy = canvas.height / 2;

//   for (const s of shapes) {
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


function getRandomSide() {
  const sides = ["left", "right", "top", "bottom"];
  return sides[Math.floor(Math.random() * sides.length)];
}
function getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)]; // Math.random() 
  }
  return color;
}

setInterval(() => globalSeconds++, 1000);

function generateShapesWithDelay(count, delay) {
  let i = 0;

  function generateNext() {
    if (i >= count) return;

    const outside = Math.random() < 0.2; 
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

//   let shape = new SvgStar(sx, sy, {
//     entrySide: side,
//     strokeWidth: 7,       
//     fillColor: 'yellow', 
//     borderColor: 'orange' 
//   });

//   shapeCounter++;
//   return shape;
// }


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

 const types = ["Star", "Circle", "Glyph"];
const shapeType = types[Math.floor(Math.random() * types.length)];

  const shape = generateShape(sx, sy ,"Glyph");

  if (shape.body) {
const cx = canvas.width / 2;
const cy = canvas.height / 2;
const dx = cx - shape.x;
const dy = cy - shape.y;
const dist = Math.hypot(dx, dy) || 1;
const speed = window.SPEED || 2;
shape.vx = (dx / dist) * speed;
shape.vy = (dy / dist) * speed;



Matter.Body.setVelocity(shape.body, { x: shape.vx, y: shape.vy });


    shape.body.restitution = 0.8;   
    shape.body.frictionAir = 0;  
    shape.body.friction = 0;
    shape.body.angularVelocity = (Math.random() - 0.5) * 0.1; 
    shape.body.inertia = Infinity;  
  }

  return shape;
}



function generateShape(x, y, shapeType) {
  let shape;

  if(shapeType === "Star") {
    shape = new SvgStar(x, y, {
      strokeWidth: 7,
      fillColor: getRandomColor(),
      borderColor: getRandomColor()
    });

    const verts = shape.getStarColliderWorld(); 
    shape.body = Matter.Bodies.fromVertices(
      shape.x,
      shape.y,
      [verts],
      {
        restitution: 0.8,   
        friction: 0,
        frictionAir: 0.0,    
        angularVelocity: (Math.random() - 0.5) * 0.1,
        render: { fillStyle: shape.fillColor, strokeStyle: shape.borderColor }
      },
      true
    );
  } else if (shapeType === "Circle") {
  shape = new SvgCircle(x, y, {
    strokeWidth: 7,
    fillColor: getRandomColor(),
    borderColor: getRandomColor()
  });

  // استفاده از کالیدر دایره بجای Bodies.circle
  const verts = shape.getCircleColliderWorld(); // مثل ستاره، نقاط محیطی کالیدر دایره

  shape.body = Matter.Bodies.fromVertices(
    shape.x,
    shape.y,
    [verts],
    {
      restitution: 0.8,
      friction: 0,
      frictionAir: 0,
      angularVelocity: (Math.random() - 0.5) * 0.1,
      render: { fillStyle: shape.fillColor, strokeStyle: shape.borderColor }
    },
    true
  );
}
else if (shapeType === "Glyph") {
    const keys = Object.keys(GLYPH5x7);
    const char = keys[Math.floor(Math.random() * keys.length)];
    shape = new GlyphLetter(x, y, char, {
      size: 120,
      stroke: getRandomColor(),
      fill: getRandomColor()
    });

 const parts = shape.glyphColliderOffset
    .filter(poly => poly && poly.length >= 3) // فقط poly معتبر
    .map(poly => 
      Matter.Bodies.fromVertices(
        shape.x,
        shape.y,
        poly,
        {
          restitution: 0.8,
          friction: 0,
          frictionAir: 0,
          angularVelocity: (Math.random() - 0.5) * 0.05, // چرخش نرم
          render: { fillStyle: shape.fill, strokeStyle: shape.stroke }
        },
        true
      )
    );

  // ترکیب همه partها در یک Body
  shape.body = Matter.Body.create({
    parts,
    restitution: 0.8,
    friction: 0,
    frictionAir: 0.01, // کمی مقاوت هوا برای نرم شدن حرکت
  });



    Matter.Body.setPosition(shape.body, { x: shape.x, y: shape.y });
    shape.body.svgShape = shape;

    Matter.World.add(world, shape.body);
    shapes.push(shape);
    totalShapes++;
    remainedShapes++;
}


  // اتصال shape به body
  shape.body.svgShape = shape;

  // اضافه کردن به دنیا و آرایه‌ها
  Matter.World.add(world, shape.body);
  shapes.push(shape);
  totalShapes++;
  remainedShapes++;

  return shape;
}




function generateShapesWithDelay(count, delay) {
  let i = 0;
  function generateNext() {
    if (i >= count) return;
    spawnShape(); 
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
    remainedShapes--; 
  }
}




function loop(now) {
  if (!started) return;

  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;

  const timeNow = performance.now() / 1000;

  if (timeNow - lastRoundTime >= roundTime) {
    round++;
    lastRoundTime = timeNow;
    generateShapesWithDelay(MAX_SHAPES, 300);
  }

    Engine.update(engine, dt * 1000);
  ctx.clearRect(0, 0, canvas.width, canvas.height);


for (const s of shapes) {
  if (!s.body) continue;

  const pos = s.body.position;
  const angle = s.body.angle;
// const verts = s.getStarColliderWorld();
let vx = s.body.velocity.x;
let vy = s.body.velocity.y;

  handleWalls(s.body);  
if (bounced) {
  Matter.Body.setVelocity(s.body, { x: vx, y: vy });
}
  s.draw(ctx, pos.x, pos.y, angle);
}

  for (let i = shapes.length - 1; i >= 0; i--) {
    if (shapes[i].remove) {
      removeShape(shapes[i]);
    }
  }

if (!wallActive && shapes.some(s => {
  const pos = s.body.position; 
  return pos.x > 0 && pos.x < canvas.width && pos.y > 0 && pos.y < canvas.height;
})) {
  wallActive = true;
}

if (wallActive) {
  drawWalls();
}

  if (startTime !== null) {
    currentTime = (performance.now() - startTime) / 1000; // به ثانیه
  }
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
 currentTime = 0; 
startTime = performance.now();
  started = true;
  last = performance.now();
  lastRoundTime = performance.now() / 1000; 

  requestAnimationFrame(loop);
}


