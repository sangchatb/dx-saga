import { useEffect, useRef } from "react";
import { useDispatch, useStore } from "react-redux";
import { Channel, runSaga } from "redux-saga";

/* USE SELECTOR TO TRIGGER SAGA */
export const makeUseSaga =
  <T, TReturn, TNext>(channel: Channel<any>) =>
  (saga: () => Generator<T, TReturn, TNext>, ownProps: Record<string, any>) => {
    const dispatch = useDispatch();
    const store = useStore();
    const ref = useRef(saga);
    const deps = [store, dispatch, ...Object.values(ownProps)];
    useEffect(() => {
      const task = runSaga(
        {
          dispatch: (action: any) => {
            // console.log(action);
            dispatch(action);
          },
          getState: store.getState.bind(store),
          channel,
          context: { ownProps },
        },
        ref.current as any
      );
      return () => {
        if (task?.isRunning()) {
          task?.cancel();
        }
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);
  };
