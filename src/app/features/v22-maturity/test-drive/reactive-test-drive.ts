import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { VehicleApi } from '@core/api/vehicle-api';
import type { TestDriveConfirmation } from '@core/models/vehicle';
import { Button } from '@shared/ui/button/button';
import { FormField, describedBy } from '@shared/ui/form-field/form-field';
import { TEST_DRIVE_VEHICLES, earliestDate, serverFieldError } from './test-drive-options';

@Component({
  selector: 'app-reactive-test-drive',
  imports: [ReactiveFormsModule, TranslatePipe, Button, FormField],
  templateUrl: './reactive-test-drive.html',
})
export class ReactiveTestDrive {
  private readonly api = inject(VehicleApi);
  protected readonly vehicles = TEST_DRIVE_VEHICLES;
  protected readonly minDate = earliestDate();
  protected readonly describedBy = describedBy;

  /* eslint-disable @typescript-eslint/unbound-method -- static validator functions don't use `this` */
  readonly form = new FormGroup({
    fullName: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    vehicleId: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    date: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    consent: new FormControl(false, { nonNullable: true, validators: [Validators.requiredTrue] }),
  });
  /* eslint-enable @typescript-eslint/unbound-method */

  readonly submitting = signal(false);
  readonly confirmation = signal<TestDriveConfirmation | null>(null);

  error(name: keyof typeof this.form.controls): string | null {
    const control = this.form.controls[name];
    if (!control.touched || control.valid) {
      return null;
    }
    if (control.hasError('server')) {
      return control.getError('server') as string;
    }
    // Validators.requiredTrue reports its error under the generic `required` key.
    const key =
      name === 'consent' ? 'consent' : (Object.keys(control.errors ?? {})[0] ?? 'required');
    return `v22.forms.errors.${key}`;
  }

  submit(): void {
    this.confirmation.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting.set(true);
    this.api.bookTestDrive(this.form.getRawValue()).subscribe({
      next: (res) => {
        this.submitting.set(false);
        this.confirmation.set(res);
        this.form.reset();
      },
      error: (e: unknown) => {
        this.submitting.set(false);
        this.form.controls.email.setErrors({ server: serverFieldError(e, 'email') });
        this.form.controls.email.markAsTouched();
      },
    });
  }
}
