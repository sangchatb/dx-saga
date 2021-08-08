import { configureStore } from "@reduxjs/toolkit";
import { mainChannel } from "./mainChannel";
import { reducer } from "./reducer";
import createSagaMidelware from "redux-saga";

const sagaMiddleware = createSagaMidelware({
  
});
export const store = configureStore({
  reducer,
  middleware: [sagaMiddleware],
  // 'channel' is not defined in the d.ts for configureStore
  // @ts-ignore
  channel: mainChannel
});



// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
