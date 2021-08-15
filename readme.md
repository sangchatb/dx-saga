# dx-saga

Warning: This package is in beta and subject to change frequently check back often for the latest.

[![npm version](https://badge.fury.io/js/dx-saga.svg)](https://www.npmjs.com/package/dx-saga)

dx-saga is a JavaScript library that allows redux-sagas to run on differences in state as opposed to
actions to facilitate component development.

[Search Colors - Live Demo](https://codesandbox.io/s/dx-saga-0xq0m)

Originally created to handle fetching viewport constrained chart data which requires watching many settings and cancellation of side-effects.

- `selectorChannel` [[example]](#selectorchannel-usage-example)
  - only run sagas when selected state changes
  - extraneous side-effects can be prevented by running sagas [[Extraneous Side-Effects]](#extraneous-side-effects-using-action-patterns)
  - multiple actions that affect a saga's input can be simplified [[Multiple Actions]](#multiple-actions-using-action-patterns)
  - overloaded actions that affect a saga's input can be simplified [[Overloaded Actions]](#overloaded-actions-using-action-patterns)
  - simplify component development when combined with `useSaga`
  - nextAction = F(select(state), saga) where select(state) ⊂ state when select(State) != select(nextState)
- `useSaga` [[example]](#combined-selectorchannel--usesaga-example-usage)
  - Start and stop sagas when components mount and unmount
  - prevent extraneous cancellations when using `takeLatest`, `takeLeading`, etc. [[global takeX test]](examples/run-saga-behavior/src/take-global/take-state.test.ts) vs [[ui instance takeX test]](examples/run-saga-behavior/src/take-ui-instance/take-instance.test.ts)
  - provide `ownProps` to the saga and any selector it uses
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

## Improving on some Existing Patterns

Below are some patterns dx-saga tries to improve

## Overloaded Actions using Action Patterns

[[Live Demo & Full Source]](https://codesandbox.io/s/overloaded-actions-8ygqh?file=/src/index.tsx:2520-2539)

```typescript
const getSearchChanges = (state: RootState): SearchChanges => {
  const text = state.value.text as string;
  return { text };
};

function* handleSearchChanges() {
  debug("delay");
  yield* delay(500);
  // select all the state that's required to handle the side-effect.
  const searchChanges = yield* select(getSearchChanges);

  debug(`handleSearchChanges ${JSON.stringify(searchChanges)}`);
}

function* watchSearchSagas() {
  /* there are a few options here:
   * action patterns - which will result in extraneous side-effects
   * function - which would allow us to inspect the action for changes
   *    to the 'text' value, but it's a bit messy and doesn't prevent side-effects
   *    when the state doesn't actually change.
   * selectorChannel - which is probably the most desirable pattern since
   *    it lets us reuse the selector and only triggers on a diff.
   */
  yield* takeLatest(valueSlice.actions.onChangeValue.type, handleSearchChanges);
}

sagaMiddleware.run(watchSearchSagas);

(async () => {
  /* change text */
  const action1 = valueSlice.actions.onChangeValue({ text: "foo" });
  store.dispatch(action1);
  await sleep(100);

  /* let's change a different value with the same action. this will result in
   * an extraneous cancelation */
  const action2 = valueSlice.actions.onChangeValue({ someOtherValue: "baz" });
  store.dispatch(action2);

  /* this results in 2 delays, 1 cancellation and 1 handle
   * it could have been 1 delay and 1 handle
   */
})();
```

## Multiple Actions using Action Patterns

When watching multiple actions, it's implied all the state that affects a saga is not included in a single action. This means
that the subset of state that affects the saga must be `select`ed in the saga. Replacing the action patterns with a `selectorChannel`
would simplify the saga by removing the action pattern list and moving the `select` into the `selectorChannel`. There would be no
opportunity to erroneously exclude an an action pattern or trigger a saga when the state didn't actual change.

[[Live Demo & Full Source]](https://codesandbox.io/s/take-latest-action-pattern-tux36?file=/src/index.tsx)

```typescript
const getSearchChanges = (state: RootState): SearchChanges => {
  const { text, caseSensitive } = state.search;
  return { text, caseSensitive };
};

function* handleSearchChanges() {
  debug("delay");
  yield* delay(500);

  // The state that affects the saga must be selected anyway.
  const searchChanges = yield* select(getSearchChanges);

  debug(`handleSearchChanges ${JSON.stringify(searchChanges)}`);
}

function* watchSearchSagas() {
  // watching multiple actions requires selecting complete state
  // in the handleSearchChanges saga. If there are no differences
  // this will be an extraneous side-effect trigger as well.
  yield* takeLatest(
    [
      searchSlice.actions.onChangeCaseSensitive.type,
      searchSlice.actions.onChangeText.type,
    ],
    handleSearchChanges
  );
}

sagaMiddleware.run(watchSearchSagas);

(async () => {
  /* change text */
  const action1 = searchSlice.actions.onChangeText("foo");
  store.dispatch(action1);
  await sleep(100);

  /* change case sensitivity*/
  const action2 = searchSlice.actions.onChangeCaseSensitive(true);
  store.dispatch(action2);
  await sleep(100);
})();
```

## Extraneous side-effects using Action Patterns

[[Live Demo & Full Source]](https://codesandbox.io/s/extraneous-side-effects-4y9k3?file=/src/index.tsx)

```typescript
const getSearchChanges = (state: RootState): SearchChanges => {
  const { text } = state.search;
  return { text };
};

function* handleSearchChanges() {
  debug("delay");
  yield* delay(500);
  // select all the state that's required to handle the side-effect.
  const searchChanges = yield* select(getSearchChanges);

  debug(`handleSearchChanges ${JSON.stringify(searchChanges)}`);
}

function* watchSearchSagas() {
  yield* takeLatest(searchSlice.actions.onChangeText.type, handleSearchChanges);
}

sagaMiddleware.run(watchSearchSagas);

(async () => {
  /* change text */
  const action1 = searchSlice.actions.onChangeText("foo");
  store.dispatch(action1);
  await sleep(100);

  /* let's change text again, but not actually change the
   * value. Even though the state object equality doesn't change,
   * this will result in an extraneous side-effect */
  const action2 = searchSlice.actions.onChangeText("foo");
  store.dispatch(action2);

  /* this results in 2 delays, 1 cancellation and 1 handle, when
   * it could have been 1 delay and 1 handle
   */
})();
```

## Prior Art

- rxjs - This idea started with observables, but it requires learning new control flow semantics.
- redux-saga - Preserves well known control flow semantics for async tasks
- selector-channel - https://github.com/redux-saga/redux-saga/issues/1694 - opted to re-implement for a few reasons:
  - compares the selected states in plain ol' JavaScript
  - Performance should be on par with reselect comparisons
  - allows for separate IO and context
  - preserves the ability to `take` actions from global sagas

## Notes

- this may cause extraneous side-effect processing if time-traveling is used extensively? Arguably no sagas should run on historical state versions. Maybe this should be solved by redux-saga if it hasn't already. Haven't tested it, yet.

## Contributing

TBD

## License

[MIT](https://choosealicense.com/licenses/mit/)
