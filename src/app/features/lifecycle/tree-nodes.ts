import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { Button } from '@shared/ui/button/button';
import { CheckProbe, TreeProbe } from './tree-probe';

const NODE_STYLES = `
  :host {
    display: block;
    min-width: 0;
  }

  .node {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-3);
    background: var(--color-surface);
    border: 2px solid var(--color-border);
    border-radius: var(--radius-md);
  }

  .node.flash {
    animation: node-flash 1.6s ease-out;
  }

  @keyframes node-flash {
    0%,
    40% {
      border-color: var(--color-success);
      background: var(--color-success-bg);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .node.flash {
      animation: none;
      border-color: var(--color-success);
    }
  }

  .head {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
    align-items: baseline;
    justify-content: space-between;
  }

  h4 {
    margin: 0;
    font-size: var(--font-size-sm);
  }

  .strategy {
    font-family: var(--font-mono);
    font-size: var(--font-size-xs);
    color: var(--color-text-muted);
  }

  .children {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(9rem, 1fr));
    gap: var(--space-2);
  }

  p {
    margin: 0;
    font-size: var(--font-size-sm);
  }
`;

@Component({
  selector: 'app-tree-leaf-a1',
  imports: [CheckProbe],
  template: `
    <div class="node" data-node="leafA1" data-testid="node-leafA1">
      <div class="head">
        <h4>Leaf A1</h4>
        <span class="strategy">OnPush</span>
        <app-check-probe node="leafA1" />
      </div>
      <p>signal: {{ probe.leafSignal() }}</p>
      <p>plain field: {{ probe.plainValue }}</p>
    </div>
  `,
  styles: NODE_STYLES,
})
export class TreeLeafA1 {
  protected readonly probe = inject(TreeProbe);
}

@Component({
  selector: 'app-tree-leaf-a2',
  imports: [CheckProbe, Button, TranslatePipe],
  // eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection -- the tree contrasts Eager with OnPush
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <div class="node" data-node="leafA2" data-testid="node-leafA2">
      <div class="head">
        <h4>Leaf A2</h4>
        <span class="strategy">Eager</span>
        <app-check-probe node="leafA2" />
      </div>
      <button app-button variant="secondary" size="sm" type="button" (click)="click()">
        {{ 'lifecycle.tree.clickA2' | translate }}
      </button>
    </div>
  `,
  styles: NODE_STYLES,
})
export class TreeLeafA2 {
  private readonly probe = inject(TreeProbe);

  protected click(): void {
    // The listener itself is the notification: Angular marks this view and its ancestors dirty.
    this.probe.run('event', () => undefined);
  }
}

@Component({
  selector: 'app-tree-branch-a',
  imports: [CheckProbe, TreeLeafA1, TreeLeafA2],
  template: `
    <div class="node" data-node="branchA" data-testid="node-branchA">
      <div class="head">
        <h4>Branch A</h4>
        <span class="strategy">OnPush</span>
        <app-check-probe node="branchA" />
      </div>
      <div class="children">
        <app-tree-leaf-a1 />
        <app-tree-leaf-a2 />
      </div>
    </div>
  `,
  styles: NODE_STYLES,
})
export class TreeBranchA {}

@Component({
  selector: 'app-tree-leaf-b1',
  imports: [CheckProbe],
  template: `
    <div class="node" data-node="leafB1" data-testid="node-leafB1">
      <div class="head">
        <h4>Leaf B1</h4>
        <span class="strategy">OnPush</span>
        <app-check-probe node="leafB1" />
      </div>
      <p>input: {{ plate() }}</p>
    </div>
  `,
  styles: NODE_STYLES,
})
export class TreeLeafB1 {
  readonly plate = input.required<string>();
}

@Component({
  selector: 'app-tree-branch-b',
  imports: [CheckProbe, TreeLeafB1],
  // eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection -- the tree contrasts Eager with OnPush
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <div class="node" data-node="branchB" data-testid="node-branchB">
      <div class="head">
        <h4>Branch B</h4>
        <span class="strategy">Eager</span>
        <app-check-probe node="branchB" />
      </div>
      <div class="children">
        <app-tree-leaf-b1 [plate]="plate()" />
      </div>
    </div>
  `,
  styles: NODE_STYLES,
})
export class TreeBranchB {
  readonly plate = input.required<string>();
}

@Component({
  selector: 'app-tree-root',
  imports: [CheckProbe, TreeBranchA, TreeBranchB],
  template: `
    <div class="node" data-node="root" data-testid="node-root">
      <div class="head">
        <h4>Root</h4>
        <span class="strategy">OnPush</span>
        <app-check-probe node="root" />
      </div>
      <div class="children">
        <app-tree-branch-a />
        <app-tree-branch-b [plate]="plate()" />
      </div>
    </div>
  `,
  styles: NODE_STYLES,
})
export class TreeRoot {
  readonly plate = input.required<string>();
}
