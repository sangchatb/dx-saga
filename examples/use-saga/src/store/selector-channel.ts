import { makeSelectorChannelFactory } from "dx-saga";
import { store } from "./store";

// connect selector channel to the store. bsangchat
export const selectorChannel = makeSelectorChannelFactory(store);
