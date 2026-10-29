/* A light veil of drifting gold and pearl glimmers, confined to the invitation. */
(function () {
  'use strict';
  const canvas = document.getElementById('glimmerCanvas');
  const context = canvas.getContext('2d');
  const invitation = document.getElementById('invitation');
  let width = 0, height = 0, left = 0, frame = 0, last = 0, motes = [];
  function resize() {
    const rect = invitation.getBoundingClientRect();
    width = rect.width; left = rect.left; height = innerHeight;
    const ratio = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(innerWidth * ratio); canvas.height = Math.round(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    motes = Array.from({ length: Math.round(width / 20) }, () => ({
      x: Math.random() * width, y: Math.random() * height, r: .7 + Math.random() * 1.1,
      speed: 4 + Math.random() * 7, phase: Math.random() * Math.PI * 2, period: 2.8 + Math.random() * 3,
    }));
  }
  function draw(now) {
    if (document.hidden) { stop(); return; }
    const delta = Math.min((now - last) / 1000, .05); last = now;
    context.clearRect(0, 0, innerWidth, height);
    if (!invitation.inert) {
      context.save(); context.beginPath(); context.rect(left, 0, width, height); context.clip();
      for (const mote of motes) {
        mote.y -= mote.speed * delta;
        if (mote.y < -15) { mote.y = height + 15; mote.x = Math.random() * width; }
        const pulse = Math.pow((Math.sin(now / 1000 / mote.period * Math.PI * 2 + mote.phase) + 1) / 2, 4);
        const x = left + mote.x + Math.sin(now / 5500 + mote.phase) * 5;
        const halo = context.createRadialGradient(x, mote.y, 0, x, mote.y, 8);
        halo.addColorStop(0, `rgba(219,184,105,${pulse * .45})`); halo.addColorStop(1, 'rgba(219,184,105,0)');
        context.fillStyle = halo; context.fillRect(x - 8, mote.y - 8, 16, 16);
        context.fillStyle = `rgba(185,144,61,${.08 + pulse * .55})`;
        context.beginPath(); context.arc(x, mote.y, mote.r, 0, Math.PI * 2); context.fill();
        if (pulse > .75) {
          context.strokeStyle = `rgba(255,239,186,${(pulse - .75) * 2})`; context.lineWidth = .6;
          context.beginPath(); context.moveTo(x - 3, mote.y); context.lineTo(x + 3, mote.y);
          context.moveTo(x, mote.y - 3); context.lineTo(x, mote.y + 3); context.stroke();
        }
      }
      context.restore();
    }
    frame = requestAnimationFrame(draw);
  }
  function stop() { cancelAnimationFrame(frame); frame = 0; context.clearRect(0, 0, innerWidth, height); canvas.dataset.glimmer = 'idle'; }
  function start() {
    if (frame || document.hidden || invitation.inert) return;
    last = performance.now(); canvas.dataset.glimmer = 'playing'; frame = requestAnimationFrame(draw);
  }
  resize(); start();
  new MutationObserver(start).observe(document.body, { attributes:true, attributeFilter:['class'] });
  window.addEventListener('resize', resize);
  document.addEventListener('visibilitychange', () => document.hidden ? stop() : start());
  window.addEventListener('pagehide', stop);
})();
