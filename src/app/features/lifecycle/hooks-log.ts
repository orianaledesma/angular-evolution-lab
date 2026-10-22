import { Injectable, signal } from '@angular/core';

export type HookKind = 'classic' | 'modern';

export interface HookEntry {
  readonly hook: string;
  readonly kind: HookKind;
  readonly detail: string;
}

export interface ActionGroup {
  readonly id: number;
  readonly actionKey: string;
  readonly entries: readonly HookEntry[];
}

/**
 * Collects lifecycle calls per user action.
 * Hooks write to a plain buffer: writing a signal from ngDoCheck / ngAfterViewChecked would schedule
 * another render, whose hooks would write again — an endless loop. The demo publishes the buffer
 * once, after the render the action caused.
 */
@Injectable()
export class HooksLog {
  private buffer: HookEntry[] = [];
  private nextId = 0;

  readonly groups = signal<readonly ActionGroup[]>([]);

  record(hook: string, kind: HookKind, detail = ''): HookEntry {
    const entry = { hook, kind, detail };
    this.buffer.push(entry);
    return entry;
  }

  /** Starts a new action: anything recorded since the last commit (e.g. the log's own render) is dropped. */
  begin(): void {
    this.buffer = [];
  }

  commit(actionKey: string): void {
    const group: ActionGroup = { id: this.nextId++, actionKey, entries: this.buffer };
    this.buffer = [];
    this.groups.update((groups) => [group, ...groups].slice(0, 5));
  }

  clear(): void {
    this.buffer = [];
    this.groups.set([]);
  }
}
