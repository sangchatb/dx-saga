import { configureStore } from "@reduxjs/toolkit";
import { mainChannel } from "./mainChannel";
import { reducer } from "./reducer";
import createSagaMiddleware from "redux-saga";

const sagaMiddleware = createSagaMiddleware({
  // @ts-ignore
  channel: mainChannel,
});
export type RunSaga = ReturnType<typeof sagaMiddleware.run>;

export const store = configureStore({
  reducer,
  middleware: [sagaMiddleware],
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
