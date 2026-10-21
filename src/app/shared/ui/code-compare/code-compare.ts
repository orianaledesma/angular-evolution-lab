import { Component, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { uniqueId } from '../../unique-id';

export interface CodeSample {
  readonly label: string;
  readonly code: string;
}

/** Side-by-side "before / now" snippets. Stacks on narrow screens. */
@Component({
  selector: 'app-code-compare',
  imports: [TranslatePipe],
  templateUrl: './code-compare.html',
  styleUrl: './code-compare.scss',
})
export class CodeCompare {
  readonly before = input.required<CodeSample>();
  readonly after = input.required<CodeSample>();
  protected readonly ids = { before: uniqueId('cc-before'), after: uniqueId('cc-after') };
}
