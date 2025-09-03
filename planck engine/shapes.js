

let shapes = [];
const SCALE = 30; // هر متر = 30px
const pl = planck;
const world = new pl.World(pl.Vec2(0, 0));
window.circleShape;
window.boxShape;
window.polyShape;
window.starShape;

window.size = 50;
window.height = 50;
window.width = 80;
// گرفتن کانتکست 2D

// متغیر برای نشان دادن کالیدر
 function spawnVelocityTowardsCenter(SPEED) {
      const cx = canvas.width / 2, cy = canvas.height / 2;
      return (x, y) => {
        const dx = cx - x, dy = cy - y, d = Math.hypot(dx, dy) || 1;
        return { vx: dx / d * SPEED, vy: dy / d * SPEED };
      };
    }
    const makeVelocity = spawnVelocityTowardsCenter(SPEED);



    function randomColor() {
      const colors = ["red", "blue", "green", "yellow", "purple", "orange", "cyan"];
      return colors[Math.floor(Math.random() * colors.length)];
    }

    function getRandomSide() {
      const sides = ["left", "right", "top", "bottom"];
      return sides[Math.floor(Math.random() * sides.length)];
    }


// ----------------
// ساخت شکل‌ها
// ----------------
function createCircle(x, y, r = window.size, color = randomColor(), border = 7) {
    const body = world.createDynamicBody(pl.Vec2(x / SCALE, y / SCALE));

    // شعاع فیزیکی = شعاع اصلی + ضخامت مرز
    const physicsR = r + border;

    // Fixture برای فیزیک
    body.createFixture(pl.Circle(physicsR / SCALE), { density: 1, restitution: 0.8 });

    body.renderColor = color;
    body.border = border;
    body.strokeColor = "#fff";

    // شعاع واقعی برای رسم
    body.visualRadius = r;

    return body;
}



function createBox(x, y, w = window.width, h = window.height, color = randomColor(), strokeWidth = 7) {
  const body = world.createDynamicBody(pl.Vec2(x / SCALE, y / SCALE));

  // ابعاد واقعی برای فیزیک = ابعاد + نصف ضخامت بوردر
  const physicsW = (w + strokeWidth +20) / 2 / SCALE;
  const physicsH = (h + strokeWidth +20) / 2 / SCALE;

  body.createFixture(pl.Box(physicsW, physicsH), { density: 1, restitution: 0.8 });

  body.renderColor = color;
  body.border = strokeWidth;
  body.strokeColor = "#fff";
  body.fixtureWidth = physicsW  * 2 * SCALE;  // برای برخورد با دیوار یا محاسبات
  body.fixtureHeight = physicsH * 2 * SCALE;

  return body;
}

// function createPolygon(x, y, verts, color = randomColor()) {
//   const body = world.createDynamicBody(pl.Vec2(x / SCALE, y / SCALE));
//   const vecs = verts.map(p => pl.Vec2(p.x / SCALE, p.y / SCALE));
//   if (pl.Polygon.isValid(vecs)) {
//     body.createFixture(pl.Polygon(vecs), { density: 1, restitution: 0.6 });
//   }
//   body.renderColor = color;
//   body.border = 7;         // ضخامت مرز
//   body.strokeColor = "#fff"; // رنگ مرز
//   return body;
// }

function createTriangle(x, y, size = window.size, color = randomColor()) {
  const body = world.createDynamicBody(pl.Vec2(x / SCALE, y / SCALE));

  // مختصات رئوس مثلث متساوی‌الاضلاع
  const height = size * Math.sqrt(3) / 2;
  const verts = [
    pl.Vec2(0, -height / 2 / SCALE),            // رأس بالا
    pl.Vec2(-size / 2 / SCALE, height / 2 / SCALE),  // پایین چپ
    pl.Vec2(size / 2 / SCALE, height / 2 / SCALE)    // پایین راست
  ];

  body.createFixture(pl.Polygon(verts), { density: 1, restitution: 0.6 });

  body.renderColor = color;
  body.border = 7;
  body.strokeColor = "#fff";

  return body;
}

function createRectangle(x, y, width = window.height, height = window.height, color = randomColor()) {
  const body = world.createDynamicBody(pl.Vec2(x / SCALE, y / SCALE));

  // Box: نصف عرض و نصف ارتفاع
  body.createFixture(pl.Box(width / 2 / SCALE, height / 2 / SCALE), { density: 1, restitution: 0.8 });

  body.renderColor = color;
  body.border = 7;
  body.strokeColor = "#fff";

  return body;
}
function createHexagon(x, y, radius = window.size, color = randomColor()) {
  const body = world.createDynamicBody(pl.Vec2(x / SCALE, y / SCALE));

  const verts = [];
  const sides = 6;
  for (let i = 0; i < sides; i++) {
    const angle = (i / sides) * 2 * Math.PI;
    verts.push(pl.Vec2(Math.cos(angle) * radius / SCALE, Math.sin(angle) * radius / SCALE));
  }

  body.createFixture(pl.Polygon(verts), { density: 1, restitution: 0.8 });

  body.renderColor = color;
  body.border = 7;
  body.strokeColor = "#fff";

  return body;
}


// function createStar(x, y, spikes = 5, outerR = 50, innerR = 25, color = randomColor()) {
//   const body = world.createDynamicBody(pl.Vec2(x / SCALE, y / SCALE));
//   const step = Math.PI / spikes;

//   for (let i = 0; i < spikes; i++) {
//     const angle = i * 2 * step - Math.PI / 2;
//     const angleNext = (i * 2 + 2) * step - Math.PI / 2;
//     const p1 = {x: Math.cos(angle) * outerR, y: Math.sin(angle) * outerR};
//     const p2 = {x: Math.cos(angle + step) * innerR, y: Math.sin(angle + step) * innerR};
//     const p3 = {x: Math.cos(angleNext) * outerR, y: Math.sin(angleNext) * outerR};
//     // Fixture مستقیم بدون isValid
//     body.createFixture(pl.Polygon([pl.Vec2(p1.x / SCALE, p1.y / SCALE), 
//                                    pl.Vec2(p2.x / SCALE, p2.y / SCALE), 
//                                    pl.Vec2(p3.x / SCALE, p3.y / SCALE)]), 
//                        {density: 1, restitution: 0.8});
//   }
//   body.renderColor = color;
//   body.border = 7;
//   body.strokeColor = "#fff";
//   return body;
// }



class Shape {
  constructor(body, type) {
    this.body = body;
    this.type = type;
    this.id = Math.random().toString(36).slice(2, 10);
    this.birth = performance.now() / 1000;
    this.maxWallBounces = 3;
    this.wallBounces = 0;
    this.collisionsEnabled = true;
    this.size = 50;       // مقدار پیش‌فرض
    this.strokeWidth = 7; // مقدار پیش‌فرض
  }

  get pos() { return this.body.getPosition(); }
  get angle() { return this.body.getAngle(); }

  draw(ctx) {

    for (let f = this.body.getFixtureList(); f; f = f.getNext()) {
      const shape = f.getShape();
      if (shape.m_type !== 'polygon' && shape.m_type !== 'circle') continue;

      ctx.save();
      ctx.translate(this.pos.x * SCALE, this.pos.y * SCALE);
      ctx.rotate(this.angle);

      // رسم شکل
      ctx.beginPath();
      if (shape.m_type === 'circle') {
        const r = shape.m_radius * SCALE;
        ctx.arc(0, 0, r, 0, 2 * Math.PI);
      } else if (shape.m_type === 'polygon') {
        const verts = shape.m_vertices;
        ctx.moveTo(verts[0].x * SCALE, verts[0].y * SCALE);
        for (let i = 1; i < verts.length; i++) {
          ctx.lineTo(verts[i].x * SCALE, verts[i].y * SCALE);
        }
        ctx.closePath();
      }

      ctx.fillStyle = this.body.renderColor || 'gray';
      ctx.fill();

      if (this.body.border) {
        ctx.lineWidth = this.body.border;
        ctx.strokeStyle = this.body.strokeColor || "#fff";
        ctx.stroke();
      }

      // لاگ قبل کالیدر
      console.log(`Calling drawCollider for shape ${this.type}`);
      drawCollider(ctx, this);

      ctx.restore();
    }
  }
}

//foraccess
circleShape = new Shape(createCircle(200, 200, 40, randomColor()), "circle");
circleShape.size = 80;
circleShape.strokeWidth = 7;
shapes.push(circleShape);

boxShape = new Shape(createBox(400, 200, 50, 50, randomColor()), "box");
boxShape.size = 50;
boxShape.strokeWidth = 7;
shapes.push(boxShape);

polyShape = new Shape(createPolygon(600, 200, [{ x: 0, y: 0 }, { x: 50, y: 0 }, { x: 25, y: 40 }], randomColor()), "polygon");
polyShape.size = 50;
polyShape.strokeWidth = 7;
shapes.push(polyShape);


rectShape = new Shape(createRectangle(600, 200,120, 60, randomColor()), "rectangle"); 
rectShape.width = 80; 
rectShape.height = 50; 
rectShape.strokeWidth = 7; 
shapes.push(rectShape);

const triShape = new Shape(createPolygon(300, 200, randomColor()), "triangle");
triShape.width = window.width;   // عرض پایه مثلث
triShape.height = Math.sqrt(3)/2 * window.width; // ارتفاع مثلث متساوی‌الاضلاع
triShape.strokeWidth = 7;
shapes.push(triShape);


// starShape = new Shape(createStar(800, 200, 5, 60, 30, randomColor()), "star");
// starShape.size = 120;
// starShape.strokeWidth = 7;
// shapes.push(starShape);

// ----------------
// رسم شکل‌ها
// ----------------
function drawCollider(ctx, shapeObj) {

  console.log(shapeObj.type);
  if (!showColliders) return;

  const size = shapeObj.size ;
  const strokeWidth = shapeObj.strokeWidth ;
const angle = shapeObj.body.angle;
// const vertices = shapeObj.body.vertices;

  ctx.save();
  ctx.translate(shapeObj.x, shapeObj.y); // موقعیت شکل
  ctx.rotate(angle);        // چرخش شکل

  ctx.strokeStyle = "lime";

  if (shapeObj.type === "circle") {
    const r = size / 2 +3;

    // حلقه نزدیک دور شکل
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, r + strokeWidth, 0, Math.PI * 2);
    ctx.stroke();

    // حلقه بزرگتر
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0, 0, r + strokeWidth + 5, 0, Math.PI * 2);
    ctx.stroke();

  } 
  else if (shapeObj.type === "square") {
    const size = window.size + 27 ;
    const half = size / 2;
    ctx.lineWidth = 2;
    ctx.strokeRect(-half - strokeWidth, -half - strokeWidth, size + strokeWidth * 2, size + strokeWidth * 2);

    ctx.lineWidth = 1;
    ctx.strokeRect(-half - strokeWidth - 5, -half - strokeWidth - 5, size + strokeWidth * 2 + 10, size + strokeWidth * 2 + 10);

  }   else if (shapeObj.type === "rectangle") {
     const w = window.width +27;
    const h = window.height +23;

    ctx.lineWidth = 2;
    ctx.strokeRect(-w/2 - strokeWidth, -h/2 - strokeWidth, w + 2*strokeWidth, h + 2*strokeWidth);

    ctx.lineWidth = 1;
    ctx.strokeRect(-w/2 - strokeWidth - 5, -h/2 - strokeWidth - 5, w + 2*strokeWidth + 10, h + 2*strokeWidth + 10);
  } 
else if (shapeObj.type === "triangle") {
const size = shapeObj.size - 10;
const h = Math.sqrt(3) / 2 * size;
const offsetY = 10;

// رئوس مثلث
let verts = [
  { x: -size / 2, y: h / 3 + offsetY },
  { x:  size / 2, y: h / 3 + offsetY },
  { x: 0,         y: -2 * h / 3 + offsetY }
];

// مرکز هندسی مثلث
const cx = (verts[0].x + verts[1].x + verts[2].x) / 3;
const cy = (verts[0].y + verts[1].y + verts[2].y) / 3;

// ===== کالیدر اصلی =====
ctx.lineWidth = 2;
ctx.beginPath();
ctx.moveTo(verts[0].x, verts[0].y);
for (let i = 1; i < verts.length; i++) {
  ctx.lineTo(verts[i].x, verts[i].y);
}
ctx.closePath();
ctx.stroke();

// ===== کالیدر بزرگ‌تر (scale حول مرکز) =====
const scale = 1.2; // بزرگ‌تر شدن
const vertsBig = verts.map(v => ({
  x: cx + (v.x - cx) * scale,
  y: cy + (v.y - cy) * scale
}));

ctx.lineWidth = 1;
ctx.beginPath();
ctx.moveTo(vertsBig[0].x, vertsBig[0].y);
for (let i = 1; i < vertsBig.length; i++) {
  ctx.lineTo(vertsBig[i].x, vertsBig[i].y);
}
ctx.closePath();
ctx.stroke();
   }
   else if (shapeObj.type === "hexagon") {
  const radius = shapeObj.size -38;   // شعاع شش‌ضلعی
  const offsetY = 0;              // اگه خواستی مثلث پایین‌تر بیاد می‌تونی اینجا هم بدی

  // رئوس شش‌ضلعی
  let verts = [];
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2; // زاویه هر رأس
    verts.push({
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius + offsetY
    });
  }

  // مرکز هندسی (میانگین رأس‌ها)
  const cx = verts.reduce((sum, v) => sum + v.x, 0) / verts.length;
  const cy = verts.reduce((sum, v) => sum + v.y, 0) / verts.length;

  // ===== کالیدر اصلی =====
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(verts[0].x, verts[0].y);
  for (let i = 1; i < verts.length; i++) {
    ctx.lineTo(verts[i].x, verts[i].y);
  }
  ctx.closePath();
  ctx.stroke();

  // ===== کالیدر بزرگتر =====
  const scale = 0.9; // مقدار بزرگ‌تر شدن
  const vertsBig = verts.map(v => ({
    x: cx + (v.x - cx) * scale,
    y: cy + (v.y - cy) * scale
  }));

  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(vertsBig[0].x, vertsBig[0].y);
  for (let i = 1; i < vertsBig.length; i++) {
    ctx.lineTo(vertsBig[i].x, vertsBig[i].y);
  }
  ctx.closePath();
  ctx.stroke();
}

 else if (shapeObj.type === "polygon") {
    // چندضلعی منتظم
    const verts = shapeObj.body.getFixtureList().getShape().m_vertices;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(verts[0].x * SCALE, verts[0].y * SCALE);
    for (let i = 1; i < verts.length; i++) {
      ctx.lineTo(verts[i].x * SCALE, verts[i].y * SCALE);
    }
    ctx.closePath();
    ctx.stroke();

    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i < verts.length; i++) {
      const v = verts[i];
      ctx.lineTo(v.x * SCALE, v.y * SCALE);
    }
  }
  // else { // مربع یا چندضلعی
  //   const half = size / 2;

  //   // حلقه نزدیک دور شکل
  //   ctx.lineWidth = 2;
  //   ctx.strokeRect(-half - strokeWidth, -half - strokeWidth, size + strokeWidth * 2, size + strokeWidth * 2);

  //   // حلقه بزرگتر
  //   ctx.lineWidth = 1;
  //   ctx.strokeRect(-half - strokeWidth - 5, -half - strokeWidth - 5, size + strokeWidth * 2 + 10, size + strokeWidth * 2 + 10);
  // }

  // متن
  ctx.fillStyle = "#ffffff";
  ctx.font = "12px Arial";
  ctx.fillText(`W:${shapeObj.wallBounces}/${shapeObj.maxWallBounces}`, -size / 2, size / 2 + 20);

  ctx.restore();
}


function drawBody(ctx, maybeShapeOrBody) {
  const body = maybeShapeOrBody.body ? maybeShapeOrBody.body : maybeShapeOrBody; // انعطاف

  const pos = body.getPosition();
  const angle = body.getAngle();

  ctx.save();
  ctx.translate(pos.x * SCALE, pos.y * SCALE);
  ctx.rotate(angle);

  for (let f = body.getFixtureList(); f; f = f.getNext()) {
    const shape = f.getShape();
    ctx.beginPath();

    if (shape.m_type === "circle") {
      const r = shape.m_radius * SCALE;
      ctx.arc(0, 0, r, 0, 2 * Math.PI);
    } 
    
if (shape.m_type === "polygon" && shape.m_vertices && shape.m_vertices.length >= 3) {
  const verts = shape.m_vertices;
  ctx.moveTo(verts[0].x * SCALE, verts[0].y * SCALE);
  for (let i = 1; i < verts.length; i++) {
    ctx.lineTo(verts[i].x * SCALE, verts[i].y * SCALE);
  }
  ctx.closePath();
}


    ctx.fillStyle = body.renderColor || "gray";
    ctx.fill();

    if (body.border) {
      ctx.lineWidth = body.border;
      ctx.strokeStyle = body.strokeColor || "#fff";
      ctx.stroke();
    }
  }

  ctx.restore();
}



function centerVerts(verts) {
  let cx = 0, cy = 0;
  for (const v of verts) { cx += v.x; cy += v.y; }
  cx /= verts.length;
  cy /= verts.length;
  return verts.map(v => ({ x: v.x - cx, y: v.y - cy }));
}

function tryGenerateShape() {
  const offset = 60;
  let sx, sy;
  let r;

  // لیست شکل‌ها: 0=دایره، 1=مربع، 2=مثلث، 3=ستاره، 4=چندضلعی منتظم
  const shapeTypes = [0, 1, 2, 3, 4];
  const shapeType = shapeTypes[Math.floor(Math.random() * shapeTypes.length)];

  // تعیین اندازه پایه
  switch (shapeType) {
    case 0: r = 40; break; // circle
    case 1: r = 50; break; // square
    case 2: r = 70; break; // triangle
    case 3: r = 50; break; // star
    case 4: r = 40; break; // regular polygon
  }

  // پیدا کردن نقطه شروع آزاد
  function isFreePosition(x, y, radius) {
    for (const b of shapes) {
      const pos = b.body.getPosition();
      const br = b.fixtureRadius || 50;
      const dx = (pos.x * SCALE) - x;
      const dy = (pos.y * SCALE) - y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < br + radius + 5) return false;
    }
    return true;
  }

  let attempts = 0;
  const maxAttempts = 30;
  do {
    const side = getRandomSide();
    if (side === "left") { sx = -offset; sy = Math.random() * canvas.height; }
    else if (side === "right") { sx = canvas.width + offset; sy = Math.random() * canvas.height; }
    else if (side === "top") { sx = Math.random() * canvas.width; sy = -offset; }
    else { sx = Math.random() * canvas.width; sy = canvas.height + offset; }
    attempts++;
  } while (!isFreePosition(sx, sy, r) && attempts < maxAttempts);

  const vel = makeVelocity(sx, sy);
  vel.vx *= 0.6;
  vel.vy *= 0.6;

  const color = randomColor();
  let body, shapeObj, typeName;

  // انتخاب شکل
  switch (shapeType) {
    case 0: { // دایره
        body = createCircle(sx, sy, window.size, color);
        typeName = "circle";
        break;
    }
    case 1: { // مربع
        body = createBox(sx, sy, window.size, window.size, color);
        typeName = "square";
        break;
    }
    case 2: { // مثلث
      body = createTriangle(sx, sy, window.size+20, color);
        typeName = "triangle";
        break;
    }
    case 3: { 
      body = createRectangle(sx, sy, window.width+30, window.height+25,color);
        typeName = "rectangle";
        break;
    }
    case 4: { 
      body = createHexagon(sx, sy, window.size,color);
        typeName = "hexagon";
        break;
    }
    // case 3: { // ستاره
    //     body = createStar(sx, sy, 5, r, r*0.5, color);
    //     typeName = "star";
    //     break;
    // }
    case 5: { // چندضلعی 6 ضلعی
        const sides = 6;
        const verts = [];
        for(let i=0;i<sides;i++){
            const a = (i/sides)*Math.PI*2;
            verts.push({x:Math.cos(a)*r, y:Math.sin(a)*r});
        }
        body = createPolygon(sx, sy, verts, color);
        typeName = "polygon";
        break;
    }
}



  if (!body) return null;
  shapeObj = new Shape(body, typeName);
  if (typeName = "triangle")
  shapeObj.size = window.size * 3;

  shapeObj.size = window.size * 2;
  shapeObj.width = window.width  * 2;
  shapeObj.height = window.height * 2;
  shapeObj.strokeWidth = 7;
  body.setLinearVelocity(pl.Vec2(vel.vx / SCALE, vel.vy / SCALE));

  shapes.push(shapeObj);
  totalShapes++;
  remainedShapes++;

  return body;
}



function generateShapesWithDelay(count, delay) {
  let i = 0;

  function generateNext() {
    if (i >= count) return;

    const sh = tryGenerateShape();
    // اینجا دیگه shapes.push(sh) نکن؛ tryGenerateShape خودش push کرده
    if (sh) {
      // فقط شمارنده‌ها اگر بخوای می‌تونی اینجا مدیریت کنی، ولی از قبل انجام شده
    }

    i++;
    setTimeout(generateNext, delay);
  }

  generateNext();
}

function removeShape(shapeObj) {
  if (!shapeObj || !shapeObj.body) return;
  world.destroyBody(shapeObj.body);
  const index = shapes.indexOf(shapeObj);
  if (index > -1) shapes.splice(index, 1);
  remainedShapes = Math.max(0, remainedShapes - 1);
}


