/* Golden blooms overlap into a continuous loop across all three scenes. */
(function () {
  'use strict';
  const palette = ['255,241,186', '255,207,104', '219,151,43'];
  const glows = palette.map(colour => {
    const sprite = document.createElement('canvas'); sprite.width = sprite.height = 32;
    const brush = sprite.getContext('2d'), glow = brush.createRadialGradient(16,16,0,16,16,16);
    glow.addColorStop(0,'rgba(255,253,229,1)'); glow.addColorStop(.15,`rgba(${colour},.95)`);
    glow.addColorStop(.4,`rgba(${colour},.32)`); glow.addColorStop(1,`rgba(${colour},0)`);
    brush.fillStyle=glow; brush.fillRect(0,0,32,32); return sprite;
  });
  document.querySelectorAll('[data-firework-scene]').forEach(canvas => {
    const context = canvas.getContext('2d'), kind = canvas.dataset.fireworkScene;
    const cues = kind === 'hero' ? [
      {t:900,x:.10,y:.15}, {t:1750,x:.90,y:.23}, {t:3200,x:.08,y:.38},
      {t:4050,x:.92,y:.43}, {t:5700,x:.14,y:.20}, {t:6500,x:.88,y:.16},
    ] : [
      {t:900,x:.14,y:.23}, {t:1750,x:.88,y:.31}, {t:3100,x:.45,y:.12},
      {t:4250,x:.09,y:.43}, {t:5200,x:.93,y:.42}, {t:6500,x:.60,y:.18},
    ];
    const loopMs=7600;
    let width=0,height=0,frame=0,start=0,lastDraw=0,particles=[],flashes=[],nextBurst=0;
    function sceneHeight() { return kind==='garden' ? height*.29 : height; }
    function launchPoint(cue) {
      if(kind!=='garden') return {x:cue.x*width,y:cue.y*height};
      // Keep the launches in the lower artwork, with the whole bloom and its
      // falling sparks inside the formal section rather than a shallow canvas.
      const radius=Math.min(width*.28,height*.18),padding=12;
      const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
      return {
        x:clamp(cue.x*width,radius+padding,width-radius-padding),
        y:clamp(height-sceneHeight()+cue.y*sceneHeight(),radius+padding,height-radius-sceneHeight()*.18-padding),
        radius,
      };
    }
    function resize() {
      const rect=canvas.getBoundingClientRect(); width=rect.width; height=rect.height;
      const ratio=Math.min(devicePixelRatio||1,1.5);
      canvas.width=Math.round(width*ratio); canvas.height=Math.round(height*ratio);
      context.setTransform(ratio,0,0,ratio,0,0);
    }
    function eligible() { return !document.hidden && document.body.classList.contains('is-open'); }
    function stop() {
      cancelAnimationFrame(frame); frame=0; particles=[]; flashes=[];
      context.clearRect(0,0,width,height); canvas.dataset.fireworks='idle';
    }
    function burst(cue) {
      const {x,y,radius}=launchPoint(cue);
      flashes.push({x,y,age:0});
      // Three shells produce a full bloom with both long rays and a dense core.
      [100,76,48].forEach((count,shell) => {
        const offset=Math.random()*Math.PI*2;
        for(let i=0;i<count;i++) {
          const angle=i/count*Math.PI*2+offset;
          const speed=kind==='garden'
            ? radius/2.5*(1-shell*.25)*(.85+Math.random()*.25)/1.1
            : width*(.26-shell*.065)*(.85+Math.random()*.25);
          particles.push({x,y,ox:x,oy:y,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,
            age:0,life:2.65+Math.random()*1.15,size:1.1+Math.random()*.8,
            colour:(i+shell)%palette.length,tail:[],phase:Math.random()*6.28});
        }
      });
      canvas.dataset.bursts=String(Number(canvas.dataset.bursts||0)+1);
    }
    function draw(now) {
      if(!eligible()) { stop(); return; }
      if(now-lastDraw<30) { frame=requestAnimationFrame(draw); return; }
      const delta=Math.min((now-lastDraw)/1000,.06); let elapsed=now-start;lastDraw=now;
      if(elapsed>=loopMs) {
        start+=Math.floor(elapsed/loopMs)*loopMs;elapsed=now-start;nextBurst=0;
        canvas.dataset.cycle=String(Number(canvas.dataset.cycle||0)+1);
      }
      while(nextBurst<cues.length && elapsed>=cues[nextBurst].t) burst(cues[nextBurst++]);
      context.clearRect(0,0,width,height);
      for(const cue of cues) {
        const ascent=(elapsed-(cue.t-650))/650;
        if(ascent<0||ascent>1) continue;
        const target=launchPoint(cue),x=target.x,origin=height+sceneHeight()*.05;
        const y=origin+(target.y-origin)*ascent;
        const trail=context.createLinearGradient(x,y,x,y+sceneHeight()*.15);
        trail.addColorStop(0,'rgba(255,227,143,.95)');trail.addColorStop(1,'rgba(211,152,46,0)');
        context.strokeStyle=trail;context.lineWidth=1.6;context.beginPath();context.moveTo(x,y);context.lineTo(x,y+sceneHeight()*.15);context.stroke();
        context.globalAlpha=.8;context.drawImage(glows[0],x-5,y-5,10,10);context.globalAlpha=1;
      }
      flashes=flashes.filter(f=>f.age<.48);
      for(const flash of flashes) {
        flash.age+=delta;
        const radius=width*.11,glow=context.createRadialGradient(flash.x,flash.y,0,flash.x,flash.y,radius);
        const alpha=Math.max(0,1-flash.age/.48);
        glow.addColorStop(0,`rgba(255,249,218,${alpha*.8})`);glow.addColorStop(.25,`rgba(255,211,110,${alpha*.4})`);glow.addColorStop(1,'rgba(255,211,110,0)');
        context.fillStyle=glow;context.fillRect(flash.x-radius,flash.y-radius,radius*2,radius*2);
      }
      particles=particles.filter(p=>p.age<p.life);
      for(const p of particles) {
        p.tail.push({x:p.x,y:p.y}); if(p.tail.length>9) p.tail.shift();
        p.age+=delta;p.vx*=Math.pow(.72,delta);p.vy=p.vy*Math.pow(.78,delta)+sceneHeight()*.032*delta;
        p.x+=p.vx*delta;p.y+=p.vy*delta;
        const fade=Math.min(1,(p.life-p.age)/1.15),twinkle=.76+.24*Math.sin(p.age*17+p.phase);
        const alpha=Math.max(0,fade*twinkle),colour=palette[p.colour];
        // Bright radial rays immediately expand into sparkling, curved tails.
        const tail=p.age<.5?{x:p.ox,y:p.oy}:p.tail[0];
        context.strokeStyle=`rgba(${colour},${alpha*.7})`;context.lineWidth=p.size;
        context.beginPath();context.moveTo(tail.x,tail.y);
        if(p.age>=.5) for(const point of p.tail) context.lineTo(point.x,point.y);
        context.lineTo(p.x,p.y);context.stroke();
        context.globalAlpha=alpha;const size=p.size*5;
        context.drawImage(glows[p.colour],p.x-size/2,p.y-size/2,size,size);context.globalAlpha=1;
      }
      frame=requestAnimationFrame(draw);
    }
    function play() {
      if(!eligible()) return;
      stop();resize();nextBurst=0;start=lastDraw=performance.now();
      canvas.dataset.fireworks='playing';canvas.dataset.cycle=String(Number(canvas.dataset.cycle||0)+1);
      frame=requestAnimationFrame(draw);
    }
    new ResizeObserver(resize).observe(canvas);
    document.addEventListener('visibilitychange',()=>document.hidden?stop():play());
    new MutationObserver(()=>{if(eligible()&&!frame) play();}).observe(document.body,{attributes:true,attributeFilter:['class']});
    window.addEventListener('pagehide',stop);
  });
})();
