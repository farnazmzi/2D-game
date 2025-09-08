
    
    function getSvgLetterCorners(svg) {
      const angle = svg.angle || 0;
      const c = Math.cos(angle);
      const s = Math.sin(angle);

      const w = (svg.width ?? 80);
      const h = (svg.height ?? 80);

      const strokeWidth = svg.strokeWidth || 0;     
      const outlinePx = svg.outlinePx || 0;     
      const strokeAlign = svg.strokeAlign || 'center'; // 'center' | 'inner' | 'outer'
      const lineJoin = svg.strokeLinejoin || 'miter'; // 'miter' | 'round' | 'bevel'
      const miterLimit = Math.max(1, svg.miterLimit || 4);

     let outward = 0;
      const totalStroke = strokeWidth + outlinePx;

      if (strokeAlign === 'outer') {
        outward = totalStroke;
      } else if (strokeAlign === 'center') {
        outward = totalStroke * 0.5;
      } else /* inner */ {
        outward = 0;
      }
      if (lineJoin === 'miter' && totalStroke > 0) {
        const half = totalStroke * (strokeAlign === 'outer' ? 1 : 0.5);
        const extra = (miterLimit - 1) * half;
        outward = Math.max(outward, half + extra);
      }

      const hw = w * 0.5 + outward;
      const hh = h * 0.5 + outward;

      const pts = [
        { x: -hw, y: -hh }, { x: hw, y: -hh },
        { x: hw, y: hh }, { x: -hw, y: hh }
      ];

      return pts.map(p => ({
        x: svg.x + p.x * c - p.y * s,
        y: svg.y + p.x * s + p.y * c
      }));
    }

    function getSquareCorners(s) {
      const half = s.size / 2 + s.strokeWidth - 3;
      const corners = [
        { x: -half, y: -half }, { x: half, y: -half }, { x: half, y: half }, { x: -half, y: half }
      ];
      return corners.map(c => {
        const cos = Math.cos(s.angle), sin = Math.sin(s.angle);
        return { x: s.x + c.x * cos - c.y * sin, y: s.y + c.x * sin + c.y * cos };
      });
    }

    function getAxes(corners) {
      const axes = [];
      for (let i = 0; i < corners.length; i++) {
        const p1 = corners[i], p2 = corners[(i + 1) % corners.length];
        const edge = { x: p2.x - p1.x, y: p2.y - p1.y };
        const normal = { x: -edge.y, y: edge.x };
        const len = Math.hypot(normal.x, normal.y) || 1;
        axes.push({ x: normal.x / len, y: normal.y / len });
      }
      return axes;
    }

    function projectCorners(corners, axis) {
      let min = Infinity, max = -Infinity;
      for (const c of corners) {
        const p = c.x * axis.x + c.y * axis.y;
        if (p < min) min = p;
        if (p > max) max = p;
      }
      return [min, max];
    }

    function getClosestPointOnRotatedSquare(circle, square) {
      const corners = getSquareCorners(square);
      const cx = circle.x, cy = circle.y;
      let closest = { x: cx, y: cy };
      let minDist = Infinity;
      for (const c of corners) {
        const dx = cx - c.x, dy = cy - c.y;
        const d = Math.hypot(dx, dy);
        if (d < minDist) { minDist = d; closest = c; }
      }
      return closest;
    }
    function getStarCorners(star) {
      const corners = [];
      const step = Math.PI / star.spikes;
      const strokePadding = (star.lineWidth || 2) / 2; 

      for (let i = 0; i < star.spikes * 2; i++) {
        const r = (i % 2 === 0 ? star.radius : star.radius / 2) + strokePadding + 4;
        const a = star.angle + i * step;
        corners.push({
          x: star.x + r * Math.cos(a),
          y: star.y + r * Math.sin(a)
        });
      }
      return corners;
    }
    function getClosestPointOnStar(circle, star) {
      const corners = getStarCorners(star);
      let closestPoint = null;
      let minDistSq = Infinity;

      for (let i = 0; i < corners.length; i++) {
        const a = corners[i];
        const b = corners[(i + 1) % corners.length];

        const t = Math.max(0, Math.min(1, ((circle.x - a.x) * (b.x - a.x) + (circle.y - a.y) * (b.y - a.y)) /
          ((b.x - a.x) * (b.x - a.x) + (b.y - a.y) * (b.y - a.y))));
        const px = a.x + t * (b.x - a.x);
        const py = a.y + t * (b.y - a.y);

        const distSq = (circle.x - px) ** 2 + (circle.y - py) ** 2;
        if (distSq < minDistSq) {
          minDistSq = distSq;
          closestPoint = { x: px, y: py };
        }
      }

      return closestPoint;
    }

    //----like Planck-like approximation
    // === helpers for impulse solver ===
    const massCache = new WeakMap();
    const inertiaCache = new WeakMap();
    function invalidateMassCache() { massCache.clear?.(); inertiaCache.clear?.(); } // call when shapes added/removed

    function computeMassAndInertia(s) {
      if (s.type === "Circle") {
        const r = s.radiusWithStroke || s.radius || 1;
        const m = Math.PI * r * r;
        const I = 0.5 * m * r * r;
        return { m, I };
      } else if (s.type === "Square") {
        const w = s.size || ((s.radiusWithStroke || 0) * Math.SQRT2);
        const m = w * w;
        const I = (1 / 6) * m * w * w;
        return { m, I };
      } else if (s.type === "Star") {
        const r = (s.radiusWithStroke || s.radius || 1);
        const m = Math.PI * r * r * 0.85;
        const I = 0.5 * m * r * r;
        return { m, I };
      } else {
        return { m: 1, I: 1 };
      }
    }
    function getMass(s) { if (!massCache.has(s)) massCache.set(s, computeMassAndInertia(s).m); return massCache.get(s); }
    function getInertia(s) { if (!inertiaCache.has(s)) inertiaCache.set(s, computeMassAndInertia(s).I); return inertiaCache.get(s); }

    function dot(a, b) { return a.x * b.x + a.y * b.y; }
    function mul(v, k) { return { x: v.x * k, y: v.y * k }; }
    function sub(a, b) { return { x: a.x - b.x, y: a.y - b.y }; }
    function add(a, b) { return { x: a.x + b.x, y: a.y + b.y }; }
    function len(v) { return Math.hypot(v.x, v.y); }

    // fallback for getClosestPointOnRotatedSquare if not present:
    function fallbackClosestPointOnPoly(point, corners) {
      // choose nearest point on polygon vertices (simple fallback)
      let best = corners[0], dmin = Infinity;
      for (const c of corners) {
        const d = (point.x - c.x) * (point.x - c.x) + (point.y - c.y) * (point.y - c.y);
        if (d < dmin) { dmin = d; best = c; }
      }
      return best;
    }

    function positionalCorrection(A, B, normal, penetration) {
      const percent = 0.2, slop = 0.01;
      const pen = Math.max(penetration - slop, 0);
      if (pen <= 0) return;
      const invMassA = 1 / getMass(A), invMassB = 1 / getMass(B);
      const corrMag = pen / (invMassA + invMassB) * percent;
      const corr = { x: normal.x * corrMag, y: normal.y * corrMag };
      A.x -= corr.x * invMassA;
      A.y -= corr.y * invMassA;
      B.x += corr.x * invMassB;
      B.y += corr.y * invMassB;
    }

    // velocity at point p (world) considering angular vel (angVel)
    function velocityAtPoint(s, px, py) {
      const vx = s.vx || 0, vy = s.vy || 0, w = s.angVel || 0;
      const rx = px - s.x, ry = py - s.y;
      // ω × r => (-w * ry, w * rx)
      return { x: vx + (-w * ry), y: vy + (w * rx) };
    }

    // === main impulse resolver ===
    function resolveCollisions() {
      const ITER = 5;

      for (let it = 0; it < ITER; it++) {
        for (let i = 0; i < shapes.length; i++) {
          const A = shapes[i];
          for (let j = i + 1; j < shapes.length; j++) {
            const B = shapes[j];

            let normal = null, penetration = 0, contactPoint = null;
            // 1) Circle-Circle
            if (A.type === "Circle" && B.type === "Circle") {
              const dx = B.x - A.x;
              const dy = B.y - A.y;
              const d = Math.hypot(dx, dy) || 1e-6;
              const sumR = A.radiusWithStroke + B.radiusWithStroke - 7;

              if (d < sumR) {
                normal = { x: dx / d, y: dy / d };
                penetration = sumR - d;

                const correctionX = normal.x * penetration * 0.5;
                const correctionY = normal.y * penetration * 0.5;
                A.x -= correctionX;
                A.y -= correctionY;
                B.x += correctionX;
                B.y += correctionY;

                contactPoint = {
                  x: (A.x + B.x) / 2,
                  y: (A.y + B.y) / 2
                };
              } else continue;
            }

            else if ((A.type === "Square" || A.type === "Star") && (B.type === "Square" || B.type === "Star")) {
              const cornersA = (A.type === "Square") ? getSquareCorners(A) : getStarCorners(A);
              const cornersB = (B.type === "Square") ? getSquareCorners(B) : getStarCorners(B);

              const axes = [...getAxes(cornersA), ...getAxes(cornersB)];

              let minPenetration = Infinity;
              let bestAxis = null;
              let contactPoints = [];

              for (const axis of axes) {
                const [minA, maxA] = projectCorners(cornersA, axis);
                const [minB, maxB] = projectCorners(cornersB, axis);

                const overlap = Math.min(maxA, maxB) - Math.max(minA, minB);

                if (overlap <= 0) {
                  minPenetration = 0;
                  break; 
                }

                if (overlap < minPenetration) {
                  minPenetration = overlap;
                  bestAxis = axis;

                  contactPoints = [];
                  for (const pA of cornersA) {
                    const proj = pA.x * axis.x + pA.y * axis.y;
                    if (proj >= Math.max(minB, minA) && proj <= Math.min(maxB, maxA)) {
                      contactPoints.push({ x: pA.x, y: pA.y });
                    }
                  }
                  for (const pB of cornersB) {
                    const proj = pB.x * axis.x + pB.y * axis.y;
                    if (proj >= Math.max(minA, minB) && proj <= Math.min(maxA, maxB)) {
                      contactPoints.push({ x: pB.x, y: pB.y });
                    }
                  }
                }
              }

              if (minPenetration > 0 && bestAxis) {
                normal = { ...bestAxis };
                penetration = minPenetration;

                if (contactPoints.length) {
                  let cx = 0, cy = 0;
                  contactPoints.forEach(p => { cx += p.x; cy += p.y; });
                  contactPoint = { x: cx / contactPoints.length, y: cy / contactPoints.length };
                } else {
                  contactPoint = { x: (A.x + B.x) / 2, y: (A.y + B.y) / 2 };
                }

                const AB = { x: B.x - A.x, y: B.y - A.y };
                if (dot(normal, AB) < 0) { normal.x *= -1; normal.y *= -1; }
              } else continue;
            }



            // 3b) Circle-Square
            else if ((A.type === "Circle" && B.type === "Square") || (B.type === "Circle" && A.type === "Square")) {
              let circle = (A.type === "Circle") ? A : B;
              let square = (A.type === "Square") ? A : B;

              const corners = getSquareCorners(square);
              const axes = getAxes(corners);

              let closest = (typeof getClosestPointOnRotatedSquare === "function")
                ? getClosestPointOnRotatedSquare(circle, square)
                : fallbackClosestPointOnPoly({ x: circle.x, y: circle.y }, corners);

              axes.push({ x: circle.x - closest.x, y: circle.y - closest.y });

              let minPenetration = Infinity;
              let bestAxis = null;

              for (const axis of axes) {
                const lenA = Math.hypot(axis.x, axis.y) || 1;
                const unit = { x: axis.x / lenA, y: axis.y / lenA };

                const [minP, maxP] = projectCorners(corners, unit);

                const projC = circle.x * unit.x + circle.y * unit.y;
                const minC = projC - circle.radiusWithStroke;
                const maxC = projC + circle.radiusWithStroke;

                const overlap = Math.min(maxP, maxC) - Math.max(minP, minC) - 4; 
                if (overlap <= 0) {
                  minPenetration = 0;
                  break;
                }
                if (overlap < minPenetration) {
                  minPenetration = overlap;
                  bestAxis = unit;
                }
              }

              if (minPenetration > 0 && bestAxis) {
                normal = { ...bestAxis };
                penetration = minPenetration;
                contactPoint = { ...closest };

                const AB = { x: square.x - circle.x, y: square.y - circle.y };
                if (dot(normal, AB) < 0) { normal.x *= -1; normal.y *= -1; }
              } else continue;
            }



            // 3) Circle-Poly (Circle-Square or Circle-Star)
            else if ((A.type === "Circle" && B.type === "Star") ||
              (B.type === "Circle" && A.type === "Star")) {

              let circle = (A.type === "Circle") ? A : B;
              let poly = (A.type === "Circle") ? B : A;
              const corners = (poly.type === "Square") ? getSquareCorners(poly) : getStarCorners(poly);
              const axes = getAxes(corners);

              let closest;
              if (poly.type === "Square") {
                closest = (typeof getClosestPointOnRotatedSquare === "function")
                  ? getClosestPointOnRotatedSquare(circle, poly)
                  : fallbackClosestPointOnPoly({ x: circle.x, y: circle.y }, corners);
              } else {
                closest = getClosestPointOnStar(circle, poly);
              }

              axes.push({ x: circle.x - closest.x, y: circle.y - closest.y });

              let oMin = Infinity, bestAxis = null;
              for (const axis of axes) {
                const lenA = Math.hypot(axis.x, axis.y) || 1;
                const unit = { x: axis.x / lenA, y: axis.y / lenA };
                const [minP, maxP] = projectCorners(corners, unit);
                const projC = circle.x * unit.x + circle.y * unit.y;
                const minC = projC - circle.radiusWithStroke;
                const maxC = projC + circle.radiusWithStroke;

                let margin = 0;
                if (poly.type === "Star" && circle.type === "Circle" && ((poly.type === "Star" && circle.type === "Circle"))) {
                  margin = 0; 
                }

                const o = Math.min(maxP + margin, maxC) - Math.max(minP - margin, minC);
                if (o <= 0) { oMin = 0; break; }
                if (o < oMin) { oMin = o; bestAxis = unit; }
              }

              if (oMin > 0 && bestAxis) {
                normal = bestAxis;
                penetration = oMin;
                contactPoint = closest;
              } else continue;
            }

            // Ensure normal points from A to B



            const AB = { x: B.x - A.x, y: B.y - A.y };
            if (dot(normal, AB) < 0) { normal.x *= -1; normal.y *= -1; }

            // Positional correction
            positionalCorrection(A, B, normal, penetration);

            // Contact geometry
            const cp = contactPoint || { x: (A.x + B.x) / 2, y: (A.y + B.y) / 2 };
            const ra = { x: cp.x - A.x, y: cp.y - A.y };
            const rb = { x: cp.x - B.x, y: cp.y - B.y };

            // Relative velocity
            const va = velocityAtPoint(A, cp.x, cp.y);
            const vb = velocityAtPoint(B, cp.x, cp.y);
            const rv = { x: vb.x - va.x, y: vb.y - va.y };
            const relAlong = dot(rv, normal);
            if (relAlong > 0) continue;

            const e = Math.min((A.restitution || 0.9), (B.restitution || 0.9), 1);
            const raCrossN = ra.x * normal.y - ra.y * normal.x;
            const rbCrossN = rb.x * normal.y - rb.y * normal.x;
            const invMassSum = (1 / getMass(A)) + (1 / getMass(B)) + (raCrossN * raCrossN) / getInertia(A) + (rbCrossN * rbCrossN) / getInertia(B);

            const jImp = -(1 + e) * relAlong / invMassSum;
            const impulse = { x: normal.x * jImp, y: normal.y * jImp };

            // Apply linear impulses
            A.vx -= impulse.x / getMass(A);
            A.vy -= impulse.y / getMass(A);
            B.vx += impulse.x / getMass(B);
            B.vy += impulse.y / getMass(B);

            // Apply angular impulses
            A.angVel = (A.angVel || 0) - (ra.x * impulse.y - ra.y * impulse.x) / getInertia(A);
            B.angVel = (B.angVel || 0) + (rb.x * impulse.y - rb.y * impulse.x) / getInertia(B);
          }
        }
      }
    }



    function spawnVelocityTowardsCenter(SPEED) {
      const cx = canvas.width / 2, cy = canvas.height / 2;
      return (x, y) => {
        const dx = cx - x, dy = cy - y, d = Math.hypot(dx, dy) || 1;
        return { vx: dx / d * SPEED, vy: dy / d * SPEED };
      };
    }
    const makeVelocity = spawnVelocityTowardsCenter(SPEED);

    function cleanupAndSpawn() {
      for (let i = shapes.length - 1; i >= 0; i--) {
        const s = shapes[i];
        if (s.ageSeconds() >= MAX_LIFE && s.isOut()) {
          const side = s.entrySide || ['left', 'right', 'top', 'bottom'][Math.floor(Math.random() * 4)];
          shapes.splice(i, 1);
          if (shapes.length < MAX_SHAPES) shapes.push(tryGenerateShape(side, shapes));
        }
      }
    }

   
