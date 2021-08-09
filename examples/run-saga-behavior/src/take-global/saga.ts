import { PayloadAction } from "@reduxjs/toolkit";

import { put, delay, takeLatest } from "typed-redux-saga";
import { ChangeTextPayload, searchSlice } from "./slice";

function* handleChangeText(action: PayloadAction<ChangeTextPayload>) {
  const { key } = action.payload;

  // simulate network request
  yield* delay(500);

  // simulate response
  const nextAction = searchSlice.actions.onReceivedResults({ key });
  yield* put(nextAction);
}
export function* watchGlobalSearchSagas() {
  yield* takeLatest(searchSlice.actions.onChangeText, handleChangeText);
}
