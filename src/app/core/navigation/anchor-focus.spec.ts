import { Component, type OnInit, signal } from '@angular/core';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { RouterLink } from '@angular/router';
import { AnchorFocus, HIGHLIGHT_CLASS, HIGHLIGHT_MS, returnTo } from './anchor-focus';

@Component({
  selector: 'app-question-page',
  imports: [RouterLink],
  template: `
    <h1>Questions</h1>
    <a routerLink="/demo" fragment="target" [state]="back">See the example</a>
    <a routerLink="/late" fragment="later">See the late example</a>
    <section id="q-1"><h2>Question 1</h2></section>
  `,
})
class QuestionPage {
  readonly back = returnTo('/questions', 'q-1', 'Back to the question');
}

@Component({
  selector: 'app-demo-page',
  template: `
    <h1>Demo</h1>
    <section id="target"><h2>Target demo</h2></section>
  `,
})
class DemoPage {}

/** Renders its target after navigation, like a @defer block or a lazy child would. */
@Component({
  selector: 'app-late-page',
  template: `
    <h1>Late</h1>
    @if (ready()) {
      <section id="later"><h2>Late demo</h2></section>
    }
  `,
})
class LatePage implements OnInit {
  readonly ready = signal(false);

  ngOnInit(): void {
    setTimeout(() => {
      this.ready.set(true);
    }, 20);
  }
}

describe('AnchorFocus', () => {
  async function setup() {
    const result = await render(`<router-outlet />`, {
      routes: [
        { path: 'questions', component: QuestionPage },
        { path: 'demo', component: DemoPage },
        { path: 'other', component: DemoPage },
        { path: 'late', component: LatePage },
      ],
    });
    const anchors = result.fixture.debugElement.injector.get(AnchorFocus);
    await result.navigate('/questions');
    return { ...result, anchors };
  }

  afterEach(() => {
    jest.useRealTimers();
  });

  it('focuses and highlights the fragment target, then removes the highlight', async () => {
    jest.useFakeTimers({ advanceTimers: true });
    const user = userEvent.setup({
      advanceTimers: (ms) => {
        jest.advanceTimersByTime(ms);
      },
    });
    const { fixture } = await setup();

    await user.click(screen.getByRole('link', { name: 'See the example' }));
    await fixture.whenStable();
    const target = await screen.findByRole('heading', { name: 'Target demo' });
    const section = target.parentElement!;

    await jest.advanceTimersByTimeAsync(0);
    expect(section).toHaveFocus();
    expect(section).toHaveAttribute('tabindex', '-1');
    expect(section).toHaveClass(HIGHLIGHT_CLASS);

    await jest.advanceTimersByTimeAsync(HIGHLIGHT_MS);
    expect(section).not.toHaveClass(HIGHLIGHT_CLASS);
  });

  it('remembers where to return and forgets it when the section changes', async () => {
    const user = userEvent.setup();
    const { fixture, anchors, navigate } = await setup();

    await user.click(screen.getByRole('link', { name: 'See the example' }));
    await fixture.whenStable();
    expect(anchors.returnTo()).toEqual({
      path: '/questions',
      fragment: 'q-1',
      labelKey: 'Back to the question',
    });

    await navigate('/demo?tab=2');
    expect(anchors.returnTo()).not.toBeNull();

    await navigate('/other');
    expect(anchors.returnTo()).toBeNull();
  });

  it('waits for a target that renders after navigation', async () => {
    const user = userEvent.setup();
    const { fixture } = await setup();

    await user.click(screen.getByRole('link', { name: 'See the late example' }));
    await fixture.whenStable();

    const late = await screen.findByRole('heading', { name: 'Late demo' });
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(late.parentElement).toHaveFocus();
  });
});
