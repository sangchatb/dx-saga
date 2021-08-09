import { put, delay, getContext, takeLatest } from "typed-redux-saga";
import { searchSlice } from "./slice";
import { RootState, selectorChannel } from "./store";

function* handleSearchTextChanges(changes: SearchTextChanges) {
  const { key, text } = changes;

  // simulate network request
  yield* delay(500);

  // simulate response
  const nextAction = searchSlice.actions.onReceivedResults({ key });
  yield* put(nextAction);
}

export interface SearchTextChanges {
  text: string;
  key: string;
}

export const getSearchText = (state: RootState, ownProps: any) => {
  const { key } = ownProps;
  const text = state.search[key]?.text;
  return { text, key };
};

export function* watchInstanceSearchSagas() {
  const ownProps = yield* getContext("ownProps");
  const searchTextChanges = selectorChannel((state) =>
    getSearchText(state, ownProps)
  );
  yield* takeLatest(searchTextChanges, handleSearchTextChanges);
}
