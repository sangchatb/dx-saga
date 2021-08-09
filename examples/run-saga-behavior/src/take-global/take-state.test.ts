import { configureStore } from "@reduxjs/toolkit";
import { expect } from "chai";
import createSagaMiddleware from "redux-saga";
import { watchGlobalSearchSagas } from "./saga";
import { searchSlice } from "./slice";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

describe("takeX - global saga", () => {
  it(`has state. if one takeLatest is used for multiple UI instances they can cancel each other erroneously.`, async () => {
    const sagaMiddleware = createSagaMiddleware();

    const store = configureStore({
      reducer: {
        search: searchSlice.reducer,
      },
      middleware: [sagaMiddleware],
    });

    sagaMiddleware.run(watchGlobalSearchSagas);

    const action1 = searchSlice.actions.onChangeText({
      key: "search1",
      text: "foo",
    });
    store.dispatch(action1);

    const action2 = searchSlice.actions.onChangeText({
      key: "search2",
      text: "bar",
    });
    store.dispatch(action2);

    let state = store.getState();
    expect(state.search.search1?.text).to.eq("foo");
    expect(state.search.search2?.text).to.eq("bar");
    await sleep(600);

    state = store.getState();
    expect(state.search.search1?.results).to.eq(0);
    expect(state.search.search2?.results).to.eq(1);
  });
});
