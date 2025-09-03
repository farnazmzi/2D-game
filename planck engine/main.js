
//     const canvas = document.getElementById("canvas");
//     const ctx = canvas.getContext("2d");
//     canvas.width = innerWidth;
//     canvas.height = innerHeight;
//     const hud = document.getElementById("hud");

//     let started = false;
//     let shapes = [];
//     let last = performance.now();
//     let globalSeconds = 0;
//     setInterval(() => globalSeconds++, 1000);

//     let round = 1;

//     let lastRoundTime = performance.now() / 1000;


//     let wallsActive = false;
//     const BORDER = 7;
//     let wallsStartTime = null; // زمان فعال شدن دیوارها
//     const WALL_BLOCK_DURATION = 50; // ثانیه
//     let lastSpawnSide = null;
//     let hoveredShape = null;
//     let showColliders = false;

//     window.circleRadius = 70;
//     window.squareSize = 80;
//     window.starRadius = 35;
//     window.MAX_SHAPES = 12;
//     window.SPEED = 150;
//     window.roundTime = 40;
//     window.maxWallBounces = 3;

//     function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
//     window.addEventListener('resize', resize);
//     resize();



//     //collider


//     const colliderBtn = document.getElementById('toggleCollider');
//     colliderBtn.addEventListener('click', () => {
//       showColliders = !showColliders;
//     });


//     function ensureInitial() {
//       generateShapesWithDelay(MAX_SHAPES, 300);
//     }

//     // ===================== کلاس‌ها =====================


//     // ===================== توابع کمکی =====================
//     function getRandomSide() {
//       const sides = ["left", "right", "top", "bottom"];
//       return sides[Math.floor(Math.random() * sides.length)];
//     }






//     let shapeCounter = 0; // بیرون از تابع تعریف کن (global)

// function loop(now) {
//   if (!started) return;

//   const dt = Math.min(0.05, (now - last) / 1000);
//   last = now;

//   // استپ کردن دنیای فیزیک
//   world.step(dt);

//   const currentTime = performance.now() / 1000;

//   // --- بررسی راند ---
//   if (currentTime - lastRoundTime >= roundTime) {
//     round++;
//     lastRoundTime = currentTime;
//     generateShapesWithDelay(MAX_SHAPES, 300);
//   }

//   // تمیز کردن صفحه
//   ctx.clearRect(0, 0, canvas.width, canvas.height);

//   // کشیدن همه‌ی بادی‌ها
//   for (const body of shapes) {
//     const pos = body.getPosition();
//     const angle = body.getAngle();

//     // فرض کن هر body توی userData یه نوع shape داره
//     const shapeInfo = body.getUserData();
//     if (shapeInfo && shapeInfo.draw) {
//       shapeInfo.draw(ctx, pos, angle);
//     }
//   }

//   // حذف بادی‌های مرده
//   for (let i = shapes.length - 1; i >= 0; i--) {
//     if (shapes[i].remove) {
//       removeShape(shapes[i]);
//     }
//   }

//   // دیوارها
//   if (!wallsActive && shapes.some(b => {
//     const pos = b.getPosition();
//     return pos.x > 0 && pos.x < canvas.width && pos.y > 0 && pos.y < canvas.height;
//   })) {
//     wallsActive = true;
//   }
//   if (wallsActive) drawWalls();

//   // HUD
//   hud.textContent = `Time: ${Math.floor(currentTime)}s · Round: ${round} · Shapes: ${totalShapes} · Remained: ${remainedShapes}`;

//   requestAnimationFrame(loop);
// }



//    function gameLoop() {
//   updatePhysics();

//   ctx.clearRect(0,0,canvas.width,canvas.height);

//   for (let body = world.getBodyList(); body; body = body.getNext()) {
//     drawBody(ctx, body);
//   }

//   requestAnimationFrame(gameLoop);
// }

// function createWalls(width, height) {
//   const wall = world.createBody();

//   // پایین
//   wall.createFixture(pl.Edge(pl.Vec2(0, height), pl.Vec2(width, height)));
//   // بالا
//   wall.createFixture(pl.Edge(pl.Vec2(0, 0), pl.Vec2(width, 0)));
//   // چپ
//   wall.createFixture(pl.Edge(pl.Vec2(0, 0), pl.Vec2(0, height)));
//   // راست
//   wall.createFixture(pl.Edge(pl.Vec2(width, 0), pl.Vec2(width, height)));
// }



//     setInterval(() => globalSeconds++, 1000);

//     let totalShapes = 0;
//     let remainedShapes = shapes.length;
//     let roundActive = true;

//     function addShape() {
//       const newShape = tryGenerateShape();
//       if (newShape)
//         return newShape;
//     }

// function removeShape(body) {
//   world.destroyBody(body);
//   remainedShapes--;
// }
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

//   const vel = makeVelocity(sx, sy);
//   let body;

//   if (shapeCounter % 3 === 0) {
//     body = createCircle(sx, sy, 7, "red");
//   } else if (shapeCounter % 3 === 1) {
//     body = createSquare(sx, sy, 14, "blue");
//   } else {
//     body = createTriangle(sx, sy, 16, "green");
//   }

//   // ست کردن سرعت اولیه
//   body.setLinearVelocity(planck.Vec2(vel.vx, vel.vy));

//   // ⚡ ست کردن draw داخل userData
//   body.setUserData({
//     draw: (ctx, pos, angle) => drawBody(ctx, body)
//   });

//   shapeCounter++;
//   return body;
// }



//     function generateShapesWithDelay(count, delay) {
//       let i = 0;

//       function generateNext() {
//         if (i >= count) return;

//         const outside = Math.random() < 0.2; // 20% بیرون
//         const sh = addShape(outside);
//         if (sh) {
//           shapes.push(sh);
//           totalShapes++;
//           remainedShapes++;
//         }

//         i++;
//         setTimeout(generateNext, delay);
//       }

//       generateNext();
//     }


   
//     //game  start
//     const startBtn = document.getElementById('startGameBtn');
//     const toggleDebug = document.getElementById('toggleDebug');
//     const liveBtn = document.getElementById('toggleLive');
//     const controlPanel = document.getElementById('controlPanel');
//     const closeControlPanel = document.getElementById('closeControlPanel');
//     const toggleCollider = document.getElementById('toggleCollider');

//     toggleDebug.style.display = 'none';
//     controlPanel.style.display = 'none';
//     liveBtn.style.display = 'none';
//     toggleCollider.style.display = 'none';

//     startBtn.addEventListener('click', () => {
//       // مخفی کردن استارت پنل
//       startBtn.style.display = 'none';
//       liveBtn.style.display = 'block';
//       controlPanel.style.display = 'none';
//       toggleDebug.style.display = 'block';
//       toggleCollider.style.display = 'block';
//       startGame();
//     });
//     closeControlPanel.addEventListener('click', () => {
//       controlPanel.style.display = 'none';
//     });



//     liveBtn.addEventListener('click', () => {
//       if (controlPanel.style.display === 'none' || controlPanel.style.display === '') {
//         controlPanel.style.display = 'block'; // یا grid یا هرچی استایل اصلیته
//       } else {
//         controlPanel.style.display = 'none';
//       }
//     });





//     function bindSlider(sliderId, valueId, variableName) {
//       const slider = document.getElementById(sliderId);
//       const valSpan = document.getElementById(valueId);

//       // مقدار اولیه رو به span و متغیر global اختصاص بده
//       valSpan.innerText = slider.value;
//       window[variableName] = parseFloat(slider.value);

//       // هر بار که اسلایدر تغییر کرد
//       slider.addEventListener('input', () => {
//         const newValue = parseFloat(slider.value);
//         valSpan.innerText = newValue;        // بروزرسانی عدد نمایش داده شده
//         window[variableName] = newValue;     // بروزرسانی متغیر global

//         // فقط برای تست: چاپ همه متغیرهای اصلی
//         console.log(
//           "circleRadius =", circleRadius,
//           "squareSize =", squareSize,
//           "starRadius =", starRadius,
//           "MAX_SHAPES =", MAX_SHAPES,
//           "SPEED =", SPEED,
//           "roundTime =", roundTime,
//           "maxWallBounces =", maxWallBounces
//         );
//       });
//     }

//     bindSlider("circleRadiusSliderStart", "circleRadiusValStart", "circleRadius");
//     bindSlider("squareSizeSliderStart", "squareSizeValStart", "squareSize");
//     bindSlider("starRadiusSliderStart", "starRadiusValStart", "starRadius");
//     bindSlider("maxShapesSliderStart", "maxShapesValStart", "MAX_SHAPES");
//     bindSlider("speedSliderStart", "speedValStart", "SPEED");
//     bindSlider("roundTimeSliderStart", "roundTimeValStart", "roundTime");
//     bindSlider("maxWallBouncesSliderStart", "maxWallBouncesValStart", "maxWallBounces");




//     function startGame() {

//       ensureInitial();
//       shapes = [];       // ← همه شکل‌های قدیمی پاک بشن
//       totalShapes = 0;
//       remainedShapes = 0;
//       SPEED = 0;
//       console.log("circleRadius=", circleRadius, "squareSize=", squareSize, "starRadius=", starRadius);

//       // --- شروع حلقه ---
//       started = true;
//       last = performance.now();
//       lastRoundTime = performance.now() / 1000; // ریست زمان راند

//       requestAnimationFrame(loop);
//     }




  const canvas = document.getElementById("myCanvas");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const ctx = canvas.getContext("2d");
const hud = document.getElementById("hud");




    const restitution = 0.9;

    let started = false;
    let shapeCounter = 0;

    let totalShapes = 0;
    let remainedShapes = 0;
    let round = 1;
    let lastRoundTime = performance.now() / 1000;
    let globalSeconds = 0;
    setInterval(() => globalSeconds++, 1000);

    window.circleRadius = 70;
    window.squareSize = 80;
    window.starRadius = 35;
    window.MAX_SHAPES = 70;
    window.SPEED = 150;
    window.roundTime = 40;
    window.maxWallBounces = 3;
    const svgString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <polygon points="50,0 61,35 98,35 68,57 79,91 50,70 21,91 32,57 2,35 39,35" />
</svg>`;

    const starSVGTemplate = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <polygon points="50,0 61,35 98,35 68,57 79,91 50,70 21,91 32,57 2,35 39,35" fill="{color}" />
</svg>`;


let showColliders = false;

    let showStarColliders = true;
    let wallsActive = false; // دیوارها اول خاموش هستند

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);

    document.getElementById("toggleCollider").addEventListener("click", () => {
      showColliders = !showColliders;
    });



 canvas.addEventListener("mousemove", (e) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      hoveredShape = null;
      for (const s of shapes) {
        const dx = mouseX - s.x;
        const dy = mouseY - s.y;
        const dist = Math.hypot(dx, dy);
        let hitRadius = s.radiusWithStroke ?? (s.size / Math.sqrt(2) + (s.strokeWidth ?? 7));
        if (dist < hitRadius) {
          hoveredShape = s;
          break;
        }
      }

      drawDebugInfo();
    });

    

    //game  start
    const startBtn = document.getElementById('startGameBtn');
    const toggleDebug = document.getElementById('toggleDebug');
    const liveBtn = document.getElementById('toggleLive');
    const controlPanel = document.getElementById('controlPanel');
    const closeControlPanel = document.getElementById('closeControlPanel');
    const toggleCollider = document.getElementById('toggleCollider');

    toggleDebug.style.display = 'none';
    controlPanel.style.display = 'none';
    liveBtn.style.display = 'none';
    toggleCollider.style.display = 'none';

    startBtn.addEventListener('click', () => {
      // مخفی کردن استارت پنل
      startBtn.style.display = 'none';
      liveBtn.style.display = 'block';
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
        controlPanel.style.display = 'block'; // یا grid یا هرچی استایل اصلیته
      } else {
        controlPanel.style.display = 'none';
      }
    });





    // class Shape {
    //   constructor(body, type) {
    //     this.body = body;
    //     this.type = type;
    //     this.id = Math.random().toString(36).slice(2, 10);
    //     this.birth = performance.now() / 1000;
    //     this.maxWallBounces = 3;
    //     this.wallBounces = 0;
    //     this.collisionsEnabled = true;
    //   }
    //   get pos() { return this.body.getPosition(); }
    //   get angle() { return this.body.getAngle(); }
    //   draw(ctx) {
    //     console.log("Fixtures:");
    //     for (let f = this.body.getFixtureList(); f; f = f.getNext()) {
    //       console.log(f.getShape());
    //       f = f.getNext();
    //       const shape = f.getShape();
    //       if (shape.m_type !== 'polygon') continue;
    //       const verts = shape.m_vertices;
    //       ctx.save();
    //       ctx.translate(pos.x * SCALE, pos.y * SCALE);
    //       ctx.rotate(this.angle);

    //       // Fill
    //       ctx.beginPath();
    //       ctx.moveTo(verts[0].x, verts[0].y);
    //       for (let i = 1; i < verts.length; i++) ctx.lineTo(verts[i].x, verts[i].y);
    //       ctx.closePath();
    //       ctx.fillStyle = this.body.renderColor || 'gray';
    //       ctx.fill();

    //       // Stroke
    //       if (this.body.border) {
    //         ctx.lineWidth = this.body.border;
    //         ctx.strokeStyle = "red";
    //         ctx.stroke();
    //       }

    //       // Colliders toggle
    //       if (showColliders) {
    //         ctx.lineWidth = 2;
    //         ctx.strokeStyle = "lime";
    //         ctx.stroke();
    //       }
    //       ctx.restore();
    //     }
    //   }
    // }
    function createPhysicsShapeFromSVG(x, y, svgString, opts = {}) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(svgString, "image/svg+xml");
      const polygons = [...doc.querySelectorAll('polygon, polyline')];

      const body = world.createDynamicBody({
        position: pl.Vec2(x, y),
        angularDamping: 0.1,
        linearDamping: 0.01
      });

      // اندازه واقعی fixture = radius که به عنوان opts.radius فرستاده شده
      const radius = opts.radius || 50;

      // scaleFactor = تبدیل نقاط SVG به واحد Planck (به گونه‌ای که fixture اندازه درست داشته باشد)
      const scaleFactor = radius / 50; // چون viewBox SVG 0..100 است

      polygons.forEach(p => {
        const points = p.getAttribute('points').trim().split(/\s+/).map(pt => {
          const [px, py] = pt.split(',').map(Number);
          // تبدیل px,py از 0..100 به واحد Planck با scale radius
          return pl.Vec2((px - 50) * scaleFactor, (py - 50) * scaleFactor);
        });

        if (points.length >= 3 && pl.Polygon.isValid(points)) {
          body.createFixture(pl.Polygon(points), {
            density: opts.density || 1,
            friction: opts.friction || 0.3,
            restitution: opts.restitution || 0.4
          });
        }
      });

      // Image برای رندر روی Canvas
      const img = new Image();
      const svg64 = btoa(unescape(encodeURIComponent(svgString)));
      img.src = "data:image/svg+xml;base64," + svg64;

      body._img = img;
      body.renderSvg = svgString;
      body.renderColor = opts.fill || 'gray';
      body.fixtureRadius = radius; // اندازه واقعی
      return body;
    }


    function createStarFixture(body, outerR, innerR, spikes = 5) {
      const step = Math.PI / spikes;

      for (let i = 0; i < spikes; i++) {
        const angle = i * 2 * step - Math.PI / 2;
        const angleNext = (i * 2 + 2) * step - Math.PI / 2;

        // هر پر ستاره = مثلث محدب
        const p1 = pl.Vec2(Math.cos(angle) * outerR, Math.sin(angle) * outerR);
        const p2 = pl.Vec2(Math.cos(angle + step) * innerR, Math.sin(angle + step) * innerR);
        const p3 = pl.Vec2(Math.cos(angleNext) * outerR, Math.sin(angleNext) * outerR);

        const verts = [p1, p2, p3];

        if (pl.Polygon.isValid(verts)) {
          body.createFixture(pl.Polygon(verts), {
            density: 1,
            friction: 0.3,
            restitution: 0.4
          });
        }
      }
      body.isStar = true;
    }

    // ===== svgmaker را بعد از لود bind کن =====
    svgmaker.mkCircle = svgmaker.mkCircle.bind(svgmaker);
    svgmaker.mkSquare = svgmaker.mkSquare.bind(svgmaker);
    svgmaker.mkTriangle = svgmaker.mkTriangle.bind(svgmaker);
    svgmaker.mkRectangle = svgmaker.mkRectangle.bind(svgmaker);
    svgmaker.mkDiamond = svgmaker.mkDiamond.bind(svgmaker);
    svgmaker.mkRegularPolygon = svgmaker.mkRegularPolygon.bind(svgmaker);
    svgmaker.mkGlyph = svgmaker.mkGlyph.bind(svgmaker);

    // ====================
    // Physics shape factory
    // ====================

    // ====================
    // Create Physics Shape
    // ====================
    // function createPhysicsShape(x, y, shapeGen, opts = {}, glyphChar = null) {
    //   const { collider, svg } = glyphChar ? shapeGen(glyphChar, opts) : shapeGen(opts);

    //   // ابتدا بدن بساز
    //   const body = world.createDynamicBody({
    //     position: pl.Vec2(x, y),
    //     angularDamping: 0.1,
    //     linearDamping: 0.01
    //   });

    //   body.fixtureRadius = opts.radius || 50;

    //   console.log("Collider:", collider);

    //   if (collider.type === 'circle') {
    //     body.createFixture(pl.Circle(body.fixtureRadius), { density: 1, friction: 0.3, restitution: 0.4 });

    //   }

    //   if (collider.type === 'starShape') {
    //     for (const poly of collider.polys) {
    //       const verts = poly.map(p => pl.Vec2(
    //         (p.x - 50) / 50 * body.fixtureRadius,
    //         (p.y - 50) / 50 * body.fixtureRadius
    //       ));
    //       if (verts.length >= 3) {
    //         body.createFixture(pl.Polygon(verts), {
    //           density: 1,
    //           friction: 0.3,
    //           restitution: 0.4
    //         });
    //       }
    //     }
    //   }

    //   //   else if (collider.type === 'poly') {
    //   //   const SCALE = 0.1; // هر پیکسل ≈ 0.1 متر

    //   //   function toVec(p, r) {
    //   //     return pl.Vec2(
    //   //       (p.x - 50) * SCALE * (r / 50),
    //   //       (p.y - 50) * SCALE * (r / 50)
    //   //     );
    //   //   }

    //   //   const verts = collider.pts.map(p => toVec(p, body.fixtureRadius));

    //   //   if (verts.length >= 3) {
    //   //     body.createFixture(pl.Polygon(verts), {
    //   //       density: 1,
    //   //       friction: 0.3,
    //   //       restitution: 0.4
    //   //     });
    //   //   }
    //   // }

    //   //else if (collider.type === 'star') {
    //   //   createStarFixture(body, body.fixtureRadius, body.fixtureRadius / 2, 5);

    //   //   body.isStar = true;
    //   //   body.strokeColor = opts.stroke || "#fff";
    //   // }
    //   else {
    //     console.warn('Unknown collider type:', collider);
    //   }

    //   body.renderSvg = svg;
    //   body.renderColor = opts.fill || 'gray';

    //   return body;
    // }



    // ====================
    // Draw bodies on canvas
    // ====================
    // function drawBody(ctx, body) {
    //   const pos = body.getPosition();
    //   const angle = body.getAngle();

    //   ctx.save();
    //   ctx.translate(pos.x * SCALE, pos.y * SCALE);
    //   ctx.rotate(body.getAngle());

    //   let isCircle = false;

    //   for (let f = body.getFixtureList(); f; f = f.getNext()) {

    //     const s = f.getShape();

    //     if (s.m_type === "circle") {
    //       isCircle = true;

    //       ctx.beginPath();
    //       ctx.arc(0, 0, s.m_radius, 0, Math.PI * 2);
    //       ctx.fillStyle = body.renderColor || "gray";
    //       ctx.fill();

    //       ctx.lineWidth = 2;
    //       ctx.strokeStyle = "#fff";
    //       ctx.stroke();

    //       if (showColliders) {
    //         ctx.beginPath();
    //         ctx.arc(0, 0, s.m_radius, 0, Math.PI * 2);
    //         ctx.strokeStyle = "#18ed09";
    //         ctx.lineWidth = 2;
    //         ctx.stroke();

    //         ctx.beginPath();
    //         ctx.arc(0, 0, s.m_radius + 5, 0, Math.PI * 2);
    //         ctx.lineWidth = 1;
    //         ctx.stroke();

    //         ctx.fillStyle = "#ffffff";
    //         ctx.font = "12px Arial";
    //         ctx.fillText(`Body`, -s.m_radius, s.m_radius + 15);
    //       }

    //     }

    //     if (s.m_type === "polygon") {
    //       const verts = s.m_vertices;
    //       const isStar = body.type === "starShape";

    //       // Fill
    //       ctx.beginPath();
    //       ctx.moveTo(verts[0].x, verts[0].y);
    //       for (let i = 1; i < verts.length; i++) ctx.lineTo(verts[i].x, verts[i].y);
    //       ctx.closePath();
    //       ctx.fillStyle = body.renderColor || "gray";
    //       ctx.fill();

    //       // Stroke
    //       ctx.lineWidth = 2;
    //       ctx.strokeStyle = "#fff";
    //       ctx.stroke();

    //       // ⚡ کالیدر ستاره
    //       if (isStar && showStarColliders) {
    //         ctx.beginPath();
    //         ctx.moveTo(verts[0].x, verts[0].y);
    //         for (let i = 1; i < verts.length; i++) ctx.lineTo(verts[i].x, verts[i].y);
    //         ctx.closePath();
    //         ctx.strokeStyle = "#18ed09";
    //         ctx.lineWidth = 2;
    //         ctx.stroke();
    //       }
    //     }


    //   }

    //   // اگر SVG باشه
    //   if (!isCircle && body.renderSvg) {
    //     const r = body.fixtureRadius * SCALE || 50;
    //     ctx.drawImage(body._img, -r, -r, r * 2, r * 2);
    //   }

    //   ctx.restore();
    // }





    

    // // ====================
    // // Generate Shape Example
    // // ====================
    // function tryGenerateShape() {
    //   const offset = 60;
    //   let sx, sy;
    //   let r;

    //   // فقط دو نوع شکل: 0 = دایره ، 3 = ستاره
    //   const shapeTypes = [0, 3];
    //   const shapeType = shapeTypes[Math.floor(Math.random() * shapeTypes.length)];

    //   // تعیین اندازه
    //   switch (shapeType) {
    //     case 0: r = window.circleRadius || 50; break; // دایره
    //     // case 3: r = window.starRadius || 50; break;   // ستاره
    //     // case 1: r = window.squareSize / 2 || 50; break; // ⛔️ غیرفعال
    //     // case 2: r = window.squareSize / 2 || 50; break; // ⛔️ غیرفعال
    //     // case 4: r = 40; break;                         // ⛔️ غیرفعال
    //     // case 5: r = 40; break;                         // ⛔️ غیرفعال
    //   }

    //   function isFreePosition(x, y, radius) {
    //     for (const b of shapes) {
    //       const pos = b.getPosition();
    //       const br = b.fixtureRadius || 50;
    //       const dx = pos.x - x;
    //       const dy = pos.y - y;
    //       const dist = Math.sqrt(dx * dx + dy * dy);
    //       if (dist < br + radius + 5) return false;
    //     }
    //     return true;
    //   }

    //   let attempts = 0;
    //   const maxAttempts = 30;
    //   do {
    //     const side = getRandomSide();
    //     if (side === "left") { sx = -offset; sy = Math.random() * canvas.height; }
    //     else if (side === "right") { sx = canvas.width + offset; sy = Math.random() * canvas.height; }
    //     else if (side === "top") { sx = Math.random() * canvas.width; sy = -offset; }
    //     else { sx = Math.random() * canvas.width; sy = canvas.height + offset; }
    //     attempts++;
    //   } while (!isFreePosition(sx, sy, r) && attempts < maxAttempts);

    //   const vel = makeVelocity(sx, sy);
    //   vel.vx *= 0.6;
    //   vel.vy *= 0.6;

    //   const color = randomColor();
    //   let body;

    //   switch (shapeType) {
    //     case 0: // دایره
    //       body = createPhysicsShape(sx, sy, svgmaker.mkCircle, { fill: color, stroke: "#fff", outlinePx: 6, radius: r });
    //       break;

    //     // case 1: // ⛔️ مربع غیرفعال
    //     //   body = createPhysicsShape(sx, sy, svgmaker.mkSquare, { fill: color, stroke: "#fff", outlinePx: 6, radius: r });
    //     //   break;

    //     // case 2: // ⛔️ مثلث غیرفعال
    //     //   body = createPhysicsShape(sx, sy, svgmaker.mkTriangle, { fill: color, stroke: "#fff", outlinePx: 6, radius: r });
    //     //   break;

    //     // case 3: // ستاره
    //     //   const starSVG = starSVGTemplate.replace("{color}", color);
    //     //    body = createPhysicsShapeFromSVG(sx, sy, starSVG, { scale: 0.5, radius: r, type: "starShape", fill: color });


    //     //   break;


    //     // case 4: // ⛔️ چندضلعی منتظم غیرفعال
    //     //   body = createPhysicsShape(sx, sy, svgmaker.mkRegularPolygon, { fill: color, stroke: "#fff", outlinePx: 6, radius: r }, 5);
    //     //   break;

    //     // case 5: // ⛔️ گلیف غیرفعال
    //     //   const chars = "ABCDE12345";
    //     //   const ch = chars[Math.floor(Math.random() * chars.length)];
    //     //   body = createPhysicsShape(sx, sy, svgmaker.mkGlyph, { fill: color, stroke: "#fff", outlinePx: 6, radius: r }, ch);
    //     //   break;
    //   }

    //   if (!body) return null;

    //   body.setLinearVelocity(pl.Vec2(vel.vx, vel.vy));
    //   shapeCounter++;
    //   shapes.push(body);
    //   totalShapes++;
    //   remainedShapes++;

    //   return body;
    // }



   function loop(now) {
  if (!started) return;

  const dt = Math.min(0.09, (now - last) / 1000);
  last = now;

  world.step(dt);

  const currentTime = performance.now() / 1000;

  // بررسی راند جدید
  if (currentTime - lastRoundTime >= window.roundTime) {
    round++;
    lastRoundTime = currentTime;
    generateShapesWithDelay(window.MAX_SHAPES, 300);
  }

  // هندل دیوار برای همه شکل‌ها
  for (const shape of shapes) {
    handleWalls(shape.body);   // ✅
  }

  // فعال شدن دیوار وقتی اولین شکل وارد صفحه شد
  if (!wallsActive && shapes.some(s => {
    const pos = s.body.getPosition();   // ✅
    return pos.x > 0 && pos.x < canvas.width && pos.y > 0 && pos.y < canvas.height;
  })) {
    wallsActive = true;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // رسم همه شکل‌ها
  for (const shape of shapes) {
    shape.draw(ctx);           // ✅
  }

  // دیوارها
  if (wallsActive) {
    drawWalls();
  }

  // حذف شکل‌هایی که باید برن بیرون
  for (let i = shapes.length - 1; i >= 0; i--) {
    if (shapes[i]._remove) {
      removeShape(shapes[i]);  // ✅ اینجا removeShape انتظار Shape می‌گیره
    }
  }

  // HUD
  hud.textContent =
    `Time: ${Math.floor(currentTime)}s · Round: ${round} · Shapes: ${totalShapes} · Remained: ${remainedShapes}`;

  requestAnimationFrame(loop);
}




    function startGame() {
      shapes = [];
      totalShapes = 0;
      remainedShapes = 0;
      shapeCounter = 0;
      started = true;
      last = performance.now();
      lastRoundTime = performance.now() / 1000;
      generateShapesWithDelay(window.MAX_SHAPES, 300);
      requestAnimationFrame(loop);
    }
 