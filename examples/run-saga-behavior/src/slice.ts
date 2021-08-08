import { createSlice } from "@reduxjs/toolkit";

export const counterSlice = createSlice({
  name: "counter",
  initialState: {
    i: 0,
    ["sagaMiddleware.run"]: 0,
    ["runSaga"]: 0,
  },
  reducers: {
    increment: (draft) => {
      draft.i += 1;
    },
    onSagaMiddleware: (draft) => {
      draft["sagaMiddleware.run"] += 1;
    },
    onRunSaga: (draft) => {
      draft["runSaga"] += 1;
    },
  },
});
