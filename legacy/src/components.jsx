// Shared components: cursor, progress, nav, magnetic button, mask reveal, grain
const { motion } = window.Motion;
const { useState, useEffect, useRef, useLayoutEffect } = React;

/* ----------------------------- Custom Cursor ----------------------------- */
function CustomCursor() {
  const ringRef = useRef(null);
  const dotRef = useRef(null);
  const labelRef = useRef(null);
  const pos = useRef({ x: -100, y: -100 });
  const ringPos = useRef({ x: -100, y: -100 });
  const [state, setState] = useState({ hovering: false, label: '' });
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    setEnabled(finePointer);
    if (!finePointer) return;

    const onMove = (e) => {
      pos.current.x = e.clientX;
      pos.current.y = e.clientY;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%,-50%)`;
      }
    };
    const onOver = (e) => {
      const t = e.target;
      if (!t || !t.closest) return;
      const labelEl = t.closest('[data-cursor-label]');
      const hoverEl = t.closest('a, button, [data-magnetic], [data-cursor-hover]');
      const label = labelEl ? labelEl.getAttribute('data-cursor-label') : '';
      const hovering = !!hoverEl || !!labelEl;
      setState((s) => (s.hovering === hovering && s.label === label ? s : { hovering, label }));
    };

    let raf;
    const loop = () => {
      ringPos.current.x += (pos.current.x - ringPos.current.x) * 0.18;
      ringPos.current.y += (pos.current.y - ringPos.current.y) * 0.18;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${ringPos.current.x}px, ${ringPos.current.y}px) translate(-50%,-50%)`;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseover', onOver);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseover', onOver);
    };
  }, []);

  if (!enabled) return null;
  const ringClass = state.label
    ? 'cursor-ring labeled'
    : state.hovering
      ? 'cursor-ring hover'
      : 'cursor-ring';
  return (
    <React.Fragment>
      <div ref={ringRef} className={ringClass}>
        {state.label && <span ref={labelRef} className="cursor-label">{state.label}</span>}
      </div>
      <div ref={dotRef} className="cursor-dot" />
    </React.Fragment>
  );
}

/* --------------------------- Scroll Progress Bar --------------------------- */
function ScrollProgress() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? window.scrollY / max : 0);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);
  return (
    <div
      style={{ transform: `scaleX(${progress})`, transformOrigin: '0% 50%' }}
      className="fixed top-0 left-0 right-0 h-px bg-amber z-[70] transition-transform duration-100 ease-out"
      aria-hidden="true"
    />
  );
}

/* ------------------------------- Live Clock ------------------------------- */
function LiveClock() {
  const [time, setTime] = useState(() => formatCairoTime());
  useEffect(() => {
    const id = setInterval(() => setTime(formatCairoTime()), 1000);
    return () => clearInterval(id);
  }, []);
  return <span className="font-mono text-[11px] tracking-[0.18em] text-inkdim tabular-nums">{time}</span>;
}
function formatCairoTime() {
  try {
    return new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Africa/Cairo',
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
    }).format(new Date()) + ' CAI';
  } catch { return ''; }
}

/* -------------------------------- Top Nav -------------------------------- */
function TopNav({ theme, setTheme }) {
  const t = window.useT ? window.useT() : ((k) => k);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState('');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Lock body scroll while the mobile drawer is open
  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }
  }, [open]);

  // Esc closes the mobile drawer
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const links = [
    { href: '#work', label: t('nav.work') },
    { href: '#experience', label: t('nav.experience') },
    { href: '#certifications', label: t('nav.certifications') },
    { href: '#stack', label: t('nav.stack') },
    { href: '#contact', label: t('nav.contact') },
  ];

  useEffect(() => {
    const ids = ['work', 'experience', 'certifications', 'stack', 'contact'];
    const onScroll = () => {
      const bandY = window.innerHeight * 0.42;
      let current = '';
      for (const id of ids) {
        const el = document.getElementById(id);
        if (!el) continue;
        const r = el.getBoundingClientRect();
        if (r.top <= bandY && r.bottom >= bandY) {
          current = id;
          break;
        }
      }
      setActive(current);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <React.Fragment>
      <nav
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${scrolled || open ? 'backdrop-blur-md bg-bg/70 border-b border-line' : 'bg-transparent'}`}
      >
        <div className="max-w-[1200px] mx-auto px-6 md:px-10 h-16 flex items-center justify-between gap-4">
          <a href="#top" className="flex items-baseline gap-3 shrink-0" onClick={() => setOpen(false)}>
            <span className="font-serif text-[20px] leading-none">Paula Magdy</span>
            <span className="hidden md:inline text-inkmute text-[12px] font-mono whitespace-nowrap">— {t('nav.cairo')}</span>
          </a>

          {/* Desktop links */}
          <ul className="hidden md:flex items-center gap-8">
            {links.map((l, i) => {
              const isActive = active === l.href.slice(1);
              return (
                <li key={l.href}>
                  <a
                    href={l.href}
                    className={`group flex items-center gap-2 text-[13px] transition-colors ${isActive ? 'text-ink' : 'text-inkdim hover:text-ink'}`}
                  >
                    <span className={`font-mono text-[10px] transition-colors ${isActive ? 'text-amber' : 'text-inkmute group-hover:text-amber'}`}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="relative">
                      {l.label}
                      <span
                        className={`absolute left-0 right-0 -bottom-1 h-px bg-amber origin-left transition-transform duration-500 ease-out ${isActive ? 'scale-x-100' : 'scale-x-0'}`}
                      />
                    </span>
                  </a>
                </li>
              );
            })}
          </ul>

          <div className="flex items-center gap-3 shrink-0">
            <span className="hidden sm:inline"><LiveClock /></span>
            {window.LocaleToggle ? React.createElement(window.LocaleToggle) : null}
            <ThemeToggle theme={theme} setTheme={setTheme} />
            {/* Hamburger — mobile only */}
            <button
              type="button"
              onClick={() => setOpen(v => !v)}
              aria-label={open ? t('nav.closeMenu') : t('nav.openMenu')}
              aria-expanded={open}
              className="md:hidden relative w-9 h-9 flex items-center justify-center rounded-full border border-line bg-bg2/60"
            >
              <span className={`block w-4 h-px bg-ink transition-all duration-300 ${open ? 'rotate-45 translate-y-px' : '-translate-y-1'}`} />
              <span className={`block w-4 h-px bg-ink transition-all duration-300 absolute ${open ? '-rotate-45' : 'translate-y-1'}`} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile drawer — full-screen overlay */}
      <div
        className={`fixed inset-0 z-40 md:hidden transition-opacity duration-300 ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        aria-hidden={!open}
      >
        <div className="absolute inset-0 bg-bg/95 backdrop-blur-md" onClick={() => setOpen(false)} />
        <div className="relative h-full flex flex-col px-6 pt-24 pb-10 overflow-y-auto">
          <ul className="flex flex-col gap-1">
            {links.map((l, i) => {
              const isActive = active === l.href.slice(1);
              return (
                <li key={l.href} className="border-b border-line">
                  <a
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className={`group flex items-baseline gap-4 py-5 transition-colors ${isActive ? 'text-amber' : 'text-ink hover:text-amber'}`}
                  >
                    <span className="font-mono text-[11px] tracking-[0.18em] text-inkmute group-hover:text-amber transition-colors">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="font-serif text-[40px] leading-none">{l.label}</span>
                  </a>
                </li>
              );
            })}
          </ul>

          <div className="mt-auto pt-10 flex items-center justify-between text-[11px] font-mono text-inkmute">
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <LiveClock />
            </span>
            <span>{t('nav.cairo')}</span>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
}

/* ----------------------------- Magnetic Button ---------------------------- */
function Magnetic({ children, className = '', strength = 0.25, as = 'button', ...rest }) {
  const ref = useRef(null);
  const [transform, setTransform] = useState({ x: 0, y: 0 });
  const handleMove = (e) => {
    const r = ref.current.getBoundingClientRect();
    const x = (e.clientX - r.left - r.width / 2) * strength;
    const y = (e.clientY - r.top - r.height / 2) * strength;
    setTransform({ x, y });
  };
  const reset = () => setTransform({ x: 0, y: 0 });
  const Comp = motion[as] || motion.button;
  return (
    <Comp
      ref={ref}
      data-magnetic
      onMouseMove={handleMove}
      onMouseLeave={reset}
      animate={{ x: transform.x, y: transform.y }}
      transition={{ type: 'spring', stiffness: 200, damping: 18, mass: 0.4 }}
      className={className}
      {...rest}
    >
      {children}
    </Comp>
  );
}

/* ------------------------------ Mask Reveal ------------------------------ */
function MaskReveal({ children, delay = 0, className = '' }) {
  return (
    <span className={`mask-line ${className}`}>
      <motion.span
        className="mask-inner"
        initial={{ y: '110%' }}
        animate={{ y: '0%' }}
        transition={{ duration: 1.1, delay, ease: [0.2, 0.7, 0.2, 1] }}
      >
        {children}
      </motion.span>
    </span>
  );
}

/* ------------------------------ Reveal in View ------------------------------ */
function Reveal({ children, delay = 0, y = 24, className = '', as = 'div' }) {
  const Comp = motion[as] || motion.div;
  return (
    <Comp
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.9, delay, ease: [0.2, 0.7, 0.2, 1] }}
      className={className}
    >
      {children}
    </Comp>
  );
}

/* ------------------------------- Section Head ------------------------------- */
function SectionHead({ num, label, kicker, children }) {
  const ruleRef = useRef(null);
  useEffect(() => {
    const el = ruleRef.current;
    if (!el || window.__prefersReducedMotion || !window.gsap) return;
    window.gsap.set(el, { scaleX: 0, transformOrigin: '0% 50%' });
    const tween = window.gsap.to(el, {
      scaleX: 1,
      duration: 1.1,
      ease: 'power3.out',
      scrollTrigger: window.ScrollTrigger
        ? { trigger: el, start: 'top 88%', once: true }
        : undefined,
    });
    return () => tween.kill();
  }, []);
  return (
    <div className="flex items-baseline gap-6 mb-10 md:mb-16">
      <div className="flex items-baseline gap-4 shrink-0">
        <span className="font-mono text-[11px] tracking-[0.2em] text-amber">{num}</span>
        <span className="section-num text-inkmute">— {label}</span>
      </div>
      <div ref={ruleRef} className="h-rule flex-1 translate-y-[-2px]" />
    </div>
  );
}

/* ------------------------------ Availability Pill ----------------------------- */
function AvailabilityPill() {
  const t = window.useT ? window.useT() : ((k) => k);
  return (
    <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full border border-line bg-bg2/60 backdrop-blur-sm">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
      </span>
      <span className="text-[11px] font-mono tracking-[0.05em] text-inkdim">{t('hero.availability')}</span>
    </div>
  );
}

/* ------------------------------ Icons (inline) ------------------------------ */
const Icon = {
  ArrowUpRight: (props) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="7" y1="17" x2="17" y2="7" />
      <polyline points="7 7 17 7 17 17" />
    </svg>
  ),
  ArrowDown: (props) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="12" y1="5" x2="12" y2="19" />
      <polyline points="19 12 12 19 5 12" />
    </svg>
  ),
  Download: (props) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  ),
  Copy: (props) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  ),
  Check: (props) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  Github: (props) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 .5C5.73.5.96 5.27.96 11.54c0 4.86 3.15 8.99 7.52 10.45.55.1.75-.24.75-.53 0-.26-.01-.95-.02-1.86-3.06.66-3.71-1.47-3.71-1.47-.5-1.27-1.22-1.6-1.22-1.6-.99-.68.08-.67.08-.67 1.1.08 1.68 1.13 1.68 1.13.98 1.68 2.57 1.2 3.19.92.1-.71.38-1.2.7-1.48-2.44-.28-5.02-1.22-5.02-5.45 0-1.21.43-2.19 1.13-2.96-.11-.28-.49-1.4.11-2.92 0 0 .93-.3 3.05 1.13a10.6 10.6 0 0 1 5.55 0c2.11-1.43 3.04-1.13 3.04-1.13.6 1.52.22 2.64.11 2.92.7.77 1.13 1.75 1.13 2.96 0 4.24-2.59 5.16-5.05 5.44.39.34.74 1.01.74 2.04 0 1.47-.01 2.66-.01 3.02 0 .3.2.64.76.53 4.36-1.46 7.51-5.59 7.51-10.45C23.04 5.27 18.27.5 12 .5z" />
    </svg>
  ),
  Linkedin: (props) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.95v5.66H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z" />
    </svg>
  ),
  Code: (props) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  ),
  Terminal: (props) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="4 17 10 11 4 5" />
      <line x1="12" y1="19" x2="20" y2="19" />
    </svg>
  ),
  Mail: (props) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  ),
  Sun: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
    </svg>
  ),
  Moon: (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  ),
};

/* ------------------------------ Theme Toggle ------------------------------ */
//  Click triggers a radial clip-path unmask: an overlay painted with the NEW
//  theme's --bg color expands from the toggle's centerpoint and covers the
//  viewport, the theme swap happens behind it at peak coverage, then the
//  overlay fades away revealing the newly-themed page.
function ThemeToggle({ theme, setTheme }) {
  const isLight = theme === 'light';
  const next = isLight ? 'dark' : 'light';

  const handleClick = (e) => {
    // Reduced-motion or no GSAP => instant swap
    if (window.__prefersReducedMotion || !window.gsap) {
      setTheme(next);
      return;
    }
    const btn = e.currentTarget;
    const rect = btn.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    // Read the NEXT theme's --bg by briefly swapping the attribute on <html>
    // (`:root[data-theme="..."]` only matches <html>, so a detached probe div
    // would inherit the current theme's vars and return the wrong color).
    // The swap + read + restore is synchronous — no paint occurs between
    // getComputedStyle calls, so the page never flickers.
    const root = document.documentElement;
    const prevAttr = root.getAttribute('data-theme') || 'dark';
    root.setAttribute('data-theme', next);
    const bgRaw = getComputedStyle(root).getPropertyValue('--bg').trim();
    root.setAttribute('data-theme', prevAttr);

    // Build overlay
    const overlay = document.createElement('div');
    overlay.className = 'theme-overlay';
    overlay.style.background = `rgb(${bgRaw})`;
    overlay.style.clipPath = `circle(0px at ${cx}px ${cy}px)`;
    overlay.style.webkitClipPath = `circle(0px at ${cx}px ${cy}px)`;
    document.body.appendChild(overlay);

    // Max radius = farthest viewport corner from the click point
    const w = window.innerWidth, h = window.innerHeight;
    const maxR = Math.hypot(Math.max(cx, w - cx), Math.max(cy, h - cy));

    window.gsap.to(overlay, {
      clipPath: `circle(${maxR}px at ${cx}px ${cy}px)`,
      webkitClipPath: `circle(${maxR}px at ${cx}px ${cy}px)`,
      duration: 0.7,
      ease: 'power2.inOut',
      onComplete: () => {
        // Swap theme behind the overlay
        setTheme(next);
        // Drop the overlay after one frame so the swap commits first
        requestAnimationFrame(() => {
          window.gsap.to(overlay, {
            opacity: 0,
            duration: 0.35,
            ease: 'power2.out',
            onComplete: () => overlay.remove(),
          });
        });
      },
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="theme-toggle"
      aria-label={`Switch to ${next} mode`}
      title={`Switch to ${next} mode`}
    >
      <span className="knob">
        {isLight
          ? <Icon.Sun className="ico" />
          : <Icon.Moon className="ico" />}
      </span>
    </button>
  );
}

Object.assign(window, {
  CustomCursor, ScrollProgress, TopNav, Magnetic, MaskReveal, Reveal,
  SectionHead, AvailabilityPill, LiveClock, Icon, ThemeToggle
});
