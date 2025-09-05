let wallBounces = -1; // متغیر عمومی

function drawWalls() {
  const thickness = 3;
  const colors = ['purple', 'green', 'blue', 'lightgray', '#004080', '#f36ddb', 'red'];

  let gradTop = ctx.createLinearGradient(0, 0, canvas.width, 0);
  colors.forEach((c, i) => gradTop.addColorStop(i / (colors.length - 1), c));

  let gradBottom = ctx.createLinearGradient(0, canvas.height, canvas.width, canvas.height);
  colors.forEach((c, i) => gradBottom.addColorStop(i / (colors.length - 1), c));

  let gradLeft = ctx.createLinearGradient(0, 0, 0, canvas.height);
  colors.forEach((c, i) => gradLeft.addColorStop(i / (colors.length - 1), c));

  let gradRight = ctx.createLinearGradient(canvas.width, 0, canvas.width, canvas.height);
  colors.forEach((c, i) => gradRight.addColorStop(i / (colors.length - 1), c));

  ctx.fillStyle = gradTop;    ctx.fillRect(0, 0, canvas.width, thickness);
  ctx.fillStyle = gradBottom; ctx.fillRect(0, canvas.height - thickness, canvas.width, thickness);
  ctx.fillStyle = gradLeft;   ctx.fillRect(0, 0, thickness, canvas.height);
  ctx.fillStyle = gradRight;  ctx.fillRect(canvas.width - thickness, 0, thickness, canvas.height);
}

function handleWalls(body) {
  if (!wallActive) return;

  const pos = body.position;  
  const vel = body.velocity;
  const r = body.circleRadius ? body.circleRadius : 20; // برای غیر دایره باید bbox حساب کنیم
  const px = pos.x;
  const py = pos.y;

  if (body.wallBounces === undefined) body.wallBounces = -1;
  if (body.maxWallBounces === undefined) body.maxWallBounces = maxWallBounces;

  // حالت آزاد (wallBounces = -1)
  if (body.wallBounces === -1) {
    if (
      px - r < 0 || px + r > canvas.width ||
      py - r < 0 || py + r > canvas.height
    ) {
      body.wallBounces = 0; // اولین ورود، دیوار فعال میشه
    }
    return;
  }

  if (body.wallBounces >= 0 && body.wallBounces < body.maxWallBounces) {
    let bounced = false;
    let vx = vel.x, vy = vel.y;

    if (px - r < 0 && vx < 0) { vx = Math.abs(vx); bounced = true; }
    if (px + r > canvas.width && vx > 0) { vx = -Math.abs(vx); bounced = true; }
    if (py - r < 0 && vy < 0) { vy = Math.abs(vy); bounced = true; }
    if (py + r > canvas.height && vy > 0) { vy = -Math.abs(vy); bounced = true; }

    if (bounced) {
      Matter.Body.setVelocity(body, { x: vx, y: vy });
      body.wallBounces++;
    }
  }

  if (body.wallBounces >= body.maxWallBounces) {
    body.wallBounces = -1; // دوباره آزاد بشه
  }

  // حذف وقتی خارج شد
  const marginX = canvas.width * 0.2;
  const marginY = canvas.height * 0.2;
  if (
    px < -marginX || px > canvas.width + marginX ||
    py < -marginY || py > canvas.height + marginY
  ) {
    body.remove = true;
  }
}
