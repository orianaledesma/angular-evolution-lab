/**
 * When each API appeared and when it became stable. "stable" values are taken from the
 * `@publicApi <version>` tags in the installed @angular/* 22.2.3 typings; `null` = not stable yet.
 */
export interface ApiStability {
  readonly api: string;
  readonly introduced: number;
  readonly stable: number | null;
}

export const API_STABILITY: readonly ApiStability[] = [
  { api: 'signal() · computed()', introduced: 16, stable: 17 },
  { api: 'effect()', introduced: 16, stable: 20 },
  { api: 'toSignal() · toObservable()', introduced: 16, stable: 20 },
  { api: 'afterNextRender()', introduced: 16, stable: 20 },
  { api: 'input() · model() · output()', introduced: 17, stable: 19 },
  { api: 'viewChild() · viewChildren()', introduced: 17, stable: 19 },
  { api: 'Zoneless change detection', introduced: 18, stable: 20 },
  { api: 'linkedSignal()', introduced: 19, stable: 20 },
  { api: 'resource() · rxResource()', introduced: 19, stable: 22 },
  { api: 'httpResource()', introduced: 19, stable: 22 },
  { api: 'isActive()', introduced: 21, stable: 21 },
  { api: 'Signal Forms', introduced: 21, stable: 22 },
  { api: 'injectAsync() · @Service()', introduced: 22, stable: 22 },
  { api: 'debounced()', introduced: 22, stable: null },
];

export const VERSIONS = [16, 17, 18, 19, 20, 21, 22] as const;

export type Phase = 'none' | 'preview' | 'stable';

export function phaseAt(entry: ApiStability, version: number): Phase {
  if (version < entry.introduced) {
    return 'none';
  }
  return entry.stable !== null && version >= entry.stable ? 'stable' : 'preview';
}
