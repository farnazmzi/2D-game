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
        this.angVel = (Math.random() * 2 - 1) * Math.PI / 180;  

        this.wallBounces = 0;
        this.maxWallBounces = 3;
        this.collisionsEnabled = true;

        this.inField = false;
        this.entering = true;
        this.leaving = false;
        this.restitution = restitution;

      }
      get radius() {
        return circleRadius;  
      }
      draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = "gray";
        ctx.fill();
        ctx.lineWidth = this.strokeWidth;
        ctx.strokeStyle = "red";
        ctx.stroke();

        if (showColliders) {
          ctx.beginPath();
          ctx.arc(0, 0, this.radiusWithStroke, 0, Math.PI * 2);
          ctx.strokeStyle = this.leaving ? "#18ed09" : (this.entering ? "#18ed09" : "#18ed09");
          ctx.lineWidth = 2;
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(0, 0, this.radiusWithStroke + 5, 0, Math.PI * 2);
          ctx.strokeStyle = ctx.strokeStyle;
          ctx.lineWidth = 1;
          ctx.stroke();

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
        this.angVel = (Math.random() * 2 - 1) * Math.PI / 180; 

        this.wallBounces = 0;
        this.maxWallBounces = 3;
        this.collisionsEnabled = true;

        this.inField = false;
        this.entering = true;
        this.leaving = false;
        this.restitution = restitution;
      }


      get size() {
        return squareSize; 
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

          ctx.lineWidth = 2;
          ctx.strokeRect(-this.size / 2 - this.strokeWidth,
            -this.size / 2 - this.strokeWidth,
            this.size + this.strokeWidth * 2,
            this.size + this.strokeWidth * 2);

          ctx.lineWidth = 1;
          ctx.strokeRect(-this.size / 2 - this.strokeWidth - 5,
            -this.size / 2 - this.strokeWidth - 5,
            this.size + this.strokeWidth * 2 + 10,
            this.size + this.strokeWidth * 2 + 10);

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

    class Star {
      constructor(x, y, spikes, vx, vy, angle = 0, strokeWidth = 7, fillColor = 'yellow', borderColor = 'orange', entrySide, restitution) {
        this.id = Math.random().toString(36).slice(2, 10);
        this.type = 'Star';
        this.name = 'Star';
        this.x = x;
        this.y = y;
        this.spikes = 5;   
        this.vx = vx;
        this.vy = vy;
        this.angle = 0;
        this.angVel = (Math.random() * 2 - 1) * Math.PI / 180; 
        this.fillColor = fillColor;
        this.borderColor = borderColor;
        this.entrySide = entrySide;
        this.birth = performance.now() / 1000;
        this.wallBounces = 0;    
        this.maxWallBounces = 3; 
        this.collisionsEnabled = true; 
        this.strokeWidth = strokeWidth;
        this.inField = false;
        this.entering = true;
        this.leaving = false;
        this.restitution = restitution;
      }


      get radius() {
        return starRadius;
      }

      draw(ctx) {
        const step = Math.PI / this.spikes;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        ctx.beginPath();
        for (let i = 0; i < this.spikes * 2; i++) {
          const r = i % 2 === 0 ? this.radius : this.radius / 2;
          const a = i * step;
          const px = Math.cos(a) * r;
          const py = Math.sin(a) * r;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fillStyle = this.fillColor;
        ctx.fill();
        ctx.strokeStyle = this.borderColor;
        ctx.lineWidth = this.strokeWidth;
        ctx.stroke();
        if (showColliders) {
          const step = Math.PI / this.spikes;
          ctx.strokeStyle = this.leaving ? "#18ed09" : (this.entering ? "#18ed09" : "#18ed09");

          ctx.beginPath();
          for (let i = 0; i < this.spikes * 2; i++) {
            const r = i % 2 === 0 ? this.radius + this.strokeWidth : (this.radius / 2) + this.strokeWidth;
            const a = i * step;
            const px = Math.cos(a) * r;
            const py = Math.sin(a) * r;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.lineWidth = 2;
          ctx.stroke();

          ctx.beginPath();
          for (let i = 0; i < this.spikes * 2; i++) {
            const r = i % 2 === 0 ? this.radius + this.strokeWidth + 5 : (this.radius / 2) + this.strokeWidth + 6;
            const a = i * step;
            const px = Math.cos(a) * r;
            const py = Math.sin(a) * r;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.lineWidth = 1;
          ctx.stroke();

          ctx.fillStyle = "#ffffff";
          ctx.font = "12px Arial";
          ctx.fillText(`W:${this.wallBounces}/${this.maxWallBounces}`, -this.radius, this.radius + 20);
        }

        ctx.restore();
      }

      ageSeconds() {
        return (performance.now() / 1000) - this.birth;
      }
      get radiusWithStroke() {
        return this.radius + 5;
      }
      isOut() {
        return this.x + this.radius < 0 || this.x - this.radius > canvas.width ||
          this.y + this.radius < 0 || this.y - this.radius > canvas.height;
      }
    }

   class SvgLetter {
      constructor(svgString, side, width = 80, height = 80, speed = 50) {
        const marginX = canvas.width * 0.2;
        const marginY = canvas.height * 0.2;

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

        const cx = canvas.width / 2, cy = canvas.height / 2;
        const dx = cx - this.x, dy = cy - this.y, d = Math.hypot(dx, dy) || 1;
        this.vx = dx / d * speed;
        this.vy = dy / d * speed;

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

    SvgLetter.prototype.getCollider = function () {
      const corners = [];
      const w = this.width || 40;
      const h = this.height || 40;
      const cos = Math.cos(this.angle || 0);
      const sin = Math.sin(this.angle || 0);

      const points = [
        { x: -w / 2, y: -h / 2 },
        { x: w / 2, y: -h / 2 },
        { x: w / 2, y: h / 2 },
        { x: -w / 2, y: h / 2 }
      ];

      for (const p of points) {
        const x = p.x * cos - p.y * sin + this.x;
        const y = p.x * sin + p.y * cos + this.y;
        corners.push({ x, y });
      }

      return corners;
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

        this.mass = 1;
        this.invMass = 1 / this.mass;
        this.inertia = (this.mass * this.size * this.size) / 12;
        this.invInertia = 1 / this.inertia;
    }

    getVertices() {
        const h = (Math.sqrt(3) / 2) * this.size;
        const vertices = [
            { x: 0, y: -h / 2 },                 
            { x: -this.size / 2, y: h / 2 },      
            { x: this.size / 2, y: h / 2 }      
        ];
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
