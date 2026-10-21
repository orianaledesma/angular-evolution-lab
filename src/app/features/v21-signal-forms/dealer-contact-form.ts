import { Component, computed, signal } from '@angular/core';
import { FormField, email, form, maxLength, pattern, required } from '@angular/forms/signals';
import { TranslatePipe } from '@ngx-translate/core';
import { Button } from '@shared/ui/button/button';
import { Card } from '@shared/ui/card/card';
import { CodeCompare } from '@shared/ui/code-compare/code-compare';
import { FormField as FormFieldUi } from '@shared/ui/form-field/form-field';
import { SIGNAL_FORMS } from './snippets';

export interface DealerContact {
  name: string;
  email: string;
  postcode: string;
  message: string;
}

export const MESSAGE_MAX = 280;

const EMPTY: DealerContact = { name: '', email: '', postcode: '', message: '' };

@Component({
  selector: 'app-dealer-contact-form',
  imports: [TranslatePipe, Card, CodeCompare, Button, FormField, FormFieldUi],
  templateUrl: './dealer-contact-form.html',
})
export class DealerContactForm {
  protected readonly snippets = SIGNAL_FORMS;
  protected readonly messageMax = MESSAGE_MAX;

  readonly model = signal<DealerContact>({ ...EMPTY });
  readonly f = form(this.model, (p) => {
    required(p.name);
    required(p.email);
    email(p.email);
    required(p.postcode);
    pattern(p.postcode, /^\d{4,5}$/);
    maxLength(p.message, MESSAGE_MAX);
  });

  readonly sent = signal<DealerContact | null>(null);
  readonly modelJson = computed(() => JSON.stringify(this.model(), null, 2));

  /** First error of a field, as an i18n key — shown only once the user touched it. */
  errorKey(field: 'name' | 'email' | 'postcode' | 'message'): string | null {
    const state = this.f[field]();
    const first = state.errors()[0];
    return state.touched() && first ? `v21.forms.errors.${first.kind}` : null;
  }

  send(event: Event): void {
    event.preventDefault();
    if (this.f().invalid()) {
      this.f().markAsTouched();
      return;
    }
    this.sent.set(this.model());
    this.model.set({ ...EMPTY });
    this.f().reset();
  }
}
