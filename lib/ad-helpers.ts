/**
 * Monetag Ad Helpers & Vignette Trigger
 * Zone: 12119121 (https://n6wxm.com/vignette.min.js)
 * Zone: 12119026 (https://nap5k.com/tag.min.js)
 */

export function triggerVignetteAd() {
  if (typeof window === 'undefined') return;

  try {
    const scriptId = 'monetag-vignette-12119121';
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.dataset.zone = '12119121';
      script.src = 'https://n6wxm.com/vignette.min.js';
      script.async = true;
      const targetElement = [document.documentElement, document.body].filter(Boolean).pop();
      if (targetElement) {
        targetElement.appendChild(script);
      }
    }
  } catch (err) {
    console.warn('Monetag vignette ad trigger error:', err);
  }
}
