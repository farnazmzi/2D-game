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
    this.wallBounces = 0;

    this.buildSVG();
    this.buildStarColliderOffsets();

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
  }

  get size() { return window.shapeSize; }
  get radius() { return this.size / 2; }

  buildSVG() {
    const svgObj = svgmaker.mkStar5({
      stroke: this.borderColor,
      fill: this.fillColor,
      outlinePx: this.strokeWidth,
      size: this.size
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
      const outerOffset = 11 * (this.size / baseSize);
      const innerOffset = 18 * (this.size / baseSize);

      let px, py;
      if (i % 2 === 1) {
        px = (r - innerOffset) * Math.cos(angle);
        py = (r - innerOffset) * Math.sin(angle);
      } else {
        px = (r - outerOffset) * Math.cos(angle);
        py = (r - outerOffset) * Math.sin(angle);
      }
      return { x: px, y: py };
    });
  }

  getStarColliderWorld() {
    if (!this.starColliderOffset) this.buildStarColliderOffsets();
    const cos = Math.cos(this.angle);
    const sin = Math.sin(this.angle);
    return this.starColliderOffset.map(p => ({
      x: this.x + p.x * cos - p.y * sin,
      y: this.y + p.x * sin + p.y * cos
    }));
  }

  getColliderPoints() {
    return this.getStarColliderWorld();
  }

  draw(ctx) {
    if (!this.loaded) return;
    if (this.body) {
      this.x = this.body.position.x;
      this.y = this.body.position.y;
      this.angle = this.body.angle;
    }

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    ctx.drawImage(this.img, -this.size / 2, -this.size / 2, this.size, this.size);

    if (showColliders) {
      // کالیدر اصلی
      ctx.strokeStyle = "#18ed09";
      ctx.lineWidth = 2;
      ctx.beginPath();
      this.starColliderOffset.forEach((p, i) => {
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      ctx.closePath();
      ctx.stroke();

      // کالیدر دوم با scale
      ctx.lineWidth = 0.6;
      const scale = 1.5;
      ctx.beginPath();
      this.starColliderOffset.forEach((p, i) => {
        const x = p.x * scale;
        const y = p.y * scale;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.closePath();
      ctx.stroke();

      // متن wallBounces
      ctx.fillStyle = "#ffffff";
      ctx.font = "12px Arial";
      ctx.fillText(`W:${this.wallBounces || 0}/${this.maxWallBounces || 3}`, -this.radius, this.radius);
    }

    ctx.restore();
  }

  getCorners() {
    const rOuter = this.radius;
    const rInner = rOuter / 2;
    const step = Math.PI / this.spikes;
    const cos = Math.cos(this.angle);
    const sin = Math.sin(this.angle);
    const points = [];
    for (let i = 0; i < this.spikes * 2; i++) {
      const r = (i % 2 === 0) ? rOuter : rInner;
      const a = i * step;
      const px = Math.cos(a) * r;
      const py = Math.sin(a) * r;
      points.push({ x: px * cos - py * sin + this.x, y: px * sin + py * cos + this.y });
    }
    return points;
  }
}

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
    this.restitution = opts.restitution ?? 0.8;
    this.wallBounces = 0;

    this.buildSVG();
    this.buildCircleColliderBase();
    this.buildCircleColliderOffsets();

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
  }

  get size() { return window.shapeSize; }
  get radius() { return this.size / 2; }

  buildSVG() {
    const svgObj = svgmaker.mkCircle({
      stroke: this.borderColor,
      fill: this.fillColor,
      outlinePx: this.strokeWidth,
      size: this.size,
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


  buildCircleColliderBase(steps = 60) {
    this.circleColliderBase = [];
    for (let i = 0; i < steps; i++) {
      const a = (i / steps) * Math.PI * 2;
      this.circleColliderBase.push({
        x: this.radius * Math.cos(a),
        y: this.radius * Math.sin(a)
      });
    }
  }

  // offset کالیدر دایره (کمی کوچکتر یا بزرگتر برای برخورد دقیق)
  buildCircleColliderOffsets(scale = 1.06) {
    if (!this.circleColliderBase) this.buildCircleColliderBase();
    this.circleColliderOffset = this.circleColliderBase.map(p => ({
      x: p.x * scale,
      y: p.y * scale
    }));
  }

  // نقاط world با اعمال position و angle
  getCircleColliderWorld() {
    if (!this.circleColliderOffset) this.buildCircleColliderOffsets();
    const cos = Math.cos(this.angle);
    const sin = Math.sin(this.angle);
    return this.circleColliderOffset.map(p => ({
      x: this.x + p.x * cos - p.y * sin,
      y: this.y + p.x * sin + p.y * cos
    }));
  }

  // متد مشابه getColliderPoints ستاره
  getColliderPoints() {
    return this.getCircleColliderWorld();

  }


  draw(ctx) {
    if (!this.loaded) return;
    if (this.body) {
      this.x = this.body.position.x;
      this.y = this.body.position.y;
      this.angle = this.body.angle;
    }

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);


    ctx.fillStyle = this.fillColor;
    ctx.strokeStyle = this.borderColor;
    ctx.lineWidth = this.strokeWidth;
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();



    if (showColliders) {
      // کالیدر اصلی
      ctx.strokeStyle = "#18ed09";
      ctx.lineWidth = 2;
      ctx.beginPath();
      this.circleColliderOffset.forEach((p, i) => {
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      ctx.closePath();
      ctx.stroke();

      // کالیدر دوم با scale
      ctx.lineWidth = 0.6;
      const scale = 1.2;
      ctx.beginPath();
      this.circleColliderOffset.forEach((p, i) => {
        const x = p.x * scale;
        const y = p.y * scale;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.closePath();
      ctx.stroke();

      // متن wallBounces
      ctx.fillStyle = "#ffffff";
      ctx.font = "12px Arial";
      ctx.fillText(`W:${this.wallBounces || 0}/${this.maxWallBounces || 3}`, -this.radius, this.radius);
    }


    ctx.restore();
  }

  getCorners(steps = 12) {
    // نقاط تقریبی دایره برای compatibility
    const cos = Math.cos(this.angle);
    const sin = Math.sin(this.angle);
    const points = [];
    for (let i = 0; i < steps; i++) {
      const a = (i / steps) * Math.PI * 2;
      const px = Math.cos(a) * this.radius;
      const py = Math.sin(a) * this.radius;
      points.push({ x: px * cos - py * sin + this.x, y: px * sin + py * cos + this.y });
    }
    return points;
  }
}


class GlyphLetter {
  constructor(x, y, char, opts = {}) {
    this.char = char.toUpperCase();
    this.x = x;
    this.y = y;
    this.angle = 0;
    this.stroke = opts.stroke || "#000";
    this.fill = opts.fill || "#fff";
    this.wallBounces = 0;

    // ساخت SVG و گرفتن polys دقیق + strokeLocal
    const glyph = svgmaker.mkGlyph(this.char, {
      stroke: this.stroke,
      fill: this.fill,
      size: this.size,
      outlinePx: 6
    });
    this.svg = glyph.svg;
    this.colliderPolys = glyph.collider.polys; // polys دقیق از rectها
    this.strokeLocal = glyph.strokeLocal; // ضخامت بوردر

    // merge کردن و گسترش با border
    this.buildGlyphColliderWithBorder();

    // ساخت تصویر برای draw
    const parser = new DOMParser();
    const doc = parser.parseFromString(this.svg, "image/svg+xml");
    const xml = new XMLSerializer().serializeToString(doc.documentElement);
    const svg64 = btoa(xml);
    this.img = new Image();
    this.loaded = false;
    this.img.src = "data:image/svg+xml;base64," + svg64;
    this.img.onload = () => { this.loaded = true; };

    // جایگذاری برای Matter.js
    this.buildMatterBody();
  }

  mergeAdjacentRects(rectPolys) {
    const rects = rectPolys.map(poly => {
      const minX = Math.min(...poly.map(p => p.x));
      const minY = Math.min(...poly.map(p => p.y));
      const maxX = Math.max(...poly.map(p => p.x));
      const maxY = Math.max(...poly.map(p => p.y));
      return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
    });

    let merged = [];
    let used = new Set();

    for (let i = 0; i < rects.length; i++) {
      if (used.has(i)) continue;
      let current = { ...rects[i] };
      used.add(i);

      let mergedAgain;
      do {
        mergedAgain = false;
        for (let j = 0; j < rects.length; j++) {
          if (used.has(j)) continue;
          const other = rects[j];

          const isHorizontal = (
            Math.abs(current.y - other.y) < 0.01 &&
            Math.abs(current.h - other.h) < 0.01 &&
            (Math.abs(current.x + current.w - other.x) < 0.01 || Math.abs(other.x + other.w - current.x) < 0.01)
          );
          const isVertical = (
            Math.abs(current.x - other.x) < 0.01 &&
            Math.abs(current.w - other.w) < 0.01 &&
            (Math.abs(current.y + current.h - other.y) < 0.01 || Math.abs(other.y + other.h - current.y) < 0.01)
          );

          if (isHorizontal) {
            current.x = Math.min(current.x, other.x);
            current.w = Math.max(current.x + current.w, other.x + other.w) - current.x;
            used.add(j);
            mergedAgain = true;
          } else if (isVertical) {
            current.y = Math.min(current.y, other.y);
            current.h = Math.max(current.y + current.h, other.y + other.h) - current.y;
            used.add(j);
            mergedAgain = true;
          }
        }
      } while (mergedAgain);

      merged.push(current);
    }

    return merged.map(r => [
      { x: r.x, y: r.y },
      { x: r.x + r.w, y: r.y },
      { x: r.x + r.w, y: r.y + r.h },
      { x: r.x, y: r.y + r.h }
    ]);
  }

  buildGlyphColliderWithBorder() {
    const borderOffset = this.strokeLocal / 2 + 7;
    const scale = this.size / 100;

    const mergedPolys = this.mergeAdjacentRects(this.colliderPolys);

    this.glyphColliderExact = mergedPolys.map(poly => {
      const minX = Math.min(...poly.map(p => p.x)) - borderOffset;
      const maxX = Math.max(...poly.map(p => p.x)) + borderOffset;
      const minY = Math.min(...poly.map(p => p.y)) - borderOffset;
      const maxY = Math.max(...poly.map(p => p.y)) + borderOffset;
      return [
        { x: (minX - 50) * scale, y: (minY - 50) * scale },
        { x: (maxX - 50) * scale, y: (minY - 50) * scale },
        { x: (maxX - 50) * scale, y: (maxY - 50) * scale },
        { x: (minX - 50) * scale, y: (maxY - 50) * scale }
      ];
    }).filter(poly => poly.length >= 3);

    if (typeof decomp !== 'undefined' && decomp) {
      this.glyphColliderExact = this.glyphColliderExact.flatMap(poly => {
        const convexPolys = decomp.quickDecomp(poly);
        return convexPolys.length > 0 ? convexPolys : [poly];
      });
    }
  }

  buildMatterBody() {
    if (typeof Matter === 'undefined') return;

    const parts = this.glyphColliderExact
      .filter(poly => poly.length >= 3)
      .map(poly => {
        const verts = poly.map(p => ({ x: p.x, y: p.y }));
        return Matter.Bodies.fromVertices(
          0,
          0,
          [verts],
          {
            isStatic: false,
            friction: 0.1,
            restitution: 0.3,
            collisionFilter: {
              group: -1,
              category: 0x0001,
              mask: 0xFFFF
            }
          },
          true
        );
      });

    this.body = Matter.Body.create({
      parts,
      position: { x: this.x, y: this.y },
      angle: this.angle,
      friction: 0.1,
      restitution: 0.3
    });

    // reference back for draw/debug
    this.body.svgShape = this;
  }
  get size() { return window.shapeSize; }
  get radius() { return this.size / 2; }
  draw(ctx) {
    if (!this.loaded || !this.body) return;

    this.x = this.body.position.x;
    this.y = this.body.position.y;
    this.angle = this.body.angle;

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    ctx.drawImage(this.img, -this.size / 2, -this.size / 2, this.size, this.size);

    if (showColliders) {
      ctx.strokeStyle = "#18ed09";
      ctx.lineWidth = 2;
      this.glyphColliderExact.forEach(poly => {
        ctx.beginPath();
        poly.forEach((p, i) => {
          if (i === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        });
        ctx.closePath();
        ctx.stroke();

        ctx.fillStyle = "#ffffff";
        ctx.font = "12px Arial";
        ctx.fillText(`W:${this.wallBounces || 0}/${this.maxWallBounces || 3}`, this.radius, this.radius);

      });
    }

    ctx.restore();
  }

  getGlyphColliderWorld() {
    const cos = Math.cos(this.angle);
    const sin = Math.sin(this.angle);
    return this.glyphColliderExact.map(poly =>
      poly.map(p => ({
        x: this.x + p.x * cos - p.y * sin,
        y: this.y + p.x * sin + p.y * cos
      }))
    );
  }
}


class SvgRectangle {
  constructor(x, y, opts = {}) {
    this.id = Math.random().toString(36).slice(2, 10);
    this.type = "Rectangle";
    this.name = "Rectangle";

    this.x = x;
    this.y = y;
    this.angle = 0;
    this.angVel = (Math.random() * 2 - 1) * Math.PI / 180;

    this.strokeWidth = opts.strokeWidth || 7;
    this.fillColor = opts.fillColor || "lightblue";
    this.borderColor = opts.borderColor || "blue";
    this.restitution = opts.restitution ?? 0.8;
    this.wallBounces = 0;

    this.width = opts.width || this.size;
    this.height = opts.height || this.size * 0.6; // نسبت پیش‌فرض

    this.buildSVG();
    this.buildRectCollider();

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
  }

  get size() { return window.shapeSize +40; }  // هماهنگ با window.shapeSize
  get radius() { return Math.max(this.width, this.height) / 2; }

  buildSVG() {
    const svgObj = svgmaker.mkRectangle({
      stroke: this.borderColor,
      fill: this.fillColor,
      outlinePx: this.strokeWidth,
      size: this.size
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

    // کالیدر از نقاط SVG و اسکیل نسبت به size
    this.rectColliderBase = svgObj.collider.pts.map(p => {
      const scaleX = this.width / 100 * 0.85;
      const scaleY = this.height / 100 * 0.85;
      return { x: (p.x - 50) * scaleX, y: (p.y - 50) * scaleY };
    });
  }

  buildRectCollider() {
    const scale = 0.57;
    const w = (this.width / 2) * scale;
    const h = (this.height / 2) * scale -2;
    this.rectColliderBase = [
      { x: -w, y: -h },
      { x: w, y: -h },
      { x: w, y: h },
      { x: -w, y: h }
    ];
  }

  getRectColliderWorld() {
    const cos = Math.cos(this.angle);
    const sin = Math.sin(this.angle);
    return this.rectColliderBase.map(p => ({
      x: this.x + p.x * cos - p.y * sin,
      y: this.y + p.x * sin + p.y * cos
    }));
  }

  getColliderPoints() {
    return this.getRectColliderWorld();
  }

  draw(ctx) {
    if (!this.loaded) return;
    if (this.body) {
      this.x = this.body.position.x;
      this.y = this.body.position.y;
      this.angle = this.body.angle;
    }

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    ctx.drawImage(this.img, -this.width / 2, -this.height / 2, this.width, this.height);

    if (showColliders) {
      ctx.strokeStyle = "#18ed09";
      ctx.lineWidth = 2;
      ctx.beginPath();
      this.rectColliderBase.forEach((p, i) => {
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      ctx.closePath();
      ctx.stroke();

      ctx.lineWidth = 0.6;
      const scale = 1.3;
      ctx.beginPath();
      this.rectColliderBase.forEach((p, i) => {
        const x = p.x * scale;
        const y = p.y * scale;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.closePath();
      ctx.stroke();

      ctx.fillStyle = "#ffffff";
      ctx.font = "12px Arial";
      ctx.fillText(`W:${this.wallBounces || 0}/${this.maxWallBounces || 3}`, -this.radius, this.radius - 35);
    }

    ctx.restore();
  }
}


class SvgSquare {
  constructor(x, y, opts = {}) {
    this.id = Math.random().toString(36).slice(2, 10);
    this.type = "Square";
    this.name = "Square";

    this.x = x;
    this.y = y;
    this.angle = 0;
    this.angVel = (Math.random() * 2 - 1) * Math.PI / 180;

    this.strokeWidth = opts.strokeWidth || 7;
    this.fillColor = opts.fillColor || "lightgreen";
    this.borderColor = opts.borderColor || "green";
    this.restitution = opts.restitution ?? 0.8;
    this.wallBounces = 0;

    this.buildSVG();
    this.buildSquareCollider();

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
  }
  get size() { return window.shapeSize; }
  get radius() { return this.size / 2; }

  buildSVG() {
    const svgObj = svgmaker.mkSquare({
      size: this.size,
      stroke: this.borderColor,
      fill: this.fillColor,
      outlinePx: this.strokeWidth
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

    this.colliderBase = svgObj.collider.pts.map(p => {
      // اگر p آبجکت {x,y} است
      const scale = 0.85; // کمی کوچکتر
      return { x: (p.x - 50) * scale, y: (p.y - 50) * scale };
    });
  }
  buildSquareCollider() {
    const half = this.size / 2;
    const scale = 0.85; // می‌تونی عدد 0.8 تا 0.9 برای کمی کوچکتر بودن امتحان کنی
    this.squareColliderBase = [
      { x: -half * scale, y: -half * scale },
      { x: half * scale, y: -half * scale },
      { x: half * scale, y: half * scale },
      { x: -half * scale, y: half * scale }
    ];
  }

  getSquareColliderWorld() {
    const cos = Math.cos(this.angle);
    const sin = Math.sin(this.angle);
    return this.squareColliderBase.map(p => ({
      x: this.x + p.x * cos - p.y * sin,
      y: this.y + p.x * sin + p.y * cos
    }));
  }

  getColliderPoints() {
    return this.getSquareColliderWorld();
  }

  draw(ctx) {
    if (!this.loaded) return;
    if (this.body) {
      this.x = this.body.position.x;
      this.y = this.body.position.y;
      this.angle = this.body.angle;
    }

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    ctx.drawImage(this.img, -this.size / 2, -this.size / 2, this.size, this.size);

    if (showColliders) {
      // کالیدر اصلی
      ctx.strokeStyle = "#18ed09";
      ctx.lineWidth = 2;
      ctx.beginPath();
      this.squareColliderBase.forEach((p, i) => {
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      ctx.closePath();
      ctx.stroke();

      // کالیدر دوم با scale
      ctx.strokeStyle = "#18ed09";
      ctx.lineWidth = 0.6;
      const scale = 1.3;
      ctx.beginPath();
      this.squareColliderBase.forEach((p, i) => {
        const x = p.x * scale;
        const y = p.y * scale;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.closePath();
      ctx.stroke();

      // متن wallBounces
      ctx.fillStyle = "#ffffff";
      ctx.font = "12px Arial";
      ctx.fillText(`W:${this.wallBounces || 0}/${this.maxWallBounces || 3}`, -this.radius, this.radius + 25);

    }


    ctx.restore();
  }
}

class SvgTriangle {
  constructor(x, y, opts = {}) {
    this.id = Math.random().toString(36).slice(2, 10);
    this.type = "Triangle";
    this.name = "Triangle";

    this.x = x;
    this.y = y;
    this.angle = 0;
    this.angVel = (Math.random() * 2 - 1) * Math.PI / 180;

    this.strokeWidth = opts.strokeWidth || 7;
    this.fillColor = opts.fillColor || "pink";
    this.borderColor = opts.borderColor || "red";
    this.restitution = opts.restitution ?? 0.8;
    this.wallBounces = 0;

    // از svgmaker بخوان
    this.buildSVG();
    this.buildCollider();

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
  }
  get size() { return window.shapeSize; }

  get radius() { return this.size / 2; }

  buildSVG() {
    const svgObj = svgmaker.mkTriangle({
      stroke: this.borderColor,
      fill: this.fillColor,
      outlinePx: this.strokeWidth,
      size: this.size
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

    // کالیدر از svgObj بگیریم
    this.colliderBase = svgObj.collider.pts.map(p => {
      const [x, y] = [p.x, p.y]; // اینجا دیگه split لازم نیست چون mkPolyFromPoints آرایه داده
      return { x: x - 50, y: y - 50 };
    });
  }

  buildCollider() {
    // کالیدر scale شده هم اضافه می‌کنیم
    this.colliderScale = this.colliderBase.map(p => ({ x: p.x * 1.3, y: p.y * 1.3 }));
  }

  getColliderWorld() {
    const cos = Math.cos(this.angle);
    const sin = Math.sin(this.angle);
    return this.colliderBase.map(p => ({
      x: this.x + p.x * cos - p.y * sin,
      y: this.y + p.x * sin + p.y * cos
    }));
  }

  getColliderPoints() {
    return this.getColliderWorld();
  }

  draw(ctx) {
    if (!this.loaded) return;
    if (this.body) {
      this.x = this.body.position.x;
      this.y = this.body.position.y;
      this.angle = this.body.angle;
    }

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    ctx.drawImage(this.img, -this.size / 2, -this.size / 2, this.size, this.size);

    if (showColliders) {
      // کالیدر اصلی
      ctx.strokeStyle = "#18ed09";
      ctx.lineWidth = 2;
      ctx.beginPath();
      this.colliderBase.forEach((p, i) => {
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      ctx.closePath();
      ctx.stroke();

      // کالیدر scale شده
      ctx.strokeStyle = "#18ed09";
      ctx.lineWidth = 0.6;
      ctx.beginPath();
      this.colliderScale.forEach((p, i) => {
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      ctx.closePath();
      ctx.stroke();

      // متن wallBounces
      ctx.fillStyle = "#ffffff";
      ctx.font = "12px Arial";
      ctx.fillText(
        `W:${this.wallBounces || 0}/${this.maxWallBounces || 3}`,
        -this.radius,
        this.radius + 25
      );
    }

    ctx.restore();
  }
}


class SvgOctagon {
  constructor(x, y, opts = {}) {
    this.id = Math.random().toString(36).slice(2, 10);
    this.type = "Diamond";
    this.name = "Diamond";

    this.x = x;
    this.y = y;
    this.angle = 0;
    this.angVel = (Math.random() * 2 - 1) * Math.PI / 180;

    this.strokeWidth = opts.strokeWidth || 7;
    this.fillColor = opts.fillColor || "violet";
    this.borderColor = opts.borderColor || "purple";
    this.restitution = opts.restitution ?? 0.8;
    this.wallBounces = 0;

    this.buildSVG();
    this.buildCollider();

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
  }

  get size() { return window.shapeSize; }
  get radius() { return this.size / 2; }

  buildSVG() {
    // از svgmaker برای ساخت لوزی استفاده می‌کنیم
    const svgObj = svgmaker.mkDiamond({
      stroke: this.borderColor,
      fill: this.fillColor,
      outlinePx: this.strokeWidth,
      size: this.size
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

  buildCollider() {
    const half = this.size / 2;          // نصف سایز تصویر
    const scale = 0.95;                  // مقیاس کوچکتر برای کالیدر
    const adjustedHalf = half * scale;   // نصف سایز ضرب در مقیاس
    this.colliderBase = [
      { x: 0, y: -adjustedHalf },  // راس بالا
      { x: adjustedHalf, y: 0 },             // گوشه راست
      { x: 0, y: adjustedHalf },  // راس پایین
      { x: -adjustedHalf, y: 0 }              // گوشه چپ
    ];
  }


  getColliderWorld() {
    const cos = Math.cos(this.angle);
    const sin = Math.sin(this.angle);
    return this.colliderBase.map(p => ({
      x: this.x + p.x * cos - p.y * sin,
      y: this.y + p.x * sin + p.y * cos
    }));
  }

  getColliderPoints() {
    return this.getColliderWorld();
  }

  draw(ctx) {
    if (!this.loaded) return;
    if (this.body) {
      this.x = this.body.position.x;
      this.y = this.body.position.y;
      this.angle = this.body.angle;
    }

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    ctx.drawImage(this.img, -this.size / 2, -this.size / 2, this.size, this.size);

    if (showColliders) {
      // کالیدر اصلی
      ctx.strokeStyle = "#18ed09";
      ctx.lineWidth = 2;
      ctx.beginPath();
      this.colliderBase.forEach((p, i) => {
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      ctx.closePath();
      ctx.stroke();

      // کالیدر دوم با scale
      ctx.strokeStyle = "#18ed09";
      ctx.lineWidth = 0.6;
      const scale = 1.3;
      ctx.beginPath();
      this.colliderBase.forEach((p, i) => {
        const x = p.x * scale;
        const y = p.y * scale;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.closePath();
      ctx.stroke();

      // متن wallBounces
      ctx.fillStyle = "#ffffff";
      ctx.font = "12px Arial";
      ctx.fillText(
        `W:${this.wallBounces || 0}/${this.maxWallBounces || 3}`,
        -this.radius,
        this.radius - 25
      );
    }

    ctx.restore();
  }
}


class SvgRegularPolygonShape {
  constructor(x, y, n = 5, opts = {}) {
    this.id = Math.random().toString(36).slice(2, 10);
    this.type = "RegularPolygon";
    this.name = "RegularPolygon";

    this.x = x;
    this.y = y;
    this.angle = 0;
    this.angVel = (Math.random() * 2 - 1) * Math.PI / 180;

    this.strokeWidth = opts.strokeWidth || 7;
    this.fillColor = opts.fillColor || "#ffffff";
    this.borderColor = opts.borderColor || "#ff0000";
    this.restitution = opts.restitution ?? 0.8;
    this.wallBounces = 0;
    this.n = n; // تعداد اضلاع

    this.buildSVG();
    this.buildCollider();

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
  }
  get size() { return window.shapeSize + 70 }

  get radius() { return this.size / 2; }
  buildSVG() {
    const radius = this.size / 2 * 0.35; // کمی margin برای stroke
    const svgObj = svgmaker.mkRegularPolygon(this.n, {
      radius,
      stroke: this.borderColor,
      fill: this.fillColor,
      outlinePx: this.strokeWidth,
      size: this.size
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

    // کالیدر هم نسبت به size تعریف میشه
    this.colliderBase = svgObj.collider.pts.map(p => {
      const [x, y] = p.split(",").map(Number);
      const scale = this.size / 100 + 0.17; // نسبت اندازه واقعی به سایز پیشفرض
      return { x: (x - 50) * scale, y: (y - 50) * scale };
    });
  }


  buildCollider() {

  }

  getColliderWorld() {
    const cos = Math.cos(this.angle);
    const sin = Math.sin(this.angle);
    return this.colliderBase.map(p => ({
      x: this.x + p.x * cos - p.y * sin,
      y: this.y + p.x * sin + p.y * cos
    }));
  }

  getColliderPoints() {
    return this.getColliderWorld();
  }

  draw(ctx) {
    if (!this.loaded) return;
    if (this.body) {
      this.x = this.body.position.x;
      this.y = this.body.position.y;
      this.angle = this.body.angle;
    }

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    ctx.drawImage(this.img, -this.size / 2, -this.size / 2, this.size, this.size);

    if (showColliders) {
      // کالیدر اصلی
      ctx.strokeStyle = "#18ed09";
      ctx.lineWidth = 2;
      ctx.beginPath();
      this.colliderBase.forEach((p, i) => {
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      ctx.closePath();
      ctx.stroke();

      // کالیدر دوم با scale
      ctx.strokeStyle = "#18ed09";
      ctx.lineWidth = 0.6;
      const scale = 1.3;
      ctx.beginPath();
      this.colliderBase.forEach((p, i) => {
        const x = p.x * scale;
        const y = p.y * scale;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.closePath();
      ctx.stroke();

      // متن wallBounces
      ctx.fillStyle = "#ffffff";
      ctx.font = "12px Arial";
      ctx.fillText(
        `W:${this.wallBounces || 0}/${this.maxWallBounces || 3}`,
        -this.radius,
        this.radius + 25
      );
    }

    ctx.restore();
  }
}
