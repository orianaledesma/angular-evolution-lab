import { Component, input } from '@angular/core';

export type BadgeTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';

@Component({
  selector: 'app-badge',
  template: '<ng-content />',
  styleUrl: './badge.scss',
  host: { '[class]': "'badge badge--' + tone()" },
})
export class Badge {
  readonly tone = input<BadgeTone>('neutral');
}
