import { Component, inject, resource } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { Badge } from '@shared/ui/badge/badge';
import { Button } from '@shared/ui/button/button';
import { Card } from '@shared/ui/card/card';
import { CodeCompare } from '@shared/ui/code-compare/code-compare';
import { DEALER_FETCHER } from './dealer-source';
import { LocationState } from './location-state';
import { RESOURCE } from './snippets';

@Component({
  selector: 'app-resource-demo',
  imports: [TranslatePipe, Card, CodeCompare, Button, Badge],
  templateUrl: './resource-demo.html',
})
export class ResourceDemo {
  protected readonly state = inject(LocationState);
  private readonly fetchDealers = inject(DEALER_FETCHER);
  protected readonly snippets = RESOURCE;

  // params returning undefined keeps the resource idle (no city selected yet).
  readonly dealers = resource({
    params: () => {
      const cityId = this.state.city();
      return cityId ? { cityId } : undefined;
    },
    loader: ({ params, abortSignal }) => this.fetchDealers(params.cityId, abortSignal),
    defaultValue: [],
  });
}
