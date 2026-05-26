// ========================================================================
//  Phase 1 motion runtime
//  - Lenis smooth scroll, RAF-linked to GSAP ticker
//  - ScrollTrigger fully synced with Lenis
//  - <SplitReveal>  : char-level scroll-triggered headline reveals
//  - <ScrollReveal> : generic fade-up element reveals
//  - prefers-reduced-motion short-circuits everything to instant
// ========================================================================

(function () {
  const { gsap, ScrollTrigger, SplitText, Lenis } = window;

  // ----- Global capability flags --------------------------------------------
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canSplit = !!(gsap && SplitText);

  if (gsap) {
    if (ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
    if (SplitText) gsap.registerPlugin(SplitText);
  }

  // ----- Lenis init (idempotent) -------------------------------------------
  let lenisInstance = null;
  function initLenis() {
    if (prefersReduced || !Lenis || lenisInstance) return lenisInstance;

    lenisInstance = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      smoothTouch: false,
    });

    // Drive Lenis from GSAP's ticker so smooth-scroll + ScrollTrigger
    // share the exact same frame — no drift, no jitter.
    if (gsap) {
      gsap.ticker.add((time) => { lenisInstance.raf(time * 1000); });
      gsap.ticker.lagSmoothing(0);
    }

    // Re-broadcast scroll to native listeners so legacy code (nav scrolled
    // state, hero parallax, scroll-progress bar) keeps working.
    lenisInstance.on('scroll', () => {
      window.dispatchEvent(new Event('scroll'));
      if (ScrollTrigger) ScrollTrigger.update();
    });

    window.lenisInstance = lenisInstance;
    return lenisInstance;
  }

  function destroyLenis() {
    if (lenisInstance) { lenisInstance.destroy(); lenisInstance = null; }
  }

  // ----- Hook: useReducedMotion --------------------------------------------
  function useReducedMotion() {
    const [v, setV] = React.useState(prefersReduced);
    React.useEffect(() => {
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      const onChange = () => setV(mq.matches);
      mq.addEventListener('change', onChange);
      return () => mq.removeEventListener('change', onChange);
    }, []);
    return v;
  }

  // ----- <SplitReveal> ------------------------------------------------------
  //  Splits text into characters (clipped per-line) and reveals them on
  //  scroll. Defaults aim for "tasteful editorial" pacing.
  //
  //  props:
  //    as        : tag name (default 'span'). Use 'h1', 'h2', etc.
  //    delay     : initial delay (s)
  //    stagger   : per-character stagger (s)
  //    duration  : per-character duration (s)
  //    ease      : GSAP ease
  //    mode      : 'scroll' (default) | 'instant' (plays on mount, no ST)
  //    start     : ScrollTrigger start position
  //    className : passthrough class
  // -------------------------------------------------------------------------
  function SplitReveal({
    as = 'span',
    children,
    delay = 0,
    stagger = 0.018,
    duration = 1.0,
    ease = 'power4.out',
    mode = 'scroll',
    start = 'top 85%',
    className = '',
    style,
    onReady,
  }) {
    const ref = React.useRef(null);
    const splitRef = React.useRef(null);
    const tweenRef = React.useRef(null);

    React.useLayoutEffect(() => {
      const el = ref.current;
      if (!el) return;

      // Reduced motion or missing libs => render text as-is
      if (prefersReduced || !canSplit) {
        if (onReady) onReady();
        return;
      }

      let cancelled = false;

      // SplitText measures rendered glyph positions, so the web font MUST be
      // loaded before we split — otherwise it measures the fallback font and
      // characters jump when the real font swaps in.
      const init = () => {
        if (cancelled || !ref.current) return;

        const split = new SplitText(ref.current, {
          type: 'lines,words,chars',
          linesClass: 'split-line',
          wordsClass: 'split-word',
          charsClass: 'split-char',
        });
        splitRef.current = split;

        gsap.set(split.chars, { yPercent: 110 });

        const tween = gsap.to(split.chars, {
          yPercent: 0,
          duration,
          ease,
          delay,
          stagger,
          ...(mode === 'scroll' && ScrollTrigger
            ? { scrollTrigger: { trigger: ref.current, start, once: true } }
            : {}),
          onComplete: onReady,
        });
        tweenRef.current = tween;
      };

      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => { if (!cancelled) init(); });
      } else {
        init();
      }

      return () => {
        cancelled = true;
        if (tweenRef.current) tweenRef.current.kill();
        if (splitRef.current) splitRef.current.revert();
      };
    }, []);

    const Comp = as;
    return (
      <Comp ref={ref} className={('split-host ' + className).trim()} style={style}>
        {children}
      </Comp>
    );
  }

  // ----- <ScrollReveal> -----------------------------------------------------
  //  Lightweight fade-up reveal. Wrap any block. Set stagger > 0 to animate
  //  direct children individually.
  // -------------------------------------------------------------------------
  function ScrollReveal({
    children,
    y = 24,
    delay = 0,
    duration = 0.9,
    stagger = 0,
    start = 'top 88%',
    ease = 'power3.out',
    as = 'div',
    className = '',
    style,
  }) {
    const ref = React.useRef(null);

    React.useLayoutEffect(() => {
      const el = ref.current;
      if (!el) return;
      if (prefersReduced || !gsap) return;

      const targets = stagger > 0 ? Array.from(el.children) : el;
      gsap.set(targets, { opacity: 0, y });

      const tween = gsap.to(targets, {
        opacity: 1,
        y: 0,
        duration,
        delay,
        ease,
        stagger,
        ...(ScrollTrigger ? { scrollTrigger: { trigger: el, start, once: true } } : {}),
      });
      return () => tween.kill();
    }, []);

    const Comp = as;
    return (
      <Comp ref={ref} className={className} style={style}>
        {children}
      </Comp>
    );
  }

  // ----- <ClipReveal> -------------------------------------------------------
  //  Clip-path mask reveal paired with a 1.1 → 1 scale, ScrollTrigger driven.
  //  Wrap any block — typically a project swatch.
  // -------------------------------------------------------------------------
  function ClipReveal({ children, duration = 1.1, ease = 'power3.out', start = 'top 88%', className = '', style }) {
    const ref = React.useRef(null);
    React.useLayoutEffect(() => {
      const el = ref.current;
      if (!el) return;
      if (prefersReduced || !gsap) return;
      const inner = el.firstElementChild;
      if (!inner) return;
      gsap.set(el, { clipPath: 'inset(0 0 100% 0)' });
      gsap.set(inner, { scale: 1.1, transformOrigin: 'center center' });
      const tl = gsap.timeline({
        scrollTrigger: ScrollTrigger ? { trigger: el, start, once: true } : undefined,
      });
      tl.to(el, { clipPath: 'inset(0 0 0% 0)', duration, ease }, 0);
      tl.to(inner, { scale: 1, duration: duration * 1.1, ease }, 0);
      return () => { tl.kill(); };
    }, []);
    return <div ref={ref} className={className} style={style}>{children}</div>;
  }

  // ----- <Marquee> ----------------------------------------------------------
  //  Infinite horizontal scroller. Duplicates children once for seamless wrap.
  //  Optional pause-on-hover and click-and-drag.
  // -------------------------------------------------------------------------
  function Marquee({ children, speed = 50, pauseOnHover = true, draggable = true, className = '' }) {
    const wrapRef = React.useRef(null);
    const innerRef = React.useRef(null);
    const trackRef = React.useRef(null);
    const tweenRef = React.useRef(null);

    React.useEffect(() => {
      const inner = innerRef.current;
      const track = trackRef.current;
      const wrap = wrapRef.current;
      if (!inner || !track || !wrap || !gsap) return;
      if (prefersReduced) return; // no infinite loop on reduced motion

      const trackWidth = track.offsetWidth;
      if (trackWidth === 0) return;

      const duration = trackWidth / speed;
      const tween = gsap.to(inner, {
        x: -trackWidth,
        duration,
        ease: 'none',
        repeat: -1,
      });
      tweenRef.current = tween;

      // Pause on hover
      const onEnter = () => tween.timeScale(0.25);
      const onLeave = () => tween.timeScale(1);
      if (pauseOnHover) {
        wrap.addEventListener('mouseenter', onEnter);
        wrap.addEventListener('mouseleave', onLeave);
      }

      // Drag-to-scrub
      let dragging = false, startX = 0, startProg = 0;
      const onDown = (e) => {
        dragging = true;
        startX = (e.touches ? e.touches[0].clientX : e.clientX);
        startProg = tween.progress();
        tween.pause();
        wrap.style.cursor = 'grabbing';
      };
      const onMove = (e) => {
        if (!dragging) return;
        const x = (e.touches ? e.touches[0].clientX : e.clientX);
        const dx = x - startX;
        const delta = dx / trackWidth;
        let p = startProg - delta;
        p = ((p % 1) + 1) % 1;
        tween.progress(p);
      };
      const onUp = () => {
        if (!dragging) return;
        dragging = false;
        wrap.style.cursor = '';
        tween.play();
      };
      if (draggable) {
        wrap.addEventListener('mousedown', onDown);
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
        wrap.addEventListener('touchstart', onDown, { passive: true });
        window.addEventListener('touchmove', onMove, { passive: true });
        window.addEventListener('touchend', onUp);
      }

      return () => {
        tween.kill();
        if (pauseOnHover) {
          wrap.removeEventListener('mouseenter', onEnter);
          wrap.removeEventListener('mouseleave', onLeave);
        }
        if (draggable) {
          wrap.removeEventListener('mousedown', onDown);
          window.removeEventListener('mousemove', onMove);
          window.removeEventListener('mouseup', onUp);
          wrap.removeEventListener('touchstart', onDown);
          window.removeEventListener('touchmove', onMove);
          window.removeEventListener('touchend', onUp);
        }
      };
    }, []);

    return (
      <div
        ref={wrapRef}
        className={'overflow-hidden select-none ' + className}
        style={{ cursor: draggable ? 'grab' : 'default' }}
      >
        <div ref={innerRef} className="flex" style={{ width: 'max-content', willChange: 'transform' }}>
          <div ref={trackRef} className="flex shrink-0">{children}</div>
          <div className="flex shrink-0" aria-hidden="true">{children}</div>
        </div>
      </div>
    );
  }

  // ----- Hook: useSwatchParallax -------------------------------------------
  //  Three-depth parallax inside a container. Pass refs for bg/mid/fg layers.
  //  On mousemove inside the container, layers translate at different rates.
  //  Returns the container ref to attach.
  // -------------------------------------------------------------------------
  function useSwatchParallax(layerRefs, depth = [4, -8, 14]) {
    const containerRef = React.useRef(null);
    React.useEffect(() => {
      const el = containerRef.current;
      if (!el) return;
      if (prefersReduced) return;
      const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
      if (!finePointer) return;

      let raf = 0;
      let mx = 0, my = 0;
      let cx = 0, cy = 0;

      const onMove = (e) => {
        const r = el.getBoundingClientRect();
        mx = (e.clientX - r.left) / r.width - 0.5;
        my = (e.clientY - r.top) / r.height - 0.5;
      };
      const onLeave = () => { mx = 0; my = 0; };

      const tick = () => {
        cx += (mx - cx) * 0.08;
        cy += (my - cy) * 0.08;
        layerRefs.forEach((ref, i) => {
          if (!ref.current) return;
          const d = depth[i] || 0;
          ref.current.style.transform = `translate3d(${cx * d}px, ${cy * d}px, 0)`;
        });
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);

      el.addEventListener('mousemove', onMove);
      el.addEventListener('mouseleave', onLeave);
      return () => {
        cancelAnimationFrame(raf);
        el.removeEventListener('mousemove', onMove);
        el.removeEventListener('mouseleave', onLeave);
      };
    }, []);
    return containerRef;
  }

  // ----- Global scroll-velocity skew driver --------------------------------
  //  Any element marked [data-skew] gets a subtle, capped skewY proportional
  //  to current scroll velocity. Decays toward 0 when idle.
  // -------------------------------------------------------------------------
  let skewBooted = false;
  function bootScrollVelocitySkew() {
    if (skewBooted || prefersReduced || !gsap) return;
    skewBooted = true;
    let lastY = window.scrollY;
    let lastT = performance.now();
    let skew = 0;
    const MAX_SKEW = 2.5;
    gsap.ticker.add(() => {
      const y = window.scrollY;
      const t = performance.now();
      const dt = t - lastT;
      const dy = y - lastY;
      let target = 0;
      if (dt > 0) target = (dy / dt) * 0.6; // ms-normalized
      target = Math.max(-MAX_SKEW, Math.min(MAX_SKEW, target));
      skew += (target - skew) * 0.18;
      if (Math.abs(dy) < 0.3) skew *= 0.85; // idle decay
      const els = document.querySelectorAll('[data-skew]');
      for (let i = 0; i < els.length; i++) {
        els[i].style.transform = `skewY(${skew.toFixed(3)}deg)`;
      }
      lastY = y;
      lastT = t;
    });
  }

  // Expose
  Object.assign(window, {
    initLenis,
    destroyLenis,
    useReducedMotion,
    SplitReveal,
    ScrollReveal,
    ClipReveal,
    Marquee,
    useSwatchParallax,
    bootScrollVelocitySkew,
    __prefersReducedMotion: prefersReduced,
  });
})();
