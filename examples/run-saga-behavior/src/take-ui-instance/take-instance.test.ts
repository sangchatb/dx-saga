import { configureStore } from "@reduxjs/toolkit";
import { expect } from "chai";
import createSagaMiddleware, { runSaga } from "redux-saga";
import { watchInstanceSearchSagas } from "./saga";
import { searchSlice } from "./slice";
import { store, store as storeInstance } from "./store";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

describe("takeX - saga per ui instance", () => {
  it(`will have separate state if sagas are added and removed when the ui component is mounted and unmounted`, async () => {
    const run = (key: string) => {
      return runSaga(
        {
          dispatch: store.dispatch.bind(store),
          context: {
            ownProps: {
              key,
            },
          },
        },
        watchInstanceSearchSagas
      );
    };

    const task1 = run("search1");
    const task2 = run("search2");

    const changeSearch1 = (text: string) => {
      const action = searchSlice.actions.onChangeText({
        key: "search1",
        text,
      });
      store.dispatch(action);
    };

    const changeSearch2 = (text: string) => {
      const action = searchSlice.actions.onChangeText({
        key: "search2",
        text,
      });
      store.dispatch(action);
    };

    changeSearch1("foo");
    changeSearch2("bar");

    let state = store.getState();
    expect(state.search.search1?.text).to.eq("foo");
    expect(state.search.search2?.text).to.eq("bar");
    await sleep(600);

    state = store.getState();
    expect(state.search.search1?.results).to.eq(1);
    expect(state.search.search2?.results).to.eq(1);

    task1.cancel();
    task2.cancel();

    changeSearch1("foo2");
    changeSearch2("bar2");
    await sleep(600);

    state = store.getState();
    expect(state.search.search1?.results).to.eq(1);
    expect(state.search.search2?.results).to.eq(1);
    expect(state.search.search1?.text).to.eq("foo2");
    expect(state.search.search2?.text).to.eq("bar2");
  });
});
