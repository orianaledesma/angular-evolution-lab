import { Component, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  type ControlEvent,
  FormControl,
  FormGroup,
  FormResetEvent,
  FormSubmittedEvent,
  PristineChangeEvent,
  ReactiveFormsModule,
  StatusChangeEvent,
  TouchedChangeEvent,
  ValueChangeEvent,
  Validators,
} from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { Button } from '@shared/ui/button/button';
import { Card } from '@shared/ui/card/card';
import { CodeCompare } from '@shared/ui/code-compare/code-compare';
import { FormField, describedBy } from '@shared/ui/form-field/form-field';
import { FORM_EVENTS } from './snippets';

export interface EventEntry {
  readonly id: number;
  readonly type: string;
  readonly detail: string;
}

export function describeEvent(event: ControlEvent): Omit<EventEntry, 'id'> {
  if (event instanceof ValueChangeEvent) {
    return { type: 'ValueChangeEvent', detail: JSON.stringify(event.value) };
  }
  if (event instanceof StatusChangeEvent) {
    return { type: 'StatusChangeEvent', detail: event.status };
  }
  if (event instanceof TouchedChangeEvent) {
    return { type: 'TouchedChangeEvent', detail: `touched=${String(event.touched)}` };
  }
  if (event instanceof PristineChangeEvent) {
    return { type: 'PristineChangeEvent', detail: `pristine=${String(event.pristine)}` };
  }
  if (event instanceof FormSubmittedEvent) {
    return { type: 'FormSubmittedEvent', detail: 'submit' };
  }
  if (event instanceof FormResetEvent) {
    return { type: 'FormResetEvent', detail: 'reset' };
  }
  return { type: event.constructor.name, detail: '' };
}

@Component({
  selector: 'app-form-events-demo',
  imports: [TranslatePipe, Card, CodeCompare, Button, FormField, ReactiveFormsModule],
  templateUrl: './form-events-demo.html',
})
export class FormEventsDemo {
  protected readonly snippets = FORM_EVENTS;
  protected readonly describedBy = describedBy;

  readonly form = new FormGroup({
    vin: new FormControl('', {
      nonNullable: true,
      // eslint-disable-next-line @typescript-eslint/unbound-method -- static validator functions don't use `this`
      validators: [Validators.required, Validators.pattern(/^[A-HJ-NPR-Z0-9]{17}$/)],
    }),
    mileage: new FormControl<number | null>(null, [Validators.min(0)]),
  });

  readonly log = signal<readonly EventEntry[]>([]);
  private nextId = 0;

  private readonly subscription = this.form.events.pipe(takeUntilDestroyed()).subscribe((event) => {
    const entry = { id: this.nextId++, ...describeEvent(event) };
    this.log.update((log) => [entry, ...log].slice(0, 12));
  });

  protected vinErrorKey(): string | null {
    const vin = this.form.controls.vin;
    return vin.touched && vin.invalid ? 'v18.events.vinError' : null;
  }

  clearLog(): void {
    this.log.set([]);
  }
}
