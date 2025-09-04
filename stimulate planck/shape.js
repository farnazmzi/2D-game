window.shapeSize = 100;



class SvgCircle {
  constructor(x, y, opts = {}) {
    this.id = Math.random().toString(36).slice(2, 10);
    this.type = "Circle";
    this.name = "Circle";

    this.x = x;
    this.y = y;
    this.angle = 0;
    this.angVel = (Math.random() * 2 - 1) * Math.PI / 180;

    this.strokeWidth = opts.strokeWidth || 7;
    this.fillColor = opts.fillColor || "lightblue";
    this.borderColor = opts.borderColor || "blue";
    this.restitution = opts.restitution ?? 0.5;
    this.entrySide = opts.entrySide;
    this.birth = performance.now() / 1000;

    // سرعت به سمت مرکز
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    let dx = cx - this.x;
    let dy = cy - this.y;
    const dist = Math.hypot(dx, dy) || 1;
    dx /= dist;
    dy /= dist;
    const SPEED_FACTOR = window.SPEED || 100;
    this.vx = dx * SPEED_FACTOR;
    this.vy = dy * SPEED_FACTOR;

    // ساخت SVG
    this.buildSVG();
  }

  get size() {
    return shapeSize;   // همیشه از گلوبال می‌خونه
  }

  get radius() {
    return this.size / 2;
  }

  buildSVG() {
    const svgObj = svgmaker.mkCircle({
      stroke: this.borderColor,
      fill: this.fillColor,
      outlinePx: this.strokeWidth,
      radius: this.radius
    });
    this.svg = svgObj.svg;

    const parser = new DOMParser();
    const doc = parser.parseFromString(this.svg, "image/svg+xml");
    const xml = new XMLSerializer().serializeToString(doc.documentElement);
    const svg64 = btoa(xml);
    this.img = new Image();
    this.loaded = false;
    this.img.src = "data:image/svg+xml;base64," + svg64;
    this.img.onload = () => { this.loaded = true; };
  }

  draw(ctx) {
    if (!this.loaded) return;
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);

    // رسم SVG
    ctx.drawImage(this.img, -this.radius, -this.radius, this.radius * 2, this.radius * 2);

    // رسم کالیدر بصری
    if (showColliders) {
      // حلقه اول (مرکز)
      ctx.strokeStyle = "#18ed09";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
      ctx.stroke();

      // حلقه دوم کمی بزرگتر
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(0, 0, this.radius * 1.25, 0, Math.PI * 2);
      ctx.stroke();

      // متن وضعیت
      ctx.fillStyle = "#ffffff";
      ctx.font = "12px Arial";
      ctx.fillText(`W:${this.wallBounces || 0}/${this.maxWallBounces || 3}`, -this.radius, this.radius + 20);
    }

    ctx.restore();
  }

  // کالیدر واقعی برای Planck.js
  getColliderPoints() {
    return { x: this.x, y: this.y, r: this.radius + this.strokeWidth };
  }

  get radiusWithStroke() {
    return this.radius + this.strokeWidth;
  }

  ageSeconds() {
    return (performance.now() / 1000) - this.birth;
  }

  isOut() {
    return (
      this.x + this.radius < 0 ||
      this.x - this.radius > canvas.width ||
      this.y + this.radius < 0 ||
      this.y - this.radius > canvas.height
    );
  }
}



class SvgLetter {
  constructor(svgString, side, width = 80, height = 80, speed = 50) {
    const marginX = canvas.width * 0.2;
    const marginY = canvas.height * 0.2;

    // تعیین مختصات اولیه طبق سمت
    if (side === 'left') { this.x = -marginX - Math.random() * 40; this.y = Math.random() * canvas.height; }
    else if (side === 'right') { this.x = canvas.width + marginX + Math.random() * 40; this.y = Math.random() * canvas.height; }
    else if (side === 'top') { this.y = -marginY - Math.random() * 40; this.x = Math.random() * canvas.width; }
    else { this.y = canvas.height + marginY + Math.random() * 40; this.x = Math.random() * canvas.width; }

    this.width = width;
    this.height = height;
    this.birth = performance.now() / 1000;
    this.angle = 0;
    this.angularSpeed = (Math.random() * 2 - 1) * Math.PI / 180;
    this.entrySide = side;
    this.loaded = false;

    // Velocity به سمت مرکز
    const cx = canvas.width / 2, cy = canvas.height / 2;
    const dx = cx - this.x, dy = cy - this.y, d = Math.hypot(dx, dy) || 1;
    this.vx = dx / d * speed;
    this.vy = dy / d * speed;

    // تبدیل SVG به Image
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgString, "image/svg+xml");
    const xml = new XMLSerializer().serializeToString(doc.documentElement);
    const svg64 = btoa(xml);

    this.img = new Image();
    this.img.src = 'data:image/svg+xml;base64,' + svg64;
    this.img.onload = () => { this.loaded = true; };
  }

  draw(ctx) {
    if (!this.loaded) return;
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    ctx.drawImage(this.img, -this.width / 2, -this.height / 2, this.width, this.height);
    ctx.restore();
  }

  ageSeconds() { return (performance.now() / 1000) - this.birth; }
  get radius() { return Math.max(this.width, this.height) / 2; }
  isOut() {
    return this.x + this.width / 2 < 0 || this.x - this.width / 2 > canvas.width ||
      this.y + this.height / 2 < 0 || this.y - this.height / 2 > canvas.height;
  }
}
function randomColor() {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);
  return `rgb(${r},${g},${b})`;
}

SvgLetter.prototype.getColliderPoints = function () {
  // ساده‌ترین حالت: مستطیل با width و height
  const hw = this.width / 2;
  const hh = this.height / 2;
  const cos = Math.cos(this.angle);
  const sin = Math.sin(this.angle);

  return [
    { x: this.x + (-hw) * cos - (-hh) * sin, y: this.y + (-hw) * sin + (-hh) * cos },
    { x: this.x + (hw) * cos - (-hh) * sin, y: this.y + (hw) * sin + (-hh) * cos },
    { x: this.x + (hw) * cos - (hh) * sin, y: this.y + (hw) * sin + (hh) * cos },
    { x: this.x + (-hw) * cos - (hh) * sin, y: this.y + (-hw) * sin + (hh) * cos },
  ];
};



class Triangle {
  constructor(x, y, size, color) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.color = color;
    this.angle = 0;
    this.rotation = 0;
    this.vx = 0;
    this.vy = 0;
    this.ax = 0;
    this.ay = 0;
    this.angularVelocity = 0;
    this.angularAcceleration = 0;
    this.restitution = restitution;
    this.bounceCount = 0;

    // جرم و ممان اینرسی ساده برای مثلث متساوی‌الاضلاع
    this.mass = 1;
    this.invMass = 1 / this.mass;
    this.inertia = (this.mass * this.size * this.size) / 12;
    this.invInertia = 1 / this.inertia;
  }

  getVertices() {
    const h = (Math.sqrt(3) / 2) * this.size;
    const vertices = [
      { x: 0, y: -h / 2 },                  // رأس بالا
      { x: -this.size / 2, y: h / 2 },      // پایین چپ
      { x: this.size / 2, y: h / 2 }        // پایین راست
    ];
    // دوران بر اساس زاویه
    return vertices.map(v => ({
      x: this.x + v.x * Math.cos(this.angle) - v.y * Math.sin(this.angle),
      y: this.y + v.x * Math.sin(this.angle) + v.y * Math.cos(this.angle)
    }));
  }

  draw(ctx) {
    const vertices = this.getVertices();
    ctx.beginPath();
    ctx.moveTo(vertices[0].x, vertices[0].y);
    ctx.lineTo(vertices[1].x, vertices[1].y);
    ctx.lineTo(vertices[2].x, vertices[2].y);
    ctx.closePath();
    ctx.fillStyle = this.color;
    ctx.fill();
    if (showCollider) {
      ctx.strokeStyle = "lime";
      ctx.stroke();
    }
  }
}





class Circle {
  constructor(x, y, strokeWidth = 7, vx = 0, vy = 0, entrySide = null, restitution = 0.9) {
    this.type = "Circle";
    this.id = Math.random().toString(36).slice(2, 10);
    this.name = "Circle";
    this.x = x;
    this.y = y;
    this.strokeWidth = strokeWidth;
    this.vx = vx;
    this.vy = vy;
    this.entrySide = entrySide;
    this.birth = performance.now() / 1000;
    this.angle = 0;
    this.angVel = (Math.random() * 2 - 1) * Math.PI / 180;  // سرعت زاویه‌ای اولیه

    // برخورد و دیوار
    this.wallBounces = 0;
    this.maxWallBounces = 3;
    this.collisionsEnabled = true;

    // وضعیت زندگی و ورود/خروج
    this.inField = false;
    this.entering = true;
    this.leaving = false;
    this.restitution = restitution;

  }
  get radius() {
    return circleRadius;  // ← همیشه از global می‌خونه
  }
  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);

    // خود دایره
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = "gray";
    ctx.fill();
    ctx.lineWidth = this.strokeWidth;
    ctx.strokeStyle = "red";
    ctx.stroke();

    if (showColliders) {
      // حلقه اول
      ctx.beginPath();
      ctx.arc(0, 0, this.radiusWithStroke, 0, Math.PI * 2);
      ctx.strokeStyle = this.leaving ? "#18ed09" : (this.entering ? "#18ed09" : "#18ed09");
      ctx.lineWidth = 2;
      ctx.stroke();

      // حلقه دوم (بزرگتر)
      ctx.beginPath();
      ctx.arc(0, 0, this.radiusWithStroke + 5, 0, Math.PI * 2);
      ctx.strokeStyle = ctx.strokeStyle;
      ctx.lineWidth = 1;
      ctx.stroke();

      // متن
      ctx.fillStyle = "#ffffff";
      ctx.font = "12px Arial";
      ctx.fillText(`W:${this.wallBounces}/${this.maxWallBounces}`, -this.radius, this.radius + 15);
    }

    ctx.restore();
  }


  ageSeconds() {
    return (performance.now() / 1000) - this.birth;
  }

  get radiusWithStroke() {
    return this.radius + this.strokeWidth;
  }

  isOut() {
    return (
      this.x < -this.radiusWithStroke ||
      this.x > canvas.width + this.radiusWithStroke ||
      this.y < -this.radiusWithStroke ||
      this.y > canvas.height + this.radiusWithStroke
    );
  }
}

class Square {
  constructor(x, y, vx = 0, vy = 0, color = "#beafed", strokeWidth = 7, entrySide = null, restitution) {
    this.type = "Square";
    this.id = Math.random().toString(36).slice(2, 10);
    this.name = "Square";
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.color = color;
    this.strokeWidth = strokeWidth;
    this.entrySide = entrySide;
    this.birth = performance.now() / 1000;
    this.angle = 0;
    this.angVel = (Math.random() * 2 - 1) * Math.PI / 180;  // سرعت زاویه‌ای اولیه

    this.wallBounces = 0;
    this.maxWallBounces = 3;
    this.collisionsEnabled = true;

    this.inField = false;
    this.entering = true;
    this.leaving = false;
    this.restitution = restitution;
  }


  get size() {
    return squareSize;  // ← همیشه از global می‌خونه
  }
  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    ctx.beginPath();
    ctx.rect(-this.size / 2, -this.size / 2, this.size, this.size);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.lineWidth = this.strokeWidth;
    ctx.strokeStyle = "#fff";
    ctx.stroke();

    if (showColliders) {
      ctx.strokeStyle = this.leaving ? "#18ed09" : (this.entering ? "#18ed09" : "#18ed09");

      // حلقه اول
      ctx.lineWidth = 2;
      ctx.strokeRect(-this.size / 2 - this.strokeWidth,
        -this.size / 2 - this.strokeWidth,
        this.size + this.strokeWidth * 2,
        this.size + this.strokeWidth * 2);

      // حلقه دوم (بزرگتر)
      ctx.lineWidth = 1;
      ctx.strokeRect(-this.size / 2 - this.strokeWidth - 5,
        -this.size / 2 - this.strokeWidth - 5,
        this.size + this.strokeWidth * 2 + 10,
        this.size + this.strokeWidth * 2 + 10);

      // متن
      ctx.fillStyle = "#ffffff";
      ctx.font = "12px Arial";
      ctx.fillText(`W:${this.wallBounces}/${this.maxWallBounces}`, -this.size / 2, this.size / 2 + 20);
    }



    ctx.restore();
  }

  ageSeconds() {
    return (performance.now() / 1000) - this.birth;
  }

  get radiusWithStroke() {
    return (this.size / Math.sqrt(2)) + this.strokeWidth;
  }

  isOut() {
    return (
      this.x < -this.radiusWithStroke ||
      this.x > canvas.width + this.radiusWithStroke ||
      this.y < -this.radiusWithStroke ||
      this.y > canvas.height + this.radiusWithStroke
    );
  }
}







class SvgStar {
  constructor(x, y, opts = {}) {
    this.id = Math.random().toString(36).slice(2, 10);
    this.type = "Star";
    this.name = "Star";

    this.x = x;
    this.y = y;
    this.angle = 0;
    this.angVel = (Math.random() * 2 - 1) * Math.PI / 180;

    this.strokeWidth = opts.strokeWidth || 7;
    this.fillColor = opts.fillColor || "yellow";
    this.borderColor = opts.borderColor || "orange";
    this.restitution = opts.restitution ?? 0.5;
    this.entrySide = opts.entrySide;
    this.birth = performance.now() / 1000;
    this.spikes = opts.spikes || 5;

    // SVG اولیه را با گلوبال shapeSize می‌سازیم
    this.buildSVG();
    this.buildStarColliderOffsets();
    // سرعت به سمت مرکز
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    let dx = cx - this.x;
    let dy = cy - this.y;
    const dist = Math.hypot(dx, dy) || 1;
    dx /= dist;
    dy /= dist;
    const SPEED_FACTOR = window.SPEED || 100;
    this.vx = dx * SPEED_FACTOR;
    this.vy = dy * SPEED_FACTOR;
  }

  // getter برای سایز و radius
  get size() {
    return shapeSize;      // همیشه از global می‌خونه
  }

  get radius() {
    return this.size / 2;
  }

  // تابع ساخت SVG با سایز فعلی
  buildSVG() {
    const svgObj = svgmaker.mkStar5({
      stroke: this.borderColor,
      fill: this.fillColor,
      outlinePx: this.strokeWidth,
      size: this.size
    });
    this.svg = svgObj.svg;

    // کالیدر
    const step = Math.PI / this.spikes;
    this.collider = [];
    for (let i = 0; i < this.spikes * 2; i++) {
      const r = (i % 2 === 0) ? this.radius + this.strokeWidth : (this.radius / 2) + this.strokeWidth;
      const a = i * step;
      this.collider.push({ x: r * Math.cos(a), y: r * Math.sin(a) });
    }

    // تبدیل SVG به Image
    const parser = new DOMParser();
    const doc = parser.parseFromString(this.svg, "image/svg+xml");
    const xml = new XMLSerializer().serializeToString(doc.documentElement);
    const svg64 = btoa(xml);
    this.img = new Image();
    this.loaded = false;
    this.img.src = "data:image/svg+xml;base64," + svg64;
    this.img.onload = () => { this.loaded = true; };
  }


  // ۱) ساخت کالیدر خام (۱۰ نقطه ستاره)
  buildStarColliderBase() {
    this.starColliderBase = [];
    const step = Math.PI / this.spikes; // زاویه بین نقاط
    for (let i = 0; i < this.spikes * 2; i++) {
      const r = (i % 2 === 0) ? this.radius + this.strokeWidth : (this.radius / 2) + this.strokeWidth;
      const a = i * step;
      this.starColliderBase.push({ x: r * Math.cos(a), y: r * Math.sin(a) });
    }
  }

  buildStarColliderOffsets() {
    if (!this.starColliderBase) this.buildStarColliderBase();


    this.starColliderOffset = this.starColliderBase.map((p, i) => {
      const angle = Math.atan2(p.y, p.x);
      const r = Math.hypot(p.x, p.y);
      const baseSize = 200;
      const outerOffset = 16 * (this.size / baseSize);
      const innerOffset = 20 * (this.size / baseSize);

      let px, py;
      if (i % 2 === 1) { // داخلی
        px = (r - innerOffset) * Math.cos(angle);
        py = (r - innerOffset) * Math.sin(angle);
      } else { // بیرونی (نمایشی)
        px = (r - outerOffset) * Math.cos(angle);
        py = (r - outerOffset) * Math.sin(angle);
      }

      return { x: px, y: py };
    });

  }

  // ۳) گرفتن نقاط آفست در دستگاه جهانی
  getStarColliderWorld() {
    if (!this.starColliderOffset) this.buildStarColliderOffsets();

    const cos = Math.cos(this.angle);
    const sin = Math.sin(this.angle);

    return this.starColliderOffset.map(p => ({
      x: this.x + p.x * cos - p.y * sin,
      y: this.y + p.x * sin + p.y * cos
    }));
  }

  // ۴) شکستن ستاره به ۵ مثلث محدب
  getStarConvexPolys() {
    const world = this.getStarColliderWorld();
    if (!world || world.length < 10) return [];

    const outer = i => world[(2 * i) % 10];
    const inner = i => world[(2 * i + 1) % 10];

    const polys = [];
    for (let i = 0; i < 5; i++) {
      polys.push([outer(i), inner(i), outer(i + 1)]);
    }
    return polys;
  }

  draw(ctx) {
    if (!this.loaded) return;
    //     if (this._lastBuiltSize !== shapeSize) {
    //     this.buildSVG();
    // }
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);

    // رسم ستاره
    ctx.drawImage(this.img, -this.size / 2, -this.size / 2, this.size, this.size);

    if (showColliders) {
      ctx.strokeStyle = "#18ed09";
      ctx.lineWidth = 2;
      ctx.beginPath();
      this.starColliderOffset.forEach((p, i) => {
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      ctx.closePath();
      ctx.stroke();


      // ===== حلقه دوم نمایشی =====
      // ctx.lineWidth = 0.6;
      // ctx.beginPath();
      // const scale = 1.5; // ضریب بزرگنمایی

      // this.starColliderOffset.forEach((p, i) => {
      //   const x = p.x * scale;
      //   const y = p.y * scale;

      //   if (i === 0) ctx.moveTo(x, y);
      //   else ctx.lineTo(x, y);
      // });
      // ctx.closePath();
      // ctx.stroke();



      ctx.fillStyle = "#ffffff";
      ctx.font = "12px Arial";
      ctx.fillText(`W:${this.wallBounces || 0}/${this.maxWallBounces || 3}`, -this.radius, this.radius);

    }

    ctx.restore();
  }

}

SvgStar.prototype.getCorners = function () {
  const rOuter = this.size / 2;
  const rInner = rOuter / 2;
  const spikes = 5;
  const step = Math.PI / spikes;
  const cos = Math.cos(this.angle);
  const sin = Math.sin(this.angle);
  const points = [];

  for (let i = 0; i < spikes * 2; i++) {
    const r = (i % 2 === 0) ? rOuter : rInner;
    const a = i * step;
    const px = Math.cos(a) * r;
    const py = Math.sin(a) * r;
    points.push({
      x: px * cos - py * sin + this.x,
      y: px * sin + py * cos + this.y
    });
  }

  return points;
};

SvgStar.prototype.getStarConvexPolys = function () {
  const pts = this.getCorners(); // همون 10 نقطه
  const cx = this.x;
  const cy = this.y;

  const polys = [];
  for (let i = 0; i < pts.length; i++) {
    const p1 = pts[i];
    const p2 = pts[(i + 1) % pts.length];
    polys.push([
      { x: cx, y: cy }, // مرکز
      p1,
      p2
    ]);
  }
  return polys;
};


function getStarPolys(shape) {
  if (shape.type === "Star" && shape.getStarConvexPolys) {
    return shape.getStarConvexPolys();
  }
  return [];
}







let shapeCounter = 0; // بیرون از تابع تعریف کن (global)


function tryGenerateShape() {
  const side = getRandomSide();
  const offset = 0.8;
  let sx, sy;

  if (side === "left") {
    sx = -canvas.width * offset;
    sy = Math.random() * canvas.height;
  } else if (side === "right") {
    sx = canvas.width + canvas.width * offset;
    sy = Math.random() * canvas.height;
  } else if (side === "top") {
    sx = Math.random() * canvas.width;
    sy = -canvas.height * offset;
  } else {
    sx = Math.random() * canvas.width;
    sy = canvas.height + canvas.height * offset;
  }

  // فقط SvgStar بساز
  let shape = new SvgStar(sx, sy, {
    entrySide: side,
    strokeWidth: 7,        // اختیاری
    fillColor: 'yellow',   // اختیاری
    borderColor: 'orange'  // اختیاری
  });

  shapeCounter++;
  return shape;
}


setInterval(() => globalSeconds++, 1000);

let totalShapes = 0;
let remainedShapes = shapes.length;
let roundActive = true;

function addShape() {
  const newShape = tryGenerateShape();
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




function updateShapeSize() {
  // فرض کنیم اندازه پایه برای 1000px عرض است
  const baseSize = 100;
  const scale = canvas.width / 1000;  // نسبت فعلی به اندازه پایه
  shapeSize = baseSize * scale;
}

function updateShapesOnResize() {
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;

  for (const s of shapes) {
    // تغییر سرعت برای هماهنگی با اندازه جدید
    let dx = cx - s.x;
    let dy = cy - s.y;
    const dist = Math.hypot(dx, dy) || 1;
    dx /= dist;
    dy /= dist;

    s.vx = dx * window.SPEED;
    s.vy = dy * window.SPEED;
  }
}

