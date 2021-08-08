import { configureStore } from "@reduxjs/toolkit";
import { expect } from "chai";
import createSagaMiddleware, { runSaga, stdChannel } from "redux-saga";
import { watchExternalSaga, watchInternalSaga } from "./saga";
import { counterSlice } from "./slice";

describe("runSaga", () => {
  it(`does not 'take' actions dispatched through the store`, () => {
    const sagaMiddleware = createSagaMiddleware();

    const store = configureStore({
      reducer: {
        counter: counterSlice.reducer,
      },
      middleware: [sagaMiddleware],
    });

    sagaMiddleware.run(watchInternalSaga);

    runSaga(
      {
        dispatch: store.dispatch.bind(store),
        getState: store.getState.bind(store),
      },
      watchExternalSaga
    );

    const action = counterSlice.actions.increment();
    store.dispatch(action);

    const state = store.getState();
    expect(state.counter.i).to.eq(1);
    expect(state.counter.runSaga).to.eq(0);
    expect(state.counter["sagaMiddleware.run"]).to.eq(1);
  });

  it(`will 'take' actions dispatched through the store if the same channel is used`, () => {
    const channel = stdChannel();
    const sagaMiddleware = createSagaMiddleware({
      // why is this not part of the d.ts
      // @ts-ignore
      channel,
    });

    const store = configureStore({
      reducer: {
        counter: counterSlice.reducer,
      },
      middleware: [sagaMiddleware],
    });

    sagaMiddleware.run(watchInternalSaga);

    runSaga(
      {
        channel,
        dispatch: store.dispatch.bind(store),
        getState: store.getState.bind(store),
      },
      watchExternalSaga
    );

    const action = counterSlice.actions.increment();
    store.dispatch(action);

    const state = store.getState();
    expect(state.counter.i).to.eq(1);
    expect(state.counter.runSaga).to.eq(1);
    expect(state.counter["sagaMiddleware.run"]).to.eq(1);
  });
});
