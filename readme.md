# dx-saga

Warning: This package is in beta and subject to change frequently check back often for the latest.

[![npm version](https://badge.fury.io/js/dx-saga.svg)](https://www.npmjs.com/package/dx-saga)

dx-saga is a JavaScript library that allows redux-sagas to run on differences in state as opposed to
actions to facilitate component development.

Originally created to handle fetching viewport constrained chart data which requires watching many settings and cancellation of side-effects.

[Live Demo](https://codesandbox.io/s/dx-saga-0xq0m)

- `selectorChannel`
  - prevent extraneous side-effects by only running sagas when the selected state changes [[example]](#selectorchannel-usage-example)
  - simplify sagas that watch multiple actions as inputs by watching the state instead
  - simplify component development when combined with `useSaga`
  - nextAction = F(select(state), saga) where select(state) ⊂ state when select(State) != select(nextState)
- `useSaga`
  - Start and stop sagas when components mount and unmount
  - ensure effects, like takeLatest, have their own state so actions from other UI components don't cancel another components side-effect. [[global takeX test]](examples/run-saga-behavior/src/take-global/take-state.test.ts) vs [[ui instance takeX test]](examples/run-saga-behavior/src/take-ui-instance/take-instance.test.ts)
  - provide `ownProps` to the saga and any selector it uses [[example]](#combined-selectorchannel--usesaga-example-usage)
  - optionally provide a separate `context` and `io` from the global saga middleware
- serialize execution of code blocks globally using `monitor.enter/exit`

## `selectorChannel` Usage Example

```typescript
const getSearchChanges = (state: RootState): SearchChanges => {
  const { text, caseSensitive } = state.search;
  return { text, caseSensitive };
};

function* handleSearchChanges(searchChanges: SearchChanges) {
  // ...
}

function* watchSearchSagas() {
  /* handle changes to state as opposed to action patterns. accepts _any_ selector */
  const searchChanges = selectorChannel(getSearchChanges);

  /* use channels where patterns are used */
  yield* takeLatest(searchChanges, handleSearchChanges);
}
```

## Combined `selectorChannel` & `useSaga` Example Usage

```typescript
export const mainChannel = stdChannel() as Channel<any>;

// we have to ignore the typescript error until channel is added to the d.ts.
const sagaMiddleware = createSagaMiddleware({
  // @ts-ignore
  channel: mainChannel,
});

// generate `useSaga` function
export const useSaga = makeUseSaga(mainChannel);

// connect selector channel to the store
export const selectorChannel = makeSelectorChannelFactory(store);
```

#### `Search.tsx` [full source](examples/use-saga/src/Search/Search.tsx)

```typescript
export const Search = (props: { formKey: string }) => {
  const renderCount = useRenderCount();

  /* start a saga fo reach `Search` component instance with `ownProps` */
  useSaga(watchSearchSaga, {
    ownProps: { formKey: props.formKey },
  });

  return (
    <div style={{ flex: 1 }}>
      <div
        style={{
          color: "white",
          backgroundColor: "blue",
        }}
      >
        {props.formKey} render count: {renderCount}
      </div>
      <SearchBar formKey={props.formKey} />
      <div>
        <Now />
      </div>
      <SearchResult formKey={props.formKey} />
    </div>
  );
};
```

#### `saga.ts` [full source](examples/use-saga/src/Search/saga.ts)

```typescript
export interface SearchChanges {
  formKey: string;
  text: string;
}

export const getSearch = (state: RootState, ownProps: any) => {
  const { formKey } = ownProps;
  const form = state.form[formKey];
  const changes: SearchChanges = {
    formKey,
    text: form?.text || empty.string,
  };
  return changes;
};

export function* watchSearchSaga() {
  // get `ownProps` from useSaga
  const ownProps: any = yield* getContext("ownProps");

  // create a channel on any selector.
  const searchTextChanges = selectorChannel((state) =>
    getSearch(state, ownProps)
  );
  yield* takeLatest(searchTextChanges, handleSearchTextChanges);
}
```

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

We would like to replace `takeLatest(pattern, saga)`, which triggers when events occur, with `takeLatest(channel, saga)` that triggers when changes occur in the subset of state returned by a selector.

`dx-saga` provides a function `makeSelectorChannelFactory` that produces a function `selectorChannel` to create selector channels. Its accepts any selector and will `emit` when subset of state returned by the selector changes. Each of these emissions can be used by existing saga API to `takeEvery`, `takeLatest`, etc.

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
  /* USE CHANNELS WHERE PATTERNS ARE USED */
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

## Prior Art

- rxjs - This idea started with observables, but it requires learning new control flow semantics.
- redux-saga - Preserves well known control flow semantics for async tasks
- selector-channel - https://github.com/redux-saga/redux-saga/issues/1694 - opted to re-implement for a few reasons:
  - compares the selected states in plain ol' JavaScript. Performance should be on par with reselect comparisons
  - allows for separate IO and context
  - preserves the ability to `take` from the global sagas

## Contributing

TBD

## License

[MIT](https://choosealicense.com/licenses/mit/)
