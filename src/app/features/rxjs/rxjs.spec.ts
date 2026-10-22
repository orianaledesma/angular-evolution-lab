import { render, screen } from '@testing-library/angular';
import { provideTranslateTesting } from '../../../testing/translate-testing';
import Rxjs from './rxjs';

describe('RxJS page', () => {
  it('renders the five RxJS demos with jump targets', async () => {
    const { container } = await render(Rxjs, { providers: [provideTranslateTesting()] });
    expect(screen.getByRole('heading', { level: 1, name: 'RxJS in practice' })).toBeInTheDocument();
    for (const id of [
      'flattening-demo',
      'subjects-demo',
      'interop-demo',
      'errors-demo',
      'leaks-demo',
    ]) {
      expect(container.querySelector(`#${id}`)).not.toBeNull();
    }
  });
});
