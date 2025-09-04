function handleWalls(shape) {
  if (!wallsActive) return;

  // دریافت نقاط کالیدر
  let corners = [];
  if (shape.name === 'Star') {
    corners = getStarCorners(shape); // همه نقاط ستاره
  } else if (shape.name === 'Square') {
    corners = getSquareCorners(shape);
  } else if (shape.name === 'Triangle') {
    corners = getTriangleCorners(shape);
  } else if (shape.radius) {
    corners = [
      { x: shape.x - shape.radius, y: shape.y - shape.radius },
      { x: shape.x + shape.radius, y: shape.y + shape.radius }
    ];
  }

  const left = 0;
  const right = canvas.width;
  const top = 0;
  const bottom = canvas.height;

  let bounced = false;

  // بررسی برخورد با هر دیوار
  for (const c of corners) {
    // چپ
    if (c.x < left && shape.vx < 0) {
      shape.vx = Math.abs(shape.vx);
      bounced = true;
    }
    // راست
    if (c.x > right && shape.vx > 0) {
      shape.vx = -Math.abs(shape.vx);
      bounced = true;
    }
    // بالا
    if (c.y < top && shape.vy < 0) {
      shape.vy = Math.abs(shape.vy);
      bounced = true;
    }
    // پایین
    if (c.y > bottom && shape.vy > 0) {
      shape.vy = -Math.abs(shape.vy);
      bounced = true;
    }
  }

  if (bounced) {
    shape.wallBounces = (shape.wallBounces || 0) + 1;
    // چرخش جزئی روی برخورد
    shape.angVel += (Math.random() - 0.5) * 0.2; 
    // جابجایی کل شکل برای خارج کردن نقاط از دیوار
    shape.x = Math.max(shape.x, shape.radius || 0);
    shape.x = Math.min(shape.x, canvas.width - (shape.radius || 0));
    shape.y = Math.max(shape.y, shape.radius || 0);
    shape.y = Math.min(shape.y, canvas.height - (shape.radius || 0));
  }
}

      //------exit permission


    
    function drawWalls() {
      const thickness = 3; // ضخامت دیوار

      // تعریف رنگ‌ها
      const colors = ['purple', 'green', 'blue', 'lightgray', '#004080', '#f36ddb', 'red'];

      // گرادینت بالا
      let gradTop = ctx.createLinearGradient(0, 0, canvas.width, 0);
      colors.forEach((c, i) => gradTop.addColorStop(i / (colors.length - 1), c));

      // گرادینت پایین
      let gradBottom = ctx.createLinearGradient(0, canvas.height, canvas.width, canvas.height);
      colors.forEach((c, i) => gradBottom.addColorStop(i / (colors.length - 1), c));

      // گرادینت چپ
      let gradLeft = ctx.createLinearGradient(0, 0, 0, canvas.height);
      colors.forEach((c, i) => gradLeft.addColorStop(i / (colors.length - 1), c));

      // گرادینت راست
      let gradRight = ctx.createLinearGradient(canvas.width, 0, canvas.width, canvas.height);
      colors.forEach((c, i) => gradRight.addColorStop(i / (colors.length - 1), c));

      // رسم دیوارها
      ctx.fillStyle = gradTop;
      ctx.fillRect(0, 0, canvas.width, thickness);

      ctx.fillStyle = gradBottom;
      ctx.fillRect(0, canvas.height - thickness, canvas.width, thickness);

      ctx.fillStyle = gradLeft;
      ctx.fillRect(0, 0, thickness, canvas.height);

      ctx.fillStyle = gradRight;
      ctx.fillRect(canvas.width - thickness, 0, thickness, canvas.height);
    }
