import React from "react";
import ReactDOM from "react-dom/client";
import { RecoilRoot } from "recoil";
import { DatesProvider } from "@mantine/dates";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/charts/styles.css";
import "@mantine/notifications/styles.css";
import { Notifications } from "@mantine/notifications";
import { ModalsProvider } from "@mantine/modals";
import AppTheme from "./AppTheme.jsx";
import AppEntry from "./AppEntry.jsx";
import { AuthProvider } from "./services/AuthContext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <RecoilRoot>
            <AppTheme>
                <DatesProvider settings={{ timezone: "UTC" }}>
                    <ModalsProvider>
                        <AuthProvider>
                            <Notifications />
                            <AppEntry />
                        </AuthProvider>
                    </ModalsProvider>
                </DatesProvider>
            </AppTheme>
        </RecoilRoot>
    </React.StrictMode>
);
