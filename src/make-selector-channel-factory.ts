import { Store } from "redux";
import { shallowEqual } from "react-redux";
import { eventChannel } from "redux-saga";

const defaultEqualityFn = shallowEqual;
export const makeSelectorChannelFactory =
  <TState, TSelected>(store: Store<TState>) =>
  (
    selector: (state: TState) => TSelected,
    equalityFn: (
      left: TSelected,
      right: TSelected
    ) => boolean = defaultEqualityFn
  ) => {
    const channel = eventChannel<TSelected>((emit) => {
      let lastSelected: TSelected | undefined;
      const check = () => {
        const state = store.getState();
        const selected = selector(state);
        if (lastSelected === undefined) {
          lastSelected = selected;
          emit(selected);
          return;
        }
        const isEqual = equalityFn(lastSelected, selected);
        if (isEqual) {
          return;
        }
        lastSelected = selected;
        emit(selected);
      };
      const unsub = store.subscribe(check);
      check();
      return () => {
        unsub();
      };
    });

    return channel;
  };
