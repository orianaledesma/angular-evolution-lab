import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { Card } from '@shared/ui/card/card';
import { API_STABILITY, VERSIONS, phaseAt } from './api-stability';

@Component({
  selector: 'app-stability-demo',
  imports: [TranslatePipe, Card],
  templateUrl: './stability-demo.html',
  styleUrl: './stability-demo.scss',
})
export class StabilityDemo {
  protected readonly rows = API_STABILITY;
  protected readonly versions = VERSIONS;
  protected readonly phaseAt = phaseAt;
}
