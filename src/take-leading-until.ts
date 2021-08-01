import { fork, take, cancel, race } from "typed-redux-saga";

export const takeLeadingUntil = (
  patternOrChannel: any,
  saga: any,
  untilPatternOrChannel: any,
  ...args: any
) =>
  fork(function* () {
    let leadingTask = null;
    while (true) {
      const { takeAction, untilAction } = yield* race({
        takeAction: take(patternOrChannel),
        untilAction: take(untilPatternOrChannel),
      });
      if (untilAction && leadingTask) {
        yield* cancel(leadingTask);
        leadingTask = null;
      }
      if (untilAction) {
        continue;
      }
      if (
        !leadingTask ||
        !leadingTask.isRunning() ||
        leadingTask.isCancelled()
      ) {
        leadingTask = yield* fork(saga, ...args.concat(takeAction));
      }
    }
  });
