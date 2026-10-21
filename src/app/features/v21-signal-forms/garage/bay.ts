import { Component, inject } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { BayTelemetry } from './bay-telemetry';

@Component({
  selector: 'app-bay',
  imports: [TranslatePipe],
  template: `
    <p class="status" data-testid="bay">
      🔧 {{ 'v21.cleanup.inBay' | translate: { bay: telemetry.bay, id: telemetry.id } }}
    </p>
  `,
})
export default class Bay {
  protected readonly telemetry = inject(BayTelemetry);
}
