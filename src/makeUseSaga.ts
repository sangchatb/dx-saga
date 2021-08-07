import { useEffect, useRef } from "react";
import { useDispatch, useStore } from "react-redux";
import { MulticastChannel, runSaga } from "redux-saga";
import { empty } from "./empty";

/* USE SELECTOR TO TRIGGER SAGA */
export const makeUseSaga =
  <T, TReturn, TNext>(channel: MulticastChannel<any>) =>
  (
    saga: () => Generator<T, TReturn, TNext>,
    ownProps?: Record<string, unknown>,
    context?: Record<string, unknown>
  ) => {
    const dispatch = useDispatch();
    const store = useStore();
    const ref = useRef(saga);
    const deps: any[] = [store, dispatch];
    if (ownProps) {
      deps.push(...Object.values(ownProps));
    }
    if (context) {
      deps.push(context);
    }
    useEffect(() => {
      const task = runSaga(
        {
          dispatch: (action: any) => {
            // console.log(action);
            dispatch(action);
          },
          getState: store.getState.bind(store),
          channel,
          context: { ...context, ownProps },
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
