import type { WorkProject } from '../types';

// Intentionally empty. The Work section is commented out of app/[locale]/page.tsx,
// and client project names — along with the government bodies and live government
// URLs behind them — must not appear anywhere in the shipped output. Hiding the
// section is not enough on its own: next-intl serializes the whole message dictionary
// into the prerendered HTML, so the matching `home.work.<project>` entries were
// removed from both locale files too.
// The previous entries are in git history if the section is ever restored.
export const WORK: readonly WorkProject[] = [] as const satisfies readonly WorkProject[];
