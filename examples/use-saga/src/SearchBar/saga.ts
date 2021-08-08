import { delay, getContext, put, takeLatest } from "typed-redux-saga";
import { ChangeValuesPayload, formSlice } from "../form/slice";
import { selectorChannel } from "../store/selector-channel";
import * as colors from "color-name";
import { AnyAction, PayloadAction } from "@reduxjs/toolkit";

const lookup = colors as Record<string, colors.RGB>;

function* updateProgress(formKey: string, message: string) {
  const progressAction = formSlice.actions.onChangeValue({
    formKey,
    values: {
      progressMessage: message
    }
  });
  yield* put(progressAction);
}

function* handleSearchTextChanges(changes: ColorSearchChanges) {
  const { formKey } = changes;
  // debounce.
  yield* delay(300);

  // show busy message
  yield* updateProgress(formKey, `${formKey} Searching....`);

  const keys = Object.keys(colors);
  const matchedKeys = keys.filter((key) => key.includes(changes.text));
  const results = matchedKeys.map((key) => ({
    name: key,
    value: lookup[key]
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
      results
    }
  });
  yield* put(foundResultAction);
}

export interface ColorSearchChanges {
  formKey: string;
  text: string;
}

export function* watchColorSearchSaga() {
  // get props from useSaga
  const ownProps: any = yield* getContext("ownProps");

  // create a channel on any selector.
  const searchTextChanges = selectorChannel((state) => {
    const { formKey } = ownProps;
    const form = state.form[formKey];
    const changes: ColorSearchChanges = {
      formKey,
      text: form?.text as string
    };
    return changes;
  });
  yield* takeLatest(searchTextChanges, handleSearchTextChanges);
  yield* takeLatest(
    (action: AnyAction) => {
      console.log(`blah ${JSON.stringify(action)}`);
      return true;
    },
    function* (action: PayloadAction<ChangeValuesPayload>) {
      yield* delay(1);
      console.log(
        `You can still handle actions from global sagas ${JSON.stringify(
          action
        )}`
      );
    }
  );
}
