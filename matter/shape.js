window.shapeSize = 100;
let totalShapes = 0;
let remainedShapes = shapes.length;
let roundActive = true;
let shapeCounter = 0; 

window.MAX_SHAPES =50;
window.SPEED = 50;


class SvgStar {
  constructor(x, y, opts = {}) {
    this.id = Math.random().toString(36).slice(2, 10);
    this.type = "Star";
    this.name = "Star";

    this.strokeWidth = opts.strokeWidth || 7;
    this.fillColor = opts.fillColor || "yellow";
    this.borderColor = opts.borderColor || "orange";
    this.restitution = opts.restitution ?? 0.5;
    this.spikes = opts.spikes || 5;

    this.size = window.shapeSize || 100;
   this.body = Bodies.polygon(x, y, 5, this.size/2, {
      restitution: 0.8,
      friction: 0.05,
      render: { fillStyle: this.fillColor, strokeStyle: this.borderColor }
    });
    World.add(world, this.body);
    // ساخت کالیدر هندسی برای Matter
    const step = Math.PI / this.spikes;
    const verts = [];
    for (let i = 0; i < this.spikes * 2; i++) {
      const r = (i % 2 === 0) ? this.size / 2 : this.size / 4;
      const a = i * step - Math.PI / 2; // ستاره رو عمودی کنیم
      verts.push({ x: r * Math.cos(a), y: r * Math.sin(a) });
    }

    this.body = Bodies.fromVertices(x, y, verts, {
      restitution: this.restitution,
      render: {
        fillStyle: this.fillColor,
        strokeStyle: this.borderColor
      }
    }, true);

    World.add(world, this.body);

    // ساخت SVG (برای ظاهر)
    this.buildSVG();
  }

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

  get vertices() {
    return this.body.vertices;
  }
get radius() {
    return this.size / 2;
}

  draw(ctx) {
    if (!this.loaded) return;

    const pos = this.body.position;
    const angle = this.body.angle;

    ctx.save();
    ctx.translate(pos.x, pos.y);
    ctx.rotate(angle);
    ctx.drawImage(this.img, -this.size / 2, -this.size / 2, this.size, this.size);

    if (showColliders) {
      ctx.strokeStyle = "#18ed09";
      ctx.lineWidth = 2;
      ctx.beginPath();
      const v = this.vertices;
      ctx.moveTo(v[0].x - pos.x, v[0].y - pos.y);
      for (let i = 1; i < v.length; i++) {
        ctx.lineTo(v[i].x - pos.x, v[i].y - pos.y);
      }
      ctx.closePath();
      ctx.stroke();
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

