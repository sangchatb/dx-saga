# dx-saga

Warning: This package is in beta and subject to change frequently check back often for the latest.

[![npm version](https://badge.fury.io/js/dx-saga.svg)](https://www.npmjs.com/package/dx-saga)

dx-saga is a JavaScript library that allows redux-sagas to run on differences in state as opposed to actions.

- trigger sagas based on differences in state, as opposed to actions, using `selectorChannel`
- start and stop sagas when components mount and unmount using `useSaga`
- provide `ownProps` to sagas using `useSaga`
- serialize execution of code blocks using `monitor.lock`

## Installation

```bash
# NPM
npm install dx-saga
```

or

```bash
# YARN
yarn add dx-saga
```

## Selector Channels

### Motivation for selector channels

#### [`https://codesandbox.io/s/take-latest-action-pattern-tux36?file=/src/index.tsx`](https://codesandbox.io/s/take-latest-action-pattern-tux36?file=/src/index.tsx)

```ts
const getSearchChanges = (state: RootState): SearchChanges => {
  const { text, caseSensitive } = state.search;
  return { text, caseSensitive };
};

function* handleSearchChanges() {
  debug("delay");
  yield* delay(500);
  const searchChanges = yield* select(getSearchChanges);
  debug(`handleSearchChanges ${JSON.stringify(searchChanges)}`);
}

function* watchSearchSagas() {
  yield* takeLatest(
    [
      searchSlice.actions.onChangeCaseSensitive.type,
      searchSlice.actions.onChangeText.type,
    ],
    handleSearchChanges
  );
}

sagaMiddleware.run(watchSearchSagas);

/* DISPATCH ACTION1 */
const action1 = searchSlice.actions.onChangeText("foo");
store.dispatch(action1);

/* IMMEDIATELY DISPATCH ACTION2. IT WILL CANCEL ACTION1'S SIDE EFFECTS
    SEE THE CONSOLE  */
const action2 = searchSlice.actions.onChangeCaseSensitive(true);
store.dispatch(action2);
```

In the above example, `takeLatest` watches for action types to trigger sagas. This works well when it's one action. When it's more than one, the saga will not have all the state it needs and it may be triggered unnecessarily when state in the action payload either contains extra data or doesn't result in a change to state. `selectorChannel` avoids each of a these cases, resulting in simpler code while leveraging the saga API.

### Creating a selectorChannel

We would like to replace `takeLatest(pattern, saga)`, which triggers when events occur, with a `selectorChannel` that triggers when changes occur in our selector.

`dx-saga` provide as function `makeSelectorChannelFactory` that produces a function `selectorChannel` to create selector channels. Its any selector and will `emit` when properties returned from the selector change. Each of these emissions can be used by existing saga API to `takeEvery`, `takeLatests`, etc.

Reselect provides a function `createSelector` for creating memoized selectors. `createSelector` takes an array of input-selectors and a transform function as its arguments. If the Redux state tree is mutated in a way that causes the value of an input-selector to change, the selector will call its transform function with the values of the input-selectors as arguments and return the result. If the values of the input-selectors are the same as the previous call to the selector, it will return the previously computed value instead of calling the transform function.

Let's define a selectorChannel named `searchChanges` to replace the action-pattern version above:

#### [`https://codesandbox.io/s/selector-channel-qepep?file=/src/index.tsx:1264-1412`](https://codesandbox.io/s/selector-channel-qepep?file=/src/index.tsx:1264-1412)

```ts
import { makeSelectorChannelFactory } from "dx-saga";

//...

const selectorChannel = makeSelectorChannelFactory(store);

const getSearchChanges = (state: RootState): SearchChanges => {
  const { text, caseSensitive } = state.search;
  return { text, caseSensitive };
};

function* handleSearchChanges(searchChanges: SearchChanges) {
  debug("delay");
  yield* delay(500);
  debug(`handleSearchChanges ${JSON.stringify(searchChanges)}`);
}

function* watchSearchSagas() {
  /* HANDLE CHANGES TO STATE AS OPPOSED TO ACTIONS. ACCEPTS ANY SELECTOR */
  const searchChanges = selectorChannel(getSearchChanges);
  /* USE WHERE PATTERNS ARE USED */
  yield* takeLatest(searchChanges, handleSearchChanges);
}

sagaMiddleware.run(watchSearchSagas);

/* DISPATCH ACTION1 */
const action1 = searchSlice.actions.onChangeText("foo");
store.dispatch(action1);

/* IMMEDIATELY DISPATCH ACTION2. IT WILL CANCEL ACTION1'S SIDE EFFECTS
    SEE THE CONSOLE  */
const action2 = searchSlice.actions.onChangeCaseSensitive(true);
store.dispatch(action2);
```

In the example above, `searchChanges` is a `selectorChannel`. It tracks differences in the state provided by `getSearchChanges`. It's provided to `takeLatest` which will trigger `handleSearchChanges` when it detects changes. Since it's provided as a channel, any `takeX` effect can be used. `takeLatest` will also cancel any `handleSearchChanges` side-effects that are still executing.

## useSaga

Coming Soon

## Monitors

Coming Soon

## Prior Art

- rxjs - Requires learning new control flow semantics. I found it very complex for simple tasks.
- redux-saga - Preserves well known control flow semantics for async tasks
- selector-channel - https://github.com/redux-saga/redux-saga/issues/1694 - opted for an implementation that compares the diff outside of sagas.
- more to come...

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License

[MIT](https://choosealicense.com/licenses/mit/)
