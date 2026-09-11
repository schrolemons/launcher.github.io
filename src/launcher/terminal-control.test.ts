import { describe, expect, it } from 'vitest';
import { parseTerminalOutput } from './terminal-control';

describe('terminal control protocol', () => {
  it('removes model status directives and returns bounded state', () => {
    const parsed = parseTerminalOutput('结论。\n%status trust=118 mood=focused label=已核对%\n补充说明。');
    expect(parsed.content).toBe('结论。\n补充说明。');
    expect(parsed.control).toEqual({ trust: 100, mood: 'focused', label: '已核对' });
  });

  it('ignores unsupported mood and sanitizes labels', () => {
    const parsed = parseTerminalOutput('%status trust=-2 mood=angry label=<危险>%' );
    expect(parsed.content).toBe('');
    expect(parsed.control).toEqual({ label: '危险' });
  });
});
