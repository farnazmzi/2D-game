function handleWalls(body) {
  if (!wallsActive) return;

  const pos = body.getPosition(); 
  const vel = body.getLinearVelocity();
  const r = body.fixtureRadius ? body.fixtureRadius : 50; 
  const px = pos.x * SCALE; 
  const py = pos.y * SCALE;

  if (body.wallBounces === undefined) body.wallBounces = 0;

  if (body.wallBounces < maxWallBounces) {
    let bounced = false;

    if (px - r < 0 && vel.x < 0) {
      body.setLinearVelocity(pl.Vec2(-vel.x, vel.y));
      bounced = true;
    }
    if (px + r > canvas.width && vel.x > 0) {
      body.setLinearVelocity(pl.Vec2(-vel.x, vel.y));
      bounced = true;
    }
    if (py - r < 0 && vel.y < 0) {
      body.setLinearVelocity(pl.Vec2(vel.x, -vel.y));
      bounced = true;
    }
    if (py + r > canvas.height && vel.y > 0) {
      body.setLinearVelocity(pl.Vec2(vel.x, -vel.y));
      bounced = true;
    }

    if (bounced) body.wallBounces++;
  } else {
    const marginX = canvas.width * 0.2;
    const marginY = canvas.height * 0.2;
    if (px < -marginX || px > canvas.width + marginX ||
        py < -marginY || py > canvas.height + marginY) {
      body._remove = true;
    }
  }
}

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

  ctx.fillStyle = gradTop;
  ctx.fillRect(0, 0, canvas.width, thickness);

  ctx.fillStyle = gradBottom;
  ctx.fillRect(0, canvas.height - thickness, canvas.width, thickness);

  ctx.fillStyle = gradLeft;
  ctx.fillRect(0, 0, thickness, canvas.height);

  ctx.fillStyle = gradRight;
  ctx.fillRect(canvas.width - thickness, 0, thickness, canvas.height);
}
