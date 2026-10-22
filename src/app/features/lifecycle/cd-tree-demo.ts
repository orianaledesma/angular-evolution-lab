import { Component, inject, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { Button } from '@shared/ui/button/button';
import { Card } from '@shared/ui/card/card';
import { CodeCompare } from '@shared/ui/code-compare/code-compare';
import { CD_TREE } from './snippets';
import { TreeRoot } from './tree-nodes';
import { TreeProbe, type TreeNodeId } from './tree-probe';

const NODE_LABELS = {
  root: 'Root',
  branchA: 'Branch A',
  leafA1: 'Leaf A1',
  leafA2: 'Leaf A2',
  branchB: 'Branch B',
  leafB1: 'Leaf B1',
} as const;

@Component({
  selector: 'app-cd-tree-demo',
  imports: [TranslatePipe, Card, CodeCompare, Button, TreeRoot],
  providers: [TreeProbe],
  templateUrl: './cd-tree-demo.html',
})
export class CdTreeDemo {
  protected readonly probe = inject(TreeProbe);
  protected readonly snippets = CD_TREE;
  readonly plate = signal('M-EV 2026');

  setSignal(): void {
    this.probe.run('signal', () => {
      this.probe.leafSignal.update((n) => n + 1);
    });
  }

  changeInput(): void {
    this.probe.run('input', () => {
      this.plate.update((p) => (p === 'M-EV 2026' ? 'W-12345E' : 'M-EV 2026'));
    });
  }

  protected names(nodes: readonly TreeNodeId[]): string {
    return nodes.map((node) => NODE_LABELS[node]).join(', ');
  }

  mutatePlain(): void {
    this.probe.run('plain', () => {
      this.probe.plainValue += 1;
    });
  }
}
