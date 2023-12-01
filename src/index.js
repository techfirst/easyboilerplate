import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import UserProvider from "./contexts/userProvider";

import { ColorModeScript } from "@chakra-ui/react";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <UserProvider>
    <ColorModeScript />
    <App />
  </UserProvider>
);
