




/* ------------------ generic polygon helpers (SAT) ------------------ */

function validPoly(poly) {
  return Array.isArray(poly) && poly.length >= 3 && poly.every(p => isFinite(p.x) && isFinite(p.y));
}

function projectCorners(corners, axis) {
  let min = Infinity, max = -Infinity;
  for (const p of corners) {
    const pr = p.x * axis.x + p.y * axis.y;
    if (pr < min) min = pr;
    if (pr > max) max = pr;
  }
  return [min, max];
}
function getStarCorners(star) {
  if (!star.starColliderOffset) return [];
  const cos = Math.cos(star.angle || 0);
  const sin = Math.sin(star.angle || 0);

  return star.starColliderOffset.map(p => ({
    x: star.x + p.x * cos - p.y * sin,
    y: star.y + p.x * sin + p.y * cos
  }));
}


function getAxes(corners) {
  const axes = [];
  for (let i = 0; i < corners.length; i++) {
    const a = corners[i], b = corners[(i + 1) % corners.length];
    const edge = { x: b.x - a.x, y: b.y - a.y };
    const ax = { x: -edge.y, y: edge.x };
    const L = Math.hypot(ax.x, ax.y) || 1e-9;
    axes.push({ x: ax.x / L, y: ax.y / L });
  }
  return axes;
}
// --- helper: velocity at point considering angular velocity ---
function velocityAtPoint(s, px, py) {
  const vx = s.vx || 0;
  const vy = s.vy || 0;
  const w = s.angVel || 0;
  const rx = px - s.x;
  const ry = py - s.y;
  // ω × r => (-w * ry, w * rx)
  return { x: vx + (-w * ry), y: vy + (w * rx) };
}


function nearestPointOnProjection(points, n, target) {
  let best = points[0], bestd = Infinity;
  for (const p of points) {
    const pr = p.x * n.x + p.y * n.y;
    const d = Math.abs(pr - target);
    if (d < bestd) { bestd = d; best = p; }
  }
  return best;
}


// --- Mass & Inertia helpers ---
const massCache = new WeakMap();
const inertiaCache = new WeakMap();

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
   const star = new SvgStar(100, 100, { spikes: 5 });
    const pts = star.starColliderOffset;
    if (!pts || pts.length < 3) return { m: 1, I: 1 };

    // centroid
    let area = 0, cx = 0, cy = 0;
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i], b = pts[(i + 1) % pts.length];
      const cross = a.x * b.y - b.x * a.y;
      area += cross;
      cx += (a.x + b.x) * cross;
      cy += (a.y + b.y) * cross;
    }
    area = Math.abs(area) / 2;
    cx /= (6 * area);
    cy /= (6 * area);

    let I = 0;
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i], b = pts[(i + 1) % pts.length];
      const cross = Math.abs(a.x * b.y - b.x * a.y);
      const dx = a.x - cx, dy = a.y - cy;
      const ex = b.x - cx, ey = b.y - cy;
      I += (dx * dx + dy * dy + dx * ex + dy * ey + ex * ex + ey * ey) * cross;
    }
    I /= 6;

    return { m: area, I };
  } else if (s.type === "SvgLetter") {
    const w = s.width || 80;
    const h = s.height || 80;
    const m = w * h * 0.5;
    const I = (1 / 12) * m * (w * w + h * h);
    return { m, I };
  } else {
    return { m: 1, I: 1 };
  }
}

function getMass(s) {
  if (!massCache.has(s)) massCache.set(s, computeMassAndInertia(s).m);
  return massCache.get(s);
}

function getInertia(s) {
  if (!inertiaCache.has(s)) inertiaCache.set(s, computeMassAndInertia(s).I);
  return inertiaCache.get(s);
}

function invalidateMassCache() {
  massCache.clear?.();
  inertiaCache.clear?.();
}


function dot(a, b) { return a.x * b.x + a.y * b.y; }

/* ------------------ poly-poly SAT -> contact ------------------ */

function polyPolyContact(A, B, polyA, polyB) {
  if (!validPoly(polyA) || !validPoly(polyB)) return null;
  const axes = [...getAxes(polyA), ...getAxes(polyB)];
  let minOverlap = Infinity, bestAxis = null;

  for (const ax of axes) {
    const [minA, maxA] = projectCorners(polyA, ax);
    const [minB, maxB] = projectCorners(polyB, ax);
    const o = Math.min(maxA, maxB) - Math.max(minA, minB);
    if (o <= 0) return null; 
    if (o < minOverlap) { minOverlap = o; bestAxis = ax; }
  }

  // ensure normal points from A -> B
  let n = bestAxis;
  const AB = { x: B.x - A.x, y: B.y - A.y };
  if (dot(n, AB) < 0) n = { x: -n.x, y: -n.y };

  // contact point: project to axis and find nearest points
  const [minA, maxA] = projectCorners(polyA, n);
  const [minB, maxB] = projectCorners(polyB, n);
  const hi = Math.min(maxA, maxB), lo = Math.max(minA, minB);
  const mid = (hi + lo) * 0.5;

  // find nearest actual vertices on each polygon to that mid projection
  function nearestPointOnAxis(pts, axis, targetProj) {
    let best = pts[0], bestd = Infinity;
    for (const p of pts) {
      const pr = p.x * axis.x + p.y * axis.y;
      const d = Math.abs(pr - targetProj);
      if (d < bestd) { bestd = d; best = p; }
    }
    return best;
  }

  const pA = nearestPointOnAxis(polyA, n, mid);
  const pB = nearestPointOnAxis(polyB, n, mid);
  const p =  { x: (pA.x + pB.x)/2, y: (pA.y + pB.y)/2 };

  return { A, B, n, pen: minOverlap, p };
}

/* ------------------ getPolys wrapper ------------------ */
function getPolys(shape) {
  if (!shape) return [];
  if (shape.type === "Star") {
    const ptsLocal = shape.starColliderOffset && shape.starColliderOffset.length
      ? shape.starColliderOffset
      : getStarCorners(shape); // fallback
    const pts = ptsLocal.map(p => ({
      x: p.x + shape.x,
      y: p.y + shape.y
    }));
    return [pts];
  }
  if (shape.type === "Square" && shape.getCorners) return [shape.getCorners()];
  if (shape.getColliderPoints) return [shape.getColliderPoints()];
  return [];
}

/* ------------------ Unified buildContact (fixed XOR and choose min-penetration) ------------------ */
function buildContact(A, B) {
  const polysA = getPolys(A);
  const polysB = getPolys(B);
  let bestContact = null;

  for (const polyA of polysA) {
    for (const polyB of polysB) {
      const contact = polyPolyContact(A, B, polyA, polyB);
      if (contact && (!bestContact || contact.pen < bestContact.pen)) {
        bestContact = contact;
      }
    }
  }

  return bestContact;
}
function sub(a, b) {
  return { x: a.x - b.x, y: a.y - b.y };
}

function add(a, b) {
  return { x: a.x + b.x, y: a.y + b.y };
}

function scale(v, s) {
  return { x: v.x * s, y: v.y * s };
}

function length(v) {
  return Math.hypot(v.x, v.y);
}

function dot(a, b) {
  return a.x * b.x + a.y * b.y;
}

/* ------------------ Resolver: positional + velocity (Planck-like) ------------------ */
function resolveCollisions(shapes) {
  const posIters = 10;
  const velIters = 8;
  const slop = 0.01; 
  const ANGLE_DAMP = 0.2;
  const MAX_ANG = 15;

  const contacts = [];
  for (let i = 0; i < shapes.length; i++) {
    for (let j = i + 1; j < shapes.length; j++) {
      const c = buildContact(shapes[i], shapes[j]);
      if (c) contacts.push(c);
    }
  }

  for (let it = 0; it < posIters; it++) {
    let any = false;
    for (const c of contacts) {
      const rec = buildContact(c.A, c.B);
      if (!rec) continue;
      const pen = Math.max(rec.pen - slop, 0);
      if (pen <= 0) continue;
      any = true;

      const A = rec.A, B = rec.B, n = rec.n;
      const invA = 1 / getMass(A), invB = 1 / getMass(B);
      const corr = pen / (invA + invB); // FULL correction
      A.x -= n.x * corr * invA;
      A.y -= n.y * corr * invA;
      B.x += n.x * corr * invB;
      B.y += n.y * corr * invB;
    }
    if (!any) break;
  }

  for (let it = 0; it < velIters; it++) {
    for (const c of contacts) {
      const rec = buildContact(c.A, c.B);
      if (!rec) continue;

      const A = rec.A, B = rec.B, n = rec.n, p = rec.p;
      const ra = sub(p, A);
      const rb = sub(p, B);

      const va = velocityAtPoint(A, p.x, p.y);
      const vb = velocityAtPoint(B, p.x, p.y);
      const rv = sub(vb, va);
      const relN = dot(rv, n);
      if (relN > 0) continue;

      const e = Math.min(A.restitution ?? 0.2, B.restitution ?? 0.2);

      const invMassA = 1 / getMass(A), invMassB = 1 / getMass(B);
      const invIA = 1 / getInertia(A), invIB = 1 / getInertia(B);

      const raCrossN = ra.x * n.y - ra.y * n.x;
      const rbCrossN = rb.x * n.y - rb.y * n.x;
      const j = -(1 + e) * relN / (invMassA + invMassB + raCrossN*raCrossN*invIA + rbCrossN*rbCrossN*invIB + 1e-9);

      const impulse = scale(n, j);

      // Linear
      A.vx -= impulse.x * invMassA;
      A.vy -= impulse.y * invMassA;
      B.vx += impulse.x * invMassB;
      B.vy += impulse.y * invMassB;

      // Angular
      A.angVel -= (ra.x * impulse.y - ra.y * impulse.x) * invIA * ANGLE_DAMP;
      B.angVel += (rb.x * impulse.y - rb.y * impulse.x) * invIB * ANGLE_DAMP;

      A.angVel = Math.max(-MAX_ANG, Math.min(MAX_ANG, A.angVel));
      B.angVel = Math.max(-MAX_ANG, Math.min(MAX_ANG, B.angVel));

      // Friction
      const vt = sub(rv, scale(n, relN));
      const vtLen = length(vt);
      if (vtLen > 1e-6) {
        const t = scale(vt, 1 / vtLen);
        const raCrossT = ra.x * t.y - ra.y * t.x;
        const rbCrossT = rb.x * t.y - rb.y * t.x;
        const invTermT = invMassA + invMassB + raCrossT*raCrossT*invIA + rbCrossT*rbCrossT*invIB;
        const mu = Math.min(A.friction ?? 0.5, B.friction ?? 0.5);
        let jt = -dot(rv, t) / (invTermT + 1e-9);
        jt = Math.max(-mu * j, Math.min(mu * j, jt));
        const frictionImpulse = scale(t, jt);

        A.vx -= frictionImpulse.x * invMassA;
        A.vy -= frictionImpulse.y * invMassA;
        B.vx += frictionImpulse.x * invMassB;
        B.vy += frictionImpulse.y * invMassB;

        A.angVel -= (ra.x * frictionImpulse.y - ra.y * frictionImpulse.x) * invIA * ANGLE_DAMP;
        B.angVel += (rb.x * frictionImpulse.y - rb.y * frictionImpulse.x) * invIB * ANGLE_DAMP;
      }
    }
  }
}
