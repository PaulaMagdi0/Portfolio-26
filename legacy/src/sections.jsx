// Sections: Hero, Work, Experience, Education, Stack, Contact
const { motion: _m, useScroll: _useScroll, useTransform: _useTransform, AnimatePresence } = window.Motion;

/* ----------------------- Animated Metric Counter ------------------------- */
//  Pulls a number out of strings like "2,000+", "−35%", "4×", "99.9%" and
//  animates it from 0 → target when the element scrolls into view. Strings
//  with no numeric content (e.g. "k-scale", "realtime", "prod") render as-is.
function parseMetric(v) {
  const match = String(v).match(/^([^\d.]*?)([\d.,]+)([^\d]*)$/);
  if (!match) return { static: true, raw: v };
  const numStr = match[2].replace(/,/g, '');
  const num = parseFloat(numStr);
  if (isNaN(num)) return { static: true, raw: v };
  return {
    prefix: match[1],
    num,
    suffix: match[3],
    hasComma: match[2].includes(','),
    isFloat: numStr.includes('.'),
  };
}
function formatMetric(p, current) {
  if (p.static) return p.raw;
  let str = p.isFloat ? current.toFixed(1) : String(Math.round(current));
  if (p.hasComma) str = parseInt(str, 10).toLocaleString();
  return p.prefix + str + p.suffix;
}
function AnimatedMetric({ value }) {
  const ref = React.useRef(null);
  const parsed = React.useMemo(() => parseMetric(value), [value]);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (parsed.static || !window.gsap || window.__prefersReducedMotion) {
      el.textContent = value;
      return;
    }
    const obj = { n: 0 };
    el.textContent = formatMetric(parsed, 0);
    const tween = window.gsap.to(obj, {
      n: parsed.num,
      duration: 1.6,
      ease: 'power2.out',
      onUpdate: () => { el.textContent = formatMetric(parsed, obj.n); },
      scrollTrigger: window.ScrollTrigger
        ? { trigger: el, start: 'top 92%', once: true }
        : undefined,
    });
    return () => tween.kill();
  }, [parsed, value]);
  return <span ref={ref}>{value}</span>;
}

/* --------------------------------- HERO --------------------------------- */
function Hero() {
  const t = window.useT ? window.useT() : ((k) => k);
  const [scroll, setScroll] = React.useState(0);
  React.useEffect(() => {
    const onScroll = () => setScroll(window.scrollY);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  const heroY = Math.min(80, scroll * 0.13);
  const heroOpacity = Math.max(0.35, 1 - scroll / 600);

  return (
    <section id="top" className="relative min-h-screen flex flex-col pt-28 md:pt-32 pb-12 md:pb-16 px-6 md:px-10 overflow-hidden">
      {/* 3D animation — desktop only (collides with text on tablet portrait) */}
      <div className="absolute inset-0 max-w-[1200px] mx-auto pointer-events-none hidden lg:block">
        <div className="absolute right-[-40px] xl:right-[-60px] 2xl:right-[-80px] top-1/2 -translate-y-1/2 w-[420px] h-[420px] xl:w-[520px] xl:h-[520px] 2xl:w-[640px] 2xl:h-[640px] text-amber">
          {window.Hero3D ? React.createElement(window.Hero3D) : null}
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto w-full relative z-10 flex-1 flex flex-col">

        {/* Eyebrow row — pinned to the top of the hero */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
          <_m.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1.1, delay: 0.2, ease: [0.2, 0.7, 0.2, 1] }}
            className="w-12 h-px bg-amber origin-left"
          />
          <_m.span
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
            className="font-mono text-[11px] tracking-[0.2em] text-inkdim uppercase"
          >
            {t('hero.portfolio')}
          </_m.span>
          <_m.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.0, duration: 0.7 }}
            className="md:ml-auto order-last md:order-none w-full md:w-auto"
          >
            <AvailabilityPill />
          </_m.div>
        </div>

        {/* Text stack — headline / description / CTAs, vertically centered in remaining space */}
        <div className="flex-1 flex flex-col justify-center">
          <div className="lg:max-w-[58%]">
            <_m.div style={{ y: heroY, opacity: heroOpacity }}>
              <h1 className="font-serif text-[14vw] sm:text-[12vw] md:text-[9.5vw] lg:text-[120px] xl:text-[140px] 2xl:text-[160px] leading-[0.95] tracking-[-0.02em] text-ink">
                <SplitReveal mode="instant" delay={0.15} stagger={0.014} duration={1.0}>
                  {t('hero.headline')}<span className="text-amber">.</span>
                </SplitReveal>
              </h1>
            </_m.div>

            <_m.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0, duration: 0.9 }}
              className="mt-8 md:mt-10 max-w-[560px]"
            >
              <span className="block uppercase tracking-[0.18em] text-[11px] font-mono text-amber mb-3">
                {t('hero.kicker')}
              </span>
              <p className="text-inkdim text-[15px] md:text-[17px] leading-[1.55]">
                {t('hero.descriptionLead')}
                <span className="text-ink">{t('hero.descriptionEmph')}</span>
              </p>
            </_m.div>

            <_m.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.9 }}
              className="mt-8 md:mt-10 flex flex-wrap gap-3"
            >
              <Magnetic as="a" href="#work" className="btn-base btn-primary">
                {t('hero.ctaWork')}
                <Icon.ArrowDown />
              </Magnetic>
              <Magnetic as="a" href="https://drive.google.com/file/d/1doOUYS38wM91LZ11xz4Qv9ZyLEeA2k9B/view" target="_blank" rel="noreferrer" className="btn-base btn-ghost" data-cursor-label="open">
                {t('hero.ctaResume')}
                <Icon.Download />
              </Magnetic>
            </_m.div>
          </div>
        </div>
      </div>
    </section>
  );
}
function MetaCell({ label, value }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-inkmute uppercase tracking-[0.18em] text-[10px]">{label}</span>
      <span className="text-ink">{value}</span>
    </div>
  );
}

/* ----------------------------- SELECTED WORK ----------------------------- */
//  kind:  'live'    → click opens project.url in a new tab (falls back to drawer if no url)
//         'private' → click opens an in-page case-study drawer
//  badge → small uppercase tag rendered in the swatch corner
const WORK_DATA = [
  {
    id: 'mie',
    name: 'Make it in the Emirates — Awards Platform',
    company: 'Challenge Group',
    period: 'Oct 2025 — Present',
    blurb: 'Government platform for the UAE Ministry of Industry & Advanced Technology. End-to-end ownership across frontend, backend, infra, and CI/CD.',
    metrics: [
      { v: '2,000+', l: 'concurrent users', lKey: 'metric.users' },
      { v: '−35%',  l: 'API latency',       lKey: 'metric.latency' },
      { v: '4×',    l: 'faster deploys',    lKey: 'metric.deploys' },
    ],
    stack: ['Next.js','NestJS','PostgreSQL','Prisma','AWS (VPC, EC2, RDS, S3, CloudFront, ECS, CodePipeline)','Docker','Vitest','Playwright'],
    swatch: ['#1a1410','#3a2a18','#d4a574'],
    kind: 'live',
    url: 'https://awards.miite.ae/en',
    badge: 'LIVE',
    caseStudy: {
      role: 'Lead Full-Stack Engineer',
      problem: 'Deliver a public-facing awards platform for the UAE Ministry of Industry & Advanced Technology — concurrent traffic from applicants, jurors, and program operators, with the security and uptime expectations of a government deployment.',
      architecture: 'Next.js frontend and NestJS backend over PostgreSQL with Prisma. AWS infrastructure across VPC, EC2, RDS, S3, CloudFront, ECS, and CodePipeline. Container-based deploys, Vitest + Playwright for unit/E2E coverage, structured logging into CloudWatch.',
      contributions: [
        'Owned the frontend architecture, API surface, database schema, and AWS infra end-to-end.',
        'Rewrote the deployment pipeline around containers + CodePipeline, taking releases from 20 minutes to under five.',
        'Optimised PostgreSQL queries and added a targeted caching layer that cut median API latency by 35%.',
        'Introduced structured logging + dashboards that reduced mean time to issue detection by ~40%.',
      ],
    },
  },
  {
    id: 'sabeel',
    name: 'Sabeel — Mobile Backend',
    company: 'Backend Engineer',
    period: '2024',
    blurb: 'Backend powering a high-traffic mobile product. Hardened the API surface, cut latency, and shipped reliable infra on AWS.',
    metrics: [
      { v: '−30%',    l: 'API latency',       lKey: 'metric.latency' },
      { v: 'k‑scale', l: 'active users',      lKey: 'metric.active' },
      { v: '99.9%',   l: 'pipeline uptime',   lKey: 'metric.uptime' },
    ],
    stack: ['Laravel','PHP','MySQL','AWS (ECS, ECR, RDS, VPC, ALB, S3, CloudFront, CloudWatch)','CI/CD'],
    swatch: ['#11171a','#1c2a32','#7ea7b8'],
    kind: 'private',
    badge: 'BACKEND · PRIVATE',
    caseStudy: {
      role: 'Backend Engineer',
      problem: 'A growing mobile app needed a backend that could handle thousands of concurrent users without latency spikes, plus a deploy pipeline the team could trust.',
      architecture: 'Laravel API on AWS ECS behind an ALB, MySQL on RDS, static assets through S3 + CloudFront. CI/CD pushing through ECR with CloudWatch monitoring and alerts.',
      contributions: [
        'Profiled and refactored the hottest endpoints, dropping median latency by ~30%.',
        'Containerised the API and moved deployments onto ECS for predictable rollouts.',
        'Hardened auth, role-based access, and request validation across the API surface.',
        'Set up CloudWatch dashboards and alarms so on-call could spot regressions in minutes.',
      ],
    },
  },
  {
    id: 'esl',
    name: 'Egyptian Schools League — Competition Engine',
    company: 'Full-Stack',
    period: '2025',
    blurb: 'Modular competition engine with real-time leaderboards. Replaced spreadsheet workflows with a configurable rules engine.',
    metrics: [
      { v: '−80%',     l: 'manual admin',          lKey: 'metric.admin' },
      { v: '+50%',     l: 'processing efficiency', lKey: 'metric.efficiency' },
      { v: 'realtime', l: 'leaderboards',          lKey: 'metric.leaderboards' },
    ],
    stack: ['Next.js','NestJS','TypeScript','PostgreSQL','Prisma','Docker'],
    swatch: ['#10130f','#1c2a1a','#a8c190'],
    kind: 'live',
    url: 'https://esl.moe.gov.eg/ar',
    badge: 'LIVE',
    caseStudy: {
      role: 'Full-Stack Engineer',
      problem: 'Operators were running national school competitions out of spreadsheets — slow scoring, fragile state, and no real-time visibility for participants.',
      architecture: 'Next.js front-end, NestJS back-end with a modular rules engine, PostgreSQL via Prisma, and a Docker-based deploy. WebSockets for live leaderboard updates.',
      contributions: [
        'Designed the rules-engine abstraction so new competition formats are config, not code.',
        'Built the real-time leaderboard pipeline and the operator dashboards that consume it.',
        'Reduced manual admin work by ~80% by replacing spreadsheet ingest with structured forms + validation.',
      ],
    },
  },
  {
    id: 'wabot',
    name: 'WhatsApp AI Chatbot Automation',
    company: 'Serverless',
    period: '2024',
    blurb: 'Serverless AI chatbot combining Amazon Lex and Twilio to automate customer-support workflows on WhatsApp.',
    metrics: [
      { v: '60%',   l: 'support automated',   lKey: 'metric.automated' },
      { v: '0ms',   l: 'cold-start budget*',  lKey: 'metric.coldstart' },
      { v: 'event', l: 'driven arch',         lKey: 'metric.eventarch' },
    ],
    stack: ['Python','AWS Lambda','Amazon Lex','Twilio API','AWS Secrets Manager','CloudWatch'],
    swatch: ['#0f1316','#1a2330','#88a6d4'],
    kind: 'private',
    badge: 'INTERNAL · AUTOMATION',
    caseStudy: {
      role: 'Serverless Engineer',
      problem: 'Support agents were drowning in repetitive WhatsApp inquiries — order status, hours, common FAQs — and customers waited hours for answers any bot could give in seconds.',
      architecture: 'Twilio webhook → AWS Lambda (Python) → Amazon Lex for intent + slot filling, with secrets in AWS Secrets Manager and CloudWatch for traceability. Pure event-driven: scales to zero between conversations.',
      contributions: [
        'Designed intent + slot taxonomy across the support team\'s real ticket history.',
        'Wrote the Lambda orchestration that bridges Lex, Twilio, and the internal CRM.',
        'Automated ~60% of inbound conversations end-to-end, escalating cleanly to a human when confidence dropped.',
      ],
    },
  },
  {
    id: 'eltan',
    name: 'Eltanfeethi — Azure Delivery',
    company: 'Cloud Lead',
    period: '2024',
    blurb: 'Led Azure infrastructure, release pipelines, and production deployment for a managed government-services platform.',
    metrics: [
      { v: 'Azure', l: 'infra + APIM',       lKey: 'metric.infra' },
      { v: 'CI/CD', l: 'release pipelines',  lKey: 'metric.pipelines' },
      { v: 'prod',  l: 'shipped',            lKey: 'metric.shipped' },
    ],
    stack: ['Microsoft Azure','Azure API Management','CI/CD'],
    swatch: ['#0f1116','#1a1d2a','#c1b5d6'],
    kind: 'private',
    badge: 'CLOUD · API GATEWAY',
    caseStudy: {
      role: 'Cloud Delivery Lead',
      problem: 'A managed government-services platform needed Azure infra stood up, API gateway in place, and a release process the team could actually trust before going to production.',
      architecture: 'Azure compute + storage, Azure API Management fronting the service surface, release pipelines through Azure DevOps with environment gates.',
      contributions: [
        'Designed the Azure infrastructure layout — subscriptions, network, identity, and policy.',
        'Configured API Management with the routing, throttling, and key-management the platform required.',
        'Built the release pipelines and gates that took the platform from staging into a production rollout.',
      ],
    },
  },
];

/* ----------------- CASE STUDY DRAWER (in-page side panel) ----------------- */
//  Right-side slide-in drawer for private projects. Sits above page content
//  with a backdrop, locks body scroll, and closes on backdrop click or Esc.
function CSBlock({ label, children, last, delay = 0 }) {
  return (
    <_m.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.65, delay, ease: [0.2, 0.7, 0.2, 1] }}
      className={last ? '' : 'mb-8 md:mb-10'}
    >
      <span className="block font-mono text-[10px] uppercase tracking-[0.18em] text-amber mb-3">{label}</span>
      {children}
    </_m.div>
  );
}

function CaseStudyDrawer({ project, onClose }) {
  const t = window.useT ? window.useT() : ((k, fb) => fb || k);
  React.useEffect(() => {
    if (!project) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    // Pause Lenis smooth-scroll so wheel events don't drive the page underneath
    if (window.lenisInstance && typeof window.lenisInstance.stop === 'function') {
      window.lenisInstance.stop();
    }
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
      if (window.lenisInstance && typeof window.lenisInstance.start === 'function') {
        window.lenisInstance.start();
      }
    };
  }, [project, onClose]);

  return (
    <AnimatePresence>
      {project && (
        <_m.div key="cs-root" className="fixed inset-x-0 top-16 bottom-0 z-[40]">
          {/* Backdrop */}
          <_m.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="absolute inset-0 bg-bg/85 backdrop-blur-sm"
          />
          {/* Drawer */}
          <_m.aside
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.45, ease: [0.2, 0.7, 0.2, 1] }}
            data-lenis-prevent
            className="absolute right-0 top-0 h-full w-full md:w-[680px] bg-bg2 border-l border-line overflow-y-auto overscroll-contain"
          >
            <div className="sticky top-0 z-10 bg-bg2/95 backdrop-blur flex items-center justify-between px-6 md:px-10 py-5 border-b border-line">
              <span className="font-mono text-[10px] tracking-[0.2em] text-amber uppercase">
                Case Study {project.badge ? <span className="text-inkmute">· {project.badge}</span> : null}
              </span>
              <button
                onClick={onClose}
                aria-label="Close case study"
                data-cursor-label="close"
                className="w-9 h-9 flex items-center justify-center rounded-full border border-line hover:border-amber hover:text-amber transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <line x1="5" y1="5" x2="19" y2="19" />
                  <line x1="19" y1="5" x2="5" y2="19" />
                </svg>
              </button>
            </div>

            <div className="px-6 md:px-10 py-8 md:py-12">
              <_m.h2
                key={project.id + '-h'}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.75, ease: [0.2, 0.7, 0.2, 1], delay: 0.05 }}
                className="font-serif text-[30px] md:text-[44px] leading-[1.05] text-ink mb-3"
              >
                {project.name}
              </_m.h2>
              <_m.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, ease: 'easeOut', delay: 0.18 }}
                className="flex items-center gap-3 text-[12px] font-mono text-inkdim mb-10"
              >
                <span>{project.company}</span>
                <span className="w-1 h-1 rounded-full bg-inkmute" />
                <span>{project.period}</span>
              </_m.div>

              <CSBlock label={t('cs.role')} delay={0.28}>
                <p className="font-serif text-[20px] text-ink">{project.caseStudy.role}</p>
              </CSBlock>

              <CSBlock label={t('cs.problem')} delay={0.36}>
                <p className="text-[15px] text-inkdim leading-relaxed">{project.caseStudy.problem}</p>
              </CSBlock>

              <CSBlock label={t('cs.architecture')} delay={0.44}>
                <p className="text-[15px] text-inkdim leading-relaxed">{project.caseStudy.architecture}</p>
              </CSBlock>

              <CSBlock label={t('cs.contributions')} delay={0.52}>
                <ul className="space-y-3">
                  {project.caseStudy.contributions.map((c, i) => (
                    <_m.li
                      key={i}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.62 + i * 0.08, ease: [0.2, 0.7, 0.2, 1] }}
                      className="flex gap-3 text-[14px] text-inkdim leading-relaxed"
                    >
                      <_m.span
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 0.45, delay: 0.7 + i * 0.08, ease: [0.2, 0.7, 0.2, 1] }}
                        className="text-amber/70 mt-2 shrink-0 w-3 h-px bg-amber/70 origin-left"
                      />
                      <span>{c}</span>
                    </_m.li>
                  ))}
                </ul>
              </CSBlock>

              <CSBlock label={t('cs.outcomes')} delay={0.6}>
                <div className="grid grid-cols-3 gap-4">
                  {project.metrics.map((m, k) => (
                    <_m.div
                      key={k}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.55, delay: 0.75 + k * 0.08, ease: [0.2, 0.7, 0.2, 1] }}
                    >
                      <span className="block font-serif text-[24px] md:text-[30px] leading-none text-ink tabular-nums mb-1">
                        <AnimatedMetric value={m.v} />
                      </span>
                      <span className="text-[10px] font-mono tracking-[0.08em] uppercase text-inkmute">{t(m.lKey, m.l)}</span>
                    </_m.div>
                  ))}
                </div>
              </CSBlock>

              <CSBlock label={t('cs.stack')} delay={0.7} last>
                <div className="flex flex-wrap gap-1.5">
                  {project.stack.map((tag, k) => (
                    <_m.span
                      key={k}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.85 + k * 0.03, ease: 'easeOut' }}
                      className="text-[11px] font-mono text-inkdim px-2 py-1 rounded border border-line bg-bg/40"
                    >
                      {tag}
                    </_m.span>
                  ))}
                </div>
              </CSBlock>
            </div>
          </_m.aside>
        </_m.div>
      )}
    </AnimatePresence>
  );
}

function Work() {
  const t = window.useT ? window.useT() : ((k) => k);
  const [selected, setSelected] = React.useState(null);
  return (
    <section id="work" className="relative px-6 md:px-10 pt-16 md:pt-24 pb-8 md:pb-10">
      <div className="max-w-[1200px] mx-auto">
        <SectionHead num="01" label={t('work.label')} />

        <Reveal>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-16 md:mb-24">
            <SplitReveal as="p" stagger={0.008} duration={0.9} className="md:col-start-3 md:col-span-8 font-serif text-[28px] md:text-[40px] leading-[1.15] text-ink">
              {t('work.intro1')}
              <span className="text-inkdim italic">{t('work.introEmph')}</span>
            </SplitReveal>
          </div>
        </Reveal>

        <div>
          {WORK_DATA.map((p, i) => (
            <WorkRow key={p.id} project={p} index={i} onOpen={setSelected} />
          ))}
        </div>
      </div>
      <CaseStudyDrawer project={selected} onClose={() => setSelected(null)} />
    </section>
  );
}

function WorkRow({ project, index, onOpen }) {
  const t = window.useT ? window.useT() : ((k, fb) => fb || k);
  const [hover, setHover] = React.useState(false);
  // Parallax refs: background, stripes overlay, monogram
  const bgLayerRef = React.useRef(null);
  const stripesLayerRef = React.useRef(null);
  const monoLayerRef = React.useRef(null);
  // Hook returns the container ref; depth values are in px
  const swatchRef = useSwatchParallax(
    [bgLayerRef, stripesLayerRef, monoLayerRef],
    [-6, 10, 18]
  );

  const hasLiveLink = project.kind === 'live' && !!project.url;
  // For live cards, show the destination domain in the cursor ring.
  // For private cards, label as "case study".
  let cursorLabel = 'case study';
  if (hasLiveLink) {
    try { cursorLabel = new URL(project.url).hostname; }
    catch { cursorLabel = 'visit'; }
  }

  const onActivate = () => {
    if (hasLiveLink) {
      window.open(project.url, '_blank', 'noopener,noreferrer');
    } else if (onOpen) {
      onOpen(project);
    }
  };

  return (
    <article
      className="work-row group relative grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 py-10 md:py-14 cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber/60 rounded-sm"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={onActivate}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onActivate(); } }}
      role="button"
      tabIndex={0}
      aria-label={hasLiveLink ? `Visit ${project.name} (opens in new tab)` : `Open ${project.name} case study`}
      data-cursor-hover
      data-cursor-label={cursorLabel}
    >
      {/* Index */}
      <div className="md:col-span-1 flex md:block items-center gap-3">
        <span className="font-mono text-[11px] text-inkmute">{String(index + 1).padStart(2, '0')}</span>
      </div>

      {/* Title + blurb */}
      <div className="md:col-span-5">
        <div className="flex items-baseline gap-3 mb-3">
          <h3 className="font-serif text-[28px] md:text-[36px] leading-[1.1] text-ink">
            <span className="title-underline">{project.name}</span>
          </h3>
          <_m.span
            animate={{ x: hover ? 4 : 0, y: hover ? -4 : 0, opacity: hover ? 1 : 0.5 }}
            transition={{ type: 'spring', stiffness: 220, damping: 16 }}
            className="text-amber shrink-0"
          >
            <Icon.ArrowUpRight />
          </_m.span>
        </div>
        <p className="text-inkdim text-[14px] leading-relaxed max-w-[440px] mb-4">{project.blurb}</p>
        <div className="flex items-center gap-3 text-[11px] font-mono text-inkmute">
          <span>{project.company}</span>
          <span className="w-1 h-1 rounded-full bg-inkmute" />
          <span>{project.period}</span>
        </div>
      </div>

      {/* Metrics */}
      <div className="md:col-span-3 grid grid-cols-3 md:grid-cols-1 gap-4 md:gap-3 self-start">
        {project.metrics.map((m, k) => (
          <div key={k} className="flex md:flex-row flex-col md:items-baseline gap-1 md:gap-3">
            <span className="font-serif text-[26px] md:text-[32px] leading-none text-ink tabular-nums">
              <AnimatedMetric value={m.v} />
            </span>
            <span className="text-[10px] md:text-[11px] font-mono tracking-[0.08em] uppercase text-inkmute">{t(m.lKey, m.l)}</span>
          </div>
        ))}
      </div>

      {/* Visual swatch — wrapper(skew) > ClipReveal(clip) > swatch(parallax) */}
      <div className="md:col-span-3 self-start">
        <div data-skew style={{ willChange: 'transform' }}>
          <ClipReveal>
            <div
              ref={swatchRef}
              className="relative aspect-[4/3] rounded-md overflow-hidden border border-line"
            >
            {/* Background gradient — moves opposite to mouse */}
            <div
              ref={bgLayerRef}
              className="absolute inset-[-10%]"
              style={{
                background: `linear-gradient(135deg, ${project.swatch[0]} 0%, ${project.swatch[1]} 60%, ${project.swatch[2]}22 100%)`,
                willChange: 'transform',
              }}
            />
            {/* Diagonal stripes — mid-depth */}
            <svg
              ref={stripesLayerRef}
              className="absolute inset-[-10%] w-[120%] h-[120%] opacity-[0.07]"
              aria-hidden="true"
              style={{ willChange: 'transform' }}
            >
              <defs>
                <pattern id={`stripes-${project.id}`} width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                  <rect width="1" height="8" fill="#ededed" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill={`url(#stripes-${project.id})`} />
            </svg>
            {/* Monogram — deepest parallax (moves most) */}
            <div
              ref={monoLayerRef}
              className="absolute inset-0 flex items-center justify-center"
              style={{ willChange: 'transform' }}
            >
              <span className="font-serif text-[80px] md:text-[110px] leading-none text-ink/15 select-none">
                {project.name.split(' ')[0][0]}
              </span>
            </div>
            {/* Corner marks — fixed (no parallax) */}
            <div className="absolute inset-0 p-3 flex justify-between items-start text-[9px] font-mono uppercase tracking-[0.18em]">
              <span className="text-ink/40">{project.id}</span>
              {project.kind === 'live' ? (
                <span className="flex items-center gap-1.5 px-1.5 py-0.5 border border-emerald-400/60 rounded-sm bg-bg/40 backdrop-blur-[2px] text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {project.badge || 'LIVE'}
                </span>
              ) : (
                <span className="text-amber/90 px-1.5 py-0.5 border border-amber/40 rounded-sm bg-bg/40 backdrop-blur-[2px]">
                  {project.badge}
                </span>
              )}
            </div>
            <div className="absolute inset-0 p-3 flex justify-between items-end text-[9px] font-mono text-ink/40 uppercase tracking-[0.2em]">
              <span>placeholder</span>
              <span>{String(index + 1).padStart(2, '0')}/{WORK_DATA.length}</span>
            </div>
          </div>
          </ClipReveal>
        </div>

        {/* Tech tags */}
        <div className="mt-4 flex flex-wrap gap-1.5">
          {project.stack.slice(0, 6).map((t, k) => (
            <span key={k} className="text-[10px] font-mono text-inkdim px-2 py-1 rounded border border-line bg-bg2/40">
              {t.split(' (')[0]}
            </span>
          ))}
          {project.stack.length > 6 && (
            <span className="text-[10px] font-mono text-inkmute px-2 py-1">+{project.stack.length - 6}</span>
          )}
        </div>
      </div>
    </article>
  );
}

/* ------------------------------ EXPERIENCE ------------------------------ */
// All visible strings are pulled via t() so the section flips to Arabic when
// the user toggles locale. Keys live in i18n.jsx.
const EXPERIENCE = [
  {
    periodKey: 'exp.r1.period',
    roleKey: 'exp.r1.role',
    companyKey: 'exp.r1.company',
    locationKey: 'exp.r1.location',
    bulletKeys: ['exp.r1.b1', 'exp.r1.b2', 'exp.r1.b3'],
  },
  {
    periodKey: 'exp.r2.period',
    roleKey: 'exp.r2.role',
    companyKey: 'exp.r2.company',
    locationKey: 'exp.r2.location',
    bulletKeys: ['exp.r2.b1', 'exp.r2.b2'],
  },
  {
    periodKey: 'exp.r3.period',
    roleKey: 'exp.r3.role',
    companyKey: 'exp.r3.company',
    locationKey: 'exp.r3.location',
    bulletKeys: ['exp.r3.b1', 'exp.r3.b2'],
  },
];

function Experience() {
  const t = window.useT ? window.useT() : ((k) => k);
  return (
    <section id="experience" className="relative px-6 md:px-10 pt-10 md:pt-14 pb-16 md:pb-24">
      <div className="max-w-[1200px] mx-auto">
        <SectionHead num="02" label={t('experience.label')} />

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-3">
            <Reveal>
              <SplitReveal as="h2" stagger={0.018} duration={0.95} className="font-serif text-[34px] md:text-[44px] leading-[1.05] text-ink">
                {t('experience.heading1')}<br/>
                <span className="italic text-inkdim font-light">{t('experience.heading2')}</span>
              </SplitReveal>
            </Reveal>
          </div>

          <div className="md:col-span-9">
            <ol className="relative">
              {EXPERIENCE.map((e, i) => (
                <Reveal key={i} delay={i * 0.05}>
                  <li className="grid grid-cols-1 md:grid-cols-12 gap-6 py-8 md:py-10 border-t border-line first:border-t-0 group">
                    <div className="md:col-span-3">
                      <span className="font-mono text-[11px] tracking-[0.1em] text-amber">{t(e.periodKey)}</span>
                    </div>
                    <div className="md:col-span-9">
                      <h3 className="font-serif text-[24px] md:text-[28px] leading-[1.15] text-ink mb-1">
                        {t(e.roleKey)}
                      </h3>
                      <p className="text-[13px] font-mono text-inkdim mb-4">
                        {t(e.companyKey)} <span className="text-inkmute">· {t(e.locationKey)}</span>
                      </p>
                      <ul className="space-y-2.5">
                        {e.bulletKeys.map((bk, k) => (
                          <li key={k} className="flex gap-3 text-[14px] text-inkdim leading-relaxed">
                            <span className="text-amber/70 mt-2 shrink-0 w-3 h-px bg-amber/70" />
                            <span>{t(bk)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </li>
                </Reveal>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------- EDUCATION -------------------------------- */
function Education() {
  const t = window.useT ? window.useT() : ((k) => k);
  return (
    <section id="education" className="relative px-6 md:px-10 py-16 md:py-24">
      <div className="max-w-[1200px] mx-auto">
        <SectionHead num="03" label={t('education.label')} />

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <Reveal className="md:col-span-3">
            <span className="font-mono text-[11px] tracking-[0.1em] text-amber">2018 — 2022</span>
          </Reveal>
          <Reveal className="md:col-span-9" delay={0.05}>
            <SplitReveal as="h3" stagger={0.014} duration={0.95} className="font-serif text-[28px] md:text-[40px] leading-[1.1] text-ink mb-3">
              B.Sc. Computer Science<br/>
              <span className="text-inkdim italic font-light">and Information Systems</span>
            </SplitReveal>
            <p className="text-[14px] font-mono text-inkdim mb-6">
              October 6 University <span className="text-inkmute">· Giza, Egypt</span>
            </p>
            <div className="border-t border-line pt-6 max-w-[680px]">
              <div className="flex items-baseline justify-between mb-2">
                <span className="text-[11px] font-mono uppercase tracking-[0.18em] text-inkmute">Graduation Project</span>
                <span className="text-[11px] font-mono text-amber">Grade A</span>
              </div>
              <p className="text-[15px] text-ink mb-1">Learning Management System</p>
              <p className="text-[13px] text-inkdim font-mono">Node.js · Express · MongoDB</p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------- CERTIFICATIONS ------------------------------- */
const CERTS = [
  {
    id: 'hccda',
    name: 'HCCDA — Tech Essentials',
    issuer: 'Huawei',
    division: 'HUAWEI CLOUD',
    issued: 'May 2026',
    expires: 'May 2029',
    credentialId: 'HWENDCTEDA542672',
    skills: ['Cloud Architecture', 'Huawei Cloud', 'Cloud Foundations'],
    logo: 'https://cdn.simpleicons.org/huawei',
    desc: 'Huawei Cloud Developer Associate — fundamentals of cloud architecture, deployment, and core services across the Huawei Cloud ecosystem.',
  },
  {
    id: 'aws-ccp',
    name: 'AWS Certified Cloud Practitioner',
    issuer: 'Amazon Web Services',
    division: null,
    issued: 'Apr 2026',
    expires: 'Apr 2029',
    credentialId: '72b404c5-b893-47a9-a8dc-688a9337ce57',
    skills: ['Cloud Computing', 'Cloud Services', 'AWS Foundations'],
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/amazonwebservices/amazonwebservices-original-wordmark.svg',
    desc: 'Foundational understanding of IT services and their uses in the AWS Cloud — fluency, billing, security, and service awareness.',
  },
  {
    id: 'hcia-ai',
    name: 'HCIA — AI Certification',
    issuer: 'Huawei',
    division: null,
    issued: 'Aug 2020',
    expires: 'Aug 2023',
    credentialId: '01010200180804649576366',
    skills: ['Python', 'Artificial Intelligence', 'Machine Learning', 'Deep Learning'],
    logo: 'https://cdn.simpleicons.org/huawei',
    desc: 'Core AI concepts, machine learning and deep learning fundamentals, plus practical model development and deployment.',
  },
];

function Certifications() {
  const t = window.useT ? window.useT() : ((k) => k);
  return (
    <section id="certifications" className="relative px-6 md:px-10 py-16 md:py-24">
      <div className="max-w-[1200px] mx-auto">
        <SectionHead num="04" label={t('certs.label')} />

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-3">
            <Reveal>
              <SplitReveal as="h2" stagger={0.018} duration={0.95} className="font-serif text-[34px] md:text-[44px] leading-[1.05] text-ink">
                {t('certs.heading1')}<br/>
                <span className="italic text-inkdim font-light">{t('certs.heading2')}</span>
              </SplitReveal>
            </Reveal>
          </div>

          <div className="md:col-span-9">
            <ol>
              {CERTS.map((c, i) => (
                <Reveal key={c.id} delay={i * 0.05}>
                  <li className="grid grid-cols-1 md:grid-cols-12 gap-6 py-8 md:py-10 border-t border-line first:border-t-0">
                    {/* Logo + dates */}
                    <div className="md:col-span-3 flex flex-col gap-3">
                      <Magnetic as="div" strength={0.35} className="inline-block w-fit">
                        <img
                          src={c.logo}
                          alt={c.issuer}
                          className="marquee-logo h-8 w-auto opacity-90"
                          loading="lazy"
                          draggable="false"
                        />
                      </Magnetic>
                      <span className="font-mono text-[11px] tracking-[0.1em] text-amber">
                        {c.issued} → {c.expires}
                      </span>
                    </div>

                    {/* Title + description + meta */}
                    <div className="md:col-span-9">
                      <h3 className="font-serif text-[24px] md:text-[28px] leading-[1.15] text-ink mb-1">
                        {c.name}
                      </h3>
                      <p className="text-[13px] font-mono text-inkdim mb-4">
                        {c.issuer}
                        {c.division && <span className="text-inkmute"> · {c.division}</span>}
                      </p>
                      <p className="text-[14px] text-inkdim leading-relaxed max-w-[600px] mb-4">
                        {c.desc}
                      </p>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-4 text-[11px] font-mono text-inkmute">
                        <span className="text-inkmute uppercase tracking-[0.14em]">Credential ID</span>
                        <span className="text-ink break-all">{c.credentialId}</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {c.skills.map((s, k) => (
                          <span key={k} className="text-[11px] font-mono text-inkdim px-2 py-1 rounded border border-line bg-bg2/40">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </li>
                </Reveal>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------- STACK ---------------------------------- */
const STACK = [
  { label: 'Frontend',       labelKey: 'stack.frontend',  items: ['React','Next.js','TypeScript','JavaScript','Tailwind CSS','Vitest','React Testing Library','Playwright'] },
  { label: 'Backend',        labelKey: 'stack.backend',   items: ['Node.js','NestJS','Express','Django','Flask','Laravel','WebSockets','REST APIs','JWT','RBAC','Jest','Redis'] },
  { label: 'Databases',      labelKey: 'stack.databases', items: ['PostgreSQL','MySQL','MongoDB','Prisma ORM','Query optimization','Indexing'] },
  { label: 'Cloud & DevOps', labelKey: 'stack.cloud',     items: ['AWS','Microsoft Azure','Huawei Cloud','Docker','Kubernetes','CI/CD'] },
  { label: 'Languages',      labelKey: 'stack.languages', items: ['TypeScript','JavaScript','Python','PHP','C++','SQL'] },
];

// Tools shown in the Stack marquee with their logo URL. Most come from Simple
// Icons; AWS and Azure are pulled from Devicon because Simple Icons removed
// them under trademark policy. Items not on either source (REST APIs, RBAC,
// CI/CD, etc.) skip the marquee and stay in the grouped grid below.
const SI = (slug) => `https://cdn.simpleicons.org/${slug}`;
const DEV = (path) => `https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${path}`;

const MARQUEE_TOOLS = [
  { name: 'React',        src: SI('react') },
  { name: 'Next.js',      src: SI('nextdotjs') },
  { name: 'TypeScript',   src: SI('typescript') },
  { name: 'JavaScript',   src: SI('javascript') },
  { name: 'Tailwind CSS', src: SI('tailwindcss') },
  { name: 'Vitest',       src: SI('vitest') },
  { name: 'Playwright',   src: DEV('playwright/playwright-original.svg') },
  { name: 'Node.js',      src: SI('nodedotjs') },
  { name: 'NestJS',       src: SI('nestjs') },
  { name: 'Express',      src: SI('express') },
  { name: 'Django',       src: SI('django') },
  { name: 'Flask',        src: SI('flask') },
  { name: 'Laravel',      src: SI('laravel') },
  { name: 'Jest',         src: SI('jest') },
  { name: 'Redis',        src: SI('redis') },
  { name: 'PostgreSQL',   src: SI('postgresql') },
  { name: 'MySQL',        src: SI('mysql') },
  { name: 'MongoDB',      src: SI('mongodb') },
  { name: 'Prisma',       src: SI('prisma') },
  { name: 'AWS',          src: DEV('amazonwebservices/amazonwebservices-original-wordmark.svg') },
  { name: 'Azure',        src: DEV('azure/azure-original.svg') },
  { name: 'Docker',       src: SI('docker') },
  { name: 'Kubernetes',   src: SI('kubernetes') },
  { name: 'Python',       src: SI('python') },
  { name: 'PHP',          src: SI('php') },
  { name: 'C++',          src: SI('cplusplus') },
];

// Single marquee item with onError fallback (Simple Icons → Devicon)
function MarqueeLogo({ name, src }) {
  const [imgSrc, setImgSrc] = React.useState(src);
  const [failed, setFailed] = React.useState(false);
  const onError = () => {
    // First fallback attempt: try Devicon's original style based on name
    if (!imgSrc.includes('devicon')) {
      const slug = name.toLowerCase().replace(/\./g, '').replace(/\+/g, 'plus').replace(/\s/g, '').replace('c++', 'cplusplus');
      setImgSrc(DEV(`${slug}/${slug}-original.svg`));
    } else {
      setFailed(true);
    }
  };
  return (
    <span className="flex items-center gap-4 px-7 md:px-10 whitespace-nowrap" title={name}>
      {!failed && (
        <img
          src={imgSrc}
          alt={name}
          height="40"
          loading="lazy"
          onError={onError}
          className="marquee-logo h-9 md:h-10 w-auto"
          draggable="false"
        />
      )}
      <span className="font-mono text-[11px] md:text-[12px] uppercase tracking-[0.18em] text-inkmute">
        {name}
      </span>
    </span>
  );
}

function Stack() {
  const t = window.useT ? window.useT() : ((k) => k);
  return (
    <section id="stack" className="relative px-6 md:px-10 py-16 md:py-24">
      <div className="max-w-[1200px] mx-auto">
        <SectionHead num="05" label={t('stack.label')} />
      </div>

      {/* Ambient logo marquee — full-bleed, infinite, drag + hover-slow */}
      <div className="-mx-6 md:-mx-10 mb-14 md:mb-20 border-y border-line py-6 md:py-8">
        <Marquee speed={48} pauseOnHover draggable>
          {MARQUEE_TOOLS.map((t, i) => (
            <MarqueeLogo key={i} name={t.name} src={t.src} />
          ))}
        </Marquee>
      </div>

      <div className="max-w-[1200px] mx-auto">
        <Reveal>
          <SplitReveal as="p" stagger={0.008} duration={0.9} className="font-serif text-[28px] md:text-[40px] leading-[1.15] text-ink mb-16 max-w-[820px]">
            Tools I reach for daily, grouped by where they live in the stack —
            <span className="text-inkdim italic"> chosen for shipping, not for the résumé.</span>
          </SplitReveal>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-6">
          {STACK.map((group, i) => (
            <Reveal key={group.label} delay={i * 0.04} className="md:col-span-12">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 py-6 border-t border-line">
                <div className="md:col-span-3 flex items-start gap-3">
                  <span className="font-mono text-[10px] text-amber mt-1">{String(i + 1).padStart(2, '0')}</span>
                  <h3 className="font-serif text-[24px] md:text-[28px] text-ink leading-none">{t(group.labelKey, group.label)}</h3>
                </div>
                <div className="md:col-span-9 flex flex-wrap gap-2">
                  {group.items.map((t, k) => (
                    <span
                      key={k}
                      className="text-[12px] font-mono text-inkdim px-2.5 py-1.5 border border-line rounded-md bg-bg2/40 hover:border-amber/40 hover:text-ink transition-colors"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* --------------------------------- CONTACT --------------------------------- */
const SOCIALS = [
  { name: 'GitHub', url: 'https://github.com/PaulaMagdi0', Icon: Icon.Github, handle: 'PaulaMagdi0' },
  { name: 'LinkedIn', url: 'https://www.linkedin.com/in/paula-magdy/', Icon: Icon.Linkedin, handle: 'paula-magdy' },
  { name: 'LeetCode', url: 'https://leetcode.com/u/4pAckTIlBP/', Icon: Icon.Code, handle: '4pAckTIlBP' },
  { name: 'HackerRank', url: 'https://www.hackerrank.com/profile/paulamagdy665', Icon: Icon.Terminal, handle: 'paulamagdy665' },
];

const RECIPIENT_EMAIL = 'paulamagdy665@gmail.com';

// --- Single form field with underline-style input + inline error -----------
function Field({ id, label, type = 'text', textarea, value, onChange, error, placeholder }) {
  return (
    <div className="relative">
      <label
        htmlFor={id}
        className="flex items-baseline justify-between gap-3 uppercase tracking-[0.18em] text-[10px] font-mono text-inkmute mb-2"
      >
        <span>{label}</span>
        {error && (
          <span className="text-amber normal-case tracking-normal text-[11px] font-mono">
            {error}
          </span>
        )}
      </label>
      {textarea ? (
        <textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={4}
          className={`w-full bg-transparent border-b ${error ? 'border-amber' : 'border-line focus:border-amber/70'} outline-none font-serif text-[20px] md:text-[24px] leading-[1.35] text-ink py-2 placeholder:text-inkmute placeholder:font-serif resize-none transition-colors`}
        />
      ) : (
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={type === 'email' ? 'email' : 'off'}
          className={`w-full bg-transparent border-b ${error ? 'border-amber' : 'border-line focus:border-amber/70'} outline-none font-serif text-[20px] md:text-[24px] leading-[1.35] text-ink py-2 placeholder:text-inkmute placeholder:font-serif transition-colors`}
        />
      )}
    </div>
  );
}

function ContactForm() {
  const t = window.useT ? window.useT() : ((k) => k);
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [message, setMessage] = React.useState('');
  const [errors, setErrors] = React.useState({});
  const [status, setStatus] = React.useState('idle'); // idle | sending | sent

  const validate = () => {
    const errs = {};
    if (!name.trim()) errs.name = t('form.required');
    if (!email.trim()) errs.email = t('form.required');
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errs.email = t('form.invalidEmail');
    if (!message.trim()) errs.message = t('form.required');
    return errs;
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      // Focus the first invalid field so keyboard users land on what to fix
      const order = ['name', 'email', 'message'];
      const firstBad = order.find(k => errs[k]);
      if (firstBad) {
        const el = document.getElementById(`contact-${firstBad}`);
        if (el && typeof el.focus === 'function') el.focus({ preventScroll: false });
      }
      return;
    }

    setStatus('sending');
    const subject = encodeURIComponent(`Portfolio inquiry — ${name.trim()}`);
    const body = encodeURIComponent(
      `${message.trim()}\n\n— ${name.trim()}\n${email.trim()}`
    );
    // Open the user's mail client with the message pre-filled
    window.location.href = `mailto:${RECIPIENT_EMAIL}?subject=${subject}&body=${body}`;
    setTimeout(() => setStatus('sent'), 400);
    setTimeout(() => {
      setStatus('idle');
      setName(''); setEmail(''); setMessage('');
    }, 4000);
  };

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-7 md:space-y-9">
      <Field
        id="contact-name"
        label={t('contact.formName')}
        value={name}
        onChange={(v) => { setName(v); if (errors.name) setErrors({ ...errors, name: undefined }); }}
        error={errors.name}
        placeholder={t('contact.formNamePlaceholder')}
      />
      <Field
        id="contact-email"
        label={t('contact.formEmail')}
        type="email"
        value={email}
        onChange={(v) => { setEmail(v); if (errors.email) setErrors({ ...errors, email: undefined }); }}
        error={errors.email}
        placeholder={t('contact.formEmailPlaceholder')}
      />
      <Field
        id="contact-message"
        label={t('contact.formMessage')}
        textarea
        value={message}
        onChange={(v) => { setMessage(v); if (errors.message) setErrors({ ...errors, message: undefined }); }}
        error={errors.message}
        placeholder={t('contact.formMessagePlaceholder')}
      />

      <div className="pt-2 flex flex-wrap items-center gap-4">
        <Magnetic
          as="button"
          type="submit"
          disabled={status === 'sending'}
          className="btn-base btn-primary disabled:opacity-60"
          data-cursor-label="send"
        >
          {status === 'sending' ? t('contact.formSending') : status === 'sent' ? t('contact.formSent') : t('contact.formSend')}
          <Icon.ArrowUpRight />
        </Magnetic>
        <span className="text-[12px] font-mono text-inkmute">
          {t('contact.formHelper')}
        </span>
      </div>
    </form>
  );
}

function Contact() {
  const t = window.useT ? window.useT() : ((k) => k);
  const [copied, setCopied] = React.useState(false);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(RECIPIENT_EMAIL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = RECIPIENT_EMAIL; document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); } catch {}
      document.body.removeChild(ta);
      setCopied(true); setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <section id="contact" className="relative px-6 md:px-10 pt-16 md:pt-24 pb-10 overflow-hidden">
      <div className="max-w-[1200px] mx-auto">
        <SectionHead num="06" label={t('contact.label')} />

        <Reveal>
          <SplitReveal as="h2" stagger={0.018} duration={1.0} className="font-serif text-[14vw] sm:text-[11vw] md:text-[8vw] lg:text-[100px] xl:text-[120px] 2xl:text-[140px] leading-[0.95] tracking-[-0.02em] text-ink mb-12 md:mb-16">
            {t('contact.heading1')} <span className="italic font-light text-inkdim">{t('contact.heading2')}</span><span className="text-amber">.</span>
          </SplitReveal>
        </Reveal>

        {/* CONTACT FORM — the main content of this section */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16 mb-20 md:mb-28">
          {/* Left rail — short pitch */}
          <Reveal className="md:col-span-4">
            <span className="block font-mono text-[11px] text-inkmute uppercase tracking-[0.18em] mb-4">
              {t('contact.sendMessage')}
            </span>
            <p className="font-serif text-[22px] md:text-[26px] leading-[1.25] text-ink mb-4">
              {t('contact.pitchHeading')}
            </p>
            <p className="text-[14px] text-inkdim leading-relaxed max-w-[300px]">
              {t('contact.pitchDescription')}
            </p>
          </Reveal>

          {/* Right column — the form */}
          <Reveal className="md:col-span-8" delay={0.1}>
            <ContactForm />
          </Reveal>
        </div>

        {/* FOOTER BAND — direct contacts as a horizontal strip */}
        <div className="border-t border-line pt-10 md:pt-12 grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-6 mb-12">

          {/* Email */}
          <Reveal className="md:col-span-5">
            <span className="block font-mono text-[10px] text-inkmute uppercase tracking-[0.18em] mb-3">
              {t('contact.email')}
            </span>
            <button
              onClick={onCopy}
              data-cursor-label="copy"
              className="group inline-flex items-center gap-3 font-serif text-[20px] md:text-[24px] text-ink hover:text-amber transition-colors"
            >
              <span className="text-left break-all">{RECIPIENT_EMAIL}</span>
              <span className="relative w-5 h-5 inline-flex items-center justify-center shrink-0">
                <_m.span
                  animate={{ opacity: copied ? 0 : 1, scale: copied ? 0.6 : 1 }}
                  transition={{ duration: 0.18 }}
                  className="absolute inset-0 flex items-center justify-center text-inkdim group-hover:text-amber"
                >
                  <Icon.Copy />
                </_m.span>
                <_m.span
                  animate={{ opacity: copied ? 1 : 0, scale: copied ? 1 : 0.6 }}
                  transition={{ duration: 0.18 }}
                  className="absolute inset-0 flex items-center justify-center text-amber"
                >
                  <Icon.Check />
                </_m.span>
              </span>
            </button>
            <_m.span
              animate={{ opacity: copied ? 1 : 0, y: copied ? 0 : -4 }}
              transition={{ duration: 0.2 }}
              className="block mt-1 text-[11px] font-mono text-amber h-4"
            >
              {t('contact.copied')}
            </_m.span>
          </Reveal>

          {/* Phone */}
          <Reveal className="md:col-span-3" delay={0.05}>
            <span className="block font-mono text-[10px] text-inkmute uppercase tracking-[0.18em] mb-3">
              {t('contact.phone')}
            </span>
            <span className="font-serif text-[20px] md:text-[24px] text-ink">
              +20 127 776 7028
            </span>
          </Reveal>

          {/* Socials */}
          <Reveal className="md:col-span-4" delay={0.1}>
            <span className="block font-mono text-[10px] text-inkmute uppercase tracking-[0.18em] mb-3">
              {t('contact.elsewhere')}
            </span>
            <ul className="grid grid-cols-2 gap-y-3 gap-x-4">
              {SOCIALS.map((s) => (
                <li key={s.name}>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                    data-cursor-label="open"
                    className="group inline-flex items-center gap-2 text-ink hover:text-amber transition-colors"
                  >
                    <s.Icon className="text-inkdim group-hover:text-amber transition-colors" />
                    <span className="font-mono text-[12px]">{s.name}</span>
                    <_m.span
                      whileHover={{ x: 2, y: -2 }}
                      className="text-inkmute group-hover:text-amber transition-colors"
                    >
                      <Icon.ArrowUpRight />
                    </_m.span>
                  </a>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        {/* Bottom line */}
        <div className="border-t border-line pt-8 flex flex-col md:flex-row gap-4 md:items-center justify-between text-[11px] font-mono text-inkmute">
          <span>{t('contact.footerBuilt')}</span>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <LiveClock />
            </span>
            <a href="#top" className="hover:text-ink transition-colors flex items-center gap-2">
              {t('contact.backToTop')}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><polyline points="18 15 12 9 6 15"/></svg>
            </a>
          </div>
        </div>
      </div>

      {/* Huge ambient signature (watermark) */}
      <div className="pointer-events-none absolute -bottom-20 left-0 right-0 text-center select-none" style={{ opacity: 0.04 }}>
        <span className="font-serif text-[28vw] leading-none tracking-tighter text-ink">Paula</span>
      </div>
    </section>
  );
}

Object.assign(window, { Hero, Work, Experience, Education, Certifications, Stack, Contact });
