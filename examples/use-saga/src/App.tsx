import React from "react";
import { useRenderCount } from "./useRenderCount/useRenderCount";
import { SearchBar } from "./SearchBar/SearchBar";
import { SearchResult } from "./SearchResult/SearchResult";
import { Now } from "./Now/Now";
import { watchColorSearchSaga } from "./SearchBar/saga";
import { useSaga } from "./store/hooks";

export function App() {
  const appRenderCount = useRenderCount();
  const Search = (props: { formKey: string }) => {
    useSaga(watchColorSearchSaga, {
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
          {props.formKey} render count: {appRenderCount}
        </div>
        <SearchBar formKey={props.formKey} />
        <div>
          <Now />
        </div>
        <SearchResult formKey={props.formKey} />
      </div>
    );
  };
  return (
    <div style={{ display: "flex", flexDirection: "row" }}>
      <Search formKey="Search 1" />
      <Search formKey="Search 2" />
    </div>
  );
}
