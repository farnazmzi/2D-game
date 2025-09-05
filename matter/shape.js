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
      const outerOffset = 10 * (this.size / baseSize);
      const innerOffset = 17 * (this.size / baseSize);

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





function parseSvgPathToPolys(pathData, scale = 1) {
  const polys = svgPathToPolygons(pathData, {
    tolerance: 1, // دقت
    decimals: 1,  // تعداد اعشار
  });
  return polys.map(poly => poly.map(([x, y]) => ({ x: x * scale, y: y * scale })));
}


// class GlyphLetter {
//   constructor(x, y, char, opts = {}) {
//     this.char = char.toUpperCase();
//     this.x = x;
//     this.y = y;
//     this.type = "Glyph";
//     this.name = "Glyph";
//     this.size = opts.size || 120;
//     this.stroke = opts.stroke || "#000";
//     this.fill = opts.fill || "#fff";

//     // ساخت SVG + لیست مستطیل‌ها
//     const glyph = svgmaker.mkGlyph(this.char, {
//       stroke: this.stroke,
//       fill: this.fill,
//       size: this.size,
//       outlinePx: 6
//     });
//     this.svg = glyph.svg;
//     this.colliderPolys = glyph.collider.polys;

//     // 🟢 ساخت کالیدر در matter.js
//     const parts = this.colliderPolys.map(poly => {
//       return Matter.Bodies.fromVertices(this.x, this.y, poly, { restitution: 0.4 }, true);
//     });

//     this.body = Matter.Body.create({
//       parts,
//       restitution: 0.4,
//       friction: 0.3
//     });
//     Matter.Body.setPosition(this.body, { x: this.x, y: this.y });

//     // ساخت تصویر برای draw
//     const parser = new DOMParser();
//     const doc = parser.parseFromString(this.svg, "image/svg+xml");
//     const xml = new XMLSerializer().serializeToString(doc.documentElement);
//     const svg64 = btoa(xml);
//     this.img = new Image();
//     this.loaded = false;
//     this.img.src = "data:image/svg+xml;base64," + svg64;
//     this.img.onload = () => { this.loaded = true; };
//   }

//   draw(ctx) {
//     if (!this.loaded) return;
//     this.x = this.body.position.x;
//     this.y = this.body.position.y;
//     this.angle = this.body.angle;

//     ctx.save();
//     ctx.translate(this.x, this.y);
//     ctx.rotate(this.angle);
//     ctx.drawImage(this.img, -this.size / 2, -this.size / 2, this.size, this.size);

//     if (showColliders) {
//       ctx.strokeStyle = "lime";
//       ctx.lineWidth = 1.5;
//       this.colliderPolys.forEach(poly => {
//         ctx.beginPath();
//         poly.forEach((p, i) => {
//           const localX = p.x - 50; // چون viewBox(0,0,100,100) بوده
//           const localY = p.y - 50;
//           if (i === 0) ctx.moveTo(localX, localY);
//           else ctx.lineTo(localX, localY);
//         });
//         ctx.closePath();
//         ctx.stroke();
//       });
//     }

//     ctx.restore();
//   }
// }





class GlyphLetter {
  constructor(x, y, char, opts = {}) {
    this.id = Math.random().toString(36).slice(2, 10);
    this.type = "Glyph";
    this.name = "Glyph";

    this.char = char.toUpperCase();
    this.x = x;
    this.y = y;
    this.angle = 0;
    this.angVel = (Math.random() * 2 - 1) * Math.PI / 180;

    this.size = opts.size || 120;
    this.stroke = opts.stroke || "#000";
    this.fill = opts.fill || "#fff";
    this.restitution = opts.restitution ?? 0.8;
    this.wallBounces = 0;

    // ساخت SVG + لیست polys
    const glyph = svgmaker.mkGlyph(this.char, {
      stroke: this.stroke,
      fill: this.fill,
      size: this.size,
      outlinePx: 6
    });
    this.svg = glyph.svg;
    this.colliderPolys = glyph.collider.polys;

    this.buildGlyphColliderOffsets();

    // ساخت تصویر برای draw
    const parser = new DOMParser();
    const doc = parser.parseFromString(this.svg, "image/svg+xml");
    const xml = new XMLSerializer().serializeToString(doc.documentElement);
    const svg64 = btoa(xml);
    this.img = new Image();
    this.loaded = false;
    this.img.src = "data:image/svg+xml;base64," + svg64;
    this.img.onload = () => { this.loaded = true; };
  }

  get radius() { return this.size / 2; }

buildGlyphColliderOffsets({ scale = 0.61, tightnessX = 2.2, tightnessY = 2.2, extraWidth = 2, extraHeight = 6 } = {}) {
  this.glyphColliderOffset = this.colliderPolys.map(poly =>
    poly.map(p => {
      const centerX = 90;
      const centerY = 90;

      // اعمال tightness
      let localX = centerX + (p.x - centerX) * tightnessX;
      let localY = centerY + (p.y - centerY) * tightnessY;

      // اضافه کردن عرض و ارتفاع اضافی
      localX += extraWidth * Math.sign(p.x - centerX);
      localY += extraHeight * Math.sign(p.y - centerY);

      // اعمال scale کلی
      localX *= scale;
      localY *= scale;

      return { x: localX, y: localY };
    })
  );
}


  getGlyphColliderWorld() {
    const cos = Math.cos(this.angle);
    const sin = Math.sin(this.angle);
    return this.glyphColliderOffset.map(poly =>
      poly.map(p => ({
        x: this.x + p.x * cos - p.y * sin,
        y: this.y + p.x * sin + p.y * cos
      }))
    );
  }

  getColliderPoints() {
    return this.getGlyphColliderWorld().flat();
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
      this.glyphColliderOffset.forEach(poly => {
        ctx.beginPath();
        poly.forEach((p, i) => {
          if (i === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        });
        ctx.closePath();
        ctx.stroke();
      });

      // // کالیدر دوم با scale
      // ctx.lineWidth = 0.6;
      // const scale = 1.5;
      // this.glyphColliderOffset.forEach(poly => {
      //   ctx.beginPath();
      //   poly.forEach((p, i) => {
      //     const x = p.x * scale;
      //     const y = p.y * scale;
      //     if (i === 0) ctx.moveTo(x, y);
      //     else ctx.lineTo(x, y);
      //   });
      //   ctx.closePath();
      //   ctx.stroke();
      // });

      // متن wallBounces
      ctx.fillStyle = "#ffffff";
      ctx.font = "12px Arial";
      ctx.fillText(`W:${this.wallBounces || 0}/${this.maxWallBounces || 3}`, -this.radius, this.radius);
    }

    ctx.restore();
  }
}
