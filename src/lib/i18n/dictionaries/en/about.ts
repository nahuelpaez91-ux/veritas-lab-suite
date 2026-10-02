import type { about as esAbout } from '../es/about';

export const about: typeof esAbout = {
  title: 'About this portfolio',
  paragraphs: [
    'I am Andrés Nahuel Páez, from La Rioja, Argentina. I spent more than eight years in administrative and records management and coordination at educational institutions, and today I build software and data solutions.',
    'I trained as a Geography teacher (statistics, cartography, geology, climatology and hydrology) and hold a degree in Education. That mix of method, data and regulation is what I bring to laboratories.',
    'Veritas Lab Suite shows how I work: real laboratory problems, calculations verified against published references, end-to-end traceability, and AI only where it belongs.',
  ],
  howTitle: 'How it is built',
  how: [
    'Next.js, React and TypeScript; scientific logic in pure modules with unit tests (Vitest) and end-to-end tests (Playwright).',
    'Continuous integration on GitHub Actions and deployment on Vercel.',
    'Demo data lives in your browser; a reference Postgres schema with an audit trail tested in CI.',
    'AI-assisted development (Claude Code), with review and tests for every change.',
  ],
  otherTitle: 'Other work: data and AI for regulated industries',
  other: [
    { label: 'Mining, energy and data portfolio', href: 'https://portfolio-andresnahuelpaez.vercel.app' },
    { label: 'Banking and fintech portfolio', href: 'https://andresnahuelpaez-portfolio-banca.vercel.app' },
  ],
  contactTitle: 'Contact',
};
