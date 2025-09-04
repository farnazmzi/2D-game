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
    const GLYPH5x7 = {
        "0": ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
        "1": ["00100", "01100", "00100", "00100", "00100", "00100", "01110"],
        "2": ["01110", "10001", "00001", "00010", "00100", "01000", "11111"],
        "3": ["01110", "10001", "00001", "00110", "00001", "10001", "01110"],
        "4": ["00010", "00110", "01010", "10010", "11111", "00010", "00010"],
        "5": ["11111", "10000", "11110", "00001", "00001", "10001", "01110"],
        "6": ["00110", "01000", "10000", "11110", "10001", "10001", "01110"],
        "7": ["11111", "00001", "00010", "00100", "01000", "01000", "01000"],
        "8": ["01110", "10001", "10001", "01110", "10001", "10001", "01110"],
        "9": ["01110", "10001", "10001", "01111", "00001", "00010", "01100"],
        "A": ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
        "B": ["11110", "10001", "10001", "11110", "10001", "10001", "11110"],
        "C": ["01110", "10001", "10000", "10000", "10000", "10001", "01110"],
        "D": ["11100", "10010", "10001", "10001", "10001", "10010", "11100"],
        "E": ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
        "F": ["11111", "10000", "10000", "11110", "10000", "10000", "10000"],
        "G": ["01110", "10001", "10000", "10111", "10001", "10001", "01110"],
        "H": ["10001", "10001", "10001", "11111", "10001", "10001", "10001"],
        "I": ["01110", "00100", "00100", "00100", "00100", "00100", "01110"],
        "J": ["00111", "00010", "00010", "00010", "10010", "10010", "01100"],
        "K": ["10001", "10010", "10100", "11000", "10100", "10010", "10001"],
        "L": ["10000", "10000", "10000", "10000", "10000", "10000", "11111"],
        "M": ["10001", "11011", "10101", "10101", "10001", "10001", "10001"],
        "N": ["10001", "11001", "10101", "10011", "10001", "10001", "10001"],
        "O": ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
        "P": ["11110", "10001", "10001", "11110", "10000", "10000", "10000"],
        "Q": ["01110", "10001", "10001", "10001", "10101", "10010", "01101"],
        "R": ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
        "S": ["01111", "10000", "10000", "01110", "00001", "00001", "11110"],
        "T": ["11111", "00100", "00100", "00100", "00100", "00100", "00100"],
        "U": ["10001", "10001", "10001", "10001", "10001", "10001", "01110"],
        "V": ["10001", "10001", "10001", "10001", "01010", "01010", "00100"],
        "W": ["10001", "10001", "10001", "10101", "10101", "11011", "10001"],
        "X": ["10001", "01010", "00100", "00100", "00100", "01010", "10001"],
        "Y": ["10001", "01010", "00100", "00100", "00100", "00100", "00100"],
        "Z": ["11111", "00001", "00010", "00100", "01000", "10000", "11111"]
    };

    class SvgMaker {
        // ---- Base shapes
        mkCircle(opts = {}) {
            const { stroke = '#ff0000', fill = '#ffffff', outlinePx = 12, size = 96, radius = 45 } = opts;
            const strokeLocal = computeStrokeLocal(size, outlinePx);
            return {
                svg: svgWrap(`<circle cx="50" cy="50" r="${radius}" />`, { stroke, fill, strokeLocal }),
                collider: { type: 'circle', r: radius },
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

        // mkRegularPolygon(n = 5, opts = {}) {
        //     const { radius = 45, rotationDeg = -90 } = opts;
        //     const cx = 50, cy = 50, rot = rotationDeg * Math.PI / 180;
        //     const pts = [];
        //     for (let i = 0; i < n; i++) {
        //         const a = rot + i * 2 * Math.PI / n;
        //         pts.push([cx + radius * Math.cos(a), cy + radius * Math.sin(a)].map(v => +v.toFixed(3)).join(","));
        //     }
        //     return this.mkPolyFromPoints(pts.join(" "), opts);
        // }
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
