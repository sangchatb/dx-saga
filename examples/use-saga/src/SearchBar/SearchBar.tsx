import { ChangeEvent } from "react";
import { formSlice } from "../form/slice";
import { useAppDispatch, useAppSelector } from "../store/hooks";

export interface SearchBarProps {
  formKey: string;
}

export const SearchBar = (props: SearchBarProps) => {
  const { formKey } = props;
  const dispatch = useAppDispatch();

  const handleChangeSearchText = (e: ChangeEvent<HTMLInputElement>) => {
    const action = formSlice.actions.onChangeValue({
      formKey,
      values: {
        text: e.target.value
      }
    });
    dispatch(action);
    console.log(`dispatching action for ${formKey}`);
  };

  // NOTE: inline component can close over event handlers negating
  // the need for `useCallback` to provide stable refs to handlers.
  const Input = () => {
    const searchText = useAppSelector(
      (state) => state.form[formKey]?.text as string
    );
    return (
      <input
        style={{ marginTop: 10, marginBottom: 10 }}
        type="text"
        value={searchText || ""}
        placeholder="Search for a color..."
        onChange={handleChangeSearchText}
      />
    );
  };

  return <Input />;
};
