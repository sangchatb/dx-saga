import { useEffect, useRef } from "react";
import { useDispatch, useStore } from "react-redux";
import { MulticastChannel, runSaga } from "redux-saga";

export interface useSagaOptions {
  ownProps?: Record<string | symbol, unknown>;
  context?: Record<string | symbol, unknown>;
}

/* USE SELECTOR TO TRIGGER SAGA */
export const makeUseSaga =
  <T, TReturn, TNext>(channel: MulticastChannel<any>) =>
  (saga: () => Generator<T, TReturn, TNext>, options?: useSagaOptions) => {
    const dispatch = useDispatch();
    const store = useStore();
    const ref = useRef(saga);
    const deps: any[] = [store, dispatch];
    const ownProps = options?.ownProps;
    if (ownProps) {
      deps.push(...Object.values(ownProps));
    }
    const context = options?.context;
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
