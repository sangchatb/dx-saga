import "./index.css";
import { render } from "react-dom";
import { App } from "./App";
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";
import { Provider } from "react-redux";
import { store } from "./store/store";

const Root = () => (
  <Provider store={store}>
    <App />
  </Provider>
);

const rootElement = document.getElementById("root");
render(<Root />, rootElement);
