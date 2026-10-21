import { EurPipe } from './eur.pipe';

describe('EurPipe', () => {
  const pipe = new EurPipe();

  it('formats per UI language', () => {
    expect(pipe.transform(39995, 'de')).toMatch(/39\.995\s€/);
    expect(pipe.transform(39995, 'en')).toBe('€39,995');
    expect(pipe.transform(12.5, 'es', 2)).toMatch(/12,50\s€/);
  });

  it('falls back to en-IE for unknown languages and reuses formatters', () => {
    expect(pipe.transform(1, 'xx')).toBe('€1');
    expect(pipe.transform(2, 'xx')).toBe('€2');
  });
});
