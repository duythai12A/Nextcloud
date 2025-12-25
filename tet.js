(() => {
  if (
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ) return;

  if (document.getElementById('tet-canvas')) return;

  const canvas = document.createElement('canvas');
  canvas.id = 'tet-canvas';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  let w, h, items = [];

  const COLORS = [
    'rgba(251,191,36,0.95)',  // vàng
    'rgba(185,28,28,0.95)',   // đỏ
    'rgba(253,230,138,0.95)', // vàng nhạt
    'rgba(22,101,52,0.85)'    // xanh nhẹ
  ];

  function resize() {
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = w;
    canvas.height = h;
  }

  function rand(min, max) { return min + Math.random() * (max - min); }

  function spawn(resetY = false) {
    const type = Math.random() < 0.25 ? 'coin' : 'confetti';
    return {
      x: rand(0, w),
      y: resetY ? rand(-h, 0) : rand(0, h),
      vx: rand(-0.35, 0.35),
      vy: rand(0.9, 1.9),
      r: rand(2.0, 4.5),
      w: rand(6, 12),
      h: rand(4, 10),
      rot: rand(0, Math.PI * 2),
      vr: rand(-0.06, 0.06),
      c: COLORS[(Math.random() * COLORS.length) | 0],
      type
    };
  }

  function init() {
    resize();
    items = [];
    const count = Math.min(160, Math.max(70, Math.floor((w * h) / 8500)));
    for (let i = 0; i < count; i++) items.push(spawn(true));
  }

  function drawOne(p) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.fillStyle = p.c;

    if (p.type === 'coin') {
      // “đồng xu”/lì xì tròn
      ctx.beginPath();
      ctx.arc(0, 0, p.r, 0, Math.PI * 2);
      ctx.fill();
      // highlight
      ctx.globalAlpha *= 0.35;
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.beginPath();
      ctx.arc(-p.r * 0.3, -p.r * 0.3, p.r * 0.35, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // confetti hình chữ nhật
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
    }

    ctx.restore();
  }

  function tick() {
    ctx.clearRect(0, 0, w, h);

    for (const p of items) {
      drawOne(p);

      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;

      if (p.x < -20) p.x = w + 20;
      if (p.x > w + 20) p.x = -20;

      if (p.y > h + 20) Object.assign(p, spawn(true));
    }

    requestAnimationFrame(tick);
  }

  window.addEventListener('resize', init);
  init();
  tick();
})();
