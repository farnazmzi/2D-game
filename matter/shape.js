class BaseShape {
  constructor(x, y, opts = {}) {
    this.angle = 0;
    this.x = x;
    this.y = y;

    this.wallBounces = 0;
    this.entrySide = opts.entrySide;
    this.canBounce = true;

    this.birth = performance.now() / 1000;
    this.spawnTime = getElapsedMs();
    this.time = (++idx) * SPAWN_INTERVAL_MS;

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
   get ageMs() {
    return getElapsedMs() - this.spawnTime;
  }
    update() {
    this.x += this.vx;
    this.y += this.vy;
  }
}



class SvgStar extends BaseShape{
  constructor(x, y, opts = {}) {
      super(x, y, opts);
    this.id = Math.random().toString(36).slice(2, 10);
    this.type = "Star";
    this.name = "Star";
    this.angVel = (Math.random() * 2 - 1) * Math.PI / 180;
    this.vx = 0;
    this.vy = 0;
    this.angularVelocity = 0;
    this.strokeWidth = opts.strokeWidth || 7;
    this.fillColor = opts.fillColor || "yellow";
    this.borderColor = opts.borderColor || "orange";
    this.restitution = opts.restitution ?? 0.8;
    this.spikes = opts.spikes || 5;
     this.bounceMode="realistic";

    this.buildSVG();
    this.buildStarColliderOffsets();
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

      ctx.fillStyle = "#ffffff";
      ctx.font = "12px Arial";
      ctx.fillText(`W:${this.body.wallBounces}/${window.maxWallBounces}`, -this.radius, this.radius - 15);
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

class SvgCircle extends BaseShape{
  constructor(x, y, opts = {}) {
        super(x, y, opts);
    this.id = Math.random().toString(36).slice(2, 10);
    this.type = "Circle";
    this.name = "Circle";
    this.angVel = (Math.random() * 2 - 1) * Math.PI / 180;

    this.strokeWidth = opts.strokeWidth || 7;
    this.fillColor = opts.fillColor || "lightblue";
    this.borderColor = opts.borderColor || "blue";
    this.bounceMode="realistic";

    this.buildSVG();
    this.buildCircleColliderBase();
    this.buildCircleColliderOffsets();
  }
  get size() { return window.shapeSize >= 100 ? window.shapeSize - 20 : window.shapeSize; }
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

  buildCircleColliderOffsets(scale = 1.06) {
    if (!this.circleColliderBase) this.buildCircleColliderBase();
    this.circleColliderOffset = this.circleColliderBase.map(p => ({
      x: p.x * scale,
      y: p.y * scale
    }));
  }

  getCircleColliderWorld() {
    if (!this.circleColliderOffset) this.buildCircleColliderOffsets();
    const cos = Math.cos(this.angle);
    const sin = Math.sin(this.angle);
    return this.circleColliderOffset.map(p => ({
      x: this.x + p.x * cos - p.y * sin,
      y: this.y + p.x * sin + p.y * cos
    }));
  }

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
      ctx.strokeStyle = "#18ed09";
      ctx.lineWidth = 2;
      ctx.beginPath();
      this.circleColliderOffset.forEach((p, i) => {
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      ctx.closePath();
      ctx.stroke();

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

      ctx.fillStyle = "#ffffff";
      ctx.font = "12px Arial";
      ctx.fillText(`W:${this.body.wallBounces}/${window.maxWallBounces}`, -this.radius, this.radius + 10);
    }


    ctx.restore();
  }

  getCorners(steps = 12) {
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

class GlyphLetter extends BaseShape{
  constructor(x, y, char, opts = {})
   {      super(x, y,char, opts);

    this.char = char.toUpperCase();
    this.x = x;
    this.y = y;
    this.angle = 0;
    this.fillColor = opts.fillColor || "lightblue";
    this.borderColor = opts.borderColor || "blue";
    this.wallBounces = 0;
    this.canBounce = true;

    const glyph = svgmaker.mkGlyph(this.char, {
      stroke: this.borderColor,
      fill: this.fillColor,
      size: this.size,
      outlinePx: 6
    });
    this.svg = glyph.svg;
    this.colliderPolys = glyph.collider.polys;
    this.strokeLocal = glyph.strokeLocal;

    this.buildGlyphColliderWithBorder();

    const parser = new DOMParser();
    const doc = parser.parseFromString(this.svg, "image/svg+xml");
    const xml = new XMLSerializer().serializeToString(doc.documentElement);
    const svg64 = btoa(xml);
    this.img = new Image();
    this.loaded = false;
    this.img.src = "data:image/svg+xml;base64," + svg64;
    this.img.onload = () => { this.loaded = true; };

    this.buildMatterBody();
    this.body.wallBounces = 0;
    this.body.maxWallBounces = window.maxWallBounces;
    this.body.canBounce = true;
    this.body.svgShape = this;
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
    const borderOffset = this.strokeLocal / 2 + 5;
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

    this.body.svgShape = this;
  }
  get size() { return window.shapeSize >= 100 ? window.shapeSize - 10 : window.shapeSize; }
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
        ctx.fillText(`W:${this.body.wallBounces}/${window.maxWallBounces}`, -this.radius, this.radius + 2);

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

class SvgRectangle extends BaseShape{
  constructor(x, y, opts = {}) {
     super(x, y, opts);
    this.id = Math.random().toString(36).slice(2, 10);
    this.type = "Rectangle";
    this.name = "Rectangle";

    this.angVel = (Math.random() * 2 - 1) * Math.PI / 180;

    this.strokeWidth = opts.strokeWidth || 7;
    this.fillColor = opts.fillColor || "lightblue";
    this.borderColor = opts.borderColor || "blue";
     this.bounceMode="flat";
    this.width = opts.width || this.size;
    this.height = opts.height || this.size * 0.6;

    this.buildSVG();
    this.buildRectCollider();
  }

  get size() { return window.shapeSize + 90; }
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

    this.rectColliderBase = svgObj.collider.pts.map(p => {
      const scaleX = this.width / 100 * 0.85;
      const scaleY = this.height / 100 * 0.85;
      return { x: (p.x - 50) * scaleX, y: (p.y - 50) * scaleY };
    });
  }

  buildRectCollider() {
    const scale = 0.57;

    let w = (this.width / 2) * scale;
    let h = (this.height / 2) * scale - 3;
    if (this.size > 150) {
      w = w - 2;
      h = h - 4;
    }


    this.rectColliderBase = [
      { x: -w, y: -h },
      { x: w, y: -h },
      { x: w, y: h },
      { x: -w, y: h }
    ];

    const cx = this.rectColliderBase.reduce((sum, p) => sum + p.x, 0) / this.rectColliderBase.length;
    const cy = this.rectColliderBase.reduce((sum, p) => sum + p.y, 0) / this.rectColliderBase.length;

    const scaleFactor = 1.3;
    this.rectColliderScaled = this.rectColliderBase.map(p => ({
      x: cx + (p.x - cx) * scaleFactor,
      y: cy + (p.y - cy) * scaleFactor
    }));
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
      ctx.fillText(`W:${this.body.wallBounces}/${window.maxWallBounces}`, -this.radius + 20, this.radius - 75);
    }

    ctx.restore();
  }
}

class SvgSquare  extends BaseShape{
  constructor(x, y, opts = {}) {
     super(x, y, opts);
    this.id = Math.random().toString(36).slice(2, 10);
    this.type = "Square";
    this.name = "Square";
    this.angVel = (Math.random() * 2 - 1) * Math.PI / 180;

    this.strokeWidth = opts.strokeWidth || 7;
    this.fillColor = opts.fillColor || "lightgreen";
    this.borderColor = opts.borderColor || "green";
     this.bounceMode="flat";
    this.buildSVG();
    this.buildSquareCollider();

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
      const scale = 0.85;
      return { x: (p.x - 50) * scale, y: (p.y - 50) * scale };
    });
  }
  buildSquareCollider() {
    const half = this.size / 2;
    const scale = 0.85;
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
      ctx.strokeStyle = "#18ed09";
      ctx.lineWidth = 2;
      ctx.beginPath();
      this.squareColliderBase.forEach((p, i) => {
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      ctx.closePath();
      ctx.stroke();

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

      ctx.fillStyle = "#ffffff";
      ctx.font = "12px Arial";
      ctx.fillText(`W:${this.body.wallBounces}/${window.maxWallBounces}`, -this.radius, this.radius + 5);

    }


    ctx.restore();
  }
}

class SvgTriangle  extends BaseShape{
  constructor(x, y, opts = {}) {
     super(x, y, opts);
    this.id = Math.random().toString(36).slice(2, 10);
    this.type = "Triangle";
    this.name = "Triangle";
    this.strokeWidth = opts.strokeWidth || 7;
    this.fillColor = opts.fillColor || "pink";
    this.borderColor = opts.borderColor || "red";
     this.bounceMode="realistic"; 
    this.buildSVG();
    this.buildCollider();
  }

  get size() { return window.shapeSize; }
  get radius() { return this.size / 2; }

  buildSVG() {
    const height = Math.sqrt(3) / 2 * 100;
    const pointsStr = `50,0 0,${height} 100,${height}`;

    const svgObj = svgmaker.mkPolyFromPoints(pointsStr, {
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

    this.vertices = svgObj.collider.pts.map(p => ({ x: p.x, y: p.y }));
  }

  buildCollider() {
    const cx = (this.vertices[0].x + this.vertices[1].x + this.vertices[2].x) / 3;
    const cy = (this.vertices[0].y + this.vertices[1].y + this.vertices[2].y) / 3;

    let scale = this.size < 100 ? 1.19 : 1.1;

    this.colliderBase = this.vertices.map(p => ({
      x: (p.x - cx) * (this.size / 100) * scale,
      y: (p.y - cy) * (this.size / 100) * scale
    }));
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
    let imgOffsetY = this.size < 100 ? -7 : this.size < 150 && this.size > 100 ? -9 : -12;
    ctx.drawImage(this.img, -this.size / 2, -this.size / 2 + imgOffsetY, this.size, this.size);
    if (showColliders) {
      ctx.strokeStyle = "#18ed09";
      ctx.lineWidth = 2;
      ctx.beginPath();
      this.colliderBase.forEach((p, i) => {
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      ctx.closePath();
      ctx.stroke();

      ctx.lineWidth = 0.6;
      const scale = 1.2;
      ctx.beginPath();
      this.colliderBase.forEach((p, i) => {
        const x = p.x * scale;
        const y = p.y * scale;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.closePath();
      ctx.stroke();

      ctx.fillStyle = "#ffffff";
      ctx.font = "12px Arial";
      ctx.fillText(`W:${this.body.wallBounces}/${window.maxWallBounces}`, -this.radius, this.radius);

    }

    ctx.restore();
  }
}

class SvgDiamond  extends BaseShape{
  constructor(x, y, opts = {}) {
     super(x, y, opts);
    this.id = Math.random().toString(36).slice(2, 10);
    this.type = "Diamond";
    this.name = "Diamond";
    this.angVel = (Math.random() * 2 - 1) * Math.PI / 180;

    this.strokeWidth = opts.strokeWidth || 7;
    this.fillColor = opts.fillColor || "violet";
    this.borderColor = opts.borderColor || "purple";
     this.bounceMode="flat";
    this.buildSVG();
  }

  get size() { return window.shapeSize; }
  get radius() { return this.size / 2; }

  buildSVG() {
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
    const half = this.size / 2;

    let adjustedHalf = half;
    if (this.size > 150) {
      adjustedHalf = half - 3;
    }


    return [
      { x: 0, y: -adjustedHalf },
      { x: adjustedHalf, y: 0 },
      { x: 0, y: adjustedHalf },
      { x: -adjustedHalf, y: 0 }
    ];
  }

  getColliderWorld() {
    const cos = Math.cos(this.angle);
    const sin = Math.sin(this.angle);
    const local = this.buildCollider();
    return local.map(p => ({
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
      const local = this.buildCollider();

      ctx.strokeStyle = "#18ed09";
      ctx.lineWidth = 2;
      ctx.beginPath();
      local.forEach((p, i) => {
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      ctx.closePath();
      ctx.stroke();

      ctx.strokeStyle = "#18ed09";
      ctx.lineWidth = 0.6;
      const scale = 1.3;
      ctx.beginPath();
      local.forEach((p, i) => {
        const x = p.x * scale;
        const y = p.y * scale;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.closePath();
      ctx.stroke();

      ctx.fillStyle = "#ffffff";
      ctx.font = "12px Arial";
      ctx.fillText(
        `W:${this.body.wallBounces}/${window.maxWallBounces}`,
        -this.radius,
        this.radius - 25
      );
    }

    ctx.restore();
  }
}

class SvgRegularPolygonShape  extends BaseShape{
  constructor(x, y, n = 5, opts = {}) {
     super(x, y, opts);
    this.id = Math.random().toString(36).slice(2, 10);
    this.type = "RegularPolygon";
    this.name = "RegularPolygon";
    this.n = 8;
    this.angVel = (Math.random() * 2 - 1) * Math.PI / 180;

    this.strokeWidth = opts.strokeWidth || 7;
    this.fillColor = opts.fillColor || "#ffffff";
    this.borderColor = opts.borderColor || "#ff0000";
    this.bounceMode="realistic";
    this.buildSVG();
    this.buildCollider();

  }

  get size() {
    return window.shapeSize <= 150 ? window.shapeSize + 70 :
      window.shapeSize >= 150 ? window.shapeSize + 50 :
        window.shapeSize >= 180 ? window.shapeSize - 30 : window.shapeSize
  }


  get radius() { return this.size / 2; }
  buildSVG() {
    const radius = this.size / 2 * 0.35;
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

    this.colliderBase = svgObj.collider.pts.map(p => {
      const [x, y] = p.split(",").map(Number);
      const scale = this.size / 100 + 0.1;
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
      ctx.strokeStyle = "#18ed09";
      ctx.lineWidth = 2;
      ctx.beginPath();
      this.colliderBase.forEach((p, i) => {
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      ctx.closePath();
      ctx.stroke();

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

      ctx.fillStyle = "#ffffff";
      ctx.font = "12px Arial";
      ctx.fillText(
        `W:${this.body.wallBounces}/${window.maxWallBounces}`,
        -this.radius,
        this.radius - 40
      );
    }

    ctx.restore();
  }
}
