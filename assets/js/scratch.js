/* Independent Naqsh canvas scratch interaction. No external runtime. */
window.NaqshScratch = function initializeScratch(canvas, settings) {
  const circle = canvas.parentElement;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  let size = 0;
  let ratio = 1;
  let drawing = false;
  let last = null;
  let revealed = false;
  let touched = false;
  let lastCheck = 0;

  function paintCover() {
    context.globalCompositeOperation = 'source-over';
    const gold = context.createLinearGradient(0, 0, size, size);
    gold.addColorStop(0, '#d5bf85');
    gold.addColorStop(0.3, '#b29250');
    gold.addColorStop(0.62, '#88703d');
    gold.addColorStop(1, '#bca065');
    context.fillStyle = gold;
    context.fillRect(0, 0, size, size);
    // Seeded flecks keep the gold texture steady through resizing.
    let seed = 193;
    function random() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }
    for (let i = 0; i < 45; i++) {
      const x = random() * size, y = random() * size;
      if (Math.hypot(x - size / 2, y - size / 2) > size * 0.47) continue;
      context.fillStyle = `rgba(255,249,240,${0.06 + random() * 0.14})`;
      context.beginPath(); context.arc(x, y, 0.3 + random() * 1.4, 0, Math.PI * 2); context.fill();
    }
    context.fillStyle = '#fff9f0';
    context.font = `500 ${Math.max(9, size * 0.085)}px "Cormorant SC", serif`;
    context.textAlign = 'center'; context.textBaseline = 'middle';
    context.fillText(settings.coverLabel.toUpperCase(), size / 2, size / 2);
  }

  function resize() {
    if (revealed) return;
    const nextSize = circle.getBoundingClientRect().width;
    if (!nextSize || Math.abs(nextSize - size) < 0.5) return;
    const previous = document.createElement('canvas');
    previous.width = canvas.width; previous.height = canvas.height;
    if (touched) previous.getContext('2d').drawImage(canvas, 0, 0);
    size = nextSize; ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(size * ratio); canvas.height = Math.round(size * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    if (touched) context.drawImage(previous, 0, 0, previous.width, previous.height, 0, 0, size, size);
    else paintCover();
  }

  function reveal() {
    if (revealed) return;
    revealed = true; drawing = false;
    circle.classList.add('is-revealed');
    circle.querySelector('.scratch-value').removeAttribute('aria-hidden');
    canvas.setAttribute('aria-label', `${settings.label}: ${settings.value}`);
    canvas.setAttribute('aria-disabled', 'true');
    for (let i = 0; i < 20; i++) {
      const sparkle = document.createElement('span');
      sparkle.className = 'sparkle'; sparkle.style.left = '50%'; sparkle.style.top = '50%';
      const angle = Math.PI * 2 * i / 20, distance = size * (0.4 + Math.random() * 0.3);
      sparkle.style.setProperty('--dx', `${Math.cos(angle) * distance}px`);
      sparkle.style.setProperty('--dy', `${Math.sin(angle) * distance}px`);
      circle.append(sparkle); setTimeout(() => sparkle.remove(), 1000);
    }
    settings.onReveal();
  }

  function clearedFraction() {
  const { data, width, height } =
    context.getImageData(0, 0, canvas.width, canvas.height);

  const heart = new Path2D(
    'M50 91C42 82 5 58 5 31C5 6 37 1 50 23C63 1 95 6 95 31C95 58 58 82 50 91Z'
  );

  let count = 0;
  let cleared = 0;

  context.save();
  context.setTransform(1, 0, 0, 1, 0, 0);

  for (let y = 0; y < height; y += 6) {
    for (let x = 0; x < width; x += 6) {
      if (!context.isPointInPath(
        heart, x * 100 / width, y * 100 / height
      )) continue;

      count++;

      if (data[(y * width + x) * 4 + 3] < 64) {
        cleared++;
      }
    }
  }

  context.restore();
  return count ? cleared / count : 0;
}

  function point(event) {
    const rect = canvas.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }

  function erase(event) {
    const next = point(event);
    context.globalCompositeOperation = 'destination-out';
    context.lineWidth = Math.max(22, size * 0.18); context.lineCap = 'round'; context.lineJoin = 'round';
    context.beginPath(); context.moveTo((last || next).x, (last || next).y); context.lineTo(next.x, next.y);
    context.stroke(); context.beginPath(); context.arc(next.x, next.y, context.lineWidth / 2, 0, Math.PI * 2); context.fill();
    last = next; touched = true;
    if (performance.now() - lastCheck > 100) {
      lastCheck = performance.now();
      if (clearedFraction() >= settings.threshold) reveal();
    }
  }

  canvas.addEventListener('pointerdown', event => {
    if (revealed) return;
    drawing = true; last = point(event); canvas.setPointerCapture(event.pointerId); erase(event);
  });
  canvas.addEventListener('pointermove', event => { if (drawing && !revealed) erase(event); });
  function finish() {
    if (!drawing) return;
    drawing = false; last = null;
    if (clearedFraction() >= settings.threshold) reveal();
  }
  canvas.addEventListener('pointerup', finish); canvas.addEventListener('pointercancel', finish);
  canvas.addEventListener('lostpointercapture', finish);
  canvas.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); reveal(); }
  });
  resize();
  new ResizeObserver(resize).observe(circle);
  document.fonts.ready.then(() => { if (!touched && !revealed) paintCover(); });
};
