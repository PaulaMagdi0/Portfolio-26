// Inline script that lifts the page-loader curtain WITHOUT waiting for React
// hydration. The opaque #page-loader is SSR'd and would otherwise only be
// removed once the client bundle downloads, parses, hydrates, and the
// PageLoader effect completes — on a throttled 4G connection that is ~3s, even
// though the hero <h1> (the LCP element) paints in its swap-fallback face at
// ~0.7s. Decoupling the curtain lift from hydration moves it back onto the real
// paint timeline. It adds `html.loaded` as soon as fonts are ready (capped), so
// the CSS clip-path wipe runs and the headline is revealed early. The React
// PageLoader still owns the brand counter animation; adding an already-present
// class is a no-op, so the two never conflict.
export const LOADER_FONT_WAIT_CAP_MS = 700;

export const loaderRevealScript = `(function(){try{var d=document.documentElement;var done=false;var reveal=function(){if(done)return;done=true;d.classList.add('loaded');};var cap=setTimeout(reveal,${LOADER_FONT_WAIT_CAP_MS});if(document.fonts&&document.fonts.ready){document.fonts.ready.then(function(){clearTimeout(cap);reveal();});}else{clearTimeout(cap);reveal();}}catch(e){document.documentElement.classList.add('loaded');}})();`;
