import { useEffect } from "react";
import { notifications } from "@mantine/notifications";
import { isWorkerAvailable, workerStream } from "../lib/WorkerCom.js";
import { useApiClient } from "../components/AuthContext.jsx";

export function useDataSync() {
    const apiClient = useApiClient();

    function handleStreamMessage({ type, category, itemCount }) {
        if (type === "started") {
            notifications.show({
                title: "Sync started",
                message: `Syncing ${category}: ${itemCount} items`,
                autoClose: 5000,
                withBorder: true,
            });
        }

        if (type === "failed") {
            notifications.show({
                title: "Sync failed",
                message: `Failed to sync ${category}: ${itemCount} failed`,
                autoClose: 5000,
                withBorder: true,
                color: "red",
            });
        }

        if (type === "completed") {
            notifications.show({
                title: "Sync completed",
                message: `Synced ${category}: ${itemCount} items`,
                autoClose: 5000,
                withBorder: true,
            });
        }
    }

    function periodicSync() {
        let token = apiClient.authToken;
        if (!token) {
            return;
        }

        workerStream(
            "sync",
            { token },
            handleStreamMessage,
            () => {},
            console.error,
            10000
        );
    }

    useEffect(() => {
        if (isWorkerAvailable()) {
            const interval = setInterval(periodicSync, 10000);
            return () => {
                clearInterval(interval);
            };
        }
    }, []);
}
