import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { MantineProvider } from "@mantine/core";
import { BrowserRouter } from "react-router-dom";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import { RecoilRoot } from "recoil";
import { DatesProvider } from "@mantine/dates";
import "@mantine/charts/styles.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RecoilRoot>
      <MantineProvider defaultColorScheme="dark">
        <DatesProvider settings={{ timezone: "UTC" }}>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </DatesProvider>
      </MantineProvider>
    </RecoilRoot>
  </React.StrictMode>
);
