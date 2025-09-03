
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = innerWidth;
    canvas.height = innerHeight;
    const hud = document.getElementById("hud");

    let started = false;
    let shapes = [];
    let last = performance.now();
    let globalSeconds = 0;
    setInterval(() => globalSeconds++, 1000);

    let round = 1;

    let lastRoundTime = performance.now() / 1000;


    let wallsActive = false;
    const BORDER = 7;
    let wallsStartTime = null; // زمان فعال شدن دیوارها
    const WALL_BLOCK_DURATION = 50; // ثانیه
    let lastSpawnSide = null;
    let hoveredShape = null;
    let showColliders = false;

    window.circleRadius = 70;
    window.squareSize = 80;
    window.starRadius = 35;
    window.MAX_SHAPES = 12;
    window.SPEED = 500;
    window.roundTime = 40;
    window.maxWallBounces = 3;

    function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
    window.addEventListener('resize', resize);
    resize();









function updatePhysics() {
  world.step(1/60); // 60fps
}



















    //collider


    const colliderBtn = document.getElementById('toggleCollider');
    colliderBtn.addEventListener('click', () => {
      showColliders = !showColliders;
    });


    function ensureInitial() {
      generateShapesWithDelay(MAX_SHAPES, 300);
    }

    // ===================== کلاس‌ها =====================


    // ===================== توابع کمکی =====================
    function getRandomSide() {
      const sides = ["left", "right", "top", "bottom"];
      return sides[Math.floor(Math.random() * sides.length)];
    }






    let shapeCounter = 0; // بیرون از تابع تعریف کن (global)

    function tryGenerateShape() {
      const side = getRandomSide();
      const offset = 0.8;
      let sx, sy;

      if (side === "left") {
        sx = -canvas.width * offset;
        sy = Math.random() * canvas.height;
      }
      else if (side === "right") {
        sx = canvas.width + canvas.width * offset;
        sy = Math.random() * canvas.height;
      }
      else if (side === "top") {
        sx = Math.random() * canvas.width;
        sy = -canvas.height * offset;
      }
      else {
        sx = Math.random() * canvas.width;
        sy = canvas.height + canvas.height * offset;
      }

      const vel = makeVelocity(sx, sy);

      let shape;
      if (shapeCounter % 3 === 0) {
        shape = new Circle(sx, sy, 7, vel.vx, vel.vy, side, 0.8);
      }
      else if (shapeCounter % 3 === 1) {
        shape = new Square(sx, sy, vel.vx, vel.vy, "#beafed", 7, side, 0.5);
      }
      else {
        shape = new Star(sx, sy, 5, vel.vx, vel.vy, 0, 7, "yellow", "orange", side, 0.5);
      }

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

    // ===================== حلقه اصلی =====================
    function loop(now) {
      if (!started) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      const currentTime = performance.now() / 1000;
      // --- بررسی راند ---
      if (currentTime - lastRoundTime >= roundTime) {
        round++;
        lastRoundTime = currentTime;
        // با هر راند جدید، دوباره اشکال تولید کن

        generateShapesWithDelay(MAX_SHAPES, 300);
        //delay 

      }
      if (hoveredShape) {
        drawDebugInfo();
      }
      //    if (shapes.length < MAX_SHAPES) {
      //   const sh = addShape();
      //   if (sh) shapes.push(sh);
      // }
      for (const s of shapes) {
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        s.angle += (s.angVel || 0) * dt;
        handleWalls(s);
      }

      resolveCollisions();

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const s of shapes) s.draw(ctx);

      for (let i = shapes.length - 1; i >= 0; i--) {
        if (shapes[i].remove) {
          removeShape(shapes[i]);
        }
      }
      if (!wallsActive && shapes.some(s => s.x > 0 && s.x < canvas.width && s.y > 0 && s.y < canvas.height)) {
        wallsActive = true;
      }
      if (wallsActive) drawWalls();
      hud.textContent = `Time: ${Math.floor(currentTime)}s · Round: ${round} · Shapes: ${totalShapes} · Remained: ${remainedShapes}`;
      requestAnimationFrame(loop);
    }


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





    function bindSlider(sliderId, valueId, variableName) {
      const slider = document.getElementById(sliderId);
      const valSpan = document.getElementById(valueId);

      // مقدار اولیه رو به span و متغیر global اختصاص بده
      valSpan.innerText = slider.value;
      window[variableName] = parseFloat(slider.value);

      // هر بار که اسلایدر تغییر کرد
      slider.addEventListener('input', () => {
        const newValue = parseFloat(slider.value);
        valSpan.innerText = newValue;        // بروزرسانی عدد نمایش داده شده
        window[variableName] = newValue;     // بروزرسانی متغیر global

        // فقط برای تست: چاپ همه متغیرهای اصلی
        console.log(
          "circleRadius =", circleRadius,
          "squareSize =", squareSize,
          "starRadius =", starRadius,
          "MAX_SHAPES =", MAX_SHAPES,
          "SPEED =", SPEED,
          "roundTime =", roundTime,
          "maxWallBounces =", maxWallBounces
        );
      });
    }

    bindSlider("circleRadiusSliderStart", "circleRadiusValStart", "circleRadius");
    bindSlider("squareSizeSliderStart", "squareSizeValStart", "squareSize");
    bindSlider("starRadiusSliderStart", "starRadiusValStart", "starRadius");
    bindSlider("maxShapesSliderStart", "maxShapesValStart", "MAX_SHAPES");
    bindSlider("speedSliderStart", "speedValStart", "SPEED");
    bindSlider("roundTimeSliderStart", "roundTimeValStart", "roundTime");
    bindSlider("maxWallBouncesSliderStart", "maxWallBouncesValStart", "maxWallBounces");




    function startGame() {

      ensureInitial();
      shapes = [];       // ← همه شکل‌های قدیمی پاک بشن
      totalShapes = 0;
      remainedShapes = 0;
      SPEED = 0;
      console.log("circleRadius=", circleRadius, "squareSize=", squareSize, "starRadius=", starRadius);

      // --- شروع حلقه ---
      started = true;
      last = performance.now();
      lastRoundTime = performance.now() / 1000; // ریست زمان راند

      requestAnimationFrame(loop);
    }


