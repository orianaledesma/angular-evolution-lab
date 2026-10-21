import { TestBed } from '@angular/core/testing';
import { DEALER_FETCHER } from './dealer-source';

describe('DEALER_FETCHER (default)', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    globalThis.fetch = originalFetch;
  });

  it('waits, fetches the JSON and filters by city', async () => {
    globalThis.fetch = jest.fn().mockResolvedValue({
      json: () =>
        Promise.resolve([
          { id: 'a', name: 'A', cityId: 'muc' },
          { id: 'b', name: 'B', cityId: 'vie' },
        ]),
    });
    const fetcher = TestBed.inject(DEALER_FETCHER);
    const result = fetcher('vie', new AbortController().signal);
    await jest.advanceTimersByTimeAsync(600);
    await expect(result).resolves.toEqual([{ id: 'b', name: 'B', cityId: 'vie' }]);
  });

  it('rejects when aborted during the delay', async () => {
    globalThis.fetch = jest.fn();
    const controller = new AbortController();
    const result = TestBed.inject(DEALER_FETCHER)('muc', controller.signal);
    controller.abort(new Error('aborted'));
    await expect(result).rejects.toThrow('aborted');
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });
});
