
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
window.roundTime = 20;

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
let phys = null;
window.SPEED = window.SPEED ?? 1;
window.REGEN_INTERVAL = window.REGEN_INTERVAL ?? 50;
window.MAX_SHAPES = window.MAX_SHAPES ?? 20;

let MARGIN = Math.min(canvas.width, canvas.height) * 0.15;
const VIEW_MARGIN = 200;
const SPAWN_OFFSET = 0.5;
let bounced = false;
// ====================== Matter.js ======================
const { Engine, World, Bodies, Body, Runner } = Matter;
const engine = Engine.create();
const world = engine.world;
engine.world.gravity.x = 0;
engine.world.gravity.y = 0;
engine.positionIterations = 10; // default 6
engine.velocityIterations = 10; // default 4
let simulationStartTime = 0; // Track when simulation started
const SPAWN_INTERVAL_MS = 2500;
let idx = 0;
Matter.Common.setDecomp(window.decomp);


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
  // "F": ["11111", "10000", "10000", "11110", "10000", "10000", "10000"],
  "G": ["01110", "10001", "10000", "10111", "10001", "10001", "01110"],
  "H": ["10001", "10001", "10001", "11111", "10001", "10001", "10001"],
  "I": ["01110", "00100", "00100", "00100", "00100", "00100", "01110"],
  "J": ["00111", "00010", "00010", "00010", "10010", "10010", "01100"],
  "K": ["10001", "10010", "10100", "11000", "10100", "10010", "10001"],
  // "L": ["10000", "10000", "10000", "10000", "10000", "10000", "11111"],
  "M": ["10001", "11011", "10101", "10101", "10001", "10001", "10001"],
  "N": ["10001", "11001", "10101", "10011", "10001", "10001", "10001"],
  "O": ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
  "P": ["11110", "10001", "10001", "11110", "10000", "10000", "10000"],
  "Q": ["01110", "10001", "10001", "10001", "10101", "10010", "01101"],
  "R": ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
  "S": ["01111", "10000", "10000", "01110", "00001", "00001", "11110"],
  // "T": ["11111", "00100", "00100", "00100", "00100", "00100", "00100"],
  "U": ["10001", "10001", "10001", "10001", "10001", "10001", "01110"],
  "V": ["10001", "10001", "10001", "10001", "01010", "01010", "00100"],
  "W": ["10001", "10001", "10001", "10101", "10101", "11011", "10001"],
  "X": ["10001", "01010", "00100", "00100", "00100", "01010", "10001"],
  // "Y": ["10001", "01010", "00100", "00100", "00100", "00100", "00100"],
  "Z": ["11111", "00001", "00010", "00100", "01000", "10000", "11111"]
};

const view = { w: 0, h: 0 };
const _world = { w: 0, h: 0 };
const camera = { x: VIEW_MARGIN, y: VIEW_MARGIN };
const field = { x: VIEW_MARGIN, y: VIEW_MARGIN, w: 0, h: 0 }; // viewport rectangle inside world

function resizeCanvas() {
    const DPR = window.devicePixelRatio || 1; 
const w = window.innerWidth;
  const h = window.innerHeight;

  // سایز رندر واقعی
  canvas.width = w * DPR;
  canvas.height = h * DPR;

  // سایز ظاهری
  canvas.style.width = w + "px";
  canvas.style.height = h + "px";
  MARGIN = Math.min(canvas.width, canvas.height) * 0.15;
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

  view.w = w; view.h = h;
  _world.w = view.w + VIEW_MARGIN * 2;
  _world.h = view.h + VIEW_MARGIN * 2;
  camera.x = VIEW_MARGIN; camera.y = VIEW_MARGIN;

  field.x = camera.x; field.y = camera.y; field.w = view.w; field.h = view.h;

  // Log viewport dimensions
  console.log(`🖼️ Canvas/Viewport dimensions: ${w}x${h}, DPR: ${DPR}`);
  console.log(`🌍 World dimensions: ${_world.w}x${_world.h}`);
  console.log(`📐 Field bounds: x=${field.x}-${field.x + field.w}, y=${field.y}-${field.y + field.h}`);
  console.log(`📷 Camera position: (${camera.x}, ${camera.y})`);

  if (phys) phys.resizeBounds({
    _world: { width: _world.w, height: _world.h },
    field: { x: field.x, y: field.y, width: field.w, height: field.h }
  });

  updateAllShapesSize();
}
window.addEventListener("resize", () => {
  requestAnimationFrame(resizeCanvas); 
});

function updateAllShapesSize() {
  shapes.forEach(s => {
    if (s.buildSVG) s.buildSVG();
  });
}


window.addEventListener("DOMContentLoaded", () => {
  const colliderBtn = document.getElementById('toggleCollider');
  colliderBtn.addEventListener('click', () => {
    showColliders = !showColliders;
  });
  window.addEventListener("keydown", (e) => {
    if (e.altKey && (e.key === "c" || e.key === "C")) colliderBtn.click();
  });
});


function ensureInitial() {
  generateShapesWithDelay(MAX_SHAPES, 1000);
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


// Helper to get elapsed time in ms
function getElapsedMs() {
  return simulationStartTime ? performance.now() - simulationStartTime : 0;
}
function logWithTime(message) {
  console.log(`[${getElapsedMs().toFixed(1)}ms] ${message}`);
}
setInterval(() => globalSeconds++, 1000);
function isTooClose(x, y, shapes, size) {
  for (let s of shapes) {
    const dx = s.x - x;
    const dy = s.y - y;
    const dist = Math.hypot(dx, dy);
    if (dist < size) return true;
  }
  return false;
}

function spawnShape() {
  let shape;
  let safe = false;
  let tries = 0;

  while (!safe && tries < 10) {
    tries++;

    let sx, sy;
    const spawnType = Math.random() < 0.25 ? "corner" : "side";

    if (spawnType === "corner") {
      const corners = [
        [0, 0],
        [canvas.width, 0],
        [0, canvas.height],
        [canvas.width, canvas.height]
      ];
      const corner = corners[Math.floor(Math.random() * corners.length)];
      sx = corner[0] < canvas.width / 2
        ? -canvas.width * SPAWN_OFFSET
        : canvas.width + canvas.width * SPAWN_OFFSET;
      sy = corner[1] < canvas.height / 2
        ? -canvas.height * SPAWN_OFFSET
        : canvas.height + canvas.height * SPAWN_OFFSET;
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


    // const types = ["Glyph"];
    const types = ["Star", "Circle", "Triangle", "Square", "Diamond", "Rectangle", "RegularPolygon" , "Glyph"];
    const shapeType = types[Math.floor(Math.random() * types.length)];
    if (isTooClose(sx, sy, shapes, window.shapeSize)) continue;

    const commonPhysicsProps = {
      restitution: 0.5,
      friction: 0.0,
      frictionAir: 0.0,
      density: 0.001,
      slop: 0.0001,
      angularVelocity: (Math.random() - 0.5) * 0.05
    };

    if (shapeType === "Star") {
      shape = new SvgStar(sx, sy, {
        strokeWidth: 7,
        fillColor: getRandomColor(),
        borderColor: getRandomColor()
      });
      const verts = shape.getStarColliderWorld();
      shape.body = Matter.Bodies.fromVertices(shape.x, shape.y, [verts], {
        ...commonPhysicsProps,
        render: { fillStyle: shape.fillColor, strokeStyle: shape.borderColor }
      }, true);

    } else if (shapeType === "Circle") {
      shape = new SvgCircle(sx, sy, {
        strokeWidth: 7,
        fillColor: getRandomColor(),
        borderColor: getRandomColor()
      });
      const verts = shape.getCircleColliderWorld();
      shape.body = Matter.Bodies.fromVertices(shape.x, shape.y, [verts], {
        ...commonPhysicsProps,
        render: { fillStyle: shape.fillColor, strokeStyle: shape.borderColor }
      }, true);

    } else if (shapeType === "Triangle") {

      shape = new SvgTriangle(sx, sy, {
        strokeWidth: 7,
        fillColor: getRandomColor(),
        borderColor: getRandomColor()
      });


      shape.body = Matter.Bodies.fromVertices(
        shape.x,
        shape.y,
        [shape.colliderBase],
        {
          ...commonPhysicsProps,
          render: { fillStyle: shape.fillColor, strokeStyle: shape.borderColor }
        },
        true
      );
    } else if (shapeType === "Square") {
      shape = new SvgSquare(sx, sy, {
        fillColor: getRandomColor(),
        borderColor: getRandomColor()
      });
      const verts = shape.getColliderPoints();
      shape.body = Matter.Bodies.fromVertices(shape.x, shape.y, [verts], {
        ...commonPhysicsProps,
        render: { fillStyle: shape.fill, strokeStyle: shape.stroke }
      }, true);

    } else if (shapeType === "Diamond") {
      shape = new SvgDiamond(sx, sy, {
        fillColor: getRandomColor(),
        borderColor: getRandomColor()
      });
      const verts = shape.getColliderPoints();
      shape.body = Matter.Bodies.fromVertices(shape.x, shape.y, [verts], {
        ...commonPhysicsProps,
        render: { fillStyle: shape.fill, strokeStyle: shape.stroke }
      }, true);

    } else if (shapeType === "Rectangle") {
      shape = new SvgRectangle(sx, sy, {
        fillColor: getRandomColor(),
        borderColor: getRandomColor()
      });
      const verts = shape.getColliderPoints();
      shape.body = Matter.Bodies.fromVertices(shape.x, shape.y, [verts], {
        ...commonPhysicsProps,
        render: { fillStyle: shape.fill, strokeStyle: shape.stroke }
      }, true);

    }

    else if (shapeType === "RegularPolygon") {
      shape = new SvgRegularPolygonShape(sx, sy, 8, {
        fillColor: getRandomColor(),
        borderColor: getRandomColor()
      });
      const verts = shape.getColliderPoints();
      shape.body = Matter.Bodies.fromVertices(shape.x, shape.y, [verts], {
        ...commonPhysicsProps,
        render: { fillStyle: shape.fill, strokeStyle: shape.stroke }
      }, true);

    }

    else if (shapeType === "Glyph") {
      const keys = Object.keys(GLYPH5x7);
      const char = keys[Math.floor(Math.random() * keys.length)];
      shape = new GlyphLetter(sx, sy, char, {
        size: window.shapeSize || 120,
        fillColor: getRandomColor(),
        borderColor: getRandomColor()
      });

      shape.bodies = [];

      const polys = shape.glyphColliderExact;
      polys.forEach(poly => {
        const cleanPoly = poly.filter((p, i, arr) => {
          const next = arr[(i + 1) % arr.length];
          return Math.hypot(next.x - p.x, next.y - p.y) > 0.1;
        });
        if (cleanPoly.length < 3) return;

        const convexPolys = (typeof decomp !== "undefined" && decomp)
          ? decomp.quickDecomp(cleanPoly)
          : [cleanPoly];

        convexPolys.forEach(cPoly => {
          const minX = Math.min(...cPoly.map(p => p.x));
          const maxX = Math.max(...cPoly.map(p => p.x));
          const minY = Math.min(...cPoly.map(p => p.y));
          const maxY = Math.max(...cPoly.map(p => p.y));
          const w = maxX - minX;
          const h = maxY - minY;
          const cx = sx + minX + w / 2;
          const cy = sy + minY + h / 2;

          const body = Matter.Bodies.rectangle(cx, cy, w, h, {
            isStatic: false,
            restitution: 0.1,
            friction: 0.003,
            frictionAir: 0.001,
            density: 0.001,
            slop: 0.0001,
            render: { fillStyle: shape.fillColor, strokeStyle: shape.borderColor }
          });

          body.offset = { x: minX + w / 2, y: minY + h / 2 };
          body.svgShape = shape;

          shape.bodies.push(body);
        });
      });

      if (shape.bodies.length > 0) {
        shape.body = Matter.Body.create({
          parts: shape.bodies,
          isStatic: false,
          restitution: 0.1,
          friction: 0.003,
          frictionAir: 0.001,
          density: 0.001,
          slop: 0.0001,
          angularVelocity: (Math.random() - 0.5) * 0.05
        });
        Matter.Body.setPosition(shape.body, { x: shape.x, y: shape.y });
        shape.body.svgShape = shape;
        Matter.World.add(engine.world, shape.body);
      }
    }


    if (shape?.body) {
      safe = shapes.every(s => {
        const dx = s.x - shape.x;
        const dy = s.y - shape.y;
        const dist = Math.hypot(dx, dy);
        return dist > (window.shapeSize || 120) * 1.2;
      });

      if (!safe) {
        Matter.World.remove(engine.world, shape.body);
        continue;
      }

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const dx = cx - shape.x;
      const dy = cy - shape.y;
      const dist = Math.hypot(dx, dy) || 1;
      const speed = window.SPEED;
      shape.vx = (dx / dist) * speed;
      shape.vy = (dy / dist) * speed;

      Matter.Body.setVelocity(shape.body, {
        x: Math.max(-speed, Math.min(speed, shape.vx)),
        y: Math.max(-speed, Math.min(speed, shape.vy))
      });
      shape.body.maxWallBounces = window.maxWallBounces;
      shape.body.wallBounces = 0;
      shape.body.canBounce = true;
      shape.body.svgShape = shape;

      Matter.World.add(world, shape.body);
      shapes.push(shape);
      totalShapes++;
      remainedShapes++;
    }
  }

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
// ----------------------
function updateGlyphPosition(glyph) {
  // if (!glyph || !glyph.bodies) return;

  // const cos = Math.cos(glyph.angle || 0);
  // const sin = Math.sin(glyph.angle || 0);

  // glyph.bodies.forEach(body => {
  //   if (!body.offset) return;
  //   const ox = body.offset.x;
  //   const oy = body.offset.y;
  //   const px = glyph.x + ox * cos - oy * sin;
  //   const py = glyph.y + ox * sin + oy * cos;
  //   Matter.Body.setPosition(body, { x: px, y: py });
  //   Matter.Body.setAngle(body, glyph.angle || 0);
  // });
}

Matter.Events.on(engine, 'collisionStart', function (event) {
  const pairs = event.pairs;

  pairs.forEach(pair => {
    const bodies = [pair.bodyA, pair.bodyB];

    bodies.forEach(body => {
      if (body.svgShape && body.svgShape.type === "Glyph") {
        Matter.Body.setVelocity(body, {
          x: -body.velocity.x * 0.8,
          y: -body.velocity.y * 0.8
        });
        Matter.Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.1);
      }

    });


  });
});


function loop(now) {
  if (!started) return;

  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;

  const timeNow = performance.now() / 1000;

  if (timeNow - lastRoundTime >= roundTime) {
    round++;
    lastRoundTime = timeNow;
    generateShapesWithDelay(MAX_SHAPES, 1000);
  }

  Engine.update(engine, dt * 1000);
  ctx.clearRect(0, 0, canvas.width, canvas.height);


  for (const s of shapes) {
    if (!s.body) continue;

    if (s.bodies) {
      updateGlyphPosition(s);
    }

    const pos = s.body.position;
    const angle = s.body.angle;
    let vx = s.body.velocity.x;
    let vy = s.body.velocity.y;

    handleWalls(s.body);
    if (s.body.outOfBounds) {
      removeShape(s);
    }
    s.draw(ctx, pos.x, pos.y, angle);
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
    currentTime = (performance.now() - startTime) / 1000;
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


