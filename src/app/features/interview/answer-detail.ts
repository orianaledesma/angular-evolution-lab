import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import type { AnchorState } from '@core/navigation/anchor-focus';
import { DEMO_NAV } from '@core/navigation/demo-nav';
import { Button } from '@shared/ui/button/button';
import type { Question } from './questions';
import { ANSWER_SNIPPETS } from './snippets';

/**
 * The full answer to an interview question: one sentence, the reasoning, optional code and a link
 * to the live demo. Shared by the question list and the quiz feedback.
 */
@Component({
  selector: 'app-answer-detail',
  imports: [TranslatePipe, RouterLink, Button],
  templateUrl: './answer-detail.html',
  styleUrl: './answer-detail.scss',
})
export class AnswerDetail {
  readonly question = input.required<Question>();
  /** Navigation state for the demo link, so the demo page can offer a way back. */
  readonly back = input<AnchorState>();
  /** The quiz already shows the one-sentence answer as the correct option. */
  readonly showShort = input(true);

  protected readonly snippets = ANSWER_SNIPPETS;

  /** Nav label key of the demo's page, for the link text. */
  protected pageKey(path: string): string {
    return DEMO_NAV.find((item) => item.path === path)?.labelKey ?? 'nav.home';
  }
}
