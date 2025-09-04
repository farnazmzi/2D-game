
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
    this.restitution = opts.restitution ?? 0.8;
    this.spikes = opts.spikes || 5;

    // ساخت SVG و کالیدر
    this.buildSVG();
    this.buildStarColliderOffsets();

    // سرعت اولیه به سمت مرکز
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    let dx = cx - this.x;
    let dy = cy - this.y;
    const dist = Math.hypot(dx, dy) || 1;
    dx /= dist;
    dy /= dist;
    const SPEED_FACTOR = window.SPEED || 1;
    this.vx = dx * SPEED_FACTOR;
    this.vy = dy * SPEED_FACTOR;

    // ساخت body Matter.js با کالیدر سفارشی
    const verts = this.getStarColliderWorld();
    this.body = Matter.Bodies.fromVertices(this.x, this.y, verts, {
      restitution: this.restitution,
      friction: 0.05,
      frictionAir: 0,
      angularVelocity: this.angVel,
      render: { fillStyle: this.fillColor, strokeStyle: this.borderColor }
    }, true);

    Matter.World.add(world, this.body);
  }

  // سایز و radius از global
  get size() { return window.shapeSize; }
  get radius() { return this.size / 2; }

  // ساخت SVG و کالیدر
  buildSVG() {
    const svgObj = svgmaker.mkStar5({
      stroke: this.borderColor,
      fill: this.fillColor,
      outlinePx: this.strokeWidth,
      size: this.size
    });
    this.svg = svgObj.svg;

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

  // ساخت کالیدر پایه و آفست
  buildStarColliderBase() {
    this.starColliderBase = [];
    const step = Math.PI / this.spikes;
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
      const outerOffset = 10 * (this.size / baseSize);
      const innerOffset = 15 * (this.size / baseSize);

      let px, py;
      if (i % 2 === 1) { // داخلی
        px = (r - innerOffset) * Math.cos(angle);
        py = (r - innerOffset) * Math.sin(angle);
      } else { // بیرونی
        px = (r - outerOffset) * Math.cos(angle);
        py = (r - outerOffset) * Math.sin(angle);
      }
      return { x: px, y: py };
    });
  }

  // نقاط کالیدر در دستگاه جهانی
  getStarColliderWorld() {
    if (!this.starColliderOffset) this.buildStarColliderOffsets();
    const cos = Math.cos(this.angle);
    const sin = Math.sin(this.angle);
    return this.starColliderOffset.map(p => ({
      x: this.x + p.x * cos - p.y * sin,
      y: this.y + p.x * sin + p.y * cos
    }));
  }

  // تقسیم ستاره به ۵ مثلث محدب
  getStarConvexPolys() {
    const world = this.getStarColliderWorld();
    const polys = [];
    for (let i = 0; i < 5; i++) {
      const outer = world[(i*2)%10];
      const inner = world[(i*2+1)%10];
      const nextOuter = world[(2*(i+1))%10];
      polys.push([outer, inner, nextOuter]);
    }
    return polys;
  }

  draw(ctx) {
    if (!this.loaded) return;
    // همگام‌سازی با فیزیک
    if (this.body) {
      this.x = this.body.position.x;
      this.y = this.body.position.y;
      this.angle = this.body.angle;
    }

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    ctx.drawImage(this.img, -this.size/2, -this.size/2, this.size, this.size);

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

            ctx.lineWidth = 0.6;
      ctx.beginPath();
      const scale = 1.5; // ضریب بزرگنمایی

      this.starColliderOffset.forEach((p, i) => {
        const x = p.x * scale;
        const y = p.y * scale;

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.closePath();
      ctx.stroke();

      ctx.fillStyle = "#ffffff";
      ctx.font = "12px Arial";
      ctx.fillText(`W:${this.wallBounces || 0}/${this.maxWallBounces || 3}`, -this.radius, this.radius);

    }
    ctx.restore();
  }

  getCorners() {
    const rOuter = this.radius;
    const rInner = rOuter/2;
    const step = Math.PI/this.spikes;
    const cos = Math.cos(this.angle);
    const sin = Math.sin(this.angle);
    const points = [];
    for (let i=0; i<this.spikes*2; i++) {
      const r = (i%2===0)? rOuter : rInner;
      const a = i*step;
      const px = Math.cos(a)*r;
      const py = Math.sin(a)*r;
      points.push({x:px*cos - py*sin + this.x, y:px*sin + py*cos + this.y});
    }
    return points;
  }
}

// کمکی برای گرفتن چندضلعی‌ها
function getStarPolys(shape) {
  if (shape.type==="Star" && shape.getStarConvexPolys) return shape.getStarConvexPolys();
  return [];
}

SvgStar.prototype.updateSize = function(newSize) {
    if (!newSize) return;
    
    const oldSize = this.size;  // سایز قبلی
    shapeSize = newSize;        // آپدیت global

    // 1️⃣ بروزرسانی SVG
    this.buildSVG();

    // 2️⃣ بروزرسانی کالیدر offset ستاره
    this.buildStarColliderOffsets();

    // 3️⃣ مقیاس دادن کالیدر نسبت به سایز قدیمی
    const scaleFactor = newSize / oldSize;
    this.starColliderOffset = this.starColliderOffset.map(p => ({
        x: p.x * scaleFactor,
        y: p.y * scaleFactor
    }));
};


// // function updateShapeSize() {
// //   // فرض کنیم اندازه پایه برای 1000px عرض است
// //   const baseSize = 100;
// //   const scale = canvas.width / 1000;  // نسبت فعلی به اندازه پایه
// //   shapeSize = baseSize * scale;
// // }

// // function updateShapesOnResize() {
// //   const cx = canvas.width / 2;
// //   const cy = canvas.height / 2;

// //   for (const s of shapes) {
// //     // تغییر سرعت برای هماهنگی با اندازه جدید
// //     let dx = cx - s.x;
// //     let dy = cy - s.y;
// //     const dist = Math.hypot(dx, dy) || 1;
// //     dx /= dist;
// //     dy /= dist;

// //     s.vx = dx * window.SPEED;
// //     s.vy = dy * window.SPEED;
// //   }
// // }






