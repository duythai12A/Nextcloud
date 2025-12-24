(() => {
  if (
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ) {
    return;
  }

  if (document.getElementById('snow-canvas')) return;

  const canvas = document.createElement('canvas');
  canvas.id = 'snow-canvas';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  let w, h, flakes = [];

  function resize() {
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = w;
    canvas.height = h;
  }

  function rand(min, max) {
    return min + Math.random() * (max - min);
  }

  function createFlake(resetY = false) {
    return {
      x: rand(0, w),
      y: resetY ? rand(-h, 0) : rand(0, h),
      r: rand(1.2, 2.8),   // TO
      vy: rand(0.8, 1.6), // NHANH HON
      vx: rand(-0.3, 0.3),
      a: rand(0.7, 1.0)
    };
  }

  function init() {
    resize();
    flakes = [];
    const count = Math.min(140, Math.max(60, Math.floor(w * h / 9000)));
    for (let i = 0; i < count; i++) flakes.push(createFlake(true));
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    for (const f of flakes) {
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${f.a})`;
      ctx.fill();

      f.y += f.vy;
      f.x += f.vx;

      if (f.y > h) Object.assign(f, createFlake(true));
    }
    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', init);

  init();
  draw();
})();
