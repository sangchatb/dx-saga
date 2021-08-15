import { delay, getContext, put, takeLatest } from "typed-redux-saga";
import { ChangeValuesPayload, formSlice } from "../form/slice";
import { selectorChannel } from "../store/selector-channel";
import * as colors from "color-name";
import { AnyAction, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store/store";
import { empty } from "../empty";

const lookup = colors as Record<string, colors.RGB>;

function* updateProgress(formKey: string, message: string) {
  const progressAction = formSlice.actions.onChangeValue({
    formKey,
    values: {
      progressMessage: message,
    },
  });
  yield* put(progressAction);
}

function* handleSearchTextChanges(changes: SearchChanges) {
  const { formKey } = changes;
  // debounce.
  yield* delay(300);

  // show busy message
  yield* updateProgress(formKey, `${formKey} Searching....`);

  const keys = Object.keys(colors);
  const matchedKeys = keys.filter((key) => key.includes(changes.text));
  const results = matchedKeys.map((key) => ({
    name: key,
    value: lookup[key],
  }));

  // simulate a long running request
  const pages = 5;
  for (let i = 0; i < pages; i++) {
    yield* delay(1000);
    yield* updateProgress(formKey, `${formKey} Simulating request ${i}...`);
  }

  // hide busy message
  yield* updateProgress(formKey, "");

  const foundResultAction = formSlice.actions.onChangeValue({
    formKey,
    values: {
      results,
    },
  });
  yield* put(foundResultAction);
}

export interface SearchChanges {
  formKey: string;
  text: string;
}

export const getSearch = (state: RootState, ownProps: any) => {
  const { formKey } = ownProps;
  const form = state.form[formKey];
  const changes: SearchChanges = {
    formKey,
    text: form?.text || empty.string,
  };
  return changes;
};

export function* watchSearchSaga() {
  // get `ownProps` from useSaga
  const ownProps: any = yield* getContext("ownProps");

  // create a channel on any selector.
  const searchTextChanges = selectorChannel((state) =>
    getSearch(state, ownProps)
  );
  yield* takeLatest(searchTextChanges, handleSearchTextChanges);
}
