import type { about as esAbout } from '../es/about';

export const about: typeof esAbout = {
  title: 'Who signs this portfolio',
  eyebrow: 'About · Andrés Nahuel Páez',
  photoAlt: 'Andrés Nahuel Páez on the MIT campus in Cambridge, with the Great Dome behind him',
  photoCaption: 'A. N. Páez · visiting the MIT campus, Cambridge (USA)',
  paragraphs: [
    'I’m Andrés Nahuel Páez and I live in La Rioja, Argentina. From 2017 to 2025 I worked in school administration: records, deadlines, regulations and coordination. That’s where I learned a record is only as good as its trail.',
    'I trained as a geography teacher, with statistics, cartography, geology, climatology and hydrology, and later earned a degree in Education. Data that has to add up, and paperwork that has to be in order.',
    'A school isn’t a laboratory. What carries over is the habit: every record should say who, when and what changed. This portfolio brings that into software, with calculations verified against published references and an end-to-end audit trail. AI explains and drafts; the results are calculated by code with tests.',
  ],
  territory: {
    title: 'Where I work from',
    text: 'A geodetic vertex is a point of known coordinates from which the rest of the land is measured. This one is mine: La Rioja, in northwest Argentina.',
    availability: 'Remote for all of Argentina and worldwide (UTC−3). On-site in La Rioja, Northwest Argentina and Cuyo.',
  },
  howTitle: 'How it is built',
  how: [
    'Next.js, React and TypeScript; scientific logic in pure modules with unit tests (Vitest) and end-to-end tests (Playwright).',
    'Continuous integration on GitHub Actions and deployment on Vercel.',
    'Demo data lives in your browser; a reference Postgres schema with an audit trail tested in CI.',
    'AI-assisted development (Claude Code), with review and tests for every change.',
  ],
  otherTitle: 'Previous portfolios',
  otherNote: 'Data and AI for other regulated industries.',
  other: [
    { label: 'Mining, energy and data portfolio', href: 'https://portfolio-andresnahuelpaez.vercel.app' },
    { label: 'Banking and fintech portfolio', href: 'https://andresnahuelpaez-portfolio-banca.vercel.app' },
  ],
  contactTitle: 'Contact',
  contactText: 'Tell me what still gets copied by hand in your lab, and we’ll see if it’s worth automating.',
};
