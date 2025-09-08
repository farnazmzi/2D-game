
function drawWalls() {
  const thickness = 3;
  const colors = ['purple', '#996dffff', 'lightgray', '#004080', '#f36ddb'];

  let gradTop = ctx.createLinearGradient(0, 0, canvas.width, 0);
  colors.forEach((c, i) => gradTop.addColorStop(i / (colors.length - 1), c));

  let gradBottom = ctx.createLinearGradient(0, canvas.height, canvas.width, canvas.height);
  colors.forEach((c, i) => gradBottom.addColorStop(i / (colors.length - 1), c));

  let gradLeft = ctx.createLinearGradient(0, 0, 0, canvas.height);
  colors.forEach((c, i) => gradLeft.addColorStop(i / (colors.length - 1), c));

  let gradRight = ctx.createLinearGradient(canvas.width, 0, canvas.width, canvas.height);
  colors.forEach((c, i) => gradRight.addColorStop(i / (colors.length - 1), c));

  ctx.fillStyle = gradTop; ctx.fillRect(0, 0, canvas.width, thickness);
  ctx.fillStyle = gradBottom; ctx.fillRect(0, canvas.height - thickness, canvas.width, thickness);
  ctx.fillStyle = gradLeft; ctx.fillRect(0, 0, thickness, canvas.height);
  ctx.fillStyle = gradRight; ctx.fillRect(canvas.width - thickness, 0, thickness, canvas.height);
}

function handleWalls(body) {
  if (!wallActive) return;

  if (body.wallBounces === undefined) body.wallBounces = 0;
  if (body.maxWallBounces === undefined) body.maxWallBounces = window.maxWallBounces;
  if (body.hitMaxBounces === undefined) body.hitMaxBounces = false;
  if (body.outOfBounds === undefined) body.outOfBounds = false;

  let vx = body.velocity.x;
  let vy = body.velocity.y;
  let hitWall = false;

  const margin = 3; // همون ضخامت دیوار

  if (!body.hitMaxBounces) {
    // کالیدر رو بگیر (اگه وجود داشت) وگرنه به fallback دایره برگرد
    let colliderPoints = body.svgShape && body.svgShape.getColliderPoints
      ? body.svgShape.getColliderPoints()
      : [{x: body.position.x, y: body.position.y}]; 

    for (let p of colliderPoints) {
      if (p.x < margin && vx < 0) { vx = Math.abs(vx); hitWall = true; }
      if (p.x > canvas.width - margin && vx > 0) { vx = -Math.abs(vx); hitWall = true; }
      if (p.y < margin && vy < 0) { vy = Math.abs(vy); hitWall = true; }
      if (p.y > canvas.height - margin && vy > 0) { vy = -Math.abs(vy); hitWall = true; }
    }

    if (hitWall) {
      Matter.Body.setVelocity(body, { x: vx, y: vy });
      body.wallBounces++;
      if (body.svgShape) {
        body.svgShape.wallBounces = body.wallBounces;
      }
    }

    if (body.wallBounces >= body.maxWallBounces) {
      body.hitMaxBounces = true;
    }
  }

  const marginX = canvas.width * 0.22;
  const marginY = canvas.height * 0.22;
  if (body.hitMaxBounces) {
    if (body.position.x < -marginX || body.position.x > canvas.width + marginX ||
        body.position.y < -marginY || body.position.y > canvas.height + marginY) {
      body.outOfBounds = true;
    }
  }
}
