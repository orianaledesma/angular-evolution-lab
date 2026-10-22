import {
  ChangeDetectionStrategy,
  Component,
  type DoCheck,
  ElementRef,
  Injectable,
  Injector,
  afterNextRender,
  inject,
  input,
  signal,
} from '@angular/core';

export const TREE_NODES = ['root', 'branchA', 'leafA1', 'leafA2', 'branchB', 'leafB1'] as const;
export type TreeNodeId = (typeof TREE_NODES)[number];

export type TreeAction = 'signal' | 'input' | 'event' | 'plain';

export interface TreeResult {
  readonly id: number;
  readonly action: TreeAction;
  readonly checked: readonly TreeNodeId[];
}

export const FLASH_CLASS = 'flash';

/**
 * Counts which views of the demo tree were refreshed by one action.
 * Counts live in a plain Map (never a signal) so that showing the result does not refresh the tree.
 */
@Injectable()
export class TreeProbe {
  private readonly injector = inject(Injector);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly counts = new Map<TreeNodeId, number>();
  private nextId = 0;

  /** Read only by Leaf A1's template. */
  readonly leafSignal = signal(0);
  /** Plain field, also shown by Leaf A1: changing it notifies nobody. */
  plainValue = 0;

  readonly result = signal<TreeResult | null>(null);

  hit(node: TreeNodeId): number {
    const next = (this.counts.get(node) ?? 0) + 1;
    this.counts.set(node, next);
    return next;
  }

  run(action: TreeAction, change: () => void): void {
    const before = new Map(this.counts);
    change();
    // If nothing at all is re-rendered (plain field), afterNextRender still runs after the next
    // render the click itself schedules.
    afterNextRender(
      {
        read: () => {
          const checked = TREE_NODES.filter(
            (node) => (this.counts.get(node) ?? 0) > (before.get(node) ?? 0),
          );
          this.flash(checked);
          this.result.set({ id: this.nextId++, action, checked });
        },
      },
      { injector: this.injector },
    );
  }

  private flash(nodes: readonly TreeNodeId[]): void {
    for (const el of this.host.nativeElement.querySelectorAll<HTMLElement>('[data-node]')) {
      el.classList.remove(FLASH_CLASS);
      if (nodes.includes(el.dataset['node'] as TreeNodeId)) {
        // Restart the CSS animation.
        el.getBoundingClientRect();
        el.classList.add(FLASH_CLASS);
      }
    }
  }
}

/** Lives inside a node's own view: ngDoCheck runs exactly when that view is refreshed. */
@Component({
  selector: 'app-check-probe',
  // eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection -- must be checked with its host view to count refreshes
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `<output class="probe" data-testid="probe">{{ count }}×</output>`,
  styles: `
    .probe {
      font-family: var(--font-mono);
      font-weight: 700;
      color: var(--color-accent-strong);
    }
  `,
})
export class CheckProbe implements DoCheck {
  private readonly probe = inject(TreeProbe);
  readonly node = input.required<TreeNodeId>();
  // Plain field: writing a signal during change detection is forbidden.
  protected count = 0;

  ngDoCheck(): void {
    this.count = this.probe.hit(this.node());
  }
}
