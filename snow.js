(() => {
  const prefersReduced =
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Optional: disable on very small screens (uncomment if you want)
  // const isSmall = Math.min(window.innerWidth, window.innerHeight) < 420;
  // if (isSmall) return;

  if (prefersReduced) return;

  function alreadyInstalled() {
    return document.getElementById('snow-canvas') !== null;
  }

  function install() {
    if (alreadyInstalled()) return;

    const canvas = document.createElement('canvas');
    canvas.id = 'snow-canvas';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let w = 0, h = 0, dpr = 1;
    let flakes = [];
    let rafId = null;

    const settings = {
      // density scales with area
      baseCount: 70,        // good for desktop
      minCount: 35,
      maxCount: 130,
      wind: 0.25,           // horizontal drift
      gravity: 0.65,        // fall speed multiplier
      maxRadius: 2.2,
      minRadius: 0.8,
    };

    function resize() {
      dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
      w = Math.floor(window.innerWidth);
      h = Math.floor(window.innerHeight);

      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Adjust flake count based on screen area
      const area = w * h;
      let target = Math.round((area / (1200 * 800)) * settings.baseCount);
      target = Math.max(settings.minCount, Math.min(settings.maxCount, target));

      // Rebuild softly (keep some if exists)
      if (flakes.length > target) {
        flakes = flakes.slice(0, target);
      } else {
        while (flakes.length < target) flakes.push(makeFlake(true));
      }
    }

    function rand(min, max) {
      return min + Math.random() * (max - min);
    }

    function makeFlake(randomY) {
      const r = rand(settings.minRadius, settings.maxRadius);
      return {
        x: rand(0, w),
        y: randomY ? rand(0, h) : rand(-h * 0.15, -10),
        r,
        vx: rand(-0.25, 0.25) + settings.wind,
        vy: rand(0.5, 1.35) * settings.gravity,
        phase: rand(0, Math.PI * 2),
        sway: rand(0.6, 1.8),
        alpha: rand(0.35, 0.95),
      };
    }

    function step() {
      ctx.clearRect(0, 0, w, h);

      // Draw
      for (let i = 0; i < flakes.length; i++) {
        const f = flakes[i];

        // Update
        f.phase += 0.01 + f.r * 0.002;
        f.x += f.vx + Math.sin(f.phase) * 0.35 * f.sway;
        f.y += f.vy;

        // Wrap
        if (f.x < -10) f.x = w + 10;
        if (f.x > w + 10) f.x = -10;

        if (f.y > h + 10) {
          flakes[i] = makeFlake(false);
          flakes[i].y = rand(-30, -10);
        }

        // Render
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${f.alpha})`;
        ctx.fill();
      }

      rafId = window.requestAnimationFrame(step);
    }

    function start() {
      resize();
      if (rafId) cancelAnimationFrame(rafId);
      rafId = window.requestAnimationFrame(step);
    }

    function stop() {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = null;
      if (canvas && canvas.parentNode) canvas.parentNode.removeChild(canvas);
      flakes = [];
    }

    // Pause when tab hidden
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        if (rafId) cancelAnimationFrame(rafId);
        rafId = null;
      } else {
        if (!rafId) rafId = window.requestAnimationFrame(step);
      }
    });

    window.addEventListener('resize', () => {
      resize();
    });

    // If Nextcloud does SPA-like navigation, keep snow alive
    // (no-op if already installed)
    start();

    // Expose stop for debugging (optional)
    window.__vdriveSnowStop = stop;
  }

  // Ensure body exists
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', install);
  } else {
    install();
  }
})();
