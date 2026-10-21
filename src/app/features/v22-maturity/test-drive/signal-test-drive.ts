import { Component, inject, signal } from '@angular/core';
import { FormField, FormRoot, email, form, required, validate } from '@angular/forms/signals';
import { TranslatePipe } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import { VehicleApi } from '@core/api/vehicle-api';
import type { TestDriveConfirmation, TestDriveRequest } from '@core/models/vehicle';
import { Button } from '@shared/ui/button/button';
import { FormField as FormFieldUi, describedBy } from '@shared/ui/form-field/form-field';
import { TEST_DRIVE_VEHICLES, earliestDate, serverFieldError } from './test-drive-options';

type Model = { -readonly [K in keyof TestDriveRequest]: TestDriveRequest[K] };

const EMPTY: Model = { fullName: '', email: '', vehicleId: '', date: '', consent: false };

@Component({
  selector: 'app-signal-test-drive',
  imports: [FormField, FormRoot, TranslatePipe, Button, FormFieldUi],
  templateUrl: './signal-test-drive.html',
})
export class SignalTestDrive {
  private readonly api = inject(VehicleApi);
  protected readonly vehicles = TEST_DRIVE_VEHICLES;
  protected readonly minDate = earliestDate();
  protected readonly describedBy = describedBy;

  readonly model = signal<Model>({ ...EMPTY });
  readonly confirmation = signal<TestDriveConfirmation | null>(null);

  readonly f = form(
    this.model,
    (p) => {
      required(p.fullName);
      required(p.email);
      email(p.email);
      required(p.vehicleId);
      required(p.date);
      validate(p.date, ({ value }) =>
        value() && value() < this.minDate ? { kind: 'minDate' } : null,
      );
      validate(p.consent, ({ value }) => (value() ? null : { kind: 'consent' }));
    },
    {
      // FormRoot calls submit() with these options when the <form> is submitted.
      submission: {
        action: async (field) => {
          this.confirmation.set(null);
          try {
            this.confirmation.set(await firstValueFrom(this.api.bookTestDrive(field().value())));
            this.model.set({ ...EMPTY });
            field().reset();
            return null;
          } catch (e) {
            // Server-side validation lands on the field, exactly like a client validator.
            return {
              kind: 'server',
              fieldTree: field.email,
              message: serverFieldError(e, 'email') ?? '',
            };
          }
        },
      },
    },
  );

  error(name: keyof Model): string | null {
    const state = this.f[name]();
    const first = state.errors()[0];
    if (!state.touched() || !first) {
      return null;
    }
    return first.kind === 'server' ? (first.message ?? null) : `v22.forms.errors.${first.kind}`;
  }
}
