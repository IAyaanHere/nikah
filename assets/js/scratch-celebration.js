/* A brief, silent gold celebration after every date heart has been revealed. */
(function () {
  'use strict';
  let celebrated = false;
  const colours = ['174,126,43', '210,164,69', '241,210,137', '153,107,36'];

  window.NaqshCelebrateDate = function celebrateDate() {
    if (celebrated || document.hidden || !document.body) return;
    celebrated = true;
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) return;
    canvas.className = 'scratch-celebration';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.append(canvas);

    const duration = 3800;
    const cues = [
      { at: 100, x: .25, y: .26 }, { at: 480, x: .75, y: .34 },
      { at: 920, x: .50, y: .18 }, { at: 1420, x: .38, y: .40 },
    ];
    const sparks = [], confetti = [];
    let width = 0, height = 0, frame = 0, nextBurst = 0, stopped = false;
    const start = performance.now();
    let lastDraw = start;

    function resize() {
      const rect = canvas.getBoundingClientRect();
      const nextWidth = Math.max(1, rect.width || window.innerWidth);
      const nextHeight = Math.max(1, rect.height || window.innerHeight);
      if (width && height) {
        for (const particle of [...sparks, ...confetti]) {
          particle.x *= nextWidth / width; particle.y *= nextHeight / height;
          if (particle.previousX !== undefined) {
            particle.previousX *= nextWidth / width; particle.previousY *= nextHeight / height;
          }
        }
      }
      width = nextWidth; height = nextHeight;
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    }

    function cleanup() {
      if (stopped) return;
      stopped = true;
      cancelAnimationFrame(frame);
      canvas.remove();
      window.removeEventListener('resize', resize);
      window.removeEventListener('pagehide', cleanup);
      document.removeEventListener('visibilitychange', onVisibility);
      sparks.length = 0; confetti.length = 0;
    }

    function onVisibility() { if (document.hidden) cleanup(); }

    function burst(cue) {
      const radius = Math.min(width * .19, height * .14);
      for (let index = 0; index < 52; index++) {
        const angle = index / 52 * Math.PI * 2 + Math.random() * .09;
        const speed = radius * (1.2 + Math.random() * .35);
        sparks.push({
          x: cue.x * width, y: cue.y * height,
          previousX: cue.x * width, previousY: cue.y * height,
          vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
          age: 0, life: 1.35 + Math.random() * .35,
          size: .9 + Math.random() * .85, colour: colours[index % colours.length],
        });
      }
    }

    function draw(now) {
      if (stopped) return;
      const elapsed = now - start;
      if (elapsed >= duration || document.hidden || !canvas.isConnected) { cleanup(); return; }
      if (now - lastDraw < 1000 / 30) { frame = requestAnimationFrame(draw); return; }
      const delta = Math.min((now - lastDraw) / 1000, .06);
      lastDraw = now;
      const fade = Math.min(1, (duration - elapsed) / 650);
      context.clearRect(0, 0, width, height);
      while (nextBurst < cues.length && elapsed >= cues[nextBurst].at) burst(cues[nextBurst++]);

      for (let index = sparks.length - 1; index >= 0; index--) {
        const spark = sparks[index];
        spark.age += delta;
        if (spark.age >= spark.life) { sparks.splice(index, 1); continue; }
        spark.previousX = spark.x; spark.previousY = spark.y;
        spark.vx *= Math.pow(.48, delta); spark.vy = spark.vy * Math.pow(.48, delta) + 28 * delta;
        spark.x += spark.vx * delta; spark.y += spark.vy * delta;
        context.globalAlpha = Math.min(1, (spark.life - spark.age) / .65) * fade;
        context.strokeStyle = `rgb(${spark.colour})`; context.lineWidth = spark.size;
        context.beginPath();
        context.moveTo(spark.previousX - spark.vx * .07, spark.previousY - spark.vy * .07);
        context.lineTo(spark.x, spark.y); context.stroke();
        context.fillStyle = '#f5d995';
        context.beginPath(); context.arc(spark.x, spark.y, spark.size, 0, Math.PI * 2); context.fill();
      }

      for (const piece of confetti) {
        piece.phase += delta * piece.spin;
        piece.x += (piece.vx + Math.sin(piece.phase) * 18) * delta;
        piece.y += piece.vy * delta;
        context.globalAlpha = fade * .9;
        context.fillStyle = `rgb(${piece.colour})`;
        context.save(); context.translate(piece.x, piece.y); context.rotate(piece.phase);
        context.fillRect(-piece.size / 2, -piece.size, Math.max(1, Math.abs(Math.cos(piece.phase)) * piece.size), piece.size * 1.7);
        context.restore();
      }
      context.globalAlpha = 1;
      frame = requestAnimationFrame(draw);
    }

    resize();
    for (let index = 0; index < 90; index++) {
      confetti.push({
        x: Math.random() * width,
        y: -Math.random() * height * .45,
        vx: (Math.random() - .5) * 70,
        vy: 155 + Math.random() * 145,
        size: 3 + Math.random() * 3,
        phase: Math.random() * Math.PI * 2, spin: 2 + Math.random() * 3,
        colour: colours[index % colours.length],
      });
    }
    window.addEventListener('resize', resize);
    window.addEventListener('pagehide', cleanup);
    document.addEventListener('visibilitychange', onVisibility);
    frame = requestAnimationFrame(draw);
  };
})();
