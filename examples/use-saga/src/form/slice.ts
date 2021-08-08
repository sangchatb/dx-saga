import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// form/slice.ts
// This is a contraived generic data store so that we can have show
// how selector channel allows triggering sagas based on state changes
// opposed to events
// bsangchat

export interface ChangeValuesPayload {
  formKey: string;
  values: Record<string, unknown>;
}

export type InitialState = Record<string, any>;

const initialState: InitialState = {};

export const formSlice = createSlice({
  name: "form",
  initialState,
  reducers: {
    onChangeValue: (draft, action: PayloadAction<ChangeValuesPayload>) => {
      const { formKey, values } = action.payload;

      let form = draft[formKey];
      if (!form) {
        form = draft[formKey] = {};
      }

      const keys = Object.keys(values);
      for (const key of keys) {
        const value = values[key];
        form[key] = value;
      }
    },
  },
});
