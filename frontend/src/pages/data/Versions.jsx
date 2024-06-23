import React, { useEffect, useState } from "react";
import { Skeleton, Stack, Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";

// @ts-ignore
const FRONTEND_VERSION = APP_VERSION;

export default function Versions() {
    const [serverStatus, setServerStatus] = useState(null);
    const [workerVersions, setWorkerVersions] = useState([]);

    function handleOnMessage(event) {
        if (event.data.type === "version") {
            setWorkerVersions((current) => [...current, event.data.version]);
        }
    }

    useEffect(() => {
        let controller = new AbortController();
        fetch("/api/status", { signal: controller.signal })
            .then((response) => response.json())
            .then((data) => setServerStatus(data))
            .catch((err) => {
                if (err.name === "AbortError") return;
                console.error(err);
                notifications.show({
                    title: "Failed to fetch backend version",
                    message: err.message,
                    color: "red",
                    withBorder: true,
                });
            });

        setWorkerVersions([]);

        navigator.serviceWorker?.addEventListener("message", handleOnMessage);
        navigator.serviceWorker?.ready?.then((registration) => {
            registration.active.postMessage({ type: "version" });
        });

        return () => {
            controller.abort();
            navigator.serviceWorker?.removeEventListener(
                "message",
                handleOnMessage
            );
        };
    }, []);

    return (
        <Stack>
            <Skeleton visible={serverStatus == null}>
                <Text>Backend: {serverStatus?.version}</Text>
            </Skeleton>
            <Text>Frontend: {FRONTEND_VERSION}</Text>
            <Text>Worker: {workerVersions.join(", ")}</Text>
        </Stack>
    );
}
