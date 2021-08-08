import { makeUseSaga } from "dx-saga";
import {
  shallowEqual,
  TypedUseSelectorHook,
  useDispatch,
  useSelector
} from "react-redux";
import { RootState, AppDispatch } from "./store";
import { mainChannel } from "./mainChannel";

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();

// NOTE: slightly modify boilerplate from redux toolkit to set
// shallowEqual to the default equality checker. bsangchat
export const useAppSelector: TypedUseSelectorHook<RootState> = (
  selector,
  equalityFn = shallowEqual
) => useSelector(selector, equalityFn);

export const useSaga = makeUseSaga(mainChannel);
