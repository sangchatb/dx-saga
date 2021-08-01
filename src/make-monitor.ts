import { buffers, Channel, channel } from "redux-saga";
import { take } from "typed-redux-saga";

export const makeMonitor = () => {
  let _lock: Channel<string> | null = null;

  function* enter() {
    if (_lock) {
      yield* take(_lock);
    } else {
      _lock = channel(buffers.expanding());
    }
  }
  function* exit() {
    if (_lock) {
      _lock.put("unlock");
      _lock = null;
    }
  }

  return {
    enter,
    exit,
  };
};
