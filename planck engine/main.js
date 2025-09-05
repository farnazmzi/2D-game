

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
    let wallsActive = false;

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
        controlPanel.style.display = 'block'; 
      } else {
        controlPanel.style.display = 'none';
      }
    });



    function createPhysicsShapeFromSVG(x, y, svgString, opts = {}) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(svgString, "image/svg+xml");
      const polygons = [...doc.querySelectorAll('polygon, polyline')];

      const body = world.createDynamicBody({
        position: pl.Vec2(x, y),
        angularDamping: 0.1,
        linearDamping: 0.01
      });

      const radius = opts.radius || 50;

      const scaleFactor = radius / 50;

      polygons.forEach(p => {
        const points = p.getAttribute('points').trim().split(/\s+/).map(pt => {
          const [px, py] = pt.split(',').map(Number);
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

      const img = new Image();
      const svg64 = btoa(unescape(encodeURIComponent(svgString)));
      img.src = "data:image/svg+xml;base64," + svg64;

      body._img = img;
      body.renderSvg = svgString;
      body.renderColor = opts.fill || 'gray';
      body.fixtureRadius = radius;
      return body;
    }


    function createStarFixture(body, outerR, innerR, spikes = 5) {
      const step = Math.PI / spikes;

      for (let i = 0; i < spikes; i++) {
        const angle = i * 2 * step - Math.PI / 2;
        const angleNext = (i * 2 + 2) * step - Math.PI / 2;

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

    svgmaker.mkCircle = svgmaker.mkCircle.bind(svgmaker);
    svgmaker.mkSquare = svgmaker.mkSquare.bind(svgmaker);
    svgmaker.mkTriangle = svgmaker.mkTriangle.bind(svgmaker);
    svgmaker.mkRectangle = svgmaker.mkRectangle.bind(svgmaker);
    svgmaker.mkDiamond = svgmaker.mkDiamond.bind(svgmaker);
    svgmaker.mkRegularPolygon = svgmaker.mkRegularPolygon.bind(svgmaker);
    svgmaker.mkGlyph = svgmaker.mkGlyph.bind(svgmaker);


   function loop(now) {
  if (!started) return;

  const dt = Math.min(0.09, (now - last) / 1000);
  last = now;

  world.step(dt);

  const currentTime = performance.now() / 1000;

  if (currentTime - lastRoundTime >= window.roundTime) {
    round++;
    lastRoundTime = currentTime;
    generateShapesWithDelay(window.MAX_SHAPES, 300);
  }

  for (const shape of shapes) {
    handleWalls(shape.body);  
  }

  if (!wallsActive && shapes.some(s => {
    const pos = s.body.getPosition();  
    return pos.x > 0 && pos.x < canvas.width && pos.y > 0 && pos.y < canvas.height;
  })) {
    wallsActive = true;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (const shape of shapes) {
    shape.draw(ctx);         
  }

  if (wallsActive) {
    drawWalls();
  }

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
 