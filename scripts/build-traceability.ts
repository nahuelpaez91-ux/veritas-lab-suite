import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';

interface VitestJson {
  testResults: { name: string; assertionResults: { title: string; status: string }[] }[];
}

function main() {
  const report = JSON.parse(readFileSync('reports/vitest.json', 'utf8')) as VitestJson;
  const tests = report.testResults.flatMap((file) =>
    file.assertionResults.map((a) => ({
      ids: [...a.title.matchAll(/\[([A-Z]+-URS-\d+)\]/g)].map((m) => m[1]),
      title: a.title.replace(/\[[A-Z]+-URS-\d+\]\s*/g, ''),
      file: file.name.replace(/\\/g, '/').replace(/^.*?\/(src\/)/, '$1'),
      status: a.status,
    })),
  );
  let commit = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? '';
  if (!commit) {
    try {
      commit = execSync('git rev-parse --short HEAD').toString().trim();
    } catch {
      commit = 'local';
    }
  }
  writeFileSync(
    'src/content/validation/traceability.json',
    JSON.stringify({ generatedAt: new Date().toISOString(), commit, tests }, null, 2) + '\n',
  );
  console.log(`traceability: ${tests.length} tests → src/content/validation/traceability.json`);
}

main();
