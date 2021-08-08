import React from "react";
import Loader from "react-loader-spinner";
import { useAppSelector, useSaga } from "../store/hooks";
import { useRenderCount } from "../useRenderCount/useRenderCount";

interface ListItemProps {
  name: string;
}

interface ListProps {
  message: string;
  results: ListItemProps[];
}

export interface SearchResultProps {
  formKey: string;
}
export const emptyListProps: ListProps = {
  results: [],
  message: "",
};

export const SearchResult = (props: SearchResultProps) => {
  const { formKey } = props;

  const List = () => {
    const renderCount = useRenderCount();
    const { results, message } = useAppSelector((state) => {
      const results = state.form[formKey]?.results;
      const message = state.form[formKey]?.progressMessage;
      const props: ListProps = {
        results,
        message,
      };
      console.log(`checking list ${formKey} message = ${message}`);
      return props;
    });

    const ListItem = (props: { name: string }) => {
      return <li>{props.name}</li>;
    };

    return (
      <ul style={{ position: "relative" }}>
        <div
          style={{
            color: "white",
            backgroundColor: "blue",
          }}
        >
          List Render {renderCount}
        </div>
        {!!message && (
          <div>
            <Loader
              type="Puff"
              color="#00BFFF"
              height={100}
              width={100}
              timeout={0}
            />
            {message}
          </div>
        )}
        {!message &&
          !!results &&
          results.map((item) => <ListItem key={item.name} {...item} />)}
      </ul>
    );
  };

  return <List />;
};
