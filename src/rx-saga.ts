import { Observable } from "rxjs";
import { runSaga } from "redux-saga";
import { useEffect, useState } from "react";

export const saga = <T, TReturn, TNext>(
  saga: () => Generator<T, TReturn, TNext>
) =>
  new Observable<TReturn>((subscriber) => {
    const task = runSaga(
      {
        dispatch: (value: TReturn) => {
          // console.log(`dispatch`, value);
          subscriber.next(value);
        }
      },
      saga as any
    );
    task.toPromise().then((value) => {
      if (task.isCancelled()) return;
      subscriber.next(value);
    });
    return () => {
      console.log(`dispose`);
      task.cancel();
    };
  });

export const useObservable = <TValue>(
  $: Observable<TValue>,
  defaultValue: TValue
) => {
  const [value, setValue] = useState<TValue>(defaultValue);
  useEffect(() => {
    const subscription = $.subscribe((nextValue) => {
      setValue(nextValue);
    });
    return () => {
      subscription.unsubscribe();
    };
  }, [setValue, $]);

  return value;
};
