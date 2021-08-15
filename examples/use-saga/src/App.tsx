import React from "react";
import { Search } from "./Search/Search";

export function App() {
  return (
    <div style={{ display: "flex", flexDirection: "row" }}>
      <Search formKey="Search 1" />
      <Search formKey="Search 2" />
    </div>
  );
}
