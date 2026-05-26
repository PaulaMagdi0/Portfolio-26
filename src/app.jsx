// App entry — wraps the tree in LocaleProvider so all sections can call useT()
function AppShell() {
  const { locale } = window.useLocale ? window.useLocale() : { locale: 'en' };
  // Initialise theme from the OS preference. Once the user toggles manually,
  // their choice wins for the rest of the session.
  const [theme, setTheme] = React.useState(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    }
    return 'dark';
  });
  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const t = window.useT ? window.useT() : ((k) => k);

  // Lenis smooth scroll + ScrollTrigger sync (init once)
  React.useEffect(() => {
    if (typeof window.initLenis === 'function') {
      window.initLenis();
    }
    if (typeof window.bootScrollVelocitySkew === 'function') {
      window.bootScrollVelocitySkew();
    }

    /* ---- Page loader: drive the counter, status, and progress bar ---- */
    const counter = document.querySelector('[data-loader-counter]');
    const status = document.querySelector('[data-loader-status]');
    const fill = document.querySelector('[data-loader-fill]');
    const STAGES = [
      t('loader.initializing'),
      t('loader.loadingAssets'),
      t('loader.loadingFonts'),
      t('loader.compositing'),
      t('loader.almostReady'),
    ];
    let pct = 0;
    let stageIdx = 0;
    let rafId = 0;
    let fontsReady = false;
    let cancelled = false;

    const apply = () => {
      if (counter) counter.textContent = String(Math.floor(pct)).padStart(2, '0');
      if (fill) fill.style.transform = `scaleX(${pct / 100})`;
      const newStage = Math.min(STAGES.length - 1, Math.floor(pct / 22));
      if (newStage !== stageIdx && status) {
        stageIdx = newStage;
        status.style.opacity = '0';
        setTimeout(() => {
          if (cancelled) return;
          status.textContent = STAGES[newStage];
          status.style.opacity = '1';
        }, 180);
      }
    };
    apply();

    const tick = () => {
      if (cancelled) return;
      const target = fontsReady ? 100 : 92;
      const step = (target - pct) * 0.06 + 0.3;
      pct = Math.min(target, pct + step);
      apply();
      if (pct < 100) {
        rafId = requestAnimationFrame(tick);
      } else {
        setTimeout(() => {
          if (!cancelled) document.documentElement.classList.add('loaded');
        }, 280);
      }
    };
    rafId = requestAnimationFrame(tick);

    const onFontsReady = () => { fontsReady = true; };
    if (document.fonts && document.fonts.ready) {
      Promise.all([
        document.fonts.ready,
        new Promise(r => setTimeout(r, 900)),
      ]).then(onFontsReady);
    } else {
      setTimeout(onFontsReady, 1200);
    }

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      if (typeof window.destroyLenis === 'function') window.destroyLenis();
    };
  }, []);

  return (
    <React.Fragment>
      <CustomCursor />
      <ScrollProgress />
      <TopNav theme={theme} setTheme={setTheme} />
      <main id="main" className="relative z-10">
        <Hero />
        <Work />
        <Experience />
        <Education />
        <Certifications />
        <Stack />
        <Contact />
      </main>
    </React.Fragment>
  );
}

function App() {
  const Provider = window.LocaleProvider || React.Fragment;
  return React.createElement(Provider, null, React.createElement(AppShell));
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
