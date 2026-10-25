'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { triggerVignetteAd } from '@/lib/ad-helpers';

/**
 * Monetag Ad Script Integration
 * - Base Multi-Tag: Zone 12119026 (https://nap5k.com/tag.min.js)
 * - Vignette Banner: Zone 12119121 (https://n6wxm.com/vignette.min.js)
 *
 * Rules:
 * - ACTIVE on public frontend pages (/, /notes, /quiz, etc.)
 * - EXCLUDED from /admin dashboard to keep teacher workflow clean
 * - EXCLUDED from active exam tests (/quiz/[id]) to prevent anti-cheat tab-switch locks
 */
export default function MonetagAdScript() {
  const pathname = usePathname();

  // Exclude all admin panel routes
  const isAdminRoute = pathname.startsWith('/admin');

  // Exclude active quiz examination arena (prevent popup anti-cheat violations)
  const isActiveQuizRoute = pathname.startsWith('/quiz/') && pathname !== '/quiz';

  const shouldDisableAds = isAdminRoute || isActiveQuizRoute;

  useEffect(() => {
    if (shouldDisableAds) return;

    // 1. Inject Base Monetag Tag
    const baseScriptId = 'monetag-tag-12119026';
    if (!document.getElementById(baseScriptId)) {
      try {
        const script = document.createElement('script');
        script.id = baseScriptId;
        script.dataset.zone = '12119026';
        script.src = 'https://nap5k.com/tag.min.js';
        script.async = true;

        const targetElement = [document.documentElement, document.body].filter(Boolean).pop();
        if (targetElement) {
          targetElement.appendChild(script);
        }
      } catch (e) {
        console.warn('Monetag base tag load error:', e);
      }
    }

    // 2. Inject Vignette Banner Tag
    triggerVignetteAd();
  }, [shouldDisableAds]);

  return null;
}
