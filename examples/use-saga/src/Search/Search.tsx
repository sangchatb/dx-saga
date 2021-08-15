import { Now } from "../Now/Now";
import { watchSearchSaga } from "./saga";
import { SearchBar } from "../SearchBar/SearchBar";
import { SearchResult } from "../SearchResult/SearchResult";
import { useSaga } from "../store/hooks";
import { useRenderCount } from "../useRenderCount/useRenderCount";

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
