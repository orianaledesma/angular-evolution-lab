import {
  Observable,
  type OperatorFunction,
  Subject,
  Subscription,
  concatMap,
  defer,
  exhaustMap,
  finalize,
  map,
  mergeMap,
  switchMap,
  tap,
  timer,
} from 'rxjs';

export const FLATTENING_OPERATORS = ['switchMap', 'mergeMap', 'concatMap', 'exhaustMap'] as const;
export type FlatteningOperator = (typeof FLATTENING_OPERATORS)[number];

export type RunStatus = 'running' | 'done' | 'cancelled';

/** One inner observable ("request") as seen by one operator. */
export interface InnerRun {
  readonly request: number;
  readonly start: number;
  readonly end: number | null;
  readonly status: RunStatus;
}

export interface LaneState {
  readonly runs: readonly InnerRun[];
  readonly outputs: readonly { readonly request: number; readonly at: number }[];
}

export interface LabEvents {
  readonly onLane: (op: FlatteningOperator, update: (lane: LaneState) => LaneState) => void;
}

export function flatten<T, R>(
  op: FlatteningOperator,
  project: (value: T) => Observable<R>,
): OperatorFunction<T, R> {
  switch (op) {
    case 'switchMap':
      return switchMap(project);
    case 'mergeMap':
      return mergeMap(project);
    case 'concatMap':
      return concatMap(project);
    case 'exhaustMap':
      return exhaustMap(project);
  }
}

export const EMPTY_LANE: LaneState = { runs: [], outputs: [] };

export interface MarbleLabOptions extends LabEvents {
  readonly durationMs: number;
  readonly elapsed: () => number;
}

export interface MarbleLab {
  readonly click: (request: number) => void;
  readonly dispose: () => void;
}

/**
 * Feeds one click stream through the four flattening operators. Each click starts a fake request
 * that takes `durationMs`; the lab reports when each operator starts, finishes or cancels it.
 */
export function createMarbleLab({ durationMs, elapsed, onLane }: MarbleLabOptions): MarbleLab {
  const clicks = new Subject<number>();
  const subscription = new Subscription();

  const finish = (op: FlatteningOperator, request: number, status: RunStatus) => {
    const end = elapsed();
    onLane(op, (lane) => ({
      ...lane,
      runs: lane.runs.map((run) =>
        run.request === request && run.status === 'running' ? { ...run, end, status } : run,
      ),
    }));
  };

  const fakeRequest = (op: FlatteningOperator, request: number): Observable<number> =>
    defer(() => {
      onLane(op, (lane) => ({
        ...lane,
        runs: [...lane.runs, { request, start: elapsed(), end: null, status: 'running' }],
      }));
      let completed = false;
      return timer(durationMs).pipe(
        map(() => request),
        tap(() => {
          completed = true;
          finish(op, request, 'done');
        }),
        // finalize runs on completion *and* on unsubscribe: switchMap cancelling is the latter.
        finalize(() => {
          if (!completed) {
            finish(op, request, 'cancelled');
          }
        }),
      );
    });

  for (const op of FLATTENING_OPERATORS) {
    subscription.add(
      clicks
        .pipe(flatten(op, (request: number) => fakeRequest(op, request)))
        .subscribe((request) => {
          onLane(op, (lane) => ({
            ...lane,
            outputs: [...lane.outputs, { request, at: elapsed() }],
          }));
        }),
    );
  }

  return {
    click: (request) => {
      clicks.next(request);
    },
    dispose: () => {
      subscription.unsubscribe();
    },
  };
}
