import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { Card } from '@shared/ui/card/card';
import { CodeCompare } from '@shared/ui/code-compare/code-compare';
import { VIEW_TRANSITIONS } from './snippets';

export type Layout = 'grid' | 'list';

export const SHOWROOM = [
  { id: 'id3', name: 'VW ID.3', color: '#2f6fb3' },
  { id: 'i4', name: 'BMW i4', color: '#1d3b5c' },
  { id: 'eqe', name: 'Mercedes EQE', color: '#5b6573' },
  { id: 'taycan', name: 'Porsche Taycan', color: '#a4161a' },
  { id: 'q4', name: 'Audi Q4 e-tron', color: '#3d4a3a' },
  { id: 'enyaq', name: 'Škoda Enyaq', color: '#17663a' },
] as const;

@Component({
  selector: 'app-view-transitions-demo',
  imports: [TranslatePipe, Card, CodeCompare, RouterLink],
  templateUrl: './view-transitions-demo.html',
  styleUrl: './view-transitions-demo.scss',
})
export class ViewTransitionsDemo {
  protected readonly snippets = VIEW_TRANSITIONS;
  protected readonly showroom = SHOWROOM;
  readonly layout = input<Layout>('grid');
}
