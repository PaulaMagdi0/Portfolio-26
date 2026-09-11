export const THEME_STORAGE_KEY = 'theme';
export const THEME_ATTRIBUTE = 'data-theme';
export const THEME_VALUES = ['light', 'dark', 'system'] as const;

// Besides applying the theme before first paint, the inline script marks the
// document as JS-capable (`html.js`, used by the CSS Reveal) and, on repeat visits
// within a session, pre-applies `html.loaded` so the page-loader curtain never
// covers the hero (see PageLoader.tsx, which sets the `pl-seen` flag).

export const themeInitScript = `(function(){try{var k='${THEME_STORAGE_KEY}';var s=localStorage.getItem(k);if(s!=='light'&&s!=='dark'&&s!=='system'){s='system';}var t=s==='system'?(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):s;document.documentElement.setAttribute('${THEME_ATTRIBUTE}',t);document.documentElement.style.colorScheme=t;}catch(e){document.documentElement.setAttribute('${THEME_ATTRIBUTE}','dark');document.documentElement.style.colorScheme='dark';}document.documentElement.classList.add('js');try{if(sessionStorage.getItem('pl-seen')==='1'){document.documentElement.classList.add('loaded');}}catch(e){}})();`;
