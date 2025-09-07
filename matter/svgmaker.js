// svgmaker.js
// Provides: window.svgmaker with:
//   mkCircle(opts), mkTriangle(opts), mkSquare(opts), mkDiamond(opts), mkRectangle(opts),
//   mkRegularPolygon(n, opts), mkStar5(opts), mkGlyph(ch, opts)
//
// Each factory accepts per-call options:
//   { stroke = '#ff0000', fill = '#ffffff', outlinePx = 12, size = 96, radius = 45, rotationDeg = -90 }
// Returns { svg, collider, strokeLocal } where strokeLocal is in 0..100 SVG units.

(function () {
    function computeStrokeLocal(sizePx, outlinePx) {
        // Convert desired pixel outline at given render size into local SVG stroke width (viewBox 0..100)
        const size = Math.max(1, sizePx || 100);
        const sw = (outlinePx == null ? 12 : outlinePx);
        return (sw * 100) / size;
    }

    function svgWrap(inner, { stroke, fill, strokeLocal, viewBox = "0 0 100 100" }) {
        return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">
  <g fill="${fill}" stroke="${stroke}" stroke-width="${strokeLocal}" stroke-linejoin="round" stroke-linecap="round" style="paint-order: stroke fill">
    ${inner}
  </g>
</svg>`.trim();
    }

    // 5x7 bitmap glyphs for digits 0–9 and A–Z (uppercase)


    class SvgMaker {
        // ---- Base shapes
        mkCircle(opts = {}) {
            const { stroke = '#ff0000', fill = '#ffffff', outlinePx = 12, size = 96, radius } = opts;

            const r = radius ?? size / 2; // نصف سایز به عنوان رادیوس
            const cx = size / 2; // مرکز x
            const cy = size / 2; // مرکز y

            const strokeLocal = computeStrokeLocal(size, outlinePx);

            return {
                svg: svgWrap(`<circle cx="${cx}" cy="${cy}" r="${r}" />`, { stroke, fill, strokeLocal, size }),
                collider: { type: 'circle', r },
                strokeLocal,
                shapeType: 'circle'
            };
        }



        mkPolyFromPoints(pointsStr, opts = {}) {
            const { stroke = '#ff0000', fill = '#ffffff', outlinePx = 12, size = 96 } = opts;
            const strokeLocal = computeStrokeLocal(size, outlinePx);
            const pts = pointsStr.trim().split(/\s+/).map(p => {
                const [x, y] = p.split(',').map(Number);
                return { x, y };
            });
            return {
                svg: svgWrap(`<polygon points="${pointsStr}" />`, { stroke, fill, strokeLocal }),
                collider: { type: 'poly', pts },
                strokeLocal,
                shapeType: 'Poly'
            };
        }

        mkTriangle(opts = {}) { return this.mkPolyFromPoints(`50,6 94,94 6,94`, opts); }
        mkSquare(opts = {}) { return this.mkPolyFromPoints(`10,10 90,10 90,90 10,90`, opts); }
        mkDiamond(opts = {}) { return this.mkPolyFromPoints(`50,5 95,50 50,95 5,50`, opts); }
        mkRectangle(opts = {}) { return this.mkPolyFromPoints(`6,28 94,28 94,72 6,72`, opts); }

        mkRegularPolygon(n = 5, opts = {}) {
            const { radius = 45, rotationDeg = 0, stroke = '#ff0000', fill = '#ffffff', outlinePx = 12, size = 96 } = opts;
            const cx = 50, cy = 50, rot = rotationDeg * Math.PI / 180;
            const pts = [];
            for (let i = 0; i < n; i++) {
                const a = rot + i * 2 * Math.PI / n;
                pts.push([cx + radius * Math.cos(a), cy + radius * Math.sin(a)].map(v => +v.toFixed(3)).join(","));
            }

            const strokeLocal = computeStrokeLocal(size, outlinePx);

            return {
                svg: svgWrap(`<polygon points="${pts.join(" ")}" />`, { stroke, fill, strokeLocal }),
                collider: { type: 'poly', pts },
                strokeLocal,
                shapeType: 'RegularPolygon'
            };
        }

        mkStar5(opts = {}) {
            const { stroke = '#ff0000', fill = '#ffffff', outlinePx = 12, size = 96 } = opts;
            const strokeLocal = computeStrokeLocal(size, outlinePx);
            const cx = 50, cy = 50, outer = 45, inner = 18, rot = 0 * Math.PI / 180, pts = [];
            for (let i = 0; i < 10; i++) {
                const rr = (i % 2 === 0) ? outer : inner; const a = rot + i * Math.PI / 5;
                pts.push([cx + rr * Math.cos(a), cy + rr * Math.sin(a)].map(v => +v.toFixed(3)).join(","));
            }
            const starSvg = svgWrap(`<polygon points="${pts.join(" ")}" />`, { stroke, fill, strokeLocal });
            const hull = this.mkRegularPolygon(5, opts).collider; // convex hull for stability
            return { svg: starSvg, collider: hull, strokeLocal, shapeType: 'star' };
        }

        // ---- Glyphs (digits/letters): rectangles + filter border, compound rect colliders
        mkGlyph(ch, opts = {}) {
            const { stroke = '#ff0000', fill = '#ffffff', outlinePx = 12, size = 96 } = opts;
            const strokeLocal = computeStrokeLocal(size, outlinePx);
            const key = String(ch).toUpperCase();
            const pattern = GLYPH5x7[key];
            if (!pattern) return this.mkSquare(opts);

            const PAD = 10, GW = 5, GH = 7;
            const cw = (100 - PAD * 2) / GW;
            const chh = (100 - PAD * 2) / GH;

            const rects = [];
            for (let r = 0; r < GH; r++) {
                for (let c = 0; c < GW; c++) {
                    if (pattern[r][c] === "1") rects.push({ x: PAD + c * cw, y: PAD + r * chh, w: cw, h: chh });
                }
            }
            const rectsSvg = rects.map(rc => `<rect x="${rc.x.toFixed(3)}" y="${rc.y.toFixed(3)}" width="${rc.w.toFixed(3)}" height="${rc.h.toFixed(3)}"/>`).join("\n    ");
            const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs>
    <filter id="outline" x="-20%" y="-20%" width="140%" height="140%">
      <feMorphology in="SourceAlpha" operator="dilate" radius="${(strokeLocal / 2).toFixed(3)}" result="dilated"/>
      <feComposite in="dilated" in2="SourceAlpha" operator="xor" result="border"/>
      <feFlood flood-color="${stroke}" result="red"/>
      <feComposite in="red" in2="border" operator="in" result="redBorder"/>
      <feComposite in="SourceGraphic" in2="redBorder" operator="over"/>
    </filter>
  </defs>
  <g fill="${fill}" stroke="none" filter="url(#outline)">
    ${rectsSvg}
  </g>
</svg>`.trim();

            const polys = rects.map(rc => ([
                { x: rc.x, y: rc.y },
                { x: rc.x + rc.w, y: rc.y },
                { x: rc.x + rc.w, y: rc.y + rc.h },
                { x: rc.x, y: rc.y + rc.h }
            ]));
            return { svg, collider: { type: 'compound', polys }, strokeLocal };
        }
    }

    window.svgmaker = new SvgMaker();
})();
