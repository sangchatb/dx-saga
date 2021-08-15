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
