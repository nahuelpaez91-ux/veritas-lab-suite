import { parseAstm } from './astm';
import { parseHl7 } from './hl7';
import type { ParseOutcome } from './types';

export function parseMessage(raw: string): ParseOutcome {
  return raw.trimStart().startsWith('MSH') ? parseHl7(raw) : parseAstm(raw);
}
