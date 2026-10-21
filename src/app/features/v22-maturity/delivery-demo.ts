import { Component, computed, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { Button } from '@shared/ui/button/button';
import { Card } from '@shared/ui/card/card';
import { CodeCompare } from '@shared/ui/code-compare/code-compare';
import { SWITCH } from './snippets';

export const DELIVERY_STEPS = [
  'ordered',
  'confirmed',
  'in-production',
  'quality-check',
  'in-transit',
  'at-dealer',
  'delivered',
] as const;
export type DeliveryStatus = (typeof DELIVERY_STEPS)[number];

@Component({
  selector: 'app-delivery-demo',
  imports: [TranslatePipe, Card, CodeCompare, Button],
  templateUrl: './delivery-demo.html',
  styleUrl: './delivery-demo.scss',
})
export class DeliveryDemo {
  protected readonly snippets = SWITCH;
  protected readonly steps = DELIVERY_STEPS;
  readonly index = signal(0);
  readonly status = computed<DeliveryStatus>(() => DELIVERY_STEPS[this.index()] ?? 'ordered');

  next(): void {
    this.index.update((i) => Math.min(i + 1, DELIVERY_STEPS.length - 1));
  }

  previous(): void {
    this.index.update((i) => Math.max(i - 1, 0));
  }
}
