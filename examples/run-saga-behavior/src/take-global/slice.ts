import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface SearchModel {
  text: string;
  results: number;
}

export interface ChangeTextPayload {
  key: string;
  text: string;
}
export interface ReceivedResultsPayload {
  key: string;
}
export interface InitialState extends Record<string, SearchModel> {}

export const searchSlice = createSlice({
  name: "search",
  initialState: {} as InitialState,
  reducers: {
    onChangeText: (draft, action: PayloadAction<ChangeTextPayload>) => {
      const { key, text } = action.payload;
      let model = draft[key];
      if (!model) {
        model = draft[key] = { text: "", results: 0 };
      }
      model.text = text;
    },
    onReceivedResults: (
      draft,
      action: PayloadAction<ReceivedResultsPayload>
    ) => {
      const { key } = action.payload;
      draft[key].results += 1;
    },
  },
});
