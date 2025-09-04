// window.maxWallBounces = 3;

// const thickness = 1; // ضخیم‌تر تا برخورد طبیعی باشه
// const wallOptions = { isStatic: true, label: 'Wall', render: { visible: false } };

// // const walls = [
// //   Bodies.rectangle(canvas.width/2, 0, canvas.width, thickness, wallOptions), // بالا
// //   Bodies.rectangle(canvas.width/2, canvas.height, canvas.width, thickness, wallOptions), // پایین
// //   Bodies.rectangle(0, canvas.height/2, thickness, canvas.height, wallOptions), // چپ
// //   Bodies.rectangle(canvas.width, canvas.height/2, thickness, canvas.height, wallOptions) // راست
// // ];

// // World.add(world, walls);


// // // شمارش برخوردها
// // Matter.Events.on(engine, 'collisionStart', function(event) {
// //   event.pairs.forEach(pair => {
// //     let shapeBody, wallBody;

// //     if (pair.bodyA.label === 'Wall') {
// //       wallBody = pair.bodyA;
// //       shapeBody = pair.bodyB;
// //     } else if (pair.bodyB.label === 'Wall') {
// //       wallBody = pair.bodyB;
// //       shapeBody = pair.bodyA;
// //     } else {
// //       return;
// //     }

// //     if (!shapeBody.svgStar) return; // فقط ستاره‌ها
// //     shapeBody.svgStar.wallBounces = (shapeBody.svgStar.wallBounces || 0) + 1;

// //     // چرخش جزئی بعد از برخورد
// //     Body.setAngularVelocity(shapeBody, shapeBody.angularVelocity + (Math.random() - 0.5) * 0.2);
// //   });
// // });
// function drawWalls() {
//   // const thickness = 3;
//   // const colors = ['purple', 'green', 'blue', 'lightgray', '#004080', '#f36ddb', 'red'];

//   // let gradTop = ctx.createLinearGradient(0, 0, canvas.width, 0);
//   // colors.forEach((c,i)=>gradTop.addColorStop(i/(colors.length-1),c));

//   // let gradBottom = ctx.createLinearGradient(0, canvas.height, canvas.width, canvas.height);
//   // colors.forEach((c,i)=>gradBottom.addColorStop(i/(colors.length-1),c));

//   // let gradLeft = ctx.createLinearGradient(0,0,0,canvas.height);
//   // colors.forEach((c,i)=>gradLeft.addColorStop(i/(colors.length-1),c));

//   // let gradRight = ctx.createLinearGradient(canvas.width,0,canvas.width,canvas.height);
//   // colors.forEach((c,i)=>gradRight.addColorStop(i/(colors.length-1),c));

//   // ctx.fillStyle = gradTop; ctx.fillRect(0,0,canvas.width,thickness);
//   // ctx.fillStyle = gradBottom; ctx.fillRect(0,canvas.height-thickness,canvas.width,thickness);
//   // ctx.fillStyle = gradLeft; ctx.fillRect(0,0,thickness,canvas.height);
//   // ctx.fillStyle = gradRight; ctx.fillRect(canvas.width-thickness,0,thickness,canvas.height);
// }
