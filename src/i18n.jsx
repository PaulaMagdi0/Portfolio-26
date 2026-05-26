// ========================================================================
//  i18n — currently STUB MODE
//  AR translations + RTL + active switcher are intentionally disabled.
//  The locale toggle still renders so its UI hook is in place, but it does
//  nothing on click. Components continue to call `t(key, fallback)` and get
//  English back from the dictionary below.
//
//  To re-enable: restore the AR branch of I18N, swap LocaleProvider back to
//  its stateful version, and un-disable the toggle buttons.
// ========================================================================

const I18N_EN = {
  'nav.cairo': 'Cairo, EG',
  'nav.work': 'Work',
  'nav.experience': 'Experience',
  'nav.certifications': 'Certifications',
  'nav.stack': 'Stack',
  'nav.contact': 'Contact',
  'nav.openMenu': 'Open menu',
  'nav.closeMenu': 'Close menu',

  'hero.portfolio': 'Portfolio / 2026',
  'hero.availability': 'Available for senior full-stack roles',
  'hero.headline': 'Software Engineer',
  'hero.kicker': 'Building systems that teams rely on.',
  'hero.descriptionLead': 'I architect and ship production-grade web platforms —',
  'hero.descriptionEmph': ' resilient backends, clean APIs, and interfaces built for scale.',
  'hero.ctaWork': 'View Work',
  'hero.ctaResume': 'Download Resume',

  'work.label': 'Selected Work',
  'work.intro1': "A short list of platforms I've shipped end-to-end —",
  'work.introEmph': ' from API design and database schemas to AWS infrastructure and CI/CD.',

  'experience.label': 'Experience',
  'experience.heading1': 'Roles',
  'experience.heading2': '& tenure.',

  'education.label': 'Education',

  'certs.label': 'Certifications',
  'certs.heading1': 'Credentials',
  'certs.heading2': '& training.',

  'stack.label': 'Stack',
  'stack.frontend': 'Frontend',
  'stack.backend': 'Backend',
  'stack.databases': 'Databases',
  'stack.cloud': 'Cloud & DevOps',
  'stack.languages': 'Languages',

  'contact.label': 'Contact',
  'contact.heading1': "Let's build",
  'contact.heading2': 'something',
  'contact.sendMessage': 'Send a message',
  'contact.pitchHeading': "Tell me what you're building.",
  'contact.pitchDescription': 'Open to senior full-stack roles and consulting engagements on scalable web platforms. Replies within 24 hours.',
  'contact.formName': 'Your name',
  'contact.formEmail': 'Email',
  'contact.formMessage': 'Message',
  'contact.formNamePlaceholder': 'Jane Doe',
  'contact.formEmailPlaceholder': 'you@company.com',
  'contact.formMessagePlaceholder': "A few lines about what you're working on or the role you have in mind.",
  'contact.formSend': 'Send message',
  'contact.formSending': 'Opening mail…',
  'contact.formSent': 'Message ready',
  'contact.formHelper': 'Opens in your mail client',
  'contact.email': 'Email',
  'contact.phone': 'Phone',
  'contact.elsewhere': 'Elsewhere',
  'contact.copied': 'copied to clipboard',
  'contact.footerBuilt': 'Designed and built by Paula Magdy · Cairo, 2026',
  'contact.backToTop': 'Back to top',

  'form.required': 'Required',
  'form.invalidEmail': 'Invalid email',

  // Experience timeline
  'exp.r1.period': 'Oct 2025 — Present',
  'exp.r1.role': 'Full-Stack Software Engineer',
  'exp.r1.company': 'Challenge Group',
  'exp.r1.location': 'Cairo',
  'exp.r1.b1': 'Architecting and shipping the UAE Ministry of Industry & Advanced Technology awards platform serving 2,000+ concurrent users.',
  'exp.r1.b2': 'Owning frontend (Next.js), backend (NestJS), PostgreSQL schema design, and AWS infrastructure end-to-end.',
  'exp.r1.b3': 'Cut deployment time from 20min → <5min and reduced API latency by 35% through container-based CI/CD and query optimization.',

  'exp.r2.period': 'Nov 2024 — Jun 2025',
  'exp.r2.role': 'Full-Stack Development Fellow',
  'exp.r2.company': 'Information Technology Institute (ITI)',
  'exp.r2.location': 'Cairo · Government-sponsored',
  'exp.r2.b1': '~1,200 hours of full-stack engineering training across the MERN, .NET, and cloud tracks.',
  'exp.r2.b2': 'Capstone projects covered API design, container deployment, and infrastructure automation.',

  'exp.r3.period': 'Oct 2022 — Oct 2024',
  'exp.r3.role': 'Front-End Developer',
  'exp.r3.company': 'Freelance',
  'exp.r3.location': 'Remote',
  'exp.r3.b1': 'Delivered React / Next.js applications for clients across e-commerce, education, and SaaS.',
  'exp.r3.b2': 'Owned the full delivery loop: design handoff → implementation → deployment → maintenance.',

  // Shared metric labels
  'metric.users': 'concurrent users',
  'metric.latency': 'API latency',
  'metric.deploys': 'faster deploys',
  'metric.active': 'active users',
  'metric.uptime': 'pipeline uptime',
  'metric.admin': 'manual admin',
  'metric.efficiency': 'processing efficiency',
  'metric.leaderboards': 'leaderboards',
  'metric.automated': 'support automated',
  'metric.coldstart': 'cold-start budget*',
  'metric.eventarch': 'driven arch',
  'metric.infra': 'infra + APIM',
  'metric.pipelines': 'release pipelines',
  'metric.shipped': 'shipped',

  'loader.initializing': 'Initializing',
  'loader.loadingAssets': 'Loading assets',
  'loader.loadingFonts': 'Loading fonts',
  'loader.compositing': 'Compositing scene',
  'loader.almostReady': 'Almost ready',
};

// No-op locale context — always English. setLocale doesn't do anything.
const LocaleContext = React.createContext({ locale: 'en', setLocale: () => {} });

function LocaleProvider({ children }) {
  React.useEffect(() => {
    document.documentElement.setAttribute('lang', 'en');
    document.documentElement.setAttribute('dir', 'ltr');
  }, []);
  return children;
}

function useLocale() { return { locale: 'en', setLocale: () => {} }; }

function useT() {
  return React.useCallback(
    (key, fallback) => I18N_EN[key] || fallback || key,
    []
  );
}

// Visible-but-disabled toggle. UI hook stays so we can re-enable later
// without re-introducing it. Buttons are static; no click handlers.
function LocaleToggle() {
  return (
    <div
      role="group"
      aria-label="Language"
      aria-disabled="true"
      className="locale-toggle"
      title="AR coming soon"
    >
      <button
        type="button"
        className="locale-pill is-active"
        aria-pressed="true"
        disabled
      >EN</button>
      <button
        type="button"
        className="locale-pill"
        aria-pressed="false"
        disabled
      >AR</button>
    </div>
  );
}

Object.assign(window, { LocaleContext, LocaleProvider, useLocale, useT, LocaleToggle });
