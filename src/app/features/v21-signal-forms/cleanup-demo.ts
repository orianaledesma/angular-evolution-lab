import { Component, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { Badge } from '@shared/ui/badge/badge';
import { Button } from '@shared/ui/button/button';
import { Card } from '@shared/ui/card/card';
import { CodeCompare } from '@shared/ui/code-compare/code-compare';
import { InjectorRegistry } from './garage/injector-registry';
import { CLEANUP } from './snippets';

@Component({
  selector: 'app-cleanup-demo',
  imports: [TranslatePipe, Card, CodeCompare, Badge, Button, RouterLink, RouterOutlet],
  templateUrl: './cleanup-demo.html',
})
export class CleanupDemo {
  protected readonly registry = inject(InjectorRegistry);
  protected readonly snippets = CLEANUP;
  protected readonly bays = ['a', 'b', 'c'] as const;
}
