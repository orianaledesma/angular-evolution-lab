import { TestBed } from '@angular/core/testing';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { MOCK_BACKEND_CONFIG } from '@core/http/mock-backend.interceptor';
import { provideAppHttp } from '@core/http/provide-http';
import { provideStaticBackend } from '../../../testing/static-backend';
import { provideTranslateTesting } from '../../../testing/translate-testing';
import { CsvExport } from './csv-export.service';
import { LazyServiceDemo } from './lazy-service-demo';

describe('LazyServiceDemo (@Service + injectAsync)', () => {
  it('loads the service on demand and previews the generated CSV', async () => {
    const user = userEvent.setup();
    await render(LazyServiceDemo, {
      providers: [
        provideTranslateTesting(),
        provideAppHttp(),
        provideStaticBackend(),
        { provide: MOCK_BACKEND_CONFIG, useValue: { latencyMs: 0, enabled: true } },
      ],
    });
    expect(screen.getByTestId('export-state')).toHaveTextContent('service not requested');

    await user.click(screen.getByRole('button', { name: 'Export stock as CSV' }));
    expect(await screen.findByText('service ready')).toBeInTheDocument();
    expect(screen.getByTestId('csv-preview')).toHaveTextContent(
      'id;brand;model;year;fuel;powerKw;priceEur',
    );
    expect(screen.getByTestId('csv-preview')).toHaveTextContent(
      'vw-id3;Volkswagen;ID.3;2024;electric;150;39995',
    );
    expect(screen.getByText(/await csv\(\) · \d+ ms/)).toBeInTheDocument();
  });
});

describe('CsvExport (@Service)', () => {
  it('is auto-provided and escapes cells', () => {
    const csv = TestBed.inject(CsvExport);
    const out = csv.toCsv([
      {
        id: 'x',
        brand: 'A;B',
        model: 'say "hi"',
        year: 2024,
        fuel: 'electric',
        powerKw: 1,
        priceEur: 2,
      },
    ]);
    expect(out.split('\n')[1]).toBe('x;"A;B";"say ""hi""";2024;electric;1;2');
  });

  it('downloads through an object URL when supported', () => {
    const csv = TestBed.inject(CsvExport);
    expect(csv.download('a.csv', 'x')).toBe(false);

    const click = jest
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => undefined);
    Object.assign(URL, { createObjectURL: jest.fn(() => 'blob:1'), revokeObjectURL: jest.fn() });
    expect(csv.download('a.csv', 'x')).toBe(true);
    expect(click).toHaveBeenCalled();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:1');
    Object.assign(URL, { createObjectURL: undefined, revokeObjectURL: undefined });
    click.mockRestore();
  });
});
