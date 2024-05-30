import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { MantineProvider, createTheme, virtualColor } from "@mantine/core";
import { BrowserRouter } from "react-router-dom";
import { RecoilRoot, useRecoilState } from "recoil";
import { DatesProvider } from "@mantine/dates";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/charts/styles.css";
import "@mantine/notifications/styles.css";
import { Notifications } from "@mantine/notifications";
import { selectedBikeColorAtom } from "./data/persistentAtoms.js";

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <RecoilRoot>
            <AppTheme>
                <DatesProvider settings={{ timezone: "UTC" }}>
                    <Notifications />
                    <BrowserRouter>
                        <App />
                    </BrowserRouter>
                </DatesProvider>
            </AppTheme>
        </RecoilRoot>
    </React.StrictMode>
);

function AppTheme({ children }) {
    const [color, _] = useRecoilState(selectedBikeColorAtom);

    const theme = createTheme({
        autoContrast: true,
        primaryColor: color ? "bikeColor" : "blue",
        colors: {
            // @ts-ignore
            bikeColor: Array(10).fill(color),
        },
    });

    return (
        <MantineProvider defaultColorScheme="dark" theme={theme}>
            {children}
        </MantineProvider>
    );
}
