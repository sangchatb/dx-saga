import { put, takeEvery } from "typed-redux-saga";
import { counterSlice } from "./slice";

function* handleIncrementMiddleware() {
  const action = counterSlice.actions.onSagaMiddleware();
  yield* put(action);
}
export function* watchInternalSaga() {
  yield* takeEvery(counterSlice.actions.increment, handleIncrementMiddleware);
}

function* handleIncrementExternal() {
  const action = counterSlice.actions.onRunSaga();
  yield* put(action);
}

export function* watchExternalSaga() {
  yield* takeEvery(counterSlice.actions.increment, handleIncrementExternal);
}
