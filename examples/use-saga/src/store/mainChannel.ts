import { Channel, stdChannel } from "redux-saga";

// define the main channel here so that it can be injected into
// both the store and external sagas. e.g. runSaga or useSaga.
// bsangchat

export const mainChannel = stdChannel() as Channel<any>;
