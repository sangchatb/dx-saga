import { configureStore } from "@reduxjs/toolkit";
import { searchSlice } from "./slice";
import { makeSelectorChannelFactory } from "dx-saga";

export const store = configureStore({
  reducer: {
    search: searchSlice.reducer,
  },
});

export const selectorChannel = makeSelectorChannelFactory(store);

export type RootState = ReturnType<typeof store.getState>;
