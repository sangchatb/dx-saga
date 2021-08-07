import { buffers, Channel, channel } from "redux-saga";
import { take } from "typed-redux-saga";
import createDebug from "debug";

const debug = createDebug("dx-saga:monitor");

export const makeMonitor = () => {
  const _locks: Channel<string>[] = [];
  let locked: boolean = false;

  function* enter() {
    if (locked === true) {
      debug("monitor: queuing request");
      const lock = channel<string>(buffers.fixed(1));
      _locks.push(lock);
      yield* take(lock);
    } else {
      locked = true;
    }
    debug("monitor: entering lock");
  }

  function* exit() {
    if (_locks.length) {
      const lock = _locks.shift();
      lock?.put("unlock");
    } else {
      locked = false;
    }
    debug("monitor: exiting lock");
  }

  return {
    enter,
    exit,
  };
};
