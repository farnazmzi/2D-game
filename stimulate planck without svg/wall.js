 function handleWalls(shape) {
      if (!wallsActive) return;

      let corners = [];
      if (shape.radius) {
        const padding = 1; // یا حتی shape.borderWidth / 2
        corners = [
          { x: shape.x - (shape.radius + padding), y: shape.y - (shape.radius + padding) },
          { x: shape.x + (shape.radius + padding), y: shape.y + (shape.radius + padding) }
        ];
      }
      if (shape.name === 'Triangle') {
        const padding = 2;
        corners = getTriangleCorners(shape).map(c => ({
          x: c.x + (c.x < shape.x ? -padding : padding),
          y: c.y + (c.y < shape.y ? -padding : padding)
        }));
      }
      if (shape.name === 'Star') {
        const padding = 3;
        corners = getStarCorners(shape).map(c => ({
          x: c.x + (c.x < shape.x ? -padding : padding),
          y: c.y + (c.y < shape.y ? -padding : padding)
        }));
      

      // }
      if (shape.name === 'Square') {
        corners = getSquareCorners(shape);
      } 
    }
      // if (shape.type === 'Rectangle') {
      //   corners = getRectangleCorners(shape);
      // }

      // if (shape.type === 'SvgLetter') {
      //   corners = getSvgLetterCorners(shape);

      // }



      const left = shape.radiusWithStroke;
      const right = canvas.width - shape.radiusWithStroke;
      const top = shape.radiusWithStroke;
      const bottom = canvas.height - shape.radiusWithStroke;

      if (shape.inside === undefined) shape.inside = true;
      if (shape.wallBounces === undefined) shape.wallBounces = 0;
      if (shape.maxWallBounces === undefined) shape.maxWallBounces = maxWallBounces;

      // فقط وقتی کمتر از maxWallBounces هست، برگرداندن اعمال شود
      if (shape.wallBounces < shape.maxWallBounces) {
        let bounced = false;

        if (shape.x - shape.radiusWithStroke < 0 && shape.vx < 0) {
          shape.x = left;
          shape.vx = Math.abs(shape.vx);
          bounced = true;
        }

        if (shape.x + shape.radiusWithStroke > canvas.width && shape.vx > 0) {
          shape.x = right;
          shape.vx = -Math.abs(shape.vx);
          bounced = true;
        }

        if (shape.y - shape.radiusWithStroke < 0 && shape.vy < 0) {
          shape.y = top;
          shape.vy = Math.abs(shape.vy);
          bounced = true;
        }

        if (shape.y + shape.radiusWithStroke > canvas.height && shape.vy > 0) {
          shape.y = bottom;
          shape.vy = -Math.abs(shape.vy);
          bounced = true;
        }

        if (bounced) shape.wallBounces++;
      } else {
        // بعد از سه بونس، اجازه بده از صفحه خارج شود
        shape.inside = false;
        // حذف وقتی 20٪ از مرز خارج شد
        const marginX = canvas.width * 0.2;
        const marginY = canvas.height * 0.2;

        if (
          shape.x < -marginX || shape.x > canvas.width + marginX ||
          shape.y < -marginY || shape.y > canvas.height + marginY
        ) {
          shape.remove = true; // پرچم حذف
        }
      }

      //------exit permission


    }
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
