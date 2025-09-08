   const toggleBtn = document.getElementById('toggleDebug');
    const debugPre = document.getElementById('debug');
    
debugPre.style.display === 'none';

    toggleBtn.addEventListener('click', () => {
      if (debugPre.style.display === 'none') {
        debugPre.style.display = 'block';
      } else {
        debugPre.style.display = 'none';
      }
    });

            window.addEventListener("keydown", (e) => {
          if (e.altKey && (e.key === "d" || e.key === "D")) toggleBtn.click();
        });
    function drawDebugInfo() {
      if (!hoveredShape) return;

      const debugData = {
        id: hoveredShape.id || null,
        name: hoveredShape.name || hoveredShape.type || "unknown",

        posWorld: {
          x: hoveredShape.x.toFixed(1),
          y: hoveredShape.y.toFixed(1)
        },
        vel: {
          vx: hoveredShape.vx?.toFixed(2),
          vy: hoveredShape.vy?.toFixed(2)
        },

        angleRad: hoveredShape.angle?.toFixed(3),
        angleDeg: (hoveredShape.angle * 180 / Math.PI).toFixed(1) + "°",

        size: {
          w: hoveredShape.width ? Math.round(hoveredShape.width) : hoveredShape.radius ? Math.round(hoveredShape.radius * 2) : null,
          h: hoveredShape.height ? Math.round(hoveredShape.height) : hoveredShape.radius ? Math.round(hoveredShape.radius * 2) : null
        },
        strokeLocal: hoveredShape.strokeLocal?.toFixed(3),
        strokeWidth: hoveredShape.strokeWidth,

        bounceMode: hoveredShape.bounceMode,
        objectBounces: hoveredShape.bounces,
        wallBounces: hoveredShape.wallBounces,
        wallBouncesRemaining: hoveredShape.bouncesRemaining,
        maxWallBounces: window.maxWallBounces,
        collisionsEnabled: hoveredShape.collisionsEnabled,

        inField: hoveredShape.inField,
        entering: hoveredShape.entering,
        leaving: hoveredShape.leaving,
        spawnTime: hoveredShape.spawnTime || hoveredShape.birth,
        ageMs: hoveredShape.spawnTime
          ? getElapsedMs() - hoveredShape.spawnTime
          : (performance.now() / 1000 - hoveredShape.birth) * 1000
      };

      const debugBox = document.getElementById("debug");
      debugBox.textContent = JSON.stringify(debugData, null, 2);
    }

    canvas.addEventListener("mousemove", (e) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      hoveredShape = null;
      for (const s of shapes) {
        const dx = mouseX - s.x;
        const dy = mouseY - s.y;
        const dist = Math.hypot(dx, dy);
        let hitRadius = s.radiusWithStroke ?? (s.size / Math.sqrt(2) + (s.strokeWidth ?? 7));
        if (dist < hitRadius) {
          hoveredShape = s;
          break;
        }
      }

      drawDebugInfo();
    });


    function isFullyInsideViewport(s) {
      const halfW = s.width ? s.width / 2 : 0;
      const halfH = s.height ? s.height / 2 : 0;
      const radius = s.radius ?? 0;
      return (
        s.x - radius - halfW >= 0 &&
        s.x + radius + halfW <= canvas.width &&
        s.y - radius - halfH >= 0 &&
        s.y + radius + halfH <= canvas.height
      );
    }
