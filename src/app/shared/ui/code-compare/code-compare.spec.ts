import { render, screen } from '@testing-library/angular';
import { provideTranslateTesting } from '../../../../testing/translate-testing';
import { CodeCompare } from './code-compare';

describe('CodeCompare', () => {
  it('shows labelled, keyboard-scrollable before/now snippets', async () => {
    await render(CodeCompare, {
      providers: [provideTranslateTesting()],
      inputs: {
        before: { label: 'v15 · NgIf directive', code: '<div [hidden]="!x">' },
        after: { label: 'v17 · @if', code: '@if (x) {}' },
      },
    });
    const before = screen.getByRole('figure', { name: /Before v15/ });
    const after = screen.getByRole('figure', { name: /Now v17/ });
    expect(before).toHaveTextContent('<div [hidden]="!x">');
    expect(after).toHaveTextContent('@if (x) {}');
    expect(before.querySelector('pre')).toHaveAttribute('tabindex', '0');
  });
});
